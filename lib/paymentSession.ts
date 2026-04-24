/**
 * جلسات الدفع الآمنة
 * - رابط واحد مرتبط برقم جوال واحد فقط (معرف العميل).
 * - مدة محدودة (default 30 دقيقة).
 * - تتبع كامل: زيارة، اختيار طريقة، فشل، نجاح، انتهاء صلاحية.
 * - حذف تلقائي بعد الانتهاء.
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { randomBytes, createHash } from "node:crypto";

export type PaymentSessionStatus =
  | "pending"
  | "viewed"
  | "method_selected"
  | "processing"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export type PaymentEventType =
  | "created"
  | "viewed"
  | "method_selected"
  | "charge_initiated"
  | "redirected_to_gateway"
  | "returned_from_gateway"
  | "insufficient_balance"
  | "verification_failed"
  | "declined"
  | "abandoned"
  | "paid"
  | "failed"
  | "expired"
  | "phone_mismatch"
  | "tampering_attempt";

export interface PaymentSession {
  id: number;
  token: string;
  orderId: number;
  clientPhone: string;
  amount: string;
  currency: string;
  description: string;
  status: PaymentSessionStatus;
  expiresAt: Date;
  createdAt: Date;
  paidAt: Date | null;
  tapChargeId: string | null;
}

export interface CreateSessionInput {
  orderId: number;
  clientPhone: string;
  amount: number;
  description: string;
  ttlMinutes?: number;
  metadata?: Record<string, unknown>;
}

export async function ensurePaymentTables(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_sessions (
      id serial PRIMARY KEY,
      token text NOT NULL UNIQUE,
      token_hash text NOT NULL,
      order_id integer NOT NULL,
      client_phone text NOT NULL,
      amount numeric(10,2) NOT NULL,
      currency text NOT NULL DEFAULT 'SAR',
      description text NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      paid_at timestamptz,
      tap_charge_id text,
      attempts_count integer NOT NULL DEFAULT 0,
      metadata jsonb DEFAULT '{}'::jsonb
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pay_sessions_phone ON payment_sessions(client_phone)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pay_sessions_order ON payment_sessions(order_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pay_sessions_expires ON payment_sessions(expires_at)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pay_sessions_status ON payment_sessions(status)`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_events (
      id serial PRIMARY KEY,
      session_id integer NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
      event_type text NOT NULL,
      payment_method text,
      reason text,
      ip text,
      user_agent text,
      gateway_code text,
      gateway_message text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pay_events_session ON payment_events(session_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pay_events_type ON payment_events(event_type)`);
}

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPaymentSession(input: CreateSessionInput): Promise<PaymentSession> {
  await ensurePaymentTables();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const ttl = Math.max(5, Math.min(input.ttlMinutes ?? 30, 60 * 24));
  const expiresAt = new Date(Date.now() + ttl * 60_000);

  const rows: any = await db.execute(sql`
    INSERT INTO payment_sessions (token, token_hash, order_id, client_phone, amount, description, expires_at, metadata)
    VALUES (${token}, ${tokenHash}, ${input.orderId}, ${input.clientPhone}, ${input.amount}, ${input.description}, ${expiresAt.toISOString()}, ${JSON.stringify(input.metadata || {})}::jsonb)
    RETURNING *
  `);
  const row = rows[0] as PaymentSession & { token_hash: string };

  await logEvent(row.id, "created");
  return row;
}

export async function getPaymentSession(token: string): Promise<PaymentSession | null> {
  await ensurePaymentTables();
  const rows: any = await db.execute(sql`
    SELECT * FROM payment_sessions WHERE token = ${token} LIMIT 1
  `);
  if (rows.length === 0) return null;
  return rows[0] as PaymentSession;
}

/**
 * يُحمّل الجلسة ويحقق:
 * - الصلاحية (expires_at)
 * - رقم الجوال (يجب أن يطابق إن وُجد)
 * يُغيّر الحالة لـ expired وينظف عند انتهاء الصلاحية.
 */
export async function loadAndValidate(
  token: string,
  expectedPhone?: string | null,
): Promise<{ ok: true; session: PaymentSession } | { ok: false; reason: "not_found" | "expired" | "phone_mismatch" | "already_paid" | "cancelled" }> {
  const session = await getPaymentSession(token);
  if (!session) return { ok: false, reason: "not_found" };

  if (session.status === "paid") return { ok: false, reason: "already_paid" };
  if (session.status === "cancelled") return { ok: false, reason: "cancelled" };

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    if (session.status !== "expired") {
      await db.execute(sql`UPDATE payment_sessions SET status='expired', updated_at=now() WHERE id=${session.id}`);
      await logEvent(session.id, "expired");
    }
    return { ok: false, reason: "expired" };
  }

  if (expectedPhone && session.clientPhone !== expectedPhone) {
    await logEvent(session.id, "phone_mismatch", { reason: `expected=${expectedPhone}` });
    return { ok: false, reason: "phone_mismatch" };
  }

  return { ok: true, session };
}

export async function updateSessionStatus(
  id: number,
  status: PaymentSessionStatus,
  fields: Partial<{ tapChargeId: string; paidAt: Date }> = {},
): Promise<void> {
  await db.execute(sql`
    UPDATE payment_sessions
    SET status=${status},
        tap_charge_id=COALESCE(${fields.tapChargeId ?? null}, tap_charge_id),
        paid_at=COALESCE(${fields.paidAt?.toISOString() ?? null}, paid_at),
        updated_at=now()
    WHERE id=${id}
  `);
}

export async function incrementAttempts(id: number): Promise<number> {
  const rows: any = await db.execute(sql`
    UPDATE payment_sessions SET attempts_count = attempts_count + 1, updated_at=now()
    WHERE id=${id} RETURNING attempts_count
  `);
  return rows[0]?.attempts_count ?? 0;
}

export async function logEvent(
  sessionId: number,
  type: PaymentEventType,
  extras: {
    paymentMethod?: string;
    reason?: string;
    ip?: string;
    userAgent?: string;
    gatewayCode?: string;
    gatewayMessage?: string;
  } = {},
): Promise<void> {
  await db.execute(sql`
    INSERT INTO payment_events (session_id, event_type, payment_method, reason, ip, user_agent, gateway_code, gateway_message)
    VALUES (${sessionId}, ${type}, ${extras.paymentMethod ?? null}, ${extras.reason ?? null}, ${extras.ip ?? null}, ${extras.userAgent ?? null}, ${extras.gatewayCode ?? null}, ${extras.gatewayMessage ?? null})
  `);
}

/**
 * تنظيف الجلسات المنتهية:
 *  - تُعلَّم expired فوراً
 *  - تُحذف نهائياً بعد 7 أيام (للاحتفاظ بالأحداث للمراجعة)
 */
export async function cleanupExpiredSessions(): Promise<{ expired: number; deleted: number }> {
  await ensurePaymentTables();
  const expRows: any = await db.execute(sql`
    UPDATE payment_sessions
    SET status='expired', updated_at=now()
    WHERE status IN ('pending','viewed','method_selected') AND expires_at < now()
    RETURNING id
  `);
  for (const r of expRows) {
    await logEvent(r.id, "expired");
  }
  const delRows: any = await db.execute(sql`
    DELETE FROM payment_sessions
    WHERE status IN ('expired','cancelled','failed')
      AND updated_at < now() - interval '7 days'
    RETURNING id
  `);
  return { expired: expRows.length, deleted: delRows.length };
}

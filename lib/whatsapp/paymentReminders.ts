/**
 * Payment expiry reminders — #28
 * يكتشف جلسات الدفع المنتهية الصلاحية ويُرسل واتساب للعميل مع رابط جديد.
 *
 * القواعد:
 *  - فقط الجلسات التي لم يُرسل لها تذكير بعد (reminder_sent IS NULL)
 *  - يُرسل تذكيراً واحداً فقط لكل جلسة
 *  - ينشئ جلسة دفع جديدة (ttl = 60 دقيقة) ويُرسل الرابط
 *  - يُعلّم الجلسة القديمة expired + يخزّن token الجديد في metadata
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/notify";
import { createPaymentSession } from "@/lib/paymentSession";

interface ExpiredSession {
  id: number;
  order_id: number;
  client_phone: string;
  amount: string;
  description: string;
  metadata: Record<string, unknown> | null;
}

const BASE_URL =
  process.env.APP_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://khadum.app";

export async function sweepExpiredPaymentSessions(): Promise<{
  reminded: number;
  errors: number;
}> {
  let reminded = 0;
  let errors = 0;

  let rows: ExpiredSession[] = [];
  try {
    const expired = (await db.execute(sql`
      SELECT
        ps.id,
        ps.order_id,
        ps.client_phone,
        ps.amount,
        ps.description,
        ps.metadata
      FROM payment_sessions ps
      WHERE
        ps.status IN ('pending', 'viewed', 'method_selected')
        AND ps.expires_at < NOW()
        AND (ps.metadata->>'reminder_sent' IS NULL OR ps.metadata->>'reminder_sent' = 'false')
      ORDER BY ps.expires_at ASC
      LIMIT 50
    `)) as unknown as ExpiredSession[];
    rows = Array.isArray(expired) ? expired : [];
  } catch {
    return { reminded: 0, errors: 0 };
  }

  for (const session of rows) {
    try {
      const newSession = await createPaymentSession({
        orderId: session.order_id,
        clientPhone: session.client_phone,
        amount: Number(session.amount),
        description: session.description,
        ttlMinutes: 60,
        metadata: {
          via: "expiry_reminder",
          original_session_id: session.id,
        },
      });

      const payLink = `${BASE_URL}/pay/${newSession.token}`;

      await sendWhatsApp(
        session.client_phone,
        `⏰ *انتهت صلاحية رابط الدفع السابق*\n\n` +
          `طلبك بانتظارك! تم تجديد رابط الدفع لمدة ساعة أخرى:\n` +
          `${payLink}\n\n` +
          `إذا كنت تواجه أي مشكلة، تواصل مع الدعم عبر الرد على هذه الرسالة. 💙`,
      ).catch(() => {});

      await db.execute(sql`
        UPDATE payment_sessions
        SET
          status = 'expired',
          updated_at = NOW(),
          metadata = COALESCE(metadata, '{}'::jsonb) ||
            ${JSON.stringify({
              reminder_sent: true,
              reminder_new_token: newSession.token,
              reminder_at: new Date().toISOString(),
            })}::jsonb
        WHERE id = ${session.id}
      `).catch(() => {});

      reminded++;
    } catch (err) {
      console.error("[paymentReminders] error reminding session", session.id, err);
      errors++;
      await db.execute(sql`
        UPDATE payment_sessions
        SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"reminder_sent": true}'::jsonb
        WHERE id = ${session.id}
      `).catch(() => {});
    }
  }

  return { reminded, errors };
}

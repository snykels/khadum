/**
 * Tap Payments Charge Webhook
 *
 * الأمان — طبقتان:
 *  1. التحقق من hashstring (HMAC-SHA256) إن أُرسل
 *  2. إعادة جلب الـ charge من Tap API مباشرة (يمنع أي webhook مزوّر)
 *
 * حالات Tap المعالَجة:
 *  CAPTURED / AUTHORIZED → دفع ناجح → تفعيل الطلب + إشعار الطرفين
 *  FAILED / DECLINED      → فشل → تسجيل السبب + إشعار العميل
 *  CANCELLED              → إلغاء العميل → تسجيل + إشعار
 *  TIMEDOUT               → انتهاء وقت الجلسة → تسجيل + إشعار
 *  ABANDONED              → تجاهل العميل → تسجيل فقط
 *  VOID                   → إلغاء تفويض بنكي → تسجيل + إشعار
 *  RESTRICTED             → بطاقة/حساب محظور → تسجيل + إشعار
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, retrieveCharge } from "@/lib/tap";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { logEvent, updateSessionStatus } from "@/lib/paymentSession";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/notify";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function findSession(charge: {
  id: string;
  metadata?: { session_id?: string; order_id?: string; project_id?: string };
}): Promise<Record<string, unknown> | null> {
  // Priority 1: session_id in metadata (new flow)
  const metaSessionId = charge.metadata?.session_id;
  if (metaSessionId) {
    const rows: any = await db.execute(
      sql`SELECT * FROM payment_sessions WHERE id=${Number(metaSessionId)} LIMIT 1`,
    );
    if (rows.length > 0) return rows[0];
  }

  // Priority 2: tap_charge_id already stored (idempotent re-delivery)
  const byCharge: any = await db.execute(
    sql`SELECT * FROM payment_sessions WHERE tap_charge_id=${charge.id} LIMIT 1`,
  );
  if (byCharge.length > 0) return byCharge[0];

  // Priority 3: order_id in metadata, take the most recent non-paid session
  const orderId =
    charge.metadata?.order_id ||
    charge.metadata?.project_id;
  if (orderId) {
    const byOrder: any = await db.execute(
      sql`SELECT * FROM payment_sessions
          WHERE order_id=${Number(orderId)} AND status NOT IN ('paid','expired','cancelled')
          ORDER BY created_at DESC LIMIT 1`,
    );
    if (byOrder.length > 0) return byOrder[0];

    // Fallback: latest session for this order regardless of status
    const anySession: any = await db.execute(
      sql`SELECT * FROM payment_sessions
          WHERE order_id=${Number(orderId)}
          ORDER BY created_at DESC LIMIT 1`,
    );
    if (anySession.length > 0) return anySession[0];
  }

  return null;
}

function classifyFailure(status: string, code?: string, message?: string): {
  eventType: string;
  reasonAr: string;
} {
  if (status === "VOID") {
    return { eventType: "declined", reasonAr: "تم إلغاء التفويض البنكي" };
  }
  if (status === "RESTRICTED") {
    return { eventType: "declined", reasonAr: "البطاقة أو الحساب محظور" };
  }
  if (status === "CANCELLED") {
    return { eventType: "abandoned", reasonAr: "تم الإلغاء" };
  }
  if (status === "TIMEDOUT") {
    return { eventType: "abandoned", reasonAr: "انتهى وقت الجلسة" };
  }
  if (status === "ABANDONED") {
    return { eventType: "abandoned", reasonAr: "تجاهل الدفع" };
  }
  // FAILED / DECLINED — determine sub-reason
  const msg = (message || "").toLowerCase();
  const c = code || "";
  if (/balance|funds|insufficient/i.test(msg) || c === "200") {
    return { eventType: "insufficient_balance", reasonAr: "الرصيد غير كافٍ" };
  }
  if (/3ds|verif|authentication/i.test(msg) || c === "300") {
    return { eventType: "verification_failed", reasonAr: "فشل التحقق بخطوتين" };
  }
  if (/expired|exp/i.test(msg)) {
    return { eventType: "declined", reasonAr: "البطاقة منتهية الصلاحية" };
  }
  if (/stolen|fraud|lost/i.test(msg)) {
    return { eventType: "declined", reasonAr: "بطاقة مُبلَّغ عنها" };
  }
  return { eventType: "declined", reasonAr: "تم رفض الدفع" };
}

// ─── route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const raw = await req.text();

  // Parse JSON
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const chargeId = (payload as any)?.id as string | undefined;
  if (!chargeId) {
    return NextResponse.json({ error: "missing charge id" }, { status: 400 });
  }

  // Layer 1: verify hashstring if provided
  const sig = req.headers.get("hashstring");
  if (sig) {
    const sigOk = await verifyWebhookSignature(payload, sig).catch(() => false);
    if (!sigOk) {
      console.warn("[tap webhook] ❌ invalid hashstring — rejected:", chargeId);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  // Layer 2: re-fetch charge from Tap to verify authenticity
  const verified = await retrieveCharge(chargeId).catch(() => null);
  if (!verified) {
    console.warn("[tap webhook] ⚠️ could not retrieve charge from Tap:", chargeId);
    return NextResponse.json({ error: "charge not retrievable" }, { status: 502 });
  }

  const status = verified.status;
  const code = verified.response?.code;
  const message = verified.response?.message;

  console.log(
    `[tap webhook] charge=${chargeId} status=${status} amount=${verified.amount} code=${code || "-"}`,
  );

  // Find the payment session
  const s = await findSession({
    id: verified.id,
    metadata: verified.metadata,
  });

  if (!s) {
    // No session found — log and return 200 so Tap doesn't retry indefinitely
    console.warn(
      `[tap webhook] ⚠️ no payment session found for charge=${chargeId}`,
      "metadata:", verified.metadata,
    );
    // Still update order directly if we have order_id in metadata
    const orderId = Number(verified.metadata?.order_id || verified.metadata?.project_id || 0);
    if (orderId && (status === "CAPTURED" || status === "AUTHORIZED")) {
      await db
        .update(orders)
        .set({ paymentStatus: "paid", paidAmount: String(verified.amount), status: "active", startedAt: new Date() })
        .where(eq(orders.id, orderId))
        .catch(() => undefined);
      await notifySuccess(orderId, chargeId, verified.amount);
    }
    return NextResponse.json({ ok: true, note: "no_session" });
  }

  // Amount integrity check
  if (Math.abs(Number(verified.amount) - Number(s.amount)) > 0.01) {
    await logEvent(Number(s.id), "tampering_attempt", {
      reason: `amount mismatch: tap=${verified.amount} session=${s.amount}`,
    });
    console.error(
      `[tap webhook] 🚨 amount mismatch charge=${chargeId} tap=${verified.amount} session=${s.amount}`,
    );
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  // Charge ID consistency check
  if (s.tap_charge_id && s.tap_charge_id !== verified.id) {
    await logEvent(Number(s.id), "tampering_attempt", { reason: "charge id mismatch" });
    return NextResponse.json({ error: "charge mismatch" }, { status: 400 });
  }

  // Idempotency: already paid
  if (s.status === "paid") {
    console.log(`[tap webhook] ℹ️ idempotent — session=${s.id} already paid`);
    return NextResponse.json({ ok: true, idempotent: true });
  }

  // ── Handle each status ───────────────────────────────────────────────────

  if (status === "CAPTURED" || status === "AUTHORIZED") {
    // ✅ Payment successful
    await updateSessionStatus(Number(s.id), "paid", {
      tapChargeId: verified.id,
      paidAt: new Date(),
    });
    await logEvent(Number(s.id), "paid", { gatewayCode: code, gatewayMessage: message });

    await db
      .update(orders)
      .set({
        paymentStatus: "paid",
        paidAmount: String(verified.amount),
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(orders.id, Number(s.order_id)));

    console.log(
      `[tap webhook] ✅ CAPTURED — session=${s.id} order=${s.order_id} amount=${verified.amount}`,
    );

    await notifySuccess(Number(s.order_id), verified.id, verified.amount);

  } else if (
    status === "FAILED" ||
    status === "DECLINED" ||
    status === "CANCELLED" ||
    status === "TIMEDOUT" ||
    status === "VOID" ||
    status === "RESTRICTED"
  ) {
    // ❌ Payment did not succeed
    const sessionStatus =
      status === "CANCELLED" || status === "TIMEDOUT" || status === "ABANDONED"
        ? "cancelled"
        : "failed";

    await updateSessionStatus(Number(s.id), sessionStatus, { tapChargeId: verified.id });

    const { eventType, reasonAr } = classifyFailure(status, code, message);
    await logEvent(Number(s.id), eventType as any, { gatewayCode: code, gatewayMessage: message });

    console.log(
      `[tap webhook] ❌ ${status} (${eventType}) — session=${s.id} order=${s.order_id}`,
    );

    await notifyFailure(Number(s.order_id), reasonAr, s.client_phone as string | null);

  } else if (status === "ABANDONED") {
    // Silent — user just left the page
    await logEvent(Number(s.id), "abandoned", { gatewayCode: code });
    await updateSessionStatus(Number(s.id), "cancelled", { tapChargeId: verified.id });

  } else {
    // INITIATED, UNKNOWN — log only
    console.log(`[tap webhook] status=${status} (no action) — charge=${chargeId}`);
  }

  return NextResponse.json({ ok: true });
}

// ─── notification helpers ─────────────────────────────────────────────────────

async function notifySuccess(orderId: number, chargeId: string, amount: number) {
  try {
    const rows: any = await db.execute(
      sql`SELECT client_phone, freelancer_phone, description, public_code
          FROM orders WHERE id=${orderId} LIMIT 1`,
    );
    if (!rows.length) return;
    const o = rows[0];
    const ref = o.public_code ? ` (${o.public_code})` : "";
    const desc = o.description ? `\n📋 *الطلب:* ${String(o.description).slice(0, 100)}` : "";

    if (o.freelancer_phone) {
      await sendWhatsApp(
        o.freelancer_phone,
        `✅ *تم استلام الدفع!*\n\nتم تأكيد دفع العميل للطلب${ref}.${desc}\n\n🚀 يمكنك البدء في التنفيذ الآن. بالتوفيق!`,
      ).catch((e: Error) =>
        console.error("[tap webhook] freelancer notify error:", e.message),
      );
    }

    if (o.client_phone) {
      await sendWhatsApp(
        o.client_phone,
        `✅ *تمت عملية الدفع بنجاح!*\n\nشكراً لك، تم تأكيد دفعتك للطلب${ref}.${desc}\n\n💰 المبلغ محجوز كأمانة حتى اكتمال العمل وموافقتك. سنُعلمك فور الانتهاء. 🎉`,
      ).catch((e: Error) =>
        console.error("[tap webhook] client notify error:", e.message),
      );
    }
  } catch (e) {
    console.error("[tap webhook] notifySuccess error:", e);
  }
}

async function notifyFailure(
  orderId: number,
  reasonAr: string,
  clientPhoneFallback: string | null,
) {
  try {
    const rows: any = await db.execute(
      sql`SELECT client_phone, public_code FROM orders WHERE id=${orderId} LIMIT 1`,
    );
    const clientPhone =
      (rows.length ? rows[0].client_phone : null) || clientPhoneFallback;
    const ref = rows.length && rows[0].public_code ? ` (${rows[0].public_code})` : "";

    if (clientPhone) {
      await sendWhatsApp(
        clientPhone,
        `❌ *لم تكتمل عملية الدفع*\n\nللأسف لم يتم تأكيد دفعتك للطلب${ref}.\n📌 *السبب:* ${reasonAr}\n\nيمكنك المحاولة مجدداً — اطلب من البوت رابط دفع جديد، أو تواصل معنا على help@khadum.app`,
      ).catch((e: Error) =>
        console.error("[tap webhook] fail notify error:", e.message),
      );
    }
  } catch (e) {
    console.error("[tap webhook] notifyFailure error:", e);
  }
}

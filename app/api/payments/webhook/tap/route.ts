/**
 * Webhook من Tap Payments
 * الأمان يعتمد على طبقتين:
 * 1. التحقق من hashstring إن وُجد (HMAC-SHA256 بنفس الـ Secret Key)
 * 2. إعادة جلب الـ charge مباشرة من Tap API للتأكد من صحة البيانات
 *    هذا يضمن أن أي webhook مزوّر لا يستطيع التأثير على النظام.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, retrieveCharge } from "@/lib/tap";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { logEvent, updateSessionStatus } from "@/lib/paymentSession";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const raw = await req.text();
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

  const sig = req.headers.get("hashstring");

  if (sig) {
    const sigOk = await verifyWebhookSignature(payload, sig).catch(() => false);
    if (!sigOk) {
      console.warn("[tap webhook] invalid hashstring signature — rejected");
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  // التحقق الأساسي: نجلب الـ charge مباشرة من Tap بغض النظر عن الـ hashstring
  const verified = await retrieveCharge(chargeId).catch(() => null);
  if (!verified) {
    console.warn("[tap webhook] could not retrieve charge from Tap:", chargeId);
    return NextResponse.json({ error: "charge not retrievable" }, { status: 502 });
  }

  const charge = payload as {
    id: string;
    status: string;
    amount: number;
    metadata?: { session_id?: string; order_id?: string };
    response?: { code?: string; message?: string };
  };

  const sessionId = Number(charge.metadata?.session_id || verified.reference?.transaction?.split("-")[1]);
  if (!sessionId) {
    return NextResponse.json({ error: "no session id" }, { status: 400 });
  }

  const rows: any = await db.execute(sql`SELECT * FROM payment_sessions WHERE id=${sessionId} LIMIT 1`);
  if (rows.length === 0) {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }
  const s = rows[0];

  // تأكيد المبلغ والـ charge id لمنع التلاعب
  if (Number(verified.amount) !== Number(s.amount)) {
    await logEvent(s.id, "tampering_attempt", { reason: `amount mismatch: webhook=${verified.amount} session=${s.amount}` });
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }
  if (s.tap_charge_id && s.tap_charge_id !== verified.id) {
    await logEvent(s.id, "tampering_attempt", { reason: `charge id mismatch` });
    return NextResponse.json({ error: "charge mismatch" }, { status: 400 });
  }
  if (s.status === "paid") {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const status = verified.status;
  const code = verified.response?.code;
  const message = verified.response?.message;

  if (status === "CAPTURED" || status === "AUTHORIZED") {
    await updateSessionStatus(s.id, "paid", { tapChargeId: verified.id, paidAt: new Date() });
    await logEvent(s.id, "paid", { gatewayCode: code, gatewayMessage: message });

    await db.update(orders)
      .set({
        paymentStatus: "paid",
        paidAmount: String(verified.amount),
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(orders.id, s.order_id));

    console.log(`[tap webhook] ✅ payment confirmed — session=${s.id} order=${s.order_id} amount=${verified.amount}`);

    const orderRows: any = await db.execute(
      sql`SELECT client_phone, freelancer_phone, description, public_code FROM orders WHERE id=${s.order_id} LIMIT 1`
    );
    if (orderRows.length > 0) {
      const o = orderRows[0];
      const orderRef = o.public_code ? ` (${o.public_code})` : "";
      const desc = o.description ? `\n📋 *الطلب:* ${o.description}` : "";

      if (o.freelancer_phone) {
        await sendWhatsApp(
          o.freelancer_phone,
          `✅ *تم استلام الدفع بنجاح!*\n\nتم تأكيد دفع العميل للطلب${orderRef}.${desc}\n\nيمكنك الآن البدء في تنفيذ الطلب. بالتوفيق! 🚀`
        ).catch(e => console.error("[tap webhook] freelancer notify error:", e));
      }

      if (o.client_phone) {
        await sendWhatsApp(
          o.client_phone,
          `✅ *تم استلام دفعتك بنجاح!*\n\nشكراً لك، تم تأكيد دفعتك للطلب${orderRef}.${desc}\n\nسيبدأ المستقل في العمل قريباً وسنُعلمك فور الانتهاء. 🎉`
        ).catch(e => console.error("[tap webhook] client notify error:", e));
      }
    }
  } else if (status === "FAILED" || status === "DECLINED" || status === "CANCELLED" || status === "TIMEDOUT") {
    await updateSessionStatus(s.id, "failed", { tapChargeId: verified.id });
    const eventType =
      code === "200" || /balance|funds/i.test(message || "") ? "insufficient_balance" :
      code === "300" || /3ds|verif/i.test(message || "") ? "verification_failed" :
      status === "CANCELLED" ? "abandoned" : "declined";
    await logEvent(s.id, eventType, { gatewayCode: code, gatewayMessage: message });
    console.log(`[tap webhook] ❌ payment ${eventType} — session=${s.id} status=${status}`);

    if (s.order_id) {
      const failedRows: any = await db.execute(
        sql`SELECT client_phone, public_code FROM orders WHERE id=${s.order_id} LIMIT 1`
      );
      if (failedRows.length > 0 && failedRows[0].client_phone) {
        const failRef = failedRows[0].public_code ? ` (${failedRows[0].public_code})` : "";
        const failReason =
          eventType === "insufficient_balance" ? "الرصيد غير كافٍ" :
          eventType === "verification_failed" ? "فشل التحقق بخطوتين" :
          eventType === "abandoned" ? "تم الإلغاء" : "تم رفض الدفع";
        await sendWhatsApp(
          failedRows[0].client_phone,
          `❌ *فشل الدفع*\n\nللأسف، لم يتم تأكيد دفعتك للطلب${failRef}.\n📌 السبب: ${failReason}\n\nيمكنك المحاولة مجدداً عبر رابط الدفع أو التواصل معنا على help@khadum.app`
        ).catch(e => console.error("[tap webhook] client fail notify error:", e));
      }
    }
  } else if (status === "ABANDONED") {
    await logEvent(s.id, "abandoned", { gatewayCode: code });
  }

  return NextResponse.json({ ok: true });
}

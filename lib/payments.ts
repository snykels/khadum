/**
 * createOrderPaymentLink
 * ينشئ payment_session كاملة ويُعيد رابط /pay/{token}
 * (بدلاً من رابط Tap مباشر) حتى:
 *  - يتمكن العميل من اختيار طريقة الدفع
 *  - يستطيع الـ webhook العثور على الجلسة عبر session_id في الـ metadata
 *  - يُسجَّل كل حدث في payment_events للمراجعة
 */
import { createPaymentSession } from "@/lib/paymentSession";

export interface OrderForPayment {
  id: number;
  amount: string | number | null;
  description: string | null;
  publicCode?: string | null;
  clientPhone: string | null;
}

function parsePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("00966")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) return "966" + digits.slice(1);
  return digits;
}

export async function createOrderPaymentLink(order: OrderForPayment): Promise<string | null> {
  if (!order.amount || !order.clientPhone) return null;

  const phone = parsePhone(order.clientPhone);
  if (!phone || phone.length < 9) return null;

  const amount = Number(order.amount);
  if (!(amount > 0)) return null;

  const base =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://khadum.app";

  const description = (order.description || `طلب رقم ${order.id}`).slice(0, 200);

  const session = await createPaymentSession({
    orderId: order.id,
    clientPhone: phone,
    amount,
    description,
    ttlMinutes: 60,
    metadata: {
      via: "wa_agent_offer",
      publicCode: order.publicCode || "",
      orderId: order.id,
    },
  });

  return `${base}/pay/${session.token}`;
}

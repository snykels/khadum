import { createCharge } from "@/lib/tap";

export interface OrderForPayment {
  id: number;
  amount: string | number | null;
  description: string | null;
  publicCode?: string | null;
  clientPhone: string | null;
}

function parseCountry(phone: string): { country: string; local: string } {
  for (const cc of ["966", "971", "965", "973"]) {
    if (phone.startsWith(cc)) return { country: cc, local: phone.slice(cc.length) };
  }
  return { country: "966", local: phone };
}

/**
 * Creates a Tap charge for an order and returns the payment URL.
 * Used by both the offer-accept path and the create_payment_link tool.
 * Returns null if any required field is missing or the Tap call fails.
 */
export async function createOrderPaymentLink(order: OrderForPayment): Promise<string | null> {
  if (!order.amount || !order.clientPhone) return null;
  const phone = order.clientPhone.replace(/[^\d]/g, "");
  if (!phone) return null;

  const amount = Number(order.amount);
  if (!(amount > 0)) return null;

  const { country, local } = parseCountry(phone);
  const base =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://khadum.app";

  const charge = await createCharge({
    amount,
    currency: "SAR",
    description: (order.description || `طلب رقم ${order.id}`).slice(0, 200),
    reference: `KHD-${order.id}-${Date.now()}`,
    source: "src_all",
    customer: {
      first_name: "Khadum Client",
      phone: { country_code: country, number: local },
    },
    redirectUrl: `${base}/payment/result?order=${order.id}`,
    webhookUrl: `${base}/api/payments/webhook/tap`,
    metadata: { project_id: String(order.id), via: "wa_agent_offer" },
  });

  return charge.transaction?.url || null;
}

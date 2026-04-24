/**
 * عميل Tap Payments
 * Docs: https://developers.tap.company/reference/api-endpoint
 *
 * المتغيرات المطلوبة:
 *   TAP_SECRET_KEY     أو Live_Secret_Key   (sk_live_...)
 *   TAP_PUBLIC_KEY     أو Live_Public_Key   (pk_live_...)
 *   TAP_TEST_SECRET    أو Test_Secret_Key   (sk_test_...)
 *   TAP_WEBHOOK_SECRET (لتوقيع الـ hashstring - من لوحة Tap)
 *   APP_BASE_URL       (مثال: https://khadum.app)
 */

const TAP_BASE = "https://api.tap.company/v2";

export type TapSource =
  | "src_all"
  | "src_card"
  | "src_sa.mada"
  | "src_apple_pay"
  | "src_sa.stcpay"
  | "src_kw.knet"
  | "src_bh.benefit";

export interface CreateChargeInput {
  amount: number;
  currency?: "SAR" | "AED" | "KWD" | "BHD" | "USD";
  description: string;
  reference: string;
  source: TapSource;
  customer: {
    first_name: string;
    phone: { country_code: string; number: string };
    email?: string;
  };
  redirectUrl: string;
  webhookUrl: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TapChargeResponse {
  id: string;
  status: "INITIATED" | "ABANDONED" | "CANCELLED" | "FAILED" | "DECLINED" | "RESTRICTED" | "CAPTURED" | "AUTHORIZED" | "VOID" | "TIMEDOUT" | "UNKNOWN";
  amount: number;
  currency: string;
  reference?: { transaction?: string; order?: string };
  transaction?: { url?: string; created?: string };
  response?: { code: string; message: string };
  source?: { id: string; payment_method?: string };
}

function getSecretKey(): string {
  const k =
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;
  if (!k) throw new Error("Tap secret key is not configured (TAP_SECRET_KEY or Live_Secret_Key)");
  return k;
}

export function getPublicKey(): string {
  return (
    process.env.TAP_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY ||
    process.env.Live_Public_Key ||
    process.env.Test_Public_Key ||
    ""
  );
}

export function isLiveMode(): boolean {
  const k = getSecretKey();
  return k.startsWith("sk_live_");
}

export async function createCharge(input: CreateChargeInput): Promise<TapChargeResponse> {
  const phoneNumber = input.customer.phone.number.replace(/^966/, "");
  const body = {
    amount: input.amount,
    currency: input.currency || "SAR",
    threeDSecure: true,
    save_card: false,
    description: input.description,
    statement_descriptor: "Khadum",
    reference: { transaction: input.reference, order: input.reference },
    receipt: { email: false, sms: true },
    customer: {
      first_name: input.customer.first_name || "Khadum Client",
      email: input.customer.email,
      phone: { country_code: input.customer.phone.country_code, number: phoneNumber },
    },
    source: { id: input.source },
    post: { url: input.webhookUrl },
    redirect: { url: input.redirectUrl },
    metadata: input.metadata,
  };

  const res = await fetch(`${TAP_BASE}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as TapChargeResponse & { errors?: unknown };
  if (!res.ok) {
    throw new Error(`Tap createCharge failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

export async function retrieveCharge(chargeId: string): Promise<TapChargeResponse> {
  const res = await fetch(`${TAP_BASE}/charges/${chargeId}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Tap retrieveCharge failed: ${res.status}`);
  return json as TapChargeResponse;
}

/**
 * التحقق من توقيع الـ webhook عبر hashstring.
 * Tap يحسب: HMAC_SHA256(secretKey, concat of fields)
 * يستخدم نفس الـ Secret Key المستخدم في API calls (لا يوجد webhook secret منفصل).
 *
 * إذا لم يرسل Tap hashstring header → يُعاد false ليُفعَّل التحقق المزدوج
 * عبر retrieveCharge مباشرة من Tap API في route handler.
 */
export async function verifyWebhookSignature(
  payload: Record<string, unknown>,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader) return false;

  const secret =
    process.env.TAP_WEBHOOK_SECRET ||
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;

  if (!secret) return false;

  const charge = payload as unknown as TapChargeResponse;
  const fields =
    `x_id${charge.id || ""}` +
    `x_amount${(charge.amount ?? 0).toFixed(3)}` +
    `x_currency${charge.currency || ""}` +
    `x_gateway_reference${charge.reference?.order || ""}` +
    `x_payment_reference${charge.reference?.transaction || ""}` +
    `x_status${charge.status || ""}` +
    `x_created${(charge as { transaction?: { created?: string } }).transaction?.created || ""}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(fields));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(hex, signatureHeader.toLowerCase().trim());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const PAYMENT_METHODS: Array<{
  id: TapSource;
  nameAr: string;
  badge?: string;
}> = [
  { id: "src_sa.mada", nameAr: "مدى", badge: "الأكثر استخداماً" },
  { id: "src_card", nameAr: "بطاقة فيزا / ماستركارد" },
  { id: "src_apple_pay", nameAr: "Apple Pay" },
  { id: "src_sa.stcpay", nameAr: "STC Pay" },
  { id: "src_google_pay" as TapSource, nameAr: "Google Pay" },
];

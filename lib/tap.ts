/**
 * عميل Tap Payments
 * Docs: https://developers.tap.company/reference/api-endpoint
 *
<<<<<<< HEAD
 * المفاتيح تُقرأ أولاً من لوحة التحكم (DB settings ns="tap")،
 * ثم تنتقل إلى متغيرات البيئة كاحتياط:
 *   TAP_SECRET_KEY     أو Live_Secret_Key   (sk_live_...)
 *   TAP_PUBLIC_KEY     أو Live_Public_Key   (pk_live_...)
 *   TAP_WEBHOOK_SECRET (اختياري)
 */

import { loadSettings } from "./settings";

=======
 * المتغيرات المطلوبة:
 *   TAP_SECRET_KEY     أو Live_Secret_Key   (sk_live_...)
 *   TAP_PUBLIC_KEY     أو Live_Public_Key   (pk_live_...)
 *   TAP_TEST_SECRET    أو Test_Secret_Key   (sk_test_...)
 *   TAP_WEBHOOK_SECRET (لتوقيع الـ hashstring - من لوحة Tap)
 *   APP_BASE_URL       (مثال: https://khadum.app)
 */

>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
const TAP_BASE = "https://api.tap.company/v2";

export type TapSource =
  | "src_all"
  | "src_card"
  | "src_sa.mada"
  | "src_apple_pay"
  | "src_google_pay"
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
  metadata?: Record<string, string | number | boolean | undefined>;
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: { country_code?: string; number?: string };
  };
}

<<<<<<< HEAD
async function resolveSecretKey(): Promise<string> {
  const cfg = await loadSettings("tap").catch(() => ({}));
  const k =
    (cfg as Record<string, string>).secretKey ||
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;
  if (!k) throw new Error("Tap secret key is not configured — أضفه في لوحة التحكم ← بوابات الدفع");
  return k;
}

async function resolveWebhookSecret(): Promise<string> {
  const cfg = await loadSettings("tap").catch(() => ({}));
  return (
    (cfg as Record<string, string>).webhookSecret ||
    process.env.TAP_WEBHOOK_SECRET ||
    (cfg as Record<string, string>).secretKey ||
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key ||
    ""
  );
}

export async function getPublicKey(): Promise<string> {
  const cfg = await loadSettings("tap").catch(() => ({}));
  return (
    (cfg as Record<string, string>).publishableKey ||
=======
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
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    process.env.TAP_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY ||
    process.env.Live_Public_Key ||
    process.env.Test_Public_Key ||
    ""
  );
}

<<<<<<< HEAD
export async function isLiveMode(): Promise<boolean> {
  const k = await resolveSecretKey().catch(() => "");
=======
export function isLiveMode(): boolean {
  const k = getSecretKey();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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
<<<<<<< HEAD
      Authorization: `Bearer ${await resolveSecretKey()}`,
=======
      Authorization: `Bearer ${getSecretKey()}`,
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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

export async function createRefund(
  chargeId: string,
  amount: number,
  reason = "Customer dispute refund — admin resolution",
): Promise<{ id: string; status: string; amount: number }> {
  const body = {
    charge_id: chargeId,
    amount: +amount.toFixed(2),
    currency: "SAR",
    description: reason,
    metadata: { source: "admin_dispute_resolution" },
  };
  const res = await fetch(`${TAP_BASE}/refunds`, {
    method: "POST",
    headers: {
<<<<<<< HEAD
      Authorization: `Bearer ${await resolveSecretKey()}`,
=======
      Authorization: `Bearer ${getSecretKey()}`,
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(`Tap createRefund failed: ${res.status} ${JSON.stringify(json)}`);
  return json as { id: string; status: string; amount: number };
}

<<<<<<< HEAD
export interface TapTransferInput {
  amount: number;
  currency?: "SAR" | "AED" | "KWD" | "BHD";
  description?: string;
  beneficiary: {
    name: string;
    iban: string;
    bankName?: string;
  };
  reference?: string;
  metadata?: Record<string, string | number>;
}

export interface TapTransferResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  reference?: { transaction?: string };
}

/**
 * يُنشئ تحويلاً بنكياً خارجياً عبر Tap Payments Transfer API.
 * يُستخدم لتحويل أرباح المستقلين إلى حساباتهم البنكية عند الموافقة على طلب السحب.
 * الوثائق: https://developers.tap.company/reference/create-transfer
 */
export async function createTransfer(
  input: TapTransferInput,
): Promise<TapTransferResponse> {
  const body = {
    amount: +input.amount.toFixed(2),
    currency: input.currency || "SAR",
    description: input.description || "Freelancer payout — Khadum",
    source: { id: "src_all" },
    destinations: [
      {
        id: "DESTINATION",
        type: "IBAN",
        amount: +input.amount.toFixed(2),
        currency: input.currency || "SAR",
        account: {
          iban: input.beneficiary.iban,
          bank_name: input.beneficiary.bankName || "SAUDI",
        },
        customer: {
          first_name: input.beneficiary.name,
        },
      },
    ],
    reference: { transaction: input.reference || `khadum-payout-${Date.now()}` },
    metadata: input.metadata || {},
  };

  const res = await fetch(`${TAP_BASE}/transfers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await resolveSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `Tap createTransfer failed: ${res.status} ${JSON.stringify(json)}`,
    );
  }
  return json as TapTransferResponse;
}

export async function retrieveCharge(chargeId: string): Promise<TapChargeResponse> {
  const res = await fetch(`${TAP_BASE}/charges/${chargeId}`, {
    headers: { Authorization: `Bearer ${await resolveSecretKey()}` },
=======
export async function retrieveCharge(chargeId: string): Promise<TapChargeResponse> {
  const res = await fetch(`${TAP_BASE}/charges/${chargeId}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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

<<<<<<< HEAD
  const secret = await resolveWebhookSecret();
=======
  const secret =
    process.env.TAP_WEBHOOK_SECRET ||
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;

>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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
  { id: "src_google_pay", nameAr: "Google Pay" },
];

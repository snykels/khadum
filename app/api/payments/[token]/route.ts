/**
 * GET  → بيانات الجلسة (للصفحة)
 * POST → بدء عملية دفع بطريقة محددة
 */
import { NextRequest, NextResponse } from "next/server";
import { loadAndValidate, updateSessionStatus, logEvent, incrementAttempts } from "@/lib/paymentSession";
import { createCharge, type TapSource, PAYMENT_METHODS } from "@/lib/tap";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "";
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const result = await loadAndValidate(token);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 410 });
  }
  const s = result.session;

  if (s.status === "pending") {
    await updateSessionStatus(s.id, "viewed");
    await logEvent(s.id, "viewed", { ip: clientIp(req), userAgent: req.headers.get("user-agent") || undefined });
  }

  return NextResponse.json({
    amount: s.amount,
    currency: s.currency,
    description: s.description,
    expiresAt: s.expiresAt,
    phoneMasked: maskPhone(s.clientPhone),
    methods: PAYMENT_METHODS,
    status: s.status,
  });
}

function maskPhone(p: string): string {
  if (p.length < 6) return "****";
  return p.slice(0, 4) + "*****" + p.slice(-2);
}

const allowedSources = new Set(PAYMENT_METHODS.map((m) => m.id));

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const source = body.source as TapSource | undefined;

  if (!source || !allowedSources.has(source)) {
    return NextResponse.json({ error: "طريقة الدفع غير صحيحة" }, { status: 400 });
  }

  const result = await loadAndValidate(token);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 410 });
  }
  const s = result.session;

  const attempts = await incrementAttempts(s.id);
  if (attempts > 5) {
    await logEvent(s.id, "tampering_attempt", { reason: "too_many_attempts" });
    await updateSessionStatus(s.id, "cancelled");
    return NextResponse.json({ error: "تم تجاوز عدد المحاولات" }, { status: 429 });
  }

  await logEvent(s.id, "method_selected", { paymentMethod: source, ip: clientIp(req), userAgent: req.headers.get("user-agent") || undefined });
  await updateSessionStatus(s.id, "method_selected");

  const baseUrl = process.env.APP_BASE_URL || `https://${req.headers.get("host")}`;
  try {
    const charge = await createCharge({
      amount: Number(s.amount),
      currency: (s.currency as "SAR") || "SAR",
      description: s.description,
      reference: `khadom-${s.id}-${s.orderId}`,
      source,
      customer: {
        first_name: "Khadum Client",
        phone: { country_code: "966", number: s.clientPhone.replace(/^966/, "") },
      },
      redirectUrl: `${baseUrl}/pay/${token}/return`,
      webhookUrl: `${baseUrl}/api/payments/webhook/tap`,
      metadata: { session_id: String(s.id), order_id: String(s.orderId), token_prefix: token.slice(0, 8) },
    });

    await db.execute(sql`UPDATE payment_sessions SET tap_charge_id=${charge.id}, status='processing', updated_at=now() WHERE id=${s.id}`);
    await logEvent(s.id, "charge_initiated", { paymentMethod: source, gatewayCode: charge.status });

    if (charge.transaction?.url) {
      await logEvent(s.id, "redirected_to_gateway", { paymentMethod: source });
      return NextResponse.json({ redirectUrl: charge.transaction.url, chargeId: charge.id });
    }
    return NextResponse.json({ error: "فشل إنشاء عملية الدفع" }, { status: 502 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    await logEvent(s.id, "failed", { paymentMethod: source, reason: msg });
    return NextResponse.json({ error: "حدث خطأ، حاول مرة ثانية" }, { status: 502 });
  }
}

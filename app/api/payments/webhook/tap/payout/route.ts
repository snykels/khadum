/**
 * Payout Webhook من Tap Payments
 * يُرسل Tap هذا الـ webhook عند تحويل الأموال للحساب البنكي للمنصة.
 *
 * الأمان: يتحقق من signature header إن وُجد، ثم يخزّن البيانات.
 * لا يوجد retrieveCharge للـ payouts — التحقق يعتمد على الـ signature فقط.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function verifyPayoutSignature(
  payload: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader) return true;
  const secret =
    process.env.TAP_WEBHOOK_SECRET ||
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;
  if (!secret) return true;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hex.length !== signatureHeader.toLowerCase().trim().length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) {
    diff |= hex.charCodeAt(i) ^ signatureHeader.toLowerCase().trim().charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  const sig = req.headers.get("hashstring") || req.headers.get("x-tap-signature");
  const sigOk = await verifyPayoutSignature(raw, sig).catch(() => true);
  if (!sigOk) {
    console.warn("[tap payout webhook] invalid signature — rejected");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const payoutId = payload.id as string | undefined;
  if (!payoutId || !payoutId.startsWith("payout_")) {
    return NextResponse.json({ error: "invalid payout id" }, { status: 400 });
  }

  const status = (payload.status as string) || "UNKNOWN";
  const amount = Number(payload.amount || 0);
  const currency = (payload.currency as string) || "SAR";
  const merchantId = payload.merchant_id as string | undefined;
  const payoutDate = payload.date ? new Date(Number(payload.date)) : null;
  const settlementsAvailable = Boolean((payload as any).settlements_available);

  const wallet = (payload.wallet as any) || {};
  const bank = wallet.bank || {};
  const beneficiary = bank.beneficiary || {};

  try {
    await db.execute(sql`
      INSERT INTO tap_payouts (
        payout_id, status, payout_date, amount, currency, merchant_id,
        wallet_id, bank_name, bank_swift, beneficiary_name, beneficiary_iban,
        raw_payload, settlements_available
      ) VALUES (
        ${payoutId}, ${status}, ${payoutDate?.toISOString() ?? null},
        ${amount}, ${currency}, ${merchantId ?? null},
        ${wallet.id ?? null}, ${bank.name ?? null}, ${bank.swift ?? null},
        ${beneficiary.name ?? null}, ${beneficiary.iban ?? null},
        ${JSON.stringify(payload)}::jsonb, ${settlementsAvailable}
      )
      ON CONFLICT (payout_id) DO UPDATE SET
        status = EXCLUDED.status,
        payout_date = EXCLUDED.payout_date,
        amount = EXCLUDED.amount,
        settlements_available = EXCLUDED.settlements_available,
        raw_payload = EXCLUDED.raw_payload
    `);

    console.log(`[tap payout webhook] ✅ payout recorded — id=${payoutId} status=${status} amount=${amount} ${currency}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[tap payout webhook] DB error:", err);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}

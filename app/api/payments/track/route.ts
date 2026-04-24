import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_link_clicks (
      id serial PRIMARY KEY,
      transaction_id text,
      user_id integer,
      gateway text,
      amount numeric,
      currency text,
      target_url text,
      ip text,
      user_agent text,
      clicked_at timestamp NOT NULL DEFAULT now(),
      paid_at timestamp,
      payment_status text DEFAULT 'pending'
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pmt_clicks_user ON payment_link_clicks(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_pmt_clicks_status ON payment_link_clicks(payment_status)`);
}

export async function POST(req: NextRequest) {
  await ensureTable();
  const s = await getSession();
  const { transactionId, gateway, amount, currency, targetUrl } = await req.json().catch(() => ({}));
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ua = req.headers.get("user-agent") || "";
  const r: any = await db.execute(sql`
    INSERT INTO payment_link_clicks (transaction_id, user_id, gateway, amount, currency, target_url, ip, user_agent)
    VALUES (${transactionId || null}, ${s?.userId || null}, ${gateway || null}, ${amount || null}, ${currency || null}, ${targetUrl || null}, ${ip}, ${ua})
    RETURNING id
  `);
  return NextResponse.json({ ok: true, clickId: r[0]?.id });
}

export async function PATCH(req: NextRequest) {
  await ensureTable();
  const { clickId, transactionId, status } = await req.json().catch(() => ({}));
  const finalStatus = status || "paid";
  if (clickId) {
    await db.execute(sql`UPDATE payment_link_clicks SET payment_status=${finalStatus}, paid_at=CASE WHEN ${finalStatus}='paid' THEN now() ELSE paid_at END WHERE id=${clickId}`);
  } else if (transactionId) {
    await db.execute(sql`UPDATE payment_link_clicks SET payment_status=${finalStatus}, paid_at=CASE WHEN ${finalStatus}='paid' THEN now() ELSE paid_at END WHERE transaction_id=${transactionId}`);
  } else {
    return NextResponse.json({ error: "clickId or transactionId required" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

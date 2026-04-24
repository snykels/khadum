/**
 * POST /api/admin/payouts/tap-list
 * يستعلم Tap API مباشرة لقائمة التحويلات خلال فترة محددة.
 * Body: { from: unixMs, to: unixMs }
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const TAP_BASE = "https://api.tap.company/v2";

function getSecretKey(): string {
  const k =
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;
  if (!k) throw new Error("Tap secret key not configured");
  return k;
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const now = Date.now();
  const from = Number(body.from || now - 30 * 24 * 60 * 60 * 1000);
  const to   = Number(body.to   || now);

  try {
    const res = await fetch(`${TAP_BASE}/payouts/list`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ period: { date: { from, to } } }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/admin/payouts/download
 * يُنزّل تقرير Tap ZIP لـ payout محدد ويُعيده للمتصفح.
 * Body: { payoutId: "payout_..." }
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
<<<<<<< HEAD
import { loadSettings } from "@/lib/settings";

const TAP_BASE = "https://api.tap.company/v2";

async function getSecretKey(): Promise<string> {
  const cfg = await loadSettings("tap").catch(() => ({}));
  const k =
    (cfg as Record<string, string>).secretKey ||
=======

const TAP_BASE = "https://api.tap.company/v2";

function getSecretKey(): string {
  const k =
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;
  if (!k) throw new Error("Tap secret key not configured");
  return k;
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { payoutId } = await req.json().catch(() => ({}));
  if (!payoutId || !String(payoutId).startsWith("payout_")) {
    return NextResponse.json({ error: "payoutId مطلوب" }, { status: 400 });
  }

  try {
    const res = await fetch(`${TAP_BASE}/payouts/download`, {
      method: "POST",
      headers: {
<<<<<<< HEAD
        Authorization: `Bearer ${await getSecretKey()}`,
=======
        Authorization: `Bearer ${getSecretKey()}`,
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payouts: { payout_id: [payoutId] } }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Tap error: ${res.status} ${err}` }, { status: res.status });
    }

    const zipBuffer = await res.arrayBuffer();

    await db.execute(sql`
      UPDATE tap_payouts SET downloaded_at = now() WHERE payout_id = ${payoutId}
    `).catch(() => {});

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${payoutId}-report.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

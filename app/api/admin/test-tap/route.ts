import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";

export async function POST(_req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const cfg = await loadSettings("tap").catch(() => ({}));
  const key =
    (cfg as Record<string, string>).secretKey ||
    process.env.TAP_SECRET_KEY ||
    process.env.Live_Secret_Key ||
    process.env.Test_Secret_Key;
  if (!key) return NextResponse.json({ error: "مفتاح Tap غير مضبوط" }, { status: 400 });
  try {
    const res = await fetch("https://api.tap.company/v2/charges?limit=1", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.errors?.[0]?.description || `HTTP ${res.status}` }, { status: res.status });
    const mode = key.startsWith("sk_live_") ? "live" : "test";
    return NextResponse.json({ ok: true, mode });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

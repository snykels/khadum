import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { loadSettings } from "@/lib/settings";

export async function POST(_req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const cfg = await loadSettings("whatsapp").catch(() => ({}));
  const token = (cfg as Record<string, string>).apiToken || process.env.WHATSAPP_TOKEN;
  const phoneId = (cfg as Record<string, string>).phoneNumberId || process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return NextResponse.json({ error: "إعدادات WhatsApp غير مكتملة (apiToken، phoneNumberId)" }, { status: 400 });
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${phoneId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.error?.message || `HTTP ${res.status}` }, { status: res.status });
    return NextResponse.json({ ok: true, phoneNumber: data.display_phone_number, name: data.verified_name });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

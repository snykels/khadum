import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendWhatsApp, generateOtp } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone || !/^\+?\d{8,16}$/.test(String(phone).replace(/\s/g, ""))) {
    return NextResponse.json({ error: "رقم غير صالح" }, { status: 400 });
  }
  const normalized = String(phone).replace(/\s/g, "");
  const recent = (await db.execute(sql`SELECT created_at FROM phone_otps WHERE phone=${normalized} ORDER BY created_at DESC LIMIT 1`)) as Array<{ created_at: string }>;
  if (recent.length && Date.now() - new Date(recent[0].created_at).getTime() < 45_000) {
    return NextResponse.json({ error: "انتظر قبل إعادة الإرسال" }, { status: 429 });
  }
  const code = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await db.execute(sql`INSERT INTO phone_otps(phone,code,expires_at) VALUES(${normalized},${code},${expires})`);
  const r = await sendWhatsApp(normalized, `رمز التحقق الخاص بك في خدوم: ${code}\nصالح لمدة 10 دقائق.`);
  const dev = process.env.NODE_ENV !== "production";
  return NextResponse.json({ ok: true, provider: r.provider, ...(dev && r.provider === "console" ? { devCode: code } : {}) });
}

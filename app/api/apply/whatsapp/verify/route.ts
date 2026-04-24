import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  const normalized = String(phone).replace(/\s/g, "");
  const rows = (await db.execute(sql`SELECT id, code, expires_at, attempts, verified FROM phone_otps WHERE phone=${normalized} ORDER BY created_at DESC LIMIT 1`)) as Array<{ id: number; code: string; expires_at: string; attempts: number; verified: boolean }>;
  if (!rows.length) return NextResponse.json({ error: "اطلب رمز جديد" }, { status: 400 });
  const r = rows[0];
  if (r.verified) return NextResponse.json({ ok: true, alreadyVerified: true });
  if (new Date(r.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "انتهت صلاحية الرمز" }, { status: 400 });
  if (r.attempts >= 5) return NextResponse.json({ error: "تجاوزت عدد المحاولات" }, { status: 429 });
  await db.execute(sql`UPDATE phone_otps SET attempts=attempts+1 WHERE id=${r.id}`);
  if (String(r.code).trim() !== String(code).trim()) {
    return NextResponse.json({ error: "رمز غير صحيح" }, { status: 400 });
  }
  await db.execute(sql`UPDATE phone_otps SET verified=true WHERE id=${r.id}`);
  return NextResponse.json({ ok: true });
}

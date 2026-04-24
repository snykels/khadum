import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

const passwordRules = (p: string) => {
  if (p.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
  if (!/[A-Z]/.test(p)) return "يجب أن تحتوي على حرف إنجليزي كبير";
  if (!/[a-z]/.test(p)) return "يجب أن تحتوي على حرف إنجليزي صغير";
  if (!/[0-9]/.test(p)) return "يجب أن تحتوي على رقم";
  return null;
};

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const pwErr = passwordRules(password);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const [row]: any = await db.execute(
      sql`SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = ${token} LIMIT 1`
    );

    if (!row) return NextResponse.json({ error: "الرابط غير صالح" }, { status: 400 });
    if (row.used) return NextResponse.json({ error: "تم استخدام هذا الرابط من قبل" }, { status: 400 });
    if (new Date(row.expires_at) < new Date()) return NextResponse.json({ error: "انتهت صلاحية الرابط، طلب رابطاً جديداً" }, { status: 400 });

    const newHash = await hashPassword(password);
    await db.execute(sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${row.user_id}`);
    await db.execute(sql`UPDATE password_reset_tokens SET used = TRUE WHERE id = ${row.id}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}

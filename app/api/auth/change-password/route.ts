import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { oldPassword, newPassword } = await req.json();
  if (!oldPassword || !newPassword) return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
  if (newPassword.length < 8) return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
  if (!/[A-Z]/.test(newPassword)) return NextResponse.json({ error: "يجب أن تحتوي على حرف إنجليزي كبير على الأقل" }, { status: 400 });
  if (!/[a-z]/.test(newPassword)) return NextResponse.json({ error: "يجب أن تحتوي على حرف إنجليزي صغير على الأقل" }, { status: 400 });
  if (!/[0-9]/.test(newPassword)) return NextResponse.json({ error: "يجب أن تحتوي على رقم على الأقل" }, { status: 400 });

  const [user]: any = await db.execute(sql`SELECT password_hash FROM users WHERE id = ${s.userId}`);
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

  const ok = await verifyPassword(oldPassword, user.password_hash);
  if (!ok) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });

  const newHash = await hashPassword(newPassword);
  await db.execute(sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${s.userId}`);

  return NextResponse.json({ ok: true });
}

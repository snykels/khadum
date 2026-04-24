import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateToken, sendEmail } from "@/lib/notify";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const rows: any = await db.execute(sql`
    SELECT i.id, i.token, i.email, i.note, i.category, i.used_at AS "usedAt", i.expires_at AS "expiresAt",
           i.created_at AS "createdAt", u.name AS "createdByName",
           a.id AS "usedByApplicationId"
    FROM application_invites i
    LEFT JOIN users u ON u.id = i.created_by_id
    LEFT JOIN freelancer_applications a ON a.id = i.used_by_application_id
    ORDER BY i.id DESC LIMIT 200`);
  return NextResponse.json({ invites: rows });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const b = await req.json();
  const email = b.email ? String(b.email).toLowerCase().trim() : null;
  const note = b.note ? String(b.note).trim() : null;
  const category = b.category ? String(b.category).trim() : null;
  const days = Number(b.expiresInDays) > 0 ? Number(b.expiresInDays) : 14;
  const token = generateToken().slice(0, 24);
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  await db.execute(sql`INSERT INTO application_invites(token, email, note, category, expires_at, created_by_id) VALUES(${token}, ${email}, ${note}, ${category}, ${expires}, ${s.userId})`);
  const origin = req.headers.get("origin") || `https://${req.headers.get("host")}`;
  const link = `${origin}/apply?invite=${token}`;
  if (b.sendEmail && email) {
    const html = `<div dir="rtl" style="font-family:Tahoma;padding:20px;max-width:560px;margin:0 auto"><h2 style="color:#34cc30">دعوة للانضمام إلى منصة خدوم</h2><p>تم دعوتك للتقديم كمستقل في منصة خدوم. اضغط الرابط أدناه لإكمال نموذج التقديم:</p><p style="text-align:center;margin:24px 0"><a href="${link}" style="background:#34cc30;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">قدّم الآن</a></p><p style="color:#777;font-size:12px;word-break:break-all">${link}</p></div>`;
    await sendEmail(email, "دعوة الانضمام إلى منصة خدوم", html);
  }
  return NextResponse.json({ ok: true, token, link });
}

export async function DELETE(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.execute(sql`DELETE FROM application_invites WHERE id=${id} AND used_at IS NULL`);
  return NextResponse.json({ ok: true });
}

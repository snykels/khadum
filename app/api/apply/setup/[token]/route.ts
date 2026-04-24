import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const rows = (await db.execute(sql`
    SELECT ev.id, ev.email, ev.used, ev.revoked, ev.expires_at, ev.application_id, ev.user_id, fa.name AS app_name, u.name AS user_name
    FROM email_verifications ev
    LEFT JOIN freelancer_applications fa ON fa.id=ev.application_id
    LEFT JOIN users u ON u.id=ev.user_id
    WHERE ev.token=${token} LIMIT 1
  `)) as Array<{ id: number; email: string; used: boolean; revoked: boolean; expires_at: string; application_id: number; user_id: number | null; app_name: string | null; user_name: string | null }>;
  if (!rows.length) return NextResponse.json({ error: "رابط غير صالح" }, { status: 404 });
  const r = rows[0];
  if (r.revoked) return NextResponse.json({ error: "تم إلغاء هذا الرابط من قِبَل الإدارة" }, { status: 410 });
  if (r.used) return NextResponse.json({ error: "تم استخدام هذا الرابط مسبقاً" }, { status: 410 });
  if (new Date(r.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "انتهت صلاحية الرابط" }, { status: 410 });
  return NextResponse.json({ ok: true, email: r.email, name: r.user_name || r.app_name });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const { password } = await req.json();
  if (!password || String(password).length < 8) return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });

  const rows = (await db.execute(sql`
    SELECT id, application_id, user_id, email, used, revoked, expires_at
    FROM email_verifications WHERE token=${token} LIMIT 1
  `)) as Array<{ id: number; application_id: number; user_id: number | null; email: string; used: boolean; revoked: boolean; expires_at: string }>;
  if (!rows.length) return NextResponse.json({ error: "رابط غير صالح" }, { status: 404 });
  const r = rows[0];
  if (r.revoked) return NextResponse.json({ error: "تم إلغاء هذا الرابط من قِبَل الإدارة" }, { status: 410 });
  if (r.used) return NextResponse.json({ error: "تم استخدام هذا الرابط مسبقاً" }, { status: 410 });
  if (new Date(r.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "انتهت صلاحية الرابط" }, { status: 410 });

  const hash = await bcrypt.hash(String(password), 10);

  // Mark application's password too (legacy compat)
  await db.execute(sql`UPDATE freelancer_applications SET password_hash=${hash}, email_verified=true WHERE id=${r.application_id}`);

  // Activate the linked user. Prefer ev.user_id; fallback by email but only when role='freelancer'
  // to avoid accidentally activating an unrelated account that happens to share the email.
  let userId = r.user_id;
  if (!userId) {
    const byEmail = (await db.execute(sql`SELECT id FROM users WHERE email=${r.email} AND role='freelancer' LIMIT 1`)) as Array<{ id: number }>;
    userId = byEmail.length ? byEmail[0].id : null;
  }

  if (userId) {
    // Update existing user
    await db.execute(sql`UPDATE users SET password_hash=${hash}, is_verified=true, activation_status='active', is_suspended=false, suspension_reason=NULL, suspended_at=NULL WHERE id=${userId}`);
  } else {
    // Legacy fallback: create user from application
    const apps = (await db.execute(sql`SELECT name, email, phone, bio, city, status FROM freelancer_applications WHERE id=${r.application_id} LIMIT 1`)) as Array<{ name: string; email: string; phone: string; bio: string; city: string; status: string }>;
    if (apps.length && apps[0].status === "approved") {
      const a = apps[0];
      await db.execute(sql`INSERT INTO users(name, email, password_hash, phone, role, bio, location, is_verified, activation_status) VALUES(${a.name}, ${a.email}, ${hash}, ${a.phone}, 'freelancer', ${a.bio}, ${a.city}, true, 'active')`);
    }
  }

  await db.execute(sql`UPDATE email_verifications SET used=true WHERE id=${r.id}`);
  return NextResponse.json({ ok: true });
}

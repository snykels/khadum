import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [user]: any = await db.execute(sql`
    SELECT u.id, u.name, u.email, u.phone, u.avatar, u.bio, u.location,
           u.is_verified AS "isVerified", u.rating, u.completed_projects AS "completedProjects",
           u.avg_response_time AS "avgResponseTime", u.created_at AS "createdAt",
           a.main_category AS "mainCategory", a.sub_category AS "subCategory",
           a.years_experience AS "yearsExperience", a.skills, a.languages,
           a.portfolio_url AS "portfolioUrl", a.linkedin_url AS "linkedinUrl",
           a.bank_name AS "bankName", a.iban
    FROM users u
    LEFT JOIN freelancer_applications a ON a.email = u.email
    WHERE u.id = ${s.userId}
  `);

  return NextResponse.json({ profile: user || null });
}

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { name, bio, location, avatar } = body;

  await db.execute(sql`
    UPDATE users SET
      name = COALESCE(${name}, name),
      bio = COALESCE(${bio}, bio),
      location = COALESCE(${location}, location),
      avatar = COALESCE(${avatar}, avatar)
    WHERE id = ${s.userId}
  `);

  return NextResponse.json({ ok: true });
}

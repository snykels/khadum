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
<<<<<<< HEAD
           u.activation_status AS "activationStatus",
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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
<<<<<<< HEAD
  const { name, bio, location, avatar, skills, languages, yearsExperience, portfolioUrl, linkedinUrl } = body;

  if (name !== undefined || bio !== undefined || location !== undefined || avatar !== undefined) {
    await db.execute(sql`
      UPDATE users SET
        name = COALESCE(${name ?? null}, name),
        bio = COALESCE(${bio ?? null}, bio),
        location = COALESCE(${location ?? null}, location),
        avatar = COALESCE(${avatar ?? null}, avatar)
      WHERE id = ${s.userId}
    `);
  }

  if (skills !== undefined || languages !== undefined || yearsExperience !== undefined || portfolioUrl !== undefined || linkedinUrl !== undefined) {
    const yrs = yearsExperience !== undefined && yearsExperience !== null && yearsExperience !== "" ? Number(yearsExperience) : null;
    await db.execute(sql`
      UPDATE freelancer_applications SET
        skills = COALESCE(${skills ?? null}, skills),
        languages = COALESCE(${languages ?? null}, languages),
        years_experience = COALESCE(${yrs}, years_experience),
        portfolio_url = COALESCE(${portfolioUrl ?? null}, portfolio_url),
        linkedin_url = COALESCE(${linkedinUrl ?? null}, linkedin_url)
      WHERE email = (SELECT email FROM users WHERE id = ${s.userId})
    `);
  }
=======
  const { name, bio, location, avatar } = body;

  await db.execute(sql`
    UPDATE users SET
      name = COALESCE(${name}, name),
      bio = COALESCE(${bio}, bio),
      location = COALESCE(${location}, location),
      avatar = COALESCE(${avatar}, avatar)
    WHERE id = ${s.userId}
  `);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  return NextResponse.json({ ok: true });
}

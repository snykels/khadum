import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, phoneCountryCode } = await req.json();
    const result: { emailTaken?: boolean; phoneTaken?: boolean } = {};

    if (email && /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(String(email).trim())) {
      const e = String(email).toLowerCase().trim();
      const a: any = await db.execute(sql`SELECT 1 FROM freelancer_applications WHERE email=${e} LIMIT 1`);
      const u: any = await db.execute(sql`SELECT 1 FROM users WHERE email=${e} AND role='freelancer' LIMIT 1`);
      result.emailTaken = a.length > 0 || u.length > 0;
    }

    if (phone) {
      const ph = String(phone).trim();
      const cc = String(phoneCountryCode || "").trim();
      const full = (cc + ph).replace(/\s/g, "");
      // Only check uniqueness in freelancers (applications + users with role=freelancer)
      const a: any = await db.execute(sql`SELECT 1 FROM freelancer_applications WHERE phone=${ph} AND phone_country_code=${cc} LIMIT 1`);
      const u: any = await db.execute(sql`SELECT 1 FROM users WHERE role='freelancer' AND (phone=${full} OR phone=${ph}) LIMIT 1`);
      result.phoneTaken = a.length > 0 || u.length > 0;
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "check failed" }, { status: 500 });
  }
}

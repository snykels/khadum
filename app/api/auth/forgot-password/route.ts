import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendTemplatedEmail } from "@/lib/notify";
import crypto from "crypto";

const BASE_URL = process.env.APP_BASE_URL || "https://khadum.app";

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    await ensureTable();

    const rows: any = await db.execute(
      sql`SELECT id, name, email FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`
    );
    const user = rows[0];

    // Always return ok for privacy (don't reveal whether email exists)
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Clean up old tokens for this user
    await db.execute(
      sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id} OR expires_at < NOW()`
    );

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.execute(
      sql`INSERT INTO password_reset_tokens (user_id, token, expires_at)
          VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})`
    );

    const link = `${BASE_URL}/reset-password?token=${token}`;

    const result = await sendTemplatedEmail("password_reset", user.email, {
      name: user.name || "عزيزي العميل",
      link,
      site_name: "خدوم",
      dashboard_url: `${BASE_URL}/freelancer`,
      help_url: `${BASE_URL}/help`,
      contact_url: `https://wa.me/966511809878`,
      unsubscribe_url: `${BASE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
    });

    if (!result.ok) {
      console.error("[forgot-password] email failed:", result.info);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const OFFICIAL = new Set(["newOrder", "messages", "payments", "support"]);
const OPTIONAL = ["reviews", "marketing", "tips"];
const CHANNELS = ["email", "whatsapp", "sms"];

const DEFAULTS: Record<string, boolean> = {
  newOrder: true, messages: true, payments: true, support: true,
  reviews: true, marketing: false, tips: false,
  email: true, whatsapp: true, sms: false,
};

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id integer NOT NULL,
      key text NOT NULL,
      enabled boolean NOT NULL DEFAULT true,
      updated_at timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, key)
    )
  `);
}

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const rows = (await db.execute(sql`SELECT key, enabled FROM notification_preferences WHERE user_id=${session.userId}`)) as Array<{ key: string; enabled: boolean }>;
  const map: Record<string, boolean> = { ...DEFAULTS };
  for (const r of rows) map[r.key] = r.enabled;
  return NextResponse.json({ preferences: map, official: Array.from(OFFICIAL), optional: OPTIONAL, channels: CHANNELS });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const body = await req.json().catch(() => ({}));
  const { key, enabled } = body || {};
  if (typeof key !== "string" || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (OFFICIAL.has(key) && !enabled) {
    return NextResponse.json({ error: "لا يمكن إيقاف الإشعارات الرسمية" }, { status: 400 });
  }
  await db.execute(sql`
    INSERT INTO notification_preferences (user_id, key, enabled, updated_at)
    VALUES (${session.userId}, ${key}, ${enabled}, now())
    ON CONFLICT (user_id, key) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()
  `);
  return NextResponse.json({ ok: true });
}

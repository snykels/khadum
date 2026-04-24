import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

async function ensureColumns() {
  await db.execute(sql`ALTER TABLE mass_notifications ADD COLUMN IF NOT EXISTS channels jsonb DEFAULT '["inapp"]'::jsonb`);
  await db.execute(sql`ALTER TABLE mass_notifications ADD COLUMN IF NOT EXISTS delivered_count integer DEFAULT 0`);
  await db.execute(sql`ALTER TABLE mass_notifications ADD COLUMN IF NOT EXISTS failed_count integer DEFAULT 0`);
  await db.execute(sql`ALTER TABLE mass_notifications ADD COLUMN IF NOT EXISTS opened_count integer DEFAULT 0`);
}

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await ensureColumns();
  const r: any = await db.execute(sql`SELECT id, title, body, target, channels, sent_count AS "sentCount", delivered_count AS "deliveredCount", failed_count AS "failedCount", opened_count AS "openedCount", sent_at AS "sentAt" FROM mass_notifications ORDER BY sent_at DESC`);
  return NextResponse.json({ notifications: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await ensureColumns();
  const { title, body, target, channels } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const tg = target || 'all';
  const allowedChannels = ["inapp", "email", "whatsapp", "sms"];
  const ch = Array.isArray(channels) && channels.length > 0
    ? channels.filter((c: string) => allowedChannels.includes(c))
    : ["inapp"];

  let cnt: any;
  if (tg === 'freelancers') cnt = await db.execute(sql`SELECT COUNT(*)::int AS c FROM users WHERE role='freelancer'`);
  else if (tg === 'clients') cnt = await db.execute(sql`SELECT COUNT(*)::int AS c FROM users WHERE role='client'`);
  else cnt = await db.execute(sql`SELECT COUNT(*)::int AS c FROM users WHERE role IN ('freelancer','client')`);
  const sentCount = cnt[0]?.c || 0;

  const ids: any = await db.execute(sql`SELECT id FROM users WHERE role IN ('freelancer','client') ${tg==='freelancers' ? sql`AND role='freelancer'` : tg==='clients' ? sql`AND role='client'` : sql``}`);

  let delivered = 0, failed = 0;
  for (const u of ids) {
    try {
      if (ch.includes("inapp")) {
        await db.execute(sql`INSERT INTO notifications(user_id,title,body,type) VALUES(${u.id},${title},${body||''},'broadcast')`);
      }
      delivered++;
    } catch { failed++; }
  }

  await db.execute(sql`
    INSERT INTO mass_notifications(title, body, target, channels, sent_count, delivered_count, failed_count)
    VALUES (${title}, ${body||''}, ${tg}, ${JSON.stringify(ch)}::jsonb, ${sentCount}, ${delivered}, ${failed})
  `);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إرسال إشعار جماعي',${title},'create')`);
  return NextResponse.json({ ok: true, sentCount, deliveredCount: delivered, failedCount: failed, channels: ch });
}

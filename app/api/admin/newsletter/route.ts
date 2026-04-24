import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const stats: any = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active=true)::int AS subscribers,
      (SELECT COUNT(*) FROM newsletter_campaigns)::int AS sent,
      COALESCE((SELECT AVG(opened_count::float / NULLIF(sent_count,0)) * 100 FROM newsletter_campaigns WHERE sent_count > 0), 0)::float AS "openRate"
  `);
  const campaigns: any = await db.execute(sql`SELECT id, title, body, target, sent_count AS "sentCount", opened_count AS "openedCount", sent_at AS "sentAt" FROM newsletter_campaigns ORDER BY sent_at DESC`);
  return NextResponse.json({ stats: stats[0], campaigns });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { title, body, target } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const tg = target || 'all';
  const cnt: any = await db.execute(sql`SELECT COUNT(*)::int AS c FROM newsletter_subscribers WHERE is_active=true`);
  const sentCount = cnt[0]?.c || 0;
  await db.execute(sql`INSERT INTO newsletter_campaigns(title,body,target,sent_count) VALUES(${title},${body||''},${tg},${sentCount})`);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إرسال نشرة',${title},'create')`);
  return NextResponse.json({ ok: true, sentCount });
}

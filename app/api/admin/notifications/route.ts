import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const rows: any = await db.execute(sql`
    SELECT id, type, title, message, is_read AS "isRead", link, priority, created_at AS "createdAt"
    FROM notifications
    WHERE user_id = ${s.userId} OR user_id IS NULL
    ORDER BY created_at DESC LIMIT 50
  `);
  const unread = rows.filter((n: any) => !n.isRead).length;
  return NextResponse.json({ notifications: rows, unread });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { action, ids } = body;
  if (action === "mark-read") {
    if (Array.isArray(ids) && ids.length) {
      await db.execute(sql`UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = ANY(${ids}::int[]) AND (user_id = ${s.userId} OR user_id IS NULL)`);
    } else {
      await db.execute(sql`UPDATE notifications SET is_read = true, read_at = NOW() WHERE (user_id = ${s.userId} OR user_id IS NULL) AND is_read = false`);
    }
    return NextResponse.json({ ok: true });
  }
  if (action === "delete") {
    if (Array.isArray(ids) && ids.length) {
      await db.execute(sql`DELETE FROM notifications WHERE id = ANY(${ids}::int[]) AND (user_id = ${s.userId} OR user_id IS NULL)`);
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
}

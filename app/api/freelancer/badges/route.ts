import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [notif]: any = await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM notifications
    WHERE user_id = ${s.userId} AND is_read = false
  `);
  const [msgs]: any = await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM messages
    WHERE receiver_id = ${s.userId} AND is_read = false
  `);

  return NextResponse.json({
    alerts: Number(notif?.count || 0),
    messages: Number(msgs?.count || 0),
  });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const tickets: any = await db.execute(sql`
    SELECT id, subject, body, status, priority, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM support_tickets WHERE user_id = ${s.userId}
    ORDER BY created_at DESC LIMIT 50
  `);
  return NextResponse.json({ tickets: tickets as any[] });
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { subject, body, priority } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "الموضوع والوصف مطلوبان" }, { status: 400 });

  const [user]: any = await db.execute(sql`SELECT name FROM users WHERE id = ${s.userId}`);
  await db.execute(sql`
    INSERT INTO support_tickets (user_id, from_name, from_type, subject, body, priority, status)
    VALUES (${s.userId}, ${user?.name || "مستقل"}, 'freelancer', ${subject}, ${body}, ${priority || "normal"}, 'open')
  `);
  return NextResponse.json({ ok: true });
}

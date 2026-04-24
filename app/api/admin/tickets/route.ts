import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
<<<<<<< HEAD
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r = await db.execute(sql`
    SELECT
      t.id,
      t.from_name AS "fromName",
      t.from_type AS "fromRole",
      t.subject,
      t.body AS "message",
      t.priority,
      t.status,
      t.created_at AS "createdAt",
      u.name AS "assignedToName",
      uu.phone AS "fromPhone",
      uu.email AS "fromEmail"
    FROM support_tickets t
    LEFT JOIN users u  ON u.id  = t.assigned_to_id
    LEFT JOIN users uu ON uu.id = t.user_id
    ORDER BY
      CASE t.status WHEN 'open' THEN 0 WHEN 'in_review' THEN 1 ELSE 2 END,
      t.created_at DESC
  `);
  return NextResponse.json({ tickets: Array.from(r) });
=======
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r = await db.execute(sql`
    SELECT t.id, t.from_name AS "fromName", t.from_type AS "fromType", t.subject, t.body,
           t.priority, t.status, t.created_at AS "createdAt",
           u.name AS "assignedToName"
    FROM support_tickets t LEFT JOIN users u ON u.id = t.assigned_to_id
    ORDER BY t.created_at DESC
  `);
  return NextResponse.json({ tickets: r });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fromName, fromType, subject, message, priority, userId } = body;
  if (!fromName || !subject) return NextResponse.json({ error: "الحقول مطلوبة" }, { status: 400 });
  const [t] = await db.insert(supportTickets).values({
<<<<<<< HEAD
    userId: userId || null,
    fromName,
    fromType: fromType || "عميل",
    subject,
    body: message,
    priority: priority || "normal",
    status: "open",
=======
    userId: userId || null, fromName, fromType: fromType || "عميل", subject, body: message,
    priority: priority || "normal", status: "open",
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  }).returning();
  return NextResponse.json({ ticket: t });
}

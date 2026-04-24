import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderTransfers, orders } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r = await db.execute(sql`
    SELECT t.id, t.order_id AS "orderId", t.reason, t.notes, t.status, t.created_at AS "createdAt",
           f1.name AS "fromName", f2.name AS "toName", o.amount
    FROM order_transfers t
    LEFT JOIN users f1 ON f1.id = t.from_freelancer_id
    LEFT JOIN users f2 ON f2.id = t.to_freelancer_id
    LEFT JOIN orders o ON o.id = t.order_id
    ORDER BY t.created_at DESC
  `);
  return NextResponse.json({ transfers: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  const { orderId, toFreelancerId, reason, notes } = body;
  if (!orderId || !toFreelancerId) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  const [t] = await db.insert(orderTransfers).values({
    orderId, fromFreelancerId: order.freelancerId, toFreelancerId, reason, notes,
    status: "completed", createdById: s.userId,
  }).returning();
  await db.update(orders).set({ freelancerId: toFreelancerId }).where(eq(orders.id, orderId));
  return NextResponse.json({ transfer: t });
}

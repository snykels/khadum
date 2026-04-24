import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r = await db.execute(sql`
    SELECT r.id, r.client_name AS "clientName", r.client_phone AS "clientPhone",
           r.freelancer_name AS "freelancerName", r.amount, r.reason, r.source, r.status,
           r.created_at AS "createdAt", o.id AS "orderId"
    FROM refund_requests r LEFT JOIN orders o ON o.id = r.order_id
    ORDER BY r.created_at DESC
  `);
  return NextResponse.json({ refunds: r });
}

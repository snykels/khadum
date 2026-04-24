import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const r = await db.execute(sql`
    SELECT s.id, s.title, s.description, s.price, s.delivery_days AS "deliveryDays", s.status,
           s.rejection_reason AS "rejectionReason", s.rating, s.orders_count AS "ordersCount",
           s.created_at AS "createdAt", c.name_ar AS "categoryName",
           u.name AS "freelancerName", u.id AS "freelancerId"
    FROM services s
    LEFT JOIN categories c ON c.id = s.category_id
    LEFT JOIN users u ON u.id = s.freelancer_id
    ${status ? sql`WHERE s.status = ${status}::service_status` : sql``}
    ORDER BY s.created_at DESC
  `);
  return NextResponse.json({ services: r });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, services, users } from "@/lib/schema";
import { desc, eq, sql, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const fl = sql`fl`.as("fl");
  const cl = sql`cl`.as("cl");
  const conds = status ? [eq(orders.status, status as any)] : [];

  const rows = await db.execute(sql`
    SELECT o.id, o.status, o.amount, o.platform_fee AS "platformFee", o.description, o.due_date AS "dueDate",
           o.created_at AS "createdAt", o.completed_at AS "completedAt",
           s.title AS "serviceTitle",
           f.name AS "freelancerName", f.id AS "freelancerId",
           c.name AS "clientName",     c.id AS "clientId", c.phone AS "clientPhone"
    FROM orders o
    LEFT JOIN services s ON s.id = o.service_id
    LEFT JOIN users f ON f.id = o.freelancer_id
    LEFT JOIN users c ON c.id = o.client_id
    ${status ? sql`WHERE o.status = ${status}::order_status` : sql``}
    ORDER BY o.created_at DESC
  `);
  return NextResponse.json({ orders: rows });
}

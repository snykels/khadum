import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const orders: any = await db.execute(sql`
    SELECT
      o.id, o.public_code AS "publicCode", o.status, o.payment_status AS "paymentStatus",
      o.amount, o.platform_fee AS "platformFee", o.paid_amount AS "paidAmount",
      o.description, o.due_date AS "dueDate", o.completed_at AS "completedAt",
      o.created_at AS "createdAt",
      u.name AS "clientName", u.phone AS "clientPhone",
      s.title AS "serviceTitle"
    FROM orders o
    LEFT JOIN users u ON u.id = o.client_id
    LEFT JOIN services s ON s.id = o.service_id
    WHERE o.freelancer_id = ${s.userId}
    ORDER BY o.created_at DESC
    LIMIT 100
  `);

  const list = orders as any[];
  const counts = {
    all: list.length,
    pending: list.filter(o => o.status === "pending").length,
    active: list.filter(o => o.status === "active").length,
    completed: list.filter(o => o.status === "completed").length,
    cancelled: list.filter(o => o.status === "cancelled").length,
    disputed: list.filter(o => o.status === "disputed").length,
  };

  return NextResponse.json({ orders: list, counts });
}

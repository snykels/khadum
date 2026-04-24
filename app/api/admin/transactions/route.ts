import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const orders: any = await db.execute(sql`
    SELECT
      o.id, o.public_code AS "publicCode", o.amount, o.platform_fee AS "platformFee",
      o.paid_amount AS "paidAmount", o.payment_status AS "paymentStatus",
      o.status AS "orderStatus", o.created_at AS "createdAt", o.completed_at AS "completedAt",
      c.name AS "clientName", c.phone AS "clientPhone",
      f.name AS "freelancerName"
    FROM orders o
    LEFT JOIN users c ON c.id = o.client_id
    LEFT JOIN users f ON f.id = o.freelancer_id
    ORDER BY o.created_at DESC
    LIMIT 500
  `);

  const withdrawalRows: any = await db.execute(sql`
    SELECT
      w.id, w.amount, w.status, w.bank_name AS "bankName",
      w.account_number AS "accountNumber", w.created_at AS "createdAt",
      u.name AS "freelancerName"
    FROM withdrawals w LEFT JOIN users u ON u.id = w.user_id
    ORDER BY w.created_at DESC LIMIT 200
  `);

  const paymentSessions: any = await db.execute(sql`
    SELECT id, order_id AS "orderId", client_phone AS "clientPhone",
      amount, currency, status, paid_at AS "paidAt",
      expires_at AS "expiresAt", created_at AS "createdAt"
    FROM payment_sessions
    ORDER BY created_at DESC LIMIT 200
  `).catch(() => []);

  const summary: any = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE WHEN payment_status='paid' THEN paid_amount ELSE 0 END),0)::text AS "totalRevenue",
      COALESCE(SUM(CASE WHEN payment_status='paid' THEN platform_fee ELSE 0 END),0)::text AS "platformProfit",
      COALESCE(SUM(CASE WHEN payment_status='paid' AND status='completed' THEN paid_amount - platform_fee ELSE 0 END),0)::text AS "paidOut",
      COALESCE(SUM(CASE WHEN payment_status='paid' AND status != 'completed' THEN paid_amount - platform_fee ELSE 0 END),0)::text AS "escrow"
    FROM orders
  `);

  return NextResponse.json({
    summary: summary[0],
    orders,
    withdrawals: withdrawalRows,
    paymentSessions,
  });
}

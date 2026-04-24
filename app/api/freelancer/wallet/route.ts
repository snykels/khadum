import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [wallet]: any = await db.execute(sql`
    SELECT balance, pending, total_earned AS "totalEarned"
    FROM wallets WHERE user_id = ${s.userId}
  `);

  const transactions: any = await db.execute(sql`
    SELECT
      o.id,
      o.public_code AS "publicCode",
      o.amount,
      o.platform_fee AS "platformFee",
      o.paid_amount AS "paidAmount",
      o.payment_status AS "paymentStatus",
      o.status AS "orderStatus",
      o.completed_at AS "completedAt",
      o.created_at AS "createdAt",
      u.name AS "clientName"
    FROM orders o
    LEFT JOIN users u ON u.id = o.client_id
    WHERE o.freelancer_id = ${s.userId}
    ORDER BY o.created_at DESC
    LIMIT 50
  `);

  const rows = (transactions as any[]).map((o: any) => {
    const net = Number(o.paidAmount) - Number(o.platformFee);
    const type =
      o.paymentStatus === "paid" && o.orderStatus === "completed"
        ? "إيداع"
        : o.paymentStatus === "paid"
        ? "معلّق"
        : "بانتظار الدفع";
    return {
      id: o.id,
      type,
      desc: `طلب #${o.publicCode || "ORD-" + String(o.id).padStart(4, "0")} — ${o.clientName || "عميل"}`,
      amount: net,
      sign: type === "إيداع" ? "+" : "",
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      date: o.completedAt || o.createdAt,
    };
  });

  const withdrawals: any = await db.execute(sql`
    SELECT id, amount, status, bank_name AS "bankName", account_number AS "accountNumber", created_at AS "createdAt"
    FROM withdrawals WHERE user_id = ${s.userId}
    ORDER BY created_at DESC LIMIT 20
  `);

  return NextResponse.json({
    balance: Number(wallet?.balance || 0),
    pending: Number(wallet?.pending || 0),
    totalEarned: Number(wallet?.totalEarned || 0),
    transactions: rows,
    withdrawals,
  });
}

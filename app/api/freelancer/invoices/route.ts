import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const rows: any = await db.execute(sql`
    SELECT
      o.id,
      o.public_code AS "publicCode",
      o.amount,
      o.platform_fee AS "platformFee",
      o.paid_amount AS "paidAmount",
      o.payment_status AS "paymentStatus",
      o.status AS "orderStatus",
      o.description,
      o.created_at AS "createdAt",
      o.completed_at AS "completedAt",
      o.client_phone AS "clientPhone",
      u.name AS "clientName",
      s.title AS "serviceTitle"
    FROM orders o
    LEFT JOIN users u ON u.id = o.client_id
    LEFT JOIN services s ON s.id = o.service_id
    WHERE o.freelancer_id = ${s.userId}
      AND o.payment_status IN ('paid', 'pending')
    ORDER BY o.created_at DESC
  `);

  const invoices = (rows as any[]).map((o: any, idx: number) => {
    const net = Number(o.paidAmount || o.amount) - Number(o.platformFee || 0);
    return {
      id: `INV-${new Date(o.createdAt).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
      orderId: o.id,
      publicCode: o.publicCode,
      client: o.clientName || o.clientPhone || "عميل",
      service: o.serviceTitle || o.description || "طلب مخصص",
      amount: Number(o.paidAmount || o.amount),
      commission: Number(o.platformFee || 0),
      net,
      date: o.createdAt,
      completedAt: o.completedAt,
      status:
        o.paymentStatus === "paid" && o.orderStatus === "completed"
          ? "مدفوعة"
          : o.paymentStatus === "paid"
          ? "بانتظار التسليم"
          : "بانتظار الدفع",
      statusColor:
        o.paymentStatus === "paid" && o.orderStatus === "completed"
          ? "bg-green-100 text-green-700"
          : o.paymentStatus === "paid"
          ? "bg-blue-100 text-blue-700"
          : "bg-yellow-100 text-yellow-700",
    };
  });

  return NextResponse.json({ invoices });
}

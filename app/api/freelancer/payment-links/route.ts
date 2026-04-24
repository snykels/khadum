/**
 * المستقل ينشئ رابط دفع → يُرسَل تلقائياً للعميل عبر البوت.
 * المستقل لا يرسله يدوياً — الزر في لوحة التحكم يرسله للبوت فقط.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { createPaymentSession } from "@/lib/paymentSession";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s?.userId || s.role !== "freelancer")
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { orderId, ttlMinutes } = body as { orderId?: number; ttlMinutes?: number };

  if (!orderId) return NextResponse.json({ error: "رقم الطلب مطلوب" }, { status: 400 });

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.freelancerId, s.userId)))
    .limit(1);

  if (!order) return NextResponse.json({ error: "الطلب غير موجود أو غير مصرح" }, { status: 404 });
  if (order.paymentStatus === "paid")
    return NextResponse.json({ error: "هذا الطلب مدفوع مسبقاً" }, { status: 400 });

  const phone = normalizePhone(order.clientPhone || "");
  if (!phone)
    return NextResponse.json({ error: "رقم جوال العميل غير متوفر في الطلب" }, { status: 400 });

  const session = await createPaymentSession({
    orderId: order.id,
    clientPhone: phone,
    amount: Number(order.amount),
    description: `طلب #${order.publicCode || order.id}`,
    ttlMinutes: ttlMinutes ?? 30,
  });

  const baseUrl = process.env.APP_BASE_URL || `https://${req.headers.get("host")}`;
  const payUrl = `${baseUrl}/pay/${session.token}`;

  return NextResponse.json({
    ok: true,
    url: payUrl,
    expiresAt: session.expiresAt,
    message: "تم إنشاء رابط الدفع وسيُرسَل للعميل تلقائياً عبر البوت",
  });
}

export async function GET() {
  const s = await getSession();
  if (!s?.userId || s.role !== "freelancer")
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const rows: any = await db.execute(sql`
    SELECT ps.id, ps.token, ps.order_id AS "orderId", ps.amount,
      ps.status, ps.expires_at AS "expiresAt", ps.paid_at AS "paidAt",
      ps.created_at AS "createdAt", o.public_code AS "publicCode"
    FROM payment_sessions ps
    JOIN orders o ON o.id = ps.order_id
    WHERE o.freelancer_id = ${s.userId}
    ORDER BY ps.created_at DESC LIMIT 50
  `).catch(() => []);

  return NextResponse.json({ sessions: rows });
}

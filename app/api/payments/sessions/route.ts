/**
 * إنشاء جلسة دفع جديدة (يستدعيها البوت أو الإدمن فقط — ليست عامة).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import { createPaymentSession } from "@/lib/paymentSession";

export async function POST(req: NextRequest) {
  // التحقق من الصلاحية: أدمن أو عبر مفتاح خدمة داخلي
  const internalKey = req.headers.get("x-internal-key");
  const isInternal = !!process.env.INTERNAL_API_KEY && internalKey === process.env.INTERNAL_API_KEY;
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  if (!isInternal && !isAdmin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { orderId, clientPhone, amount, description, ttlMinutes } = body as {
    orderId?: number;
    clientPhone?: string;
    amount?: number;
    description?: string;
    ttlMinutes?: number;
  };

  if (!orderId || !clientPhone || !amount || !description) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const phone = normalizePhone(clientPhone);
  if (!phone) {
    return NextResponse.json({ error: "رقم الجوال غير صحيح" }, { status: 400 });
  }

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (order.length === 0) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }
  const orderClientPhone = normalizePhone(order[0].clientPhone || "");
  if (orderClientPhone && orderClientPhone !== phone) {
    return NextResponse.json({ error: "رقم الجوال لا يطابق رقم الطلب" }, { status: 400 });
  }

  if (Number(amount) <= 0 || Number(amount) > 100_000) {
    return NextResponse.json({ error: "المبلغ غير صالح" }, { status: 400 });
  }

  const created = await createPaymentSession({
    orderId,
    clientPhone: phone,
    amount: Number(amount),
    description: String(description).slice(0, 200),
    ttlMinutes: ttlMinutes ?? 30,
  });

  const baseUrl = process.env.APP_BASE_URL || `https://${req.headers.get("host")}`;
  return NextResponse.json({
    sessionId: created.id,
    token: created.token,
    url: `${baseUrl}/pay/${created.token}`,
    expiresAt: created.expiresAt,
  });
}

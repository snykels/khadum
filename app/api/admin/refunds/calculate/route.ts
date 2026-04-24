import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { calculateRefund } from "@/lib/refundCalculator";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { orderId, freelancerDelivered, clientApproved } = body;
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
  const [o] = await db.select().from(orders).where(eq(orders.id, Number(orderId))).limit(1);
  if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });

  const result = calculateRefund({
    orderAmount: Number(o.amount),
    paidAmount: Number(o.paidAmount),
    refundedAmount: Number(o.refundedAmount),
    status: o.status as any,
    acceptedAt: o.acceptedAt,
    startedAt: o.startedAt,
    completedAt: o.completedAt,
    dueDate: o.dueDate,
    freelancerDelivered: !!freelancerDelivered,
    clientApproved: !!clientApproved,
  });
  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminInterventions, users, conversations } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rows = await db
    .select()
    .from(adminInterventions)
    .orderBy(desc(adminInterventions.createdAt))
    .limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { type, conversationId, orderId, disputeId, targetUserId, reason, details, amount } = body;
  if (!type || !reason) return NextResponse.json({ error: "type و reason مطلوبان" }, { status: 400 });

  const [intervention] = await db
    .insert(adminInterventions)
    .values({
      adminId: session.userId!,
      type,
      conversationId: conversationId ? Number(conversationId) : null,
      orderId: orderId ? Number(orderId) : null,
      disputeId: disputeId ? Number(disputeId) : null,
      targetUserId: targetUserId ? Number(targetUserId) : null,
      reason,
      details: (details ?? {}) as any,
      amount: amount !== undefined ? String(amount) : null,
    })
    .returning();

  if (type === "block" && targetUserId) {
    await db
      .update(users)
      .set({ isBlocked: true, blockReason: reason, blockedAt: new Date(), blockedBySystem: false })
      .where(eq(users.id, Number(targetUserId)));
  } else if (type === "unblock" && targetUserId) {
    await db
      .update(users)
      .set({ isBlocked: false, blockReason: null, blockedAt: null, blockedBySystem: false })
      .where(eq(users.id, Number(targetUserId)));
  } else if ((type === "warning" || type === "manual_message" || type === "note") && conversationId) {
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, Number(conversationId)));
  }

  return NextResponse.json(intervention, { status: 201 });
}

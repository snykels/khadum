import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { disputes, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const raisedByU = alias(users, "raised_by_u");
  const againstU = alias(users, "against_u");
  const rows = await db
    .select({
      id: disputes.id,
      publicCode: disputes.publicCode,
      orderId: disputes.orderId,
      conversationId: disputes.conversationId,
      category: disputes.category,
      reason: disputes.reason,
      status: disputes.status,
      priority: disputes.priority,
      autoDetected: disputes.autoDetected,
      raisedByName: raisedByU.name,
      againstName: againstU.name,
      createdAt: disputes.createdAt,
      resolvedAt: disputes.resolvedAt,
    })
    .from(disputes)
    .leftJoin(raisedByU, eq(raisedByU.id, disputes.raisedBy))
    .leftJoin(againstU, eq(againstU.id, disputes.againstUserId))
    .orderBy(desc(disputes.createdAt))
    .limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { id, status, resolution, refundAmount } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const [updated] = await db
    .update(disputes)
    .set({
      ...(status ? { status } : {}),
      ...(resolution ? { resolution } : {}),
      ...(refundAmount !== undefined ? { refundAmount: String(refundAmount), refundIssued: true } : {}),
      ...(status === "resolved" || status === "rejected" ? { resolvedBy: session.userId, resolvedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(disputes.id, Number(id)))
    .returning();
  return NextResponse.json(updated);
}

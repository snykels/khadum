import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
<<<<<<< HEAD
import { disputes, conversations } from "@/lib/schema";
=======
import { disputes } from "@/lib/schema";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rows = await db.execute(sql`
    SELECT
      d.id, d.public_code AS "publicCode", d.order_id AS "orderId",
      d.conversation_id AS "conversationId",
      d.category, d.reason, d.status, d.priority,
      d.auto_detected AS "autoDetected",
<<<<<<< HEAD
      d.evidence,
      d.resolution, d.refund_issued AS "refundIssued",
      d.assigned_to AS "assignedTo",
=======
      d.resolution, d.refund_issued AS "refundIssued",
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      d.created_at AS "createdAt", d.resolved_at AS "resolvedAt",
      ru.name AS "raisedByName",
      au.name AS "againstName",
      o.amount AS "orderAmount",
      o.public_code AS "orderCode"
    FROM disputes d
    LEFT JOIN users ru ON ru.id = d.raised_by
    LEFT JOIN users au ON au.id = d.against_user_id
    LEFT JOIN orders o  ON o.id  = d.order_id
    ORDER BY d.created_at DESC
    LIMIT 200
  `);
  return NextResponse.json(rows.rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
<<<<<<< HEAD
  const { id, status, resolution, refundAmount, assignedToMe } = body;
=======
  const { id, status, resolution, refundAmount } = body;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const [updated] = await db
    .update(disputes)
    .set({
      ...(status ? { status } : {}),
      ...(resolution ? { resolution } : {}),
      ...(refundAmount !== undefined ? { refundAmount: String(refundAmount), refundIssued: true } : {}),
<<<<<<< HEAD
      ...(assignedToMe ? { assignedTo: session.userId } : {}),
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      ...(status === "resolved" || status === "rejected" ? { resolvedBy: session.userId, resolvedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(disputes.id, Number(id)))
    .returning();
  return NextResponse.json(updated);
}
<<<<<<< HEAD

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { conversationId, reason, category } = body;

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const [conv] = await db
    .select({
      id: conversations.id,
      orderId: conversations.orderId,
      clientId: conversations.clientId,
      freelancerId: conversations.freelancerId,
    })
    .from(conversations)
    .where(eq(conversations.id, Number(conversationId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "conversation not found" }, { status: 404 });
  }
  if (!conv.clientId || !conv.freelancerId) {
    return NextResponse.json({ error: "conversation missing parties" }, { status: 400 });
  }

  const existing = await db
    .select({ id: disputes.id })
    .from(disputes)
    .where(eq(disputes.conversationId, Number(conversationId)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ id: existing[0].id, existing: true });
  }

  const publicCode = `DSP-${Date.now().toString(36).toUpperCase()}`;
  const [created] = await db
    .insert(disputes)
    .values({
      publicCode,
      conversationId: conv.id,
      orderId: conv.orderId ?? undefined,
      raisedBy: conv.clientId,
      raisedByParty: "client",
      againstUserId: conv.freelancerId,
      category: category || "general",
      reason: reason || "تحويل من محادثة بواسطة الإدارة",
      assignedTo: session.userId,
    })
    .returning();

  await db
    .update(conversations)
    .set({ status: "disputed" })
    .where(eq(conversations.id, Number(conversationId)));

  return NextResponse.json(created, { status: 201 });
}
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

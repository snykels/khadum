import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, users, orders } from "@/lib/schema";
import { and, eq, or, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateConversationCode } from "@/lib/conversationCode";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = session.userId;
  const isAdmin = session.role === "admin" || session.role === "supervisor";

  const where = isAdmin ? undefined : or(eq(conversations.clientId, uid), eq(conversations.freelancerId, uid));
  const rows = await db
    .select()
    .from(conversations)
    .where(where as any)
    .orderBy(desc(conversations.lastMessageAt))
    .limit(100);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { orderId, clientId, freelancerId, subject } = body;

  if (!clientId || !freelancerId) {
    return NextResponse.json({ error: "clientId و freelancerId مطلوبان" }, { status: 400 });
  }

  if (orderId) {
    const existing = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.orderId, Number(orderId))))
      .limit(1);
    if (existing.length) return NextResponse.json(existing[0]);
  }

  const [client] = await db.select().from(users).where(eq(users.id, Number(clientId))).limit(1);
  const [freelancer] = await db.select().from(users).where(eq(users.id, Number(freelancerId))).limit(1);
  if (!client || !freelancer) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  const [conv] = await db
    .insert(conversations)
    .values({
      publicCode: generateConversationCode(),
      orderId: orderId ? Number(orderId) : null,
      clientId: Number(clientId),
      freelancerId: Number(freelancerId),
      subject: subject || null,
      status: "active",
    })
    .returning();
  return NextResponse.json(conv, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, users, orders, services, adminInterventions, supportTickets } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const convId = Number(id);

  const client = alias(users, "client");
  const freelancer = alias(users, "freelancer");
  const admin = alias(users, "admin");

  const [conv] = await db
    .select({
      id: conversations.id,
      publicCode: conversations.publicCode,
      orderId: conversations.orderId,
      status: conversations.status,
      subject: conversations.subject,
      lastMessageAt: conversations.lastMessageAt,
      lastMessageBy: conversations.lastMessageBy,
      unreadByAdmin: conversations.unreadByAdmin,
      adminId: conversations.adminId,
      adminName: admin.name,
      adminEmail: admin.email,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAvatar: client.avatar,
      clientCreatedAt: client.createdAt,
      clientIsBlocked: client.isBlocked,
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      freelancerEmail: freelancer.email,
      freelancerPhone: freelancer.phone,
      freelancerAvatar: freelancer.avatar,
      freelancerCreatedAt: freelancer.createdAt,
      freelancerIsBlocked: freelancer.isBlocked,
      closedAt: conversations.closedAt,
      closedReason: conversations.closedReason,
      createdAt: conversations.createdAt,
      channel: conversations.channel,
    })
    .from(conversations)
    .leftJoin(client, eq(client.id, conversations.clientId))
    .leftJoin(freelancer, eq(freelancer.id, conversations.freelancerId))
    .leftJoin(admin, eq(admin.id, conversations.adminId))
    .where(eq(conversations.id, convId))
    .limit(1);

  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Mark as read by admin
  await db
    .update(conversations)
    .set({ unreadByAdmin: 0 })
    .where(eq(conversations.id, convId));

  // Order info
  let order: any = null;
  if (conv.orderId) {
    const [o] = await db
      .select({
        id: orders.id,
        publicCode: orders.publicCode,
        status: orders.status,
        amount: orders.amount,
        createdAt: orders.createdAt,
        serviceTitle: services.title,
      })
      .from(orders)
      .leftJoin(services, eq(services.id, orders.serviceId))
      .where(eq(orders.id, conv.orderId))
      .limit(1);
    order = o || null;
  }

  // Internal notes (interventions of type "note")
  const notes = await db
    .select({
      id: adminInterventions.id,
      adminId: adminInterventions.adminId,
      adminName: users.name,
      reason: adminInterventions.reason,
      createdAt: adminInterventions.createdAt,
    })
    .from(adminInterventions)
    .leftJoin(users, eq(users.id, adminInterventions.adminId))
    .where(
      and(
        eq(adminInterventions.conversationId, convId),
        eq(adminInterventions.type, "note")
      )
    )
    .orderBy(desc(adminInterventions.createdAt))
    .limit(50);

  // Recent tickets by client
  let ticketHistory: any[] = [];
  if (conv.clientId) {
    ticketHistory = await db
      .select({
        id: supportTickets.id,
        subject: supportTickets.subject,
        status: supportTickets.status,
        priority: supportTickets.priority,
        createdAt: supportTickets.createdAt,
      })
      .from(supportTickets)
      .where(eq(supportTickets.userId, conv.clientId))
      .orderBy(desc(supportTickets.createdAt))
      .limit(5);
  }

  return NextResponse.json({ ...conv, order, notes, ticketHistory });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const convId = Number(id);
  const body = await req.json().catch(() => ({}));

  const update: any = { updatedAt: new Date() };

  if (typeof body.status === "string") {
    const allowed = ["active", "completed", "disputed", "blocked", "archived"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }
    update.status = body.status;
    if (body.status === "completed" || body.status === "archived") {
      update.closedAt = new Date();
      if (body.closedReason) update.closedReason = String(body.closedReason);
    } else {
      update.closedAt = null;
      update.closedReason = null;
    }
  }

  if ("adminId" in body) {
    if (body.adminId === null || body.adminId === "") {
      update.adminId = null;
    } else {
      const aid = Number(body.adminId);
      if (Number.isFinite(aid)) update.adminId = aid;
    }
  }

  if (typeof body.subject === "string") {
    update.subject = body.subject.slice(0, 500);
  }

  const [updated] = await db
    .update(conversations)
    .set(update)
    .where(eq(conversations.id, convId))
    .returning();

  return NextResponse.json(updated);
}

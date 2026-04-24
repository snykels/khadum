import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";
import { maybeRunLifecycle } from "@/lib/dataLifecycle";

export async function GET() {
  // Fire-and-forget hourly cleanup (advisory-locked, throttled)
  maybeRunLifecycle().catch(() => {});
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const client = alias(users, "client");
  const freelancer = alias(users, "freelancer");
  const rows = await db
    .select({
      id: conversations.id,
      publicCode: conversations.publicCode,
      orderId: conversations.orderId,
      status: conversations.status,
      subject: conversations.subject,
      lastMessageAt: conversations.lastMessageAt,
      lastMessageBy: conversations.lastMessageBy,
      unreadByAdmin: conversations.unreadByAdmin,
      clientName: client.name,
      clientId: client.id,
      freelancerName: freelancer.name,
      freelancerId: freelancer.id,
    })
    .from(conversations)
    .leftJoin(client, eq(client.id, conversations.clientId))
    .leftJoin(freelancer, eq(freelancer.id, conversations.freelancerId))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(200);
  return NextResponse.json(rows);
}

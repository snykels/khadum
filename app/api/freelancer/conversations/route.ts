import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = session.userId;
  const client = alias(users, "client");
  const freelancer = alias(users, "freelancer");
  const all = await db
    .select({
      id: conversations.id,
      publicCode: conversations.publicCode,
      orderId: conversations.orderId,
      status: conversations.status,
      subject: conversations.subject,
      lastMessageAt: conversations.lastMessageAt,
      lastMessageBy: conversations.lastMessageBy,
      clientId: client.id,
      clientName: client.name,
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      unreadByClient: conversations.unreadByClient,
      unreadByFreelancer: conversations.unreadByFreelancer,
    })
    .from(conversations)
    .leftJoin(client, eq(client.id, conversations.clientId))
    .leftJoin(freelancer, eq(freelancer.id, conversations.freelancerId))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(200);
  // Filter to my conversations
  const mine = all.filter((c) => c.clientId === me || c.freelancerId === me);
  return NextResponse.json(mine);
}

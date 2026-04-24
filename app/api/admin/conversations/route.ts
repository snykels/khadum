<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, users, conversationMessages, orders } from "@/lib/schema";
import { and, desc, eq, ilike, or, sql, inArray } from "drizzle-orm";
=======
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
import { getSession } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";
import { maybeRunLifecycle } from "@/lib/dataLifecycle";

<<<<<<< HEAD
export async function GET(req: NextRequest) {
=======
export async function GET() {
  // Fire-and-forget hourly cleanup (advisory-locked, throttled)
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  maybeRunLifecycle().catch(() => {});
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
<<<<<<< HEAD

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const assignee = searchParams.get("assignee");
  const search = searchParams.get("q");
  const unread = searchParams.get("unread");
  const rawLimit = Number(searchParams.get("limit") || 100);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 500) : 100;

  const client = alias(users, "client");
  const freelancer = alias(users, "freelancer");
  const admin = alias(users, "admin");

  const conds: any[] = [];
  if (status && status !== "all") {
    if (status === "unassigned") {
      conds.push(sql`${conversations.adminId} IS NULL`);
    } else {
      conds.push(eq(conversations.status, status as any));
    }
  }
  if (assignee) {
    if (assignee === "me") conds.push(eq(conversations.adminId, session.userId!));
    else if (assignee === "none") conds.push(sql`${conversations.adminId} IS NULL`);
    else conds.push(eq(conversations.adminId, Number(assignee)));
  }
  if (unread === "1") {
    conds.push(sql`${conversations.unreadByAdmin} > 0`);
  }
  if (search) {
    conds.push(
      or(
        ilike(conversations.publicCode, `%${search}%`),
        ilike(client.name, `%${search}%`),
        ilike(freelancer.name, `%${search}%`),
        ilike(conversations.subject, `%${search}%`)
      )!
    );
  }

=======
  const client = alias(users, "client");
  const freelancer = alias(users, "freelancer");
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
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
<<<<<<< HEAD
      adminId: conversations.adminId,
      adminName: admin.name,
      clientName: client.name,
      clientId: client.id,
      clientPhone: client.phone,
      clientAvatar: client.avatar,
      freelancerName: freelancer.name,
      freelancerId: freelancer.id,
      freelancerPhone: freelancer.phone,
      freelancerAvatar: freelancer.avatar,
      createdAt: conversations.createdAt,
      channel: conversations.channel,
=======
      clientName: client.name,
      clientId: client.id,
      freelancerName: freelancer.name,
      freelancerId: freelancer.id,
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    })
    .from(conversations)
    .leftJoin(client, eq(client.id, conversations.clientId))
    .leftJoin(freelancer, eq(freelancer.id, conversations.freelancerId))
<<<<<<< HEAD
    .leftJoin(admin, eq(admin.id, conversations.adminId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(conversations.lastMessageAt))
    .limit(limit);

=======
    .orderBy(desc(conversations.lastMessageAt))
    .limit(200);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return NextResponse.json(rows);
}

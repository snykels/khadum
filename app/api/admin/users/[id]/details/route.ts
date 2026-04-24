import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders, wallets, withdrawals, reviews, services, refundRequests, supportTickets, freelancerApplications } from "@/lib/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await ctx.params;
  const userId = parseInt(id);
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const isFreelancer = user.role === "freelancer";

  const [stats] = isFreelancer
    ? await db.select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) FILTER (WHERE ${orders.status}='completed')::int`,
        cancelled: sql<number>`count(*) FILTER (WHERE ${orders.status}='cancelled')::int`,
        active: sql<number>`count(*) FILTER (WHERE ${orders.status} IN ('active','pending'))::int`,
        disputed: sql<number>`count(*) FILTER (WHERE ${orders.status}='disputed')::int`,
        earned: sql<string>`coalesce(sum(${orders.amount}) FILTER (WHERE ${orders.status}='completed'),0)::text`,
        gross: sql<string>`coalesce(sum(${orders.amount}),0)::text`,
      }).from(orders).where(eq(orders.freelancerId, userId))
    : await db.select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) FILTER (WHERE ${orders.status}='completed')::int`,
        cancelled: sql<number>`count(*) FILTER (WHERE ${orders.status}='cancelled')::int`,
        active: sql<number>`count(*) FILTER (WHERE ${orders.status} IN ('active','pending'))::int`,
        disputed: sql<number>`count(*) FILTER (WHERE ${orders.status}='disputed')::int`,
        spent: sql<string>`coalesce(sum(${orders.amount}),0)::text`,
        gross: sql<string>`coalesce(sum(${orders.amount}),0)::text`,
      }).from(orders).where(eq(orders.clientId, userId));

  const recentOrders = await db.select({
    id: orders.id,
    publicCode: orders.publicCode,
    status: orders.status,
    amount: orders.amount,
    paidAmount: orders.paidAmount,
    paymentStatus: orders.paymentStatus,
    createdAt: orders.createdAt,
    completedAt: orders.completedAt,
    serviceTitle: services.title,
  }).from(orders)
    .leftJoin(services, eq(services.id, orders.serviceId))
    .where(isFreelancer ? eq(orders.freelancerId, userId) : eq(orders.clientId, userId))
    .orderBy(desc(orders.createdAt)).limit(20);

  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));

  const recentWithdrawals = isFreelancer ? await db.select().from(withdrawals)
    .where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt)).limit(10) : [];

  const recentRefunds = !isFreelancer ? await db.select({
    id: refundRequests.id,
    amount: refundRequests.amount,
    refundAmount: refundRequests.refundAmount,
    status: refundRequests.status,
    reason: refundRequests.reason,
    createdAt: refundRequests.createdAt,
  }).from(refundRequests)
    .where(eq(refundRequests.clientPhone, user.phone || "__none__"))
    .orderBy(desc(refundRequests.createdAt)).limit(10) : [];

  const recentTickets = await db.select({
    id: supportTickets.id,
    subject: supportTickets.subject,
    status: supportTickets.status,
    priority: supportTickets.priority,
    createdAt: supportTickets.createdAt,
  }).from(supportTickets).where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt)).limit(10);

  const recentReviews = isFreelancer ? await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    createdAt: reviews.createdAt,
    reviewerName: users.name,
  }).from(reviews)
    .leftJoin(users, eq(users.id, reviews.reviewerId))
    .where(eq(reviews.freelancerId, userId))
    .orderBy(desc(reviews.createdAt)).limit(10) : [];

  const onlineThreshold = 15 * 60 * 1000;
  const isOnline = user.lastLoginAt ? (Date.now() - new Date(user.lastLoginAt).getTime() < onlineThreshold) : false;

  const [application] = isFreelancer
    ? await db.select().from(freelancerApplications)
        .where(eq(freelancerApplications.email, user.email))
        .orderBy(desc(freelancerApplications.createdAt))
        .limit(1)
    : [null];

  return NextResponse.json({
    user: { ...user, isOnline },
    stats: stats || {},
    recentOrders,
    wallet: wallet || null,
    withdrawals: recentWithdrawals,
    reviews: recentReviews,
    refunds: recentRefunds,
    tickets: recentTickets,
    application: application || null,
  });
}

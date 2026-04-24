import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

function periodFilter(period: string): string {
  switch (period) {
    case "today":   return "AND created_at >= NOW() - INTERVAL '1 day'";
    case "7d":      return "AND created_at >= NOW() - INTERVAL '7 days'";
    case "30d":     return "AND created_at >= NOW() - INTERVAL '30 days'";
    case "90d":     return "AND created_at >= NOW() - INTERVAL '90 days'";
    default:        return "";
  }
}

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period") || "30d";
  const pf = periodFilter(period);
  const pfO = pf.replace(/created_at/g, "o.created_at");

  const r: any = await db.execute(sql.raw(`
    SELECT
      (SELECT COUNT(*) FROM users ${pf ? pf.replace("AND created_at", "WHERE created_at") : ""})::int AS "totalUsers",
      (SELECT COUNT(*) FROM users WHERE role='freelancer' AND NOT is_suspended)::int AS "activeFreelancers",
      (SELECT COUNT(*) FROM users WHERE role='client')::int AS "totalClients",
      (SELECT COUNT(*) FROM orders WHERE status IN ('active','pending'))::int AS "activeOrders",
      (SELECT COUNT(*) FROM orders WHERE status='disputed')::int AS "disputes",
      COALESCE((SELECT SUM(platform_fee) FROM orders WHERE payment_status='paid' ${pf}),0)::float AS "platformRevenue",
      COALESCE((SELECT SUM(amount) FROM orders WHERE status='completed' ${pf}),0)::float AS "gmv",
      COALESCE((SELECT SUM(paid_amount) FROM orders WHERE payment_status='paid' ${pf}),0)::float AS "totalPaid",
      (SELECT COUNT(*) FROM orders ${pf ? pf.replace("AND created_at", "WHERE created_at") : ""})::int AS "totalOrders",
      (SELECT COUNT(*) FROM orders WHERE payment_status='paid' ${pf})::int AS "paidOrders",
      (SELECT COUNT(*) FROM freelancer_applications WHERE status='pending')::int AS "pendingApplications",
      (SELECT COUNT(*) FROM withdrawals WHERE status='pending')::int AS "pendingWithdrawals",
      (SELECT COUNT(*) FROM support_tickets WHERE status='open')::int AS "openTickets",
      (SELECT COUNT(*) FROM services WHERE status='published')::int AS "activeServices"
  `));

  const daily: any = await db.execute(sql.raw(`
    SELECT
      DATE(created_at) AS date,
      COUNT(*)::int AS orders,
      COALESCE(SUM(CASE WHEN payment_status='paid' THEN paid_amount ELSE 0 END),0)::float AS revenue
    FROM orders
    ${pf ? pf.replace("AND created_at", "WHERE created_at") : "WHERE created_at >= NOW() - INTERVAL '30 days'"}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 90
  `));

  const signupsDaily: any = await db.execute(sql.raw(`
    SELECT DATE(created_at) AS date, COUNT(*)::int AS signups
    FROM users
    ${pf ? pf.replace("AND created_at", "WHERE created_at") : "WHERE created_at >= NOW() - INTERVAL '30 days'"}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 90
  `));

  const signupsMap: Record<string, number> = {};
  for (const row of signupsDaily) signupsMap[row.date] = row.signups;
  const dailyWithSignups = daily.map((d: any) => ({
    ...d,
    signups: signupsMap[d.date] || 0,
  }));

  const topCategories: any = await db.execute(sql.raw(`
    SELECT
      COALESCE(c.name_ar, 'غير محدد') AS name,
      COUNT(o.id)::int AS orders,
      COALESCE(SUM(o.paid_amount),0)::float AS revenue
    FROM orders o
    LEFT JOIN services s ON s.id = o.service_id
    LEFT JOIN categories c ON c.id = s.category_id
    WHERE o.payment_status='paid' ${pfO}
    GROUP BY c.name_ar
    ORDER BY revenue DESC
    LIMIT 10
  `));

  const topFreelancers: any = await db.execute(sql.raw(`
    SELECT
      u.id, u.name,
      COUNT(o.id)::int AS orders,
      COALESCE(SUM(o.paid_amount - o.platform_fee),0)::float AS revenue,
      0 AS rating
    FROM orders o
    JOIN users u ON u.id = o.freelancer_id
    WHERE o.payment_status='paid' ${pfO}
    GROUP BY u.id, u.name
    ORDER BY revenue DESC
    LIMIT 10
  `));

  const stats = r[0] || {};

  const recent: any = await db.execute(sql`
    SELECT o.id, o.amount, o.status, o.payment_status AS "paymentStatus",
           o.created_at AS "createdAt",
           s.title AS "serviceTitle", u.name AS "freelancerName", c.name AS "clientName"
    FROM orders o
    LEFT JOIN services s ON s.id = o.service_id
    LEFT JOIN users u ON u.id = o.freelancer_id
    LEFT JOIN users c ON c.id = o.client_id
    ORDER BY o.created_at DESC LIMIT 5
  `);

  const disputes: any = await db.execute(sql`
    SELECT o.id, o.amount, o.created_at AS "createdAt",
           s.title AS "serviceTitle", u.name AS "freelancerName", c.name AS "clientName"
    FROM orders o
    LEFT JOIN services s ON s.id = o.service_id
    LEFT JOIN users u ON u.id = o.freelancer_id
    LEFT JOIN users c ON c.id = o.client_id
    WHERE o.status='disputed'
    ORDER BY o.created_at DESC LIMIT 5
  `);

  return NextResponse.json({
    stats,
    totals: {
      users: stats.totalUsers || 0,
      freelancers: stats.activeFreelancers || 0,
      clients: stats.totalClients || 0,
      orders: stats.totalOrders || 0,
      revenue: stats.platformRevenue || 0,
      activeServices: stats.activeServices || 0,
      tickets: stats.openTickets || 0,
    },
    daily: dailyWithSignups,
    topCategories,
    topFreelancers,
    recentOrders: recent,
    disputes,
    period,
  });
}

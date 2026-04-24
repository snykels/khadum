/**
 * GET /api/freelancer/stats
 * يُعيد ملخص إحصائيات المستقل المسجّل:
 *  - monthEarnings: صافي الأرباح هذا الشهر
 *  - activeOrders: عدد الطلبات النشطة
 *  - avgRating: متوسط التقييم
 *  - completionRate: معدل الإنجاز (%)
 *  - totalCompleted: عدد الطلبات المكتملة
 *  - walletBalance: رصيد المحفظة
 *  - recentOrders: آخر 5 طلبات
 *  - monthlyEarnings: آخر 6 أشهر للرسم البياني
 *  - userName: اسم المستقل
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const uid = s.userId;

  const [kpi]: any = await db.execute(sql`
    SELECT
      u.name,
      u.rating,
      COALESCE(w.balance, 0)::float AS "walletBalance",
      COUNT(CASE WHEN o.status = 'active' THEN 1 END)::int AS "activeOrders",
      COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::int AS "totalCompleted",
      COUNT(CASE WHEN o.status != 'cancelled' THEN 1 END)::int AS "totalNonCancelled",
      COALESCE(SUM(CASE
        WHEN o.status = 'completed'
         AND o.completed_at >= date_trunc('month', NOW())
        THEN (o.paid_amount - o.platform_fee)
        ELSE 0
      END), 0)::float AS "monthEarnings"
    FROM users u
    LEFT JOIN wallets w ON w.user_id = u.id
    LEFT JOIN orders o ON o.freelancer_id = u.id
    WHERE u.id = ${uid}
    GROUP BY u.id, u.name, u.rating, w.balance
  `);

  const totalCompleted = kpi?.totalCompleted ?? 0;
  const totalNonCancelled = kpi?.totalNonCancelled ?? 0;
  const completionRate =
    totalNonCancelled > 0
      ? Math.round((totalCompleted / totalNonCancelled) * 100)
      : 100;

  const monthly: any = await db.execute(sql`
    SELECT
      to_char(date_trunc('month', completed_at), 'YYYY-MM') AS "yearMonth",
      to_char(date_trunc('month', completed_at), 'Mon') AS "month",
      COALESCE(SUM(paid_amount - platform_fee), 0)::float AS "earnings",
      COUNT(*)::int AS "orders"
    FROM orders
    WHERE freelancer_id = ${uid}
      AND status = 'completed'
      AND completed_at >= NOW() - INTERVAL '6 months'
    GROUP BY 1, 2
    ORDER BY 1 ASC
  `);

  const MONTH_AR: Record<string, string> = {
    Jan: "يناير", Feb: "فبراير", Mar: "مارس", Apr: "أبريل",
    May: "مايو", Jun: "يونيو", Jul: "يوليو", Aug: "أغسطس",
    Sep: "سبتمبر", Oct: "أكتوبر", Nov: "نوفمبر", Dec: "ديسمبر",
  };

  const monthlyAr = (monthly as any[]).map((r: any) => ({
    month: MONTH_AR[r.month] || r.month,
    earnings: Number(r.earnings),
    orders: r.orders,
  }));

  const recent: any = await db.execute(sql`
    SELECT
      o.id,
      o.public_code AS "publicCode",
      o.status,
      o.paid_amount AS "paidAmount",
      o.platform_fee AS "platformFee",
      o.description,
      o.due_date AS "dueDate",
      o.completed_at AS "completedAt",
      o.created_at AS "createdAt",
      u.name AS "clientName"
    FROM orders o
    LEFT JOIN users u ON u.id = o.client_id
    WHERE o.freelancer_id = ${uid}
    ORDER BY o.created_at DESC
    LIMIT 5
  `);

  const statusLabels: Record<string, string> = {
    pending:   "بانتظار الدفع",
    active:    "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
    disputed:  "نزاع",
    delivery:  "بانتظار المراجعة",
  };
  const statusColors: Record<string, string> = {
    pending:   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    active:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    disputed:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    delivery:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  const recentOrders = (recent as any[]).map((o: any) => {
    const net = Number(o.paidAmount ?? 0) - Number(o.platformFee ?? 0);
    return {
      id: `#${o.publicCode || String(o.id).padStart(4, "0")}`,
      service: o.description?.slice(0, 50) || "طلب جديد",
      client: o.clientName || "عميل",
      amount: net > 0 ? `${net.toFixed(0)} ر.س` : "—",
      status: statusLabels[o.status] || o.status,
      statusColor: statusColors[o.status] || statusColors.pending,
      deadline: o.dueDate
        ? new Date(o.dueDate).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })
        : o.status === "completed" ? "—" : "غير محدد",
    };
  });

  return NextResponse.json({
    userName: kpi?.name || "المستقل",
    walletBalance: kpi?.walletBalance ?? 0,
    monthEarnings: kpi?.monthEarnings ?? 0,
    activeOrders: kpi?.activeOrders ?? 0,
    avgRating: kpi?.rating ? Number(kpi.rating) : null,
    completionRate,
    totalCompleted,
    monthlyEarnings: monthlyAr,
    recentOrders,
  });
}

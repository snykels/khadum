import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [agg]: any = await db.execute(sql`
    SELECT
      COALESCE(SUM(paid_amount - platform_fee), 0)::numeric AS "totalNet",
      COALESCE(SUM(paid_amount), 0)::numeric AS "totalGross",
      COALESCE(SUM(platform_fee), 0)::numeric AS "totalFees",
      COUNT(*)::int AS "ordersCount"
    FROM orders
    WHERE freelancer_id = ${s.userId} AND payment_status = 'paid'
  `);

  const monthly: any = await db.execute(sql`
    SELECT
      to_char(date_trunc('month', completed_at), 'YYYY-MM') AS "month",
      COALESCE(SUM(paid_amount - platform_fee), 0)::numeric AS "net",
      COUNT(*)::int AS "orders"
    FROM orders
    WHERE freelancer_id = ${s.userId} AND status = 'completed' AND completed_at IS NOT NULL
    GROUP BY 1 ORDER BY 1 DESC LIMIT 12
  `);

  return NextResponse.json({
    summary: agg || { totalNet: 0, totalGross: 0, totalFees: 0, ordersCount: 0 },
    monthly: monthly as any[],
  });
}

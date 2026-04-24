import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") || 30), 365);

  const [summary, byFreelancer, byOrder] = await Promise.all([
    db.execute(sql`
      SELECT
        reason_code,
        COUNT(*)::int AS count
      FROM offer_rejection_reasons
      WHERE created_at > NOW() - (${days} || ' days')::interval
      GROUP BY reason_code
      ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT
        orr.freelancer_phone,
        u.name AS freelancer_name,
        COUNT(*)::int AS total_rejections,
        COUNT(*) FILTER (WHERE reason_code = 'outside_specialty')::int AS outside_specialty,
        COUNT(*) FILTER (WHERE reason_code = 'busy')::int AS busy,
        COUNT(*) FILTER (WHERE reason_code = 'low_budget')::int AS low_budget,
        COUNT(*) FILTER (WHERE reason_code = 'other')::int AS other,
        MAX(orr.created_at) AS last_rejection_at
      FROM offer_rejection_reasons orr
      LEFT JOIN users u ON u.id = orr.freelancer_id
      WHERE orr.created_at > NOW() - (${days} || ' days')::interval
      GROUP BY orr.freelancer_phone, u.name
      ORDER BY total_rejections DESC
      LIMIT 50
    `),
    db.execute(sql`
      SELECT
        orr.order_id,
        o.public_code,
        o.description,
        COUNT(*)::int AS rejection_count,
        STRING_AGG(DISTINCT orr.reason_code, ', ') AS reasons
      FROM offer_rejection_reasons orr
      LEFT JOIN orders o ON o.id = orr.order_id
      WHERE orr.created_at > NOW() - (${days} || ' days')::interval
      GROUP BY orr.order_id, o.public_code, o.description
      ORDER BY rejection_count DESC
      LIMIT 20
    `),
  ]);

  return NextResponse.json({ summary, byFreelancer, byOrder, days });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const reviews: any = await db.execute(sql`
    SELECT
      r.id, r.rating, r.comment, r.created_at AS "createdAt",
      u.name AS "reviewerName", u.avatar AS "reviewerAvatar",
      o.public_code AS "orderCode",
      s.title AS "serviceTitle"
    FROM reviews r
    LEFT JOIN users u ON u.id = r.reviewer_id
    LEFT JOIN orders o ON o.id = r.order_id
    LEFT JOIN services s ON s.id = o.service_id
    WHERE r.freelancer_id = ${s.userId}
    ORDER BY r.created_at DESC
    LIMIT 100
  `);

  const list = reviews as any[];
  const stats = {
    total: list.length,
    average: list.length ? list.reduce((sum, r) => sum + Number(r.rating || 0), 0) / list.length : 0,
    distribution: {
      5: list.filter(r => Number(r.rating) === 5).length,
      4: list.filter(r => Number(r.rating) === 4).length,
      3: list.filter(r => Number(r.rating) === 3).length,
      2: list.filter(r => Number(r.rating) === 2).length,
      1: list.filter(r => Number(r.rating) === 1).length,
    }
  };

  return NextResponse.json({ reviews: list, stats });
}

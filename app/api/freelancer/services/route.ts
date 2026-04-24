import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const services: any = await db.execute(sql`
    SELECT
      s.id, s.title, s.description, s.price, s.delivery_days AS "deliveryDays",
      s.status, s.rejection_reason AS "rejectionReason",
      s.rating, s.orders_count AS "ordersCount",
      s.created_at AS "createdAt",
      c.name_ar AS "categoryName",
      sc.name_ar AS "subcategoryName"
    FROM services s
    LEFT JOIN categories c ON c.id = s.category_id
    LEFT JOIN subcategories sc ON sc.id = s.subcategory_id
    WHERE s.freelancer_id = ${s.userId}
    ORDER BY s.created_at DESC
  `);

  return NextResponse.json({ services: services as any[] });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, services } from "@/lib/schema";
import { asc, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const r = await db.execute(sql`
    SELECT c.id, c.name_ar AS "nameAr", c.icon, c.sort_order AS "sortOrder", c.is_active AS "isActive",
           (SELECT COUNT(*)::int FROM services s WHERE s.category_id = c.id) AS "servicesCount"
    FROM categories c ORDER BY c.sort_order ASC
  `);
  return NextResponse.json({ categories: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { nameAr, icon } = await req.json();
  if (!nameAr) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  const [c] = await db.insert(categories).values({ nameAr, icon: icon || "📂" }).returning();
  return NextResponse.json({ category: c });
}

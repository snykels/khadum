import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, categories, subcategories } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      description: services.description,
      price: services.price,
      deliveryDays: services.deliveryDays,
      status: services.status,
      rejectionReason: services.rejectionReason,
      ordersCount: services.ordersCount,
      rating: services.rating,
      createdAt: services.createdAt,
      categoryId: services.categoryId,
      categoryName: categories.nameAr,
      subcategoryId: services.subcategoryId,
      subcategoryName: subcategories.nameAr,
    })
    .from(services)
    .leftJoin(categories, eq(services.categoryId, categories.id))
    .leftJoin(subcategories, eq(services.subcategoryId, subcategories.id))
    .where(eq(services.freelancerId, session.userId))
    .orderBy(desc(services.createdAt));
  return NextResponse.json({ services: rows });
}

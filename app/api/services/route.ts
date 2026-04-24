import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { services, users, categories, subcategories } from "@/lib/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const CreateSchema = z.object({
  categoryId: z.number().int().positive(),
  subcategoryId: z.number().int().positive(),
  title: z.string().trim().min(5, "العنوان قصير جداً").max(120),
  description: z.string().trim().min(20, "الوصف قصير جداً").max(5000),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر").max(1000000),
  deliveryDays: z.number().int().min(1).max(60).default(3),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const categoryId = url.searchParams.get("categoryId");
    const subcategoryId = url.searchParams.get("subcategoryId");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "24", 10) || 24, 100);
    const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);

    const conditions = [eq(services.status, "published")];
    if (q) {
      conditions.push(
        or(ilike(services.title, `%${q}%`), ilike(services.description, `%${q}%`))!
      );
    }
    if (categoryId && /^\d+$/.test(categoryId)) {
      conditions.push(eq(services.categoryId, parseInt(categoryId, 10)));
    }
    if (subcategoryId && /^\d+$/.test(subcategoryId)) {
      conditions.push(eq(services.subcategoryId, parseInt(subcategoryId, 10)));
    }
    if (minPrice && !isNaN(Number(minPrice))) {
      conditions.push(sql`${services.price} >= ${Number(minPrice)}`);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      conditions.push(sql`${services.price} <= ${Number(maxPrice)}`);
    }

    const rows = await db
      .select({
        id: services.id,
        title: services.title,
        description: services.description,
        price: services.price,
        deliveryDays: services.deliveryDays,
        rating: services.rating,
        ordersCount: services.ordersCount,
        createdAt: services.createdAt,
        categoryId: services.categoryId,
        categoryName: categories.nameAr,
        subcategoryId: services.subcategoryId,
        subcategoryName: subcategories.nameAr,
        freelancerId: services.freelancerId,
        freelancerName: users.name,
      })
      .from(services)
      .leftJoin(categories, eq(services.categoryId, categories.id))
      .leftJoin(subcategories, eq(services.subcategoryId, subcategories.id))
      .leftJoin(users, eq(services.freelancerId, users.id))
      .where(and(...conditions))
      .orderBy(desc(services.createdAt), asc(services.id))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ services: rows });
  } catch (err) {
    console.error("services list error:", err);
    return NextResponse.json({ error: "تعذّر جلب الخدمات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }
  if (session.role !== "freelancer" && session.role !== "admin") {
    return NextResponse.json({ error: "هذه الميزة للمستقلين فقط" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const [sub] = await db
    .select({
      id: subcategories.id,
      categoryId: subcategories.categoryId,
      subActive: subcategories.isActive,
      catActive: categories.isActive,
    })
    .from(subcategories)
    .leftJoin(categories, eq(categories.id, subcategories.categoryId))
    .where(eq(subcategories.id, data.subcategoryId))
    .limit(1);
  if (!sub || sub.categoryId !== data.categoryId) {
    return NextResponse.json(
      { error: "التصنيف الفرعي لا يطابق التصنيف الرئيسي" },
      { status: 400 }
    );
  }
  if (!sub.subActive || !sub.catActive) {
    return NextResponse.json(
      { error: "التصنيف المختار غير متاح حالياً" },
      { status: 400 }
    );
  }

  try {
    const [created] = await db
      .insert(services)
      .values({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        freelancerId: session.userId,
        price: data.price.toFixed(2),
        deliveryDays: data.deliveryDays,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ service: created });
  } catch (err) {
    console.error("create service error:", err);
    return NextResponse.json({ error: "تعذّر إنشاء الخدمة" }, { status: 500 });
  }
}

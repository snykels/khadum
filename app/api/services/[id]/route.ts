import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { services, users, categories, subcategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const UpdateSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  subcategoryId: z.number().int().positive().optional(),
  title: z.string().trim().min(5).max(120).optional(),
  description: z.string().trim().min(20).max(5000).optional(),
  price: z.number().positive().max(1000000).optional(),
  deliveryDays: z.number().int().min(1).max(60).optional(),
});

async function loadService(id: number) {
  const [row] = await db
    .select({
      id: services.id,
      title: services.title,
      description: services.description,
      price: services.price,
      deliveryDays: services.deliveryDays,
      status: services.status,
      rejectionReason: services.rejectionReason,
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
    .where(eq(services.id, id))
    .limit(1);
  return row ?? null;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await ctx.params;
  const id = parseInt(rawId, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });
  }
  const service = await loadService(id);
  if (!service) {
    return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
  }
  const session = await getSession();
  const isOwner = session.userId === service.freelancerId;
  const isAdmin = session.role === "admin";
  if (service.status !== "published" && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "الخدمة غير متاحة" }, { status: 404 });
  }
  return NextResponse.json({ service });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const { id: rawId } = await ctx.params;
  const id = parseInt(rawId, 10);
  if (!id) return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });

  const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (existing.freelancerId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "لا تملك صلاحية تعديل هذه الخدمة" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  if (d.subcategoryId || d.categoryId) {
    const subId = d.subcategoryId ?? existing.subcategoryId;
    const catId = d.categoryId ?? existing.categoryId;
    if (subId) {
      const [sub] = await db
        .select({
          categoryId: subcategories.categoryId,
          subActive: subcategories.isActive,
          catActive: categories.isActive,
        })
        .from(subcategories)
        .leftJoin(categories, eq(categories.id, subcategories.categoryId))
        .where(eq(subcategories.id, subId))
        .limit(1);
      if (!sub || (catId && sub.categoryId !== catId)) {
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
    }
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (d.title !== undefined) updates.title = d.title;
  if (d.description !== undefined) updates.description = d.description;
  if (d.categoryId !== undefined) updates.categoryId = d.categoryId;
  if (d.subcategoryId !== undefined) updates.subcategoryId = d.subcategoryId;
  if (d.price !== undefined) updates.price = d.price.toFixed(2);
  if (d.deliveryDays !== undefined) updates.deliveryDays = d.deliveryDays;
  if (session.role !== "admin") {
    updates.status = "pending";
    updates.rejectionReason = null;
  }

  const [updated] = await db
    .update(services)
    .set(updates)
    .where(eq(services.id, id))
    .returning();
  return NextResponse.json({ service: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const { id: rawId } = await ctx.params;
  const id = parseInt(rawId, 10);
  if (!id) return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });

  const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (existing.freelancerId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "لا تملك صلاحية حذف هذه الخدمة" }, { status: 403 });
  }

  try {
    await db.delete(services).where(eq(services.id, id));
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "23503") {
      return NextResponse.json(
        { error: "لا يمكن حذف الخدمة لارتباطها بطلبات حالية" },
        { status: 409 }
      );
    }
    console.error("delete service error:", err);
    return NextResponse.json({ error: "تعذّر حذف الخدمة" }, { status: 500 });
  }
}

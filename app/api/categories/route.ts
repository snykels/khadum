import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, subcategories } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.id));

    const subs = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.isActive, true))
      .orderBy(asc(subcategories.sortOrder), asc(subcategories.id));

    const grouped = cats.map((c) => ({
      id: c.id,
      nameAr: c.nameAr,
      icon: c.icon,
      subcategories: subs
        .filter((s) => s.categoryId === c.id)
        .map((s) => ({ id: s.id, nameAr: s.nameAr })),
    }));

    return NextResponse.json({ categories: grouped });
  } catch (err) {
    console.error("categories error:", err);
    return NextResponse.json({ error: "تعذّر جلب التصنيفات" }, { status: 500 });
  }
}

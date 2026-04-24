import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const upd: any = {};
  if (body.nameAr) upd.nameAr = body.nameAr;
  if (body.icon) upd.icon = body.icon;
  if (typeof body.isActive === "boolean") upd.isActive = body.isActive;
  const [c] = await db.update(categories).set(upd).where(eq(categories.id, parseInt(id))).returning();
  return NextResponse.json({ category: c });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(categories).where(eq(categories.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}

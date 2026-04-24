import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quickReplies } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const allowed: any = {};
  for (const k of ["title", "body", "category", "isActive", "variables", "shortcode"]) {
    if (body[k] !== undefined) allowed[k] = body[k];
  }
  allowed.updatedAt = new Date();
  const [r] = await db.update(quickReplies).set(allowed).where(eq(quickReplies.id, Number(id))).returning();
  return NextResponse.json(r);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await db.delete(quickReplies).where(eq(quickReplies.id, Number(id)));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const upd: any = {};
  if (body.status) upd.status = body.status;
  if (body.status === "completed") upd.completedAt = new Date();
  const [o] = await db.update(orders).set(upd).where(eq(orders.id, parseInt(id))).returning();
  return NextResponse.json({ order: o });
}

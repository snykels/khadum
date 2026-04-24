import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refundRequests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const upd: any = {};
  if (body.status) {
    upd.status = body.status;
    upd.handledById = s.userId;
    upd.handledAt = new Date();
  }
  const [r] = await db.update(refundRequests).set(upd).where(eq(refundRequests.id, parseInt(id))).returning();
  return NextResponse.json({ refund: r });
}

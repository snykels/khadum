import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  const { action, reason } = await req.json();
  if (!["approve", "reject", "suspend", "publish"].includes(action)) return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  const upd: any = {};
  if (action === "approve" || action === "publish") upd.status = "published";
  if (action === "reject") { upd.status = "rejected"; upd.rejectionReason = reason || "تم الرفض"; }
  if (action === "suspend") upd.status = "rejected";
  upd.updatedAt = new Date();
  const [svc] = await db.update(services).set(upd).where(eq(services.id, parseInt(id))).returning();
  return NextResponse.json({ service: svc });
}

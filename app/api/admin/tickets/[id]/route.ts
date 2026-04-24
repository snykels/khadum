import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
<<<<<<< HEAD
  const s = await getSession(); if (!s || (s.role !== "admin" && s.role !== "supervisor")) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
=======
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const { id } = await ctx.params;
  const body = await req.json();
  const upd: any = { updatedAt: new Date() };
  if (body.status) upd.status = body.status;
  if (body.assignedToId) upd.assignedToId = body.assignedToId;
  if (body.priority) upd.priority = body.priority;
  const [t] = await db.update(supportTickets).set(upd).where(eq(supportTickets.id, parseInt(id))).returning();
  return NextResponse.json({ ticket: t });
}

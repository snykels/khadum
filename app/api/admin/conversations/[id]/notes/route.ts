import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminInterventions, users } from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const convId = Number(id);
  const rows = await db
    .select({
      id: adminInterventions.id,
      adminId: adminInterventions.adminId,
      adminName: users.name,
      reason: adminInterventions.reason,
      createdAt: adminInterventions.createdAt,
    })
    .from(adminInterventions)
    .leftJoin(users, eq(users.id, adminInterventions.adminId))
    .where(
      and(
        eq(adminInterventions.conversationId, convId),
        eq(adminInterventions.type, "note")
      )
    )
    .orderBy(desc(adminInterventions.createdAt))
    .limit(100);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const convId = Number(id);
  const body = await req.json().catch(() => ({}));
  const note = String(body.note || "").trim();
  if (!note) return NextResponse.json({ error: "نص الملاحظة مطلوب" }, { status: 400 });

  const [row] = await db
    .insert(adminInterventions)
    .values({
      adminId: session.userId!,
      type: "note",
      conversationId: convId,
      reason: note,
      details: {},
    })
    .returning();

  const [admin] = await db.select({ name: users.name }).from(users).where(eq(users.id, session.userId!)).limit(1);

  return NextResponse.json({
    id: row.id,
    adminId: row.adminId,
    adminName: admin?.name || "",
    reason: row.reason,
    createdAt: row.createdAt,
  }, { status: 201 });
}

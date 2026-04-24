import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, adminInterventions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const convId = Number(id);
  if (!Number.isFinite(convId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = body.reason || "تصعيد يدوي من الإدارة";

  const [conv] = await db
    .select({ id: conversations.id, status: conversations.status })
    .from(conversations)
    .where(eq(conversations.id, convId))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await db.insert(adminInterventions).values({
    conversationId: convId,
    adminId: session.userId!,
    type: "note",
    reason: `🔺 تصعيد: ${reason}`,
    details: { escalated: true, escalatedAt: new Date().toISOString() },
  });

  return NextResponse.json({ ok: true, message: "تم تصعيد المحادثة بنجاح" });
}

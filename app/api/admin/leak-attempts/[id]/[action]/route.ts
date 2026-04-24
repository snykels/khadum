import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leakAttempts, users, adminInterventions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; action: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id, action } = await ctx.params;
  const leakId = Number(id);
  if (!Number.isFinite(leakId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const allowed = ["warn", "block", "ignore"];
  if (!allowed.includes(action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const [leak] = await db
    .select({
      id: leakAttempts.id,
      userId: leakAttempts.userId,
      conversationId: leakAttempts.conversationId,
      rawText: leakAttempts.rawText,
    })
    .from(leakAttempts)
    .where(eq(leakAttempts.id, leakId))
    .limit(1);

  if (!leak) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const actionEnumMap: Record<string, "warned" | "blocked" | "ignored"> = {
    warn: "warned",
    block: "blocked",
    ignore: "ignored",
  };

  await db
    .update(leakAttempts)
    .set({
      action: actionEnumMap[action],
      reviewedBy: session.userId!,
      reviewedAt: new Date(),
      reviewNote: action,
    })
    .where(eq(leakAttempts.id, leakId));

  if (action === "warn") {
    await db.insert(adminInterventions).values({
      conversationId: leak.conversationId,
      adminId: session.userId!,
      type: "warning",
      targetUserId: leak.userId,
      reason: "تحذير بسبب محاولة تسريب معلومات التواصل",
      details: { leakAttemptId: leakId, rawText: (leak.rawText || "").slice(0, 200) },
    });
    return NextResponse.json({ ok: true, message: "تم إرسال التحذير بنجاح" });
  }

  if (action === "block") {
    await db
      .update(users)
      .set({ isBlocked: true })
      .where(eq(users.id, leak.userId));

    await db.insert(adminInterventions).values({
      conversationId: leak.conversationId,
      adminId: session.userId!,
      type: "block",
      targetUserId: leak.userId,
      reason: "حظر المستخدم بسبب محاولة تسريب معلومات التواصل",
      details: { leakAttemptId: leakId },
    });
    return NextResponse.json({ ok: true, message: "تم حظر المستخدم بنجاح" });
  }

  if (action === "ignore") {
    return NextResponse.json({ ok: true, message: "تم تجاهل المحاولة (إيجابي كاذب)" });
  }

  return NextResponse.json({ ok: true });
}

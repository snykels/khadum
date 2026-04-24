import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, conversationMessages, leakAttempts, users, disputes } from "@/lib/schema";
import { and, eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { detectLeak } from "@/lib/leakDetector";
import { detectDispute } from "@/lib/disputeDetector";
import { publish } from "@/lib/sse";
import { generateDisputeCode } from "@/lib/conversationCode";

type Ctx = { params: Promise<{ id: string }> };

async function partyOf(convId: number, userId: number, role?: string) {
  const [c] = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
  if (!c) return null;
  if (role === "admin" || role === "supervisor") return { conv: c, party: "admin" as const };
  if (c.clientId === userId) return { conv: c, party: "client" as const };
  if (c.freelancerId === userId) return { conv: c, party: "freelancer" as const };
  return null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const convId = Number(id);
  const access = await partyOf(convId, session.userId, session.role);
  if (!access) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const msgs = await db
    .select()
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, convId))
    .orderBy(asc(conversationMessages.createdAt))
    .limit(500);

  const isAdmin = access.party === "admin";
  const filtered = msgs.map((m) => ({
    ...m,
    bodyOriginal: isAdmin ? m.bodyOriginal : m.bodyRedacted || m.bodyOriginal,
  }));

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const convId = Number(id);
  const access = await partyOf(convId, session.userId, session.role);
  if (!access) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [me] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (me?.isBlocked) {
    return NextResponse.json({ error: "حسابك محظور — لا يمكن إرسال رسائل", reason: me.blockReason }, { status: 403 });
  }
  if (access.conv.status === "blocked" || access.conv.status === "archived") {
    return NextResponse.json({ error: "المحادثة مغلقة" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { text, messageType = "text", mediaUrl } = body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "النص مطلوب" }, { status: 400 });
  }

  const useClaude = (access.party !== "admin") && process.env.LEAK_USE_CLAUDE === "1";
  const leak = await detectLeak(text, { useClaude });
  const dispute = (access.party !== "admin") ? detectDispute(text) : null;

  const isBlocked = leak.action === "blocked";
  const hasLeak = leak.hasLeak;

  const [msg] = await db
    .insert(conversationMessages)
    .values({
      conversationId: convId,
      senderParty: access.party,
      senderId: session.userId,
      messageType,
      bodyOriginal: text,
      bodyRedacted: hasLeak ? leak.redactedText : null,
      mediaUrl: mediaUrl || null,
      hasLeak,
      leakSeverity: leak.severity || null,
      isBlocked,
      blockedReason: isBlocked ? `محاولة تسريب: ${leak.patterns.map((p) => p.type).join(",")}` : null,
      deliveredAt: isBlocked ? null : new Date(),
    })
    .returning();

  if (hasLeak && access.party !== "admin") {
    await db.insert(leakAttempts).values({
      conversationId: convId,
      messageId: msg.id,
      userId: session.userId,
      userParty: access.party,
      detectedPatterns: leak.patterns as any,
      severity: leak.severity || "low",
      action: leak.action,
      detectedBy: leak.detectedBy,
      rawText: text,
      redactedText: leak.redactedText,
      confidence: String(leak.confidence) as any,
    });
    await db
      .update(users)
      .set({
        leakAttemptsCount: (me?.leakAttemptsCount || 0) + 1,
        lastLeakAttemptAt: new Date(),
        ...(((me?.leakAttemptsCount || 0) + 1 >= 3) ? {
          isBlocked: true,
          blockReason: "ثلاث محاولات تسريب أو أكثر",
          blockedAt: new Date(),
          blockedBySystem: true,
        } : {}),
      })
      .where(eq(users.id, session.userId));
  }

  if (dispute?.shouldRaise && access.conv.orderId) {
    const existing = await db
      .select()
      .from(disputes)
      .where(and(eq(disputes.orderId, access.conv.orderId), eq(disputes.status, "open")))
      .limit(1);
    if (!existing.length) {
      const otherUserId = access.party === "client" ? access.conv.freelancerId : access.conv.clientId;
      await db.insert(disputes).values({
        publicCode: generateDisputeCode(),
        orderId: access.conv.orderId,
        conversationId: convId,
        raisedBy: session.userId,
        raisedByParty: access.party,
        againstUserId: otherUserId,
        category: dispute.category,
        reason: text.slice(0, 500),
        status: "open",
        priority: dispute.suggestedPriority,
        autoDetected: true,
        detectedBy: "heuristic",
      });
    }
  }

  await db
    .update(conversations)
    .set({
      lastMessageAt: new Date(),
      lastMessageBy: access.party,
      updatedAt: new Date(),
      ...(access.party === "client" ? { unreadByFreelancer: (access.conv.unreadByFreelancer || 0) + 1, unreadByAdmin: (access.conv.unreadByAdmin || 0) + 1 } : {}),
      ...(access.party === "freelancer" ? { unreadByClient: (access.conv.unreadByClient || 0) + 1, unreadByAdmin: (access.conv.unreadByAdmin || 0) + 1 } : {}),
      ...(access.party === "admin" ? { unreadByClient: (access.conv.unreadByClient || 0) + 1, unreadByFreelancer: (access.conv.unreadByFreelancer || 0) + 1 } : {}),
    })
    .where(eq(conversations.id, convId));

  publish(`conv:${convId}`, { type: "message", message: { ...msg, bodyOriginal: isBlocked ? null : msg.bodyOriginal } });
  publish(`admin:conv`, { type: "conv_update", conversationId: convId, hasLeak, severity: leak.severity });

  return NextResponse.json(
    {
      message: msg,
      leak: hasLeak ? { severity: leak.severity, action: leak.action, blocked: isBlocked } : null,
      dispute: dispute?.shouldRaise ? { raised: true, category: dispute.category } : null,
    },
    { status: 201 }
  );
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leakAttempts, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rows = await db
    .select({
      id: leakAttempts.id,
      conversationId: leakAttempts.conversationId,
      messageId: leakAttempts.messageId,
      userId: leakAttempts.userId,
      userName: users.name,
      userParty: leakAttempts.userParty,
      severity: leakAttempts.severity,
      action: leakAttempts.action,
      detectedBy: leakAttempts.detectedBy,
      detectedPatterns: leakAttempts.detectedPatterns,
      rawText: leakAttempts.rawText,
      redactedText: leakAttempts.redactedText,
      confidence: leakAttempts.confidence,
      reviewedAt: leakAttempts.reviewedAt,
      createdAt: leakAttempts.createdAt,
    })
    .from(leakAttempts)
    .leftJoin(users, eq(users.id, leakAttempts.userId))
    .orderBy(desc(leakAttempts.createdAt))
    .limit(200);
  return NextResponse.json(rows);
}

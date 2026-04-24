import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    const query = db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    if (userId) {
      const results = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, parseInt(userId)))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      return NextResponse.json(results);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Database not connected" }, { status: 500 });
  }
}

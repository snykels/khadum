import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sseStream } from "@/lib/sse";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const convId = Number(id);
  const [c] = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  const isAdmin = session.role === "admin" || session.role === "supervisor";
  if (!isAdmin && c.clientId !== session.userId && c.freelancerId !== session.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return sseStream(`conv:${convId}`);
}

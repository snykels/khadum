import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withdrawals, wallets } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  const { status } = await req.json();
  const [w] = await db.update(withdrawals).set({ status }).where(eq(withdrawals.id, parseInt(id))).returning();
  if (status === "approved" && w) {
    await db.update(wallets).set({ balance: sql`${wallets.balance} - ${w.amount}` }).where(eq(wallets.userId, w.userId!));
  }
  return NextResponse.json({ withdrawal: w });
}

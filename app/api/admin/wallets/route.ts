import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r = await db.execute(sql`
    SELECT
      COALESCE((SELECT SUM(balance) FROM wallets),0)::text AS "totalBalance",
      COALESCE((SELECT SUM(balance) FROM wallets w JOIN users u ON u.id=w.user_id WHERE u.role='freelancer'),0)::text AS "freelancerBalance",
      COALESCE((SELECT SUM(pending) FROM wallets),0)::text AS "pendingBalance",
      COALESCE((SELECT SUM(platform_fee) FROM orders),0)::text AS "platformProfit"
  `);
  const list = await db.execute(sql`
    SELECT u.id, u.name, u.role, w.balance, w.pending, w.total_earned AS "totalEarned"
    FROM wallets w JOIN users u ON u.id=w.user_id ORDER BY w.balance DESC
  `);
  return NextResponse.json({ summary: r[0], wallets: list });
}

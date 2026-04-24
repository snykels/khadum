import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, name, provider, is_active AS "isActive", tx_count AS "txCount" FROM payment_gateways ORDER BY id`);
  return NextResponse.json({ gateways: r });
}

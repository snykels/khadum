import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, user_id AS "userId", user_name AS "userName", action, target, type, created_at AS "createdAt" FROM audit_log ORDER BY created_at DESC LIMIT 200`);
  return NextResponse.json({ logs: r });
}

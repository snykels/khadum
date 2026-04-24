import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r = await db.execute(sql`
    SELECT w.id, w.amount, w.status, w.bank_name AS "bankName", w.account_number AS "accountNumber",
           w.note, w.created_at AS "createdAt", u.name AS "freelancerName", u.id AS "freelancerId"
    FROM withdrawals w LEFT JOIN users u ON u.id = w.user_id ORDER BY w.created_at DESC
  `);
  return NextResponse.json({ withdrawals: r });
}

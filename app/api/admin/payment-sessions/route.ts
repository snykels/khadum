import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status  = searchParams.get("status") || "";
  const phone   = searchParams.get("phone") || "";
  const limit   = Math.min(Number(searchParams.get("limit") || 100), 500);
  const offset  = Number(searchParams.get("offset") || 0);

  const rows = await db.execute(sql`
    SELECT
      ps.id,
      ps.token,
      ps.order_id,
      ps.client_phone,
      ps.amount,
      ps.currency,
      ps.description,
      ps.status,
      ps.expires_at,
      ps.created_at,
      ps.updated_at,
      ps.paid_at,
      ps.tap_charge_id,
      ps.attempts_count,
      ps.metadata,
      o.public_code AS order_code,
      o.status      AS order_status
    FROM payment_sessions ps
    LEFT JOIN orders o ON o.id = ps.order_id
    WHERE
      (${status} = '' OR ps.status = ${status})
      AND (${phone} = '' OR ps.client_phone LIKE ${'%' + phone + '%'})
    ORDER BY ps.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  const counts = await db.execute(sql`
    SELECT status, COUNT(*)::int AS cnt
    FROM payment_sessions
    GROUP BY status
  `);

  return NextResponse.json({
    sessions: rows.rows,
    stats: counts.rows,
  });
}

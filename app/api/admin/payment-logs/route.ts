import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_link_clicks (
      id serial PRIMARY KEY,
      transaction_id text,
      user_id integer,
      gateway text,
      amount numeric,
      currency text,
      target_url text,
      ip text,
      user_agent text,
      clicked_at timestamp NOT NULL DEFAULT now(),
      paid_at timestamp,
      payment_status text DEFAULT 'pending'
    )
  `);

  const stats: any = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total_clicks,
      COUNT(*) FILTER (WHERE payment_status='paid')::int AS paid,
      COUNT(*) FILTER (WHERE payment_status='pending')::int AS pending,
      COUNT(*) FILTER (WHERE payment_status='failed')::int AS failed
    FROM payment_link_clicks
  `);

  const rows: any = await db.execute(sql`
    SELECT c.id, c.transaction_id AS "transactionId", c.user_id AS "userId",
           u.name AS "userName", u.email AS "userEmail",
           c.gateway, c.amount, c.currency, c.payment_status AS "status",
           c.clicked_at AS "clickedAt", c.paid_at AS "paidAt"
    FROM payment_link_clicks c
    LEFT JOIN users u ON u.id = c.user_id
    ORDER BY c.clicked_at DESC
    LIMIT 200
  `);

  return NextResponse.json({ stats: stats[0] || {}, logs: rows });
}

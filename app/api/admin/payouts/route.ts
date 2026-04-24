/**
 * GET  /api/admin/payouts        — قائمة جميع التحويلات البنكية من Tap
 * POST /api/admin/payouts/list   — استعلام Tap API مباشرة لقائمة التحويلات
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const url = req.nextUrl;
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);
  const status = url.searchParams.get("status");

  const rows: any = await db.execute(sql.raw(`
    SELECT
      id, payout_id AS "payoutId", status, payout_date AS "payoutDate",
      amount::float, currency, merchant_id AS "merchantId",
      wallet_id AS "walletId", bank_name AS "bankName", bank_swift AS "bankSwift",
      beneficiary_name AS "beneficiaryName", beneficiary_iban AS "beneficiaryIban",
      settlements_available AS "settlementsAvailable",
      received_at AS "receivedAt", downloaded_at AS "downloadedAt"
    FROM tap_payouts
    ${status ? `WHERE status = '${status.replace(/[^A-Z_]/g, "")}'` : ""}
    ORDER BY received_at DESC
    LIMIT ${limit}
  `));

  const summary: any = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total,
      COALESCE(SUM(CASE WHEN status='PAID_OUT' THEN amount ELSE 0 END),0)::float AS "totalPaidOut",
      COALESCE(SUM(CASE WHEN status='PENDING' THEN amount ELSE 0 END),0)::float AS "totalPending",
      COUNT(CASE WHEN status='PAID_OUT' THEN 1 END)::int AS "countPaidOut",
      COUNT(CASE WHEN status='FAILED' THEN 1 END)::int AS "countFailed"
    FROM tap_payouts
  `);

  return NextResponse.json({ payouts: rows, summary: summary[0] });
}

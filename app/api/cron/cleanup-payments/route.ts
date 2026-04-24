/**
 * تنظيف جلسات الدفع المنتهية.
 * تُستدعى من Replit Scheduled Deployment أو cron داخلي.
 * Header مطلوب: x-cron-key = process.env.CRON_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredSessions } from "@/lib/paymentSession";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-cron-key");
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await cleanupExpiredSessions();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return POST(req);
}

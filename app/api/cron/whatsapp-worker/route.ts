/**
 * Cron safety-net for the WhatsApp inbound queue.
 *
 * Why: the webhook drains the queue via `after()`, but on serverless
 * runtimes that drain can be killed mid-flight if it exceeds the
 * function budget — or skipped entirely if `after()` callbacks are
 * dropped. This route guarantees that any pending job is processed
 * within the cron interval (recommended: every minute).
 *
 * Auth: same pattern as `/api/cron/cleanup` — Bearer CRON_SECRET, or
 * an admin/supervisor session.
 */

import { NextRequest, NextResponse } from "next/server";
import { drainQueue } from "@/lib/whatsapp/queue";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  let allowed = false;
  if (secret && authHeader === `Bearer ${secret}`) allowed = true;
  if (!allowed) {
    const session = await getSession();
    if (session.role === "admin" || session.role === "supervisor") allowed = true;
  }
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const report = await drainQueue();
  return NextResponse.json({ ok: true, report });
}

export const POST = GET;

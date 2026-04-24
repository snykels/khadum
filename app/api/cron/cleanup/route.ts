import { NextRequest, NextResponse } from "next/server";
import { runDataLifecycle, maybeRunLifecycle } from "@/lib/dataLifecycle";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Allow if Authorization: Bearer <CRON_SECRET> matches OR caller is admin
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  let allowed = false;
  if (secret && authHeader === `Bearer ${secret}`) allowed = true;
  if (!allowed) {
    const session = await getSession();
    if (session.role === "admin" || session.role === "supervisor") allowed = true;
  }
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const force = req.nextUrl.searchParams.get("force") === "1";
  const report = force ? await runDataLifecycle() : await maybeRunLifecycle(0);
  return NextResponse.json({ ok: true, report });
}

export const POST = GET;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const rows = (await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM freelancer_applications WHERE status='pending') AS applications_pending,
        (SELECT COUNT(*)::int FROM users WHERE role='freelancer' AND activation_status='pending' AND COALESCE(is_suspended,false)=false AND COALESCE(is_blocked,false)=false) AS freelancers_pending_activation
    `)) as Array<{ applications_pending: number; freelancers_pending_activation: number }>;

    const r = rows[0] || { applications_pending: 0, freelancers_pending_activation: 0 };
    return NextResponse.json({
      applicationsPending: Number(r.applications_pending) || 0,
      freelancersPendingActivation: Number(r.freelancers_pending_activation) || 0,
    });
  } catch (e) {
    console.error("sidebar-counts error:", e);
    return NextResponse.json({ applicationsPending: 0, freelancersPendingActivation: 0 });
  }
}

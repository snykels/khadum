import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { freelancerApplications, users } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    const { id } = await params;
    const appId = parseInt(id);
    if (isNaN(appId)) return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });

    const [app] = await db.select().from(freelancerApplications)
      .where(eq(freelancerApplications.id, appId)).limit(1);
    if (!app) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (app.status !== "approved") {
      return NextResponse.json({ error: "الطلب غير مقبول" }, { status: 400 });
    }

    // Revoke all unused tokens — the row remains approved+pending-activation
    // so the admin can still see/track it under the "expired/invalidated" bucket.
    await db.execute(sql`UPDATE email_verifications SET revoked=true WHERE application_id=${app.id} AND used=false AND COALESCE(revoked,false)=false`);

    // Suspend the still-pending user so they cannot be activated by stale links/race conditions.
    const [u] = await db.select({ id: users.id, activationStatus: users.activationStatus })
      .from(users).where(eq(users.email, app.email)).limit(1);
    if (u && u.activationStatus === "pending") {
      await db.update(users)
        .set({ isSuspended: true, suspensionReason: "تم إلغاء الدعوة قبل تفعيل الحساب", suspendedAt: new Date() })
        .where(eq(users.id, u.id));
    }

    // Note the cancellation on the application without overwriting the approval audit trail.
    await db.update(freelancerApplications)
      .set({ rejectionReason: "تم إلغاء الدعوة وإبطال رابط التفعيل من قِبَل الإدارة", reviewedAt: new Date(), reviewedBy: session.userId })
      .where(eq(freelancerApplications.id, appId));

    return NextResponse.json({ ok: true, message: "تم إلغاء الدعوة وإبطال الرابط" });
  } catch (e) {
    console.error("cancel error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

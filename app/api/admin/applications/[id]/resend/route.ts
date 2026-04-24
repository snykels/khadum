import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { freelancerApplications, users } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateToken, sendTemplatedEmail, sendEmail, sendWhatsApp, loadSettings } from "@/lib/notify";

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
      return NextResponse.json({ error: "الطلب لم يُقبل بعد" }, { status: 400 });
    }

    const [u] = await db.select({
      id: users.id,
      activationStatus: users.activationStatus,
      isSuspended: users.isSuspended,
      isBlocked: users.isBlocked,
    }).from(users).where(eq(users.email, app.email)).limit(1);
    if (!u) return NextResponse.json({ error: "حساب المستقل غير موجود" }, { status: 404 });
    if (u.activationStatus === "active") {
      return NextResponse.json({ error: "الحساب مفعّل بالفعل" }, { status: 400 });
    }
    if (u.isBlocked) {
      return NextResponse.json({ error: "الحساب محظور — فك الحظر أولاً" }, { status: 400 });
    }

    // Revoke prior tokens
    await db.execute(sql`UPDATE email_verifications SET revoked=true WHERE application_id=${app.id} AND used=false AND COALESCE(revoked,false)=false`);

    // Resending an invite re-opens the activation pathway: clear any prior cancellation suspension.
    if (u.isSuspended) {
      await db.update(users)
        .set({ isSuspended: false, suspensionReason: null, suspendedAt: null })
        .where(eq(users.id, u.id));
    }

    const token = generateToken();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.execute(sql`INSERT INTO email_verifications(email, application_id, user_id, token, expires_at) VALUES(${app.email}, ${app.id}, ${u.id}, ${token}, ${expires})`);

    const general = await loadSettings("general");
    const siteName = general.platformName || "خدوم";
    const baseUrl = (process.env.APP_BASE_URL || "https://khadum.app").replace(/\/$/, "");
    const link = `${baseUrl}/apply/setup/${token}`;

    const tplResult = await sendTemplatedEmail("apply_setup", app.email, {
      name: app.name, link, site_name: siteName, email: app.email,
    });
    if (!tplResult.ok) {
      const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px"><h2 style="color:#34cc30">رابط جديد لتفعيل حسابك في ${siteName}</h2><p>مرحباً ${app.name}, هذا رابط جديد لتعيين كلمة المرور وتفعيل حسابك:</p><p style="text-align:center;margin:30px 0"><a href="${link}" style="background:#34cc30;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">تفعيل الحساب الآن</a></p><p style="color:#777;font-size:13px">الرابط صالح لمدة 7 أيام. الروابط السابقة تم إبطالها.</p></div>`;
      await sendEmail(app.email, `رابط جديد للتفعيل — ${siteName}`, html);
    }

    if (app.phone) {
      const waMsg = `مرحباً ${app.name} 👋\nأرسلنا لك رابط جديد لتفعيل حسابك في ${siteName}:\n${link}\n\nالرابط صالح 7 أيام، والروابط السابقة لم تعد تعمل.`;
      sendWhatsApp(app.phone, waMsg).catch((e) => console.error("wa send failed", e));
    }

    return NextResponse.json({ ok: true, message: "تم إرسال رابط جديد" });
  } catch (e) {
    console.error("resend error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

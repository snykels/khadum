import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { freelancerApplications, users } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateToken, sendTemplatedEmail, sendEmail, sendWhatsApp, loadSettings } from "@/lib/notify";

// Real bcrypt hash of a 32-byte random secret nobody knows. bcrypt.compare returns false safely.
// Cost factor 10 matches lib/auth.ts. Generated once and committed; the secret itself is discarded.
const PENDING_PASSWORD_HASH = "$2b$10$Kw8RMdTcXdm2gocpuiRsWulxtDeE9v3IxN.fRZlmf5yHimRaQ15Qq";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    const { id } = await params;
    const appId = parseInt(id);
    if (isNaN(appId)) return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });

    const [app] = await db.select({ id: freelancerApplications.id })
      .from(freelancerApplications).where(eq(freelancerApplications.id, appId)).limit(1);
    if (!app) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const body = await req.json();
    const upd: any = {};
    const str = (v: any) => typeof v === "string" ? v.trim() || null : undefined;

    const fields = [
      "name","phone","email","gender","dateOfBirth","country","city",
      "bio","mainCategory","subCategory","yearsExperience",
      "skills","languages","motivation",
      "portfolioUrl","linkedinUrl","portfolioFiles",
      "bankName","iban","accountHolderName",
      "nationalIdNumber","passportNumber","idType",
      "nationalIdImage","nationalIdFrontImage","nationalIdBackImage",
      "ibanDocument","verificationDocuments",
    ] as const;

    for (const f of fields) {
      const v = str(body[f]);
      if (v !== undefined) (upd as any)[f] = v;
    }

    if (!Object.keys(upd).length) return NextResponse.json({ error: "لا تحديثات" }, { status: 400 });

    const [updated] = await db.update(freelancerApplications)
      .set(upd).where(eq(freelancerApplications.id, appId)).returning();

    return NextResponse.json({ application: updated });
  } catch (e) {
    console.error("application patch error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const appId = parseInt(id);
    if (isNaN(appId)) return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });

    const { action, reason } = await req.json();
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
    }

    const [app] = await db.select().from(freelancerApplications)
      .where(eq(freelancerApplications.id, appId)).limit(1);
    if (!app) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (app.status !== "pending") {
      return NextResponse.json({ error: "تم معالجة هذا الطلب مسبقاً" }, { status: 409 });
    }

    if (action === "approve") {
      // Check existing user
      const [existing] = await db.select({ id: users.id, role: users.role, activationStatus: users.activationStatus })
        .from(users).where(eq(users.email, app.email)).limit(1);

      let userId: number;
      if (existing) {
        // Allow re-link only if previous account is also a freelancer pending activation
        if (existing.role !== "freelancer" || existing.activationStatus !== "pending") {
          return NextResponse.json({ error: "يوجد حساب نشط بهذا البريد مسبقاً" }, { status: 409 });
        }
        userId = existing.id;
      } else {
        // Create freelancer user immediately
        const inserted = await db.insert(users).values({
          name: app.name,
          email: app.email,
          phone: app.phone,
          role: "freelancer",
          passwordHash: PENDING_PASSWORD_HASH,
          bio: app.bio,
          location: app.city,
          isVerified: false,
          activationStatus: "pending",
        }).returning({ id: users.id });
        userId = inserted[0].id;
      }

      // Revoke any prior un-used tokens for this application
      await db.execute(sql`UPDATE email_verifications SET revoked=true WHERE application_id=${app.id} AND used=false AND COALESCE(revoked,false)=false`);

      const token = generateToken();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.execute(sql`INSERT INTO email_verifications(email, application_id, user_id, token, expires_at) VALUES(${app.email}, ${app.id}, ${userId}, ${token}, ${expires})`);

      await db.update(freelancerApplications)
        .set({ status: "approved", reviewedAt: new Date(), reviewedBy: session.userId })
        .where(eq(freelancerApplications.id, appId));

      const general = await loadSettings("general");
      const siteName = general.platformName || "خدوم";
      const baseUrl = (process.env.APP_BASE_URL || "https://khadum.app").replace(/\/$/, "");
      const link = `${baseUrl}/apply/setup/${token}`;

      // Email (template first, raw fallback)
      const tplResult = await sendTemplatedEmail("apply_setup", app.email, {
        name: app.name, link, site_name: siteName, email: app.email,
      });
      if (!tplResult.ok) {
        const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px"><h2 style="color:#34cc30">مبروك ${app.name}! تمت الموافقة على طلبك في ${siteName}</h2><p>تم إنشاء حسابك وفعّله الآن بتعيين كلمة مرور:</p><p style="text-align:center;margin:30px 0"><a href="${link}" style="background:#34cc30;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">تفعيل الحساب الآن</a></p><p style="color:#777;font-size:13px">الرابط صالح لمدة 7 أيام.</p><p style="word-break:break-all;color:#555;font-size:12px">${link}</p></div>`;
        await sendEmail(app.email, `تمت الموافقة على طلبك — ${siteName}`, html);
      }

      // WhatsApp (best-effort, doesn't block)
      if (app.phone) {
        const waMsg = `مرحباً ${app.name} 👋\n\nمبروك! تمت الموافقة على طلب انضمامك إلى ${siteName}.\nلتفعيل حسابك وتعيين كلمة المرور:\n${link}\n\nالرابط صالح 7 أيام.`;
        sendWhatsApp(app.phone, waMsg).catch((e) => console.error("wa send failed", e));
      }

      return NextResponse.json({ ok: true, message: "تمت الموافقة وأُنشئ حساب المستقل، وأُرسل رابط التفعيل", userId });
    }

    if (action === "reject") {
      await db.update(freelancerApplications)
        .set({ status: "rejected", rejectionReason: reason || null, reviewedAt: new Date(), reviewedBy: session.userId })
        .where(eq(freelancerApplications.id, appId));

      return NextResponse.json({ ok: true, message: "تم رفض الطلب" });
    }
  } catch (e) {
    console.error("application action error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

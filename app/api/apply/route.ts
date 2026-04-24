import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { freelancerApplications, users } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { generateToken, sendTemplatedEmail, sendEmail, loadSettings } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, phoneCountryCode, country, city, gender, dateOfBirth, bio,
      mainCategory, subCategory, yearsExperience, skills, languages,
      portfolioUrl, nationalIdFrontImage, nationalIdBackImage,
      bankName, iban, ibanDocument, accountHolderName,
      idType, nationalIdNumber, passportNumber,
      verificationDocuments, portfolioFiles, inviteToken,
    } = body;

    // === Registration mode gate ===
    const general = await loadSettings("general");
    const mode = (general.registrationMode || "open") as "open" | "invite" | "closed";
    if (mode === "closed") return NextResponse.json({ error: "التسجيل مغلق حالياً" }, { status: 403 });
    let inviteRow: any = null;
    if (mode === "invite") {
      if (!inviteToken) return NextResponse.json({ error: "هذا التسجيل بدعوة فقط — يلزم رابط دعوة صالح" }, { status: 403 });
      const rows: any = await db.execute(sql`SELECT id, email, used_at, expires_at FROM application_invites WHERE token=${String(inviteToken)} LIMIT 1`);
      if (!rows.length) return NextResponse.json({ error: "رمز الدعوة غير صحيح" }, { status: 403 });
      inviteRow = rows[0];
      if (inviteRow.used_at) return NextResponse.json({ error: "تم استخدام هذه الدعوة مسبقاً" }, { status: 403 });
      if (inviteRow.expires_at && new Date(inviteRow.expires_at) < new Date()) return NextResponse.json({ error: "انتهت صلاحية الدعوة" }, { status: 403 });
    }

    if (
      !name || !email || !phone || !phoneCountryCode || !country || !city ||
      !gender || !dateOfBirth || !bio || !mainCategory || !subCategory ||
      !yearsExperience || !skills || !portfolioUrl || !nationalIdFrontImage ||
      !nationalIdBackImage || !bankName || !iban || !ibanDocument || !accountHolderName ||
      !idType
    ) {
      return NextResponse.json({ error: "يرجى ملء جميع الحقول المطلوبة" }, { status: 400 });
    }
    if (idType === "national_id" && !/^[12]\d{9}$/.test(String(nationalIdNumber || ""))) {
      return NextResponse.json({ error: "رقم الهوية الوطنية يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2" }, { status: 400 });
    }
    if (idType === "passport" && !/^[A-Z0-9]{6,12}$/i.test(String(passportNumber || "").trim())) {
      return NextResponse.json({ error: "رقم الجواز غير صالح" }, { status: 400 });
    }
    if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(String(email).trim())) {
      return NextResponse.json({ error: "البريد الإلكتروني يجب أن يكون بأحرف لاتينية فقط" }, { status: 400 });
    }

    const trimmedBio = String(bio).trim();
    if (trimmedBio.length < 150 || trimmedBio.length > 300) {
      return NextResponse.json({ error: "النبذة يجب أن تكون بين 150 و 300 حرف" }, { status: 400 });
    }

    const cleanPhone = String(phoneCountryCode + phone).replace(/\s/g, "");
    const otp = (await db.execute(sql`SELECT verified FROM phone_otps WHERE phone=${cleanPhone} AND verified=true ORDER BY created_at DESC LIMIT 1`)) as Array<{ verified: boolean }>;
    if (!otp.length) {
      return NextResponse.json({ error: "يجب التحقق من رقم الواتساب أولاً" }, { status: 400 });
    }

    const existing = await db.select({ id: freelancerApplications.id })
      .from(freelancerApplications)
      .where(eq(freelancerApplications.email, email.toLowerCase().trim()))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "يوجد طلب مسبق بهذا البريد الإلكتروني" }, { status: 409 });
    }

    const existingUser = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 409 });
    }

    // Phone uniqueness — only within freelancer scope (clients may share)
    const phoneCheck = (await db.execute(sql`
      SELECT 'app' AS src FROM freelancer_applications WHERE phone_country_code=${phoneCountryCode} AND phone=${phone.trim()}
      UNION ALL
      SELECT 'user' AS src FROM users WHERE role='freelancer' AND (phone=${cleanPhone} OR phone=${phone.trim()})
      LIMIT 1
    `)) as Array<{ src: string }>;
    if (phoneCheck.length > 0) {
      return NextResponse.json({ error: "رقم الجوال مسجل مسبقاً في حساب مستقل آخر" }, { status: 409 });
    }

    const verifDocs = Array.isArray(verificationDocuments) ? verificationDocuments.slice(0, 5) : [];

    const [app] = await db.insert(freelancerApplications).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      phoneCountryCode: phoneCountryCode || null,
      country: country || null,
      city: city || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      bio: trimmedBio,
      mainCategory: mainCategory || null,
      subCategory: subCategory || null,
      yearsExperience: yearsExperience || null,
      skills: Array.isArray(skills) ? skills.join(", ") : skills,
      languages: Array.isArray(languages) ? languages.join(", ") : (languages || null),
      portfolioUrl: portfolioUrl || null,
      nationalIdFrontImage: nationalIdFrontImage || null,
      nationalIdBackImage: nationalIdBackImage || null,
      bankName: bankName || null,
      iban: String(iban).replace(/\s/g, "").toUpperCase(),
      ibanDocument: ibanDocument || null,
      accountHolderName: accountHolderName.trim(),
      idType: idType,
      nationalIdNumber: idType === "national_id" ? String(nationalIdNumber).trim() : null,
      passportNumber: idType === "passport" ? String(passportNumber).trim().toUpperCase() : null,
      verificationDocuments: verifDocs.length ? JSON.stringify(verifDocs) : null,
      portfolioFiles: Array.isArray(portfolioFiles) && portfolioFiles.length ? JSON.stringify(portfolioFiles.slice(0, 5)) : null,
      inviteToken: inviteRow ? String(inviteToken) : null,
      phoneVerified: true,
      emailVerified: false,
      status: "pending",
    }).returning({ id: freelancerApplications.id });

    if (inviteRow) {
      await db.execute(sql`UPDATE application_invites SET used_at=NOW(), used_by_application_id=${app.id} WHERE id=${inviteRow.id}`);
    }

    const siteName = general.platformName || "خدوم";

    const tplResult = await sendTemplatedEmail("apply_received", email.toLowerCase().trim(), {
      name: name.trim(), site_name: siteName, email: email.toLowerCase().trim(),
    });
    if (!tplResult.ok) {
      const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px"><h2 style="color:#34cc30">مرحباً ${name}، تم استلام طلبك في ${siteName}</h2><p>شكراً لتقديمك على الانضمام إلى منصتنا. لقد استلمنا طلبك وهو الآن قيد المراجعة من قبل فريق العمل.</p><p>سنقوم بإعلامك عبر البريد الإلكتروني خلال أيام العمل القليلة القادمة بقرار قبول أو رفض طلبك. وفي حال القبول سيتم إرسال رابط لإكمال إنشاء حسابك وتعيين كلمة المرور.</p><p style="color:#777;font-size:13px;margin-top:30px">شكراً لصبرك،<br/>فريق ${siteName}</p></div>`;
      await sendEmail(email.toLowerCase().trim(), `تم استلام طلبك — ${siteName}`, html);
    }

    return NextResponse.json({ ok: true, applicationId: app.id, message: "تم استلام طلبك! سنراجعه ونتواصل معك بالبريد الإلكتروني." });
  } catch (e) {
    console.error("apply error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء إرسال الطلب" }, { status: 500 });
  }
}

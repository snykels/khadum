import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { to } = await req.json().catch(() => ({}));
  if (!to) return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;color:#333;border-radius:12px;border:1px solid #eee">
    <h2 style="color:#34cc30;margin-bottom:8px">✅ اختبار إرسال البريد</h2>
    <p>تم استلام هذا البريد بنجاح من منصة خدوم.</p>
    <p style="color:#888;font-size:12px">الوقت: ${new Date().toLocaleString("ar-SA")}</p>
  </div>`;
  const result = await sendEmail(to, "اختبار إرسال البريد — خدوم", html);
  if (!result.ok) return NextResponse.json({ error: result.info || "فشل الإرسال", provider: result.provider }, { status: 500 });
  return NextResponse.json({ ok: true, provider: result.provider });
}

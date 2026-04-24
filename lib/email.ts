import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "خدوم <help@khadum.app>";
const BASE_URL = process.env.APP_BASE_URL || "https://khadum.app";

export async function sendPasswordResetEmail(to: string, token: string, name: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "إعادة تعيين كلمة المرور — خدوم",
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <tr>
          <td style="background:#485869;padding:32px 40px;text-align:center">
            <span style="color:#34cc30;font-size:32px;font-weight:bold">خدوم</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px">
            <h1 style="color:#485869;font-size:24px;margin:0 0 16px">إعادة تعيين كلمة المرور</h1>
            <p style="color:#6b7280;line-height:1.6;margin:0 0 24px">مرحباً ${name}،</p>
            <p style="color:#6b7280;line-height:1.6;margin:0 0 32px">
              تلقّينا طلبك لإعادة تعيين كلمة المرور. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة. الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px">
              <tr>
                <td style="background:#34cc30;border-radius:10px;padding:16px 40px">
                  <a href="${link}" style="color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold">إعادة تعيين كلمة المرور</a>
                </td>
              </tr>
            </table>
            <p style="color:#9ca3af;font-size:13px;margin:0 0 8px">
              إذا لم تطلب ذلك، تجاهل هذا البريد — حسابك بأمان تام.
            </p>
            <p style="color:#9ca3af;font-size:12px;margin:0">
              أو انسخ الرابط: <a href="${link}" style="color:#34cc30;word-break:break-all">${link}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="color:#9ca3af;font-size:12px;margin:0">© 2026 خدوم — khadum.app · help@khadum.app</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });

  if (error) throw new Error(error.message);
}

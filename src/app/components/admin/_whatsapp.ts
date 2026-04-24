'use client';

/**
 * يفتح محادثة واتساب ويب في نافذة منبثقة داخل المتصفح
 * بدلاً من تطبيق واتساب أو صفحة wa.me التحويلية.
 */
type OpenOpts = { prefilledText?: string; uniqueWindow?: boolean };

export function openWhatsAppChat(
  phone: string | null | undefined,
  optsOrText?: string | OpenOpts
) {
  if (!phone) {
    alert("لا يوجد رقم جوال لهذا المستخدم");
    return;
  }
  const clean = String(phone).replace(/\D/g, "");
  if (!clean) {
    alert("رقم الجوال غير صالح");
    return;
  }
  const opts: OpenOpts =
    typeof optsOrText === "string" ? { prefilledText: optsOrText } : (optsOrText || {});
  const params = new URLSearchParams({ phone: clean });
  if (opts.prefilledText) params.set("text", opts.prefilledText);
  const url = `https://web.whatsapp.com/send?${params.toString()}`;
  const w = 1100, h = 760;
  const left = Math.max(0, Math.round((window.screen.width - w) / 2));
  const top = Math.max(0, Math.round((window.screen.height - h) / 2));
  // Unique window names allow opening multiple chats side-by-side (bulk action).
  const winName = opts.uniqueWindow ? `khadom_wa_${clean}` : "khadom_whatsapp";
  window.open(
    url,
    winName,
    `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
}

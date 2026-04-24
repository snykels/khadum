import { KhadomTokens as T } from "./tokens";

const esc = (s: string) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]);
const v = (s: string, vars: Record<string, string>) => s.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);

export type KhadomEmailBlock =
  | { type: "k_header"; logoUrl?: string; siteName?: string; navLinks?: { label: string; url: string }[] }
  | { type: "k_hero"; variant?: "info" | "celebrate" | "alert"; icon?: string; title: string; subtitle?: string; tone?: "success" | "warning" | "error" | "info" }
  | { type: "k_body"; greeting?: string; paragraphs: string[] }
  | { type: "k_info_card"; title?: string; rows: { key: string; value: string; emphasize?: boolean }[] }
  | { type: "k_cta_primary"; text: string; href: string; whatsapp?: boolean; icon?: string }
  | { type: "k_cta_secondary"; text: string; href: string }
  | { type: "k_features"; items: { icon?: string; title: string; description: string }[] }
  | { type: "k_testimonial"; quote: string; author: string; role?: string; stars?: number }
  | { type: "k_legal_notice"; text: string; emoji?: string }
  | { type: "k_footer"; description?: string; social?: { label: string; url: string }[]; legalAddress?: string; unsubscribeUrl?: string };

function header(b: Extract<KhadomEmailBlock, { type: "k_header" }>) {
  const logo = b.logoUrl ? `<img src="${esc(b.logoUrl)}" alt="${esc(b.siteName || "خدوم")}" height="40" style="display:block;margin:0 auto;height:40px"/>` : `<div style="font-size:24px;font-weight:700;color:${T.colors.royalGreen};text-align:center">${esc(b.siteName || "خدوم")}</div>`;
  const nav = (b.navLinks || []).slice(0, 3).map(l => `<a href="${esc(l.url)}" style="color:${T.colors.grayScale[600]};text-decoration:none;margin:0 12px;font-size:13px">${esc(l.label)}</a>`).join("");
  return `<tr><td style="padding:0;background:${T.colors.warmGray};height:8px;line-height:8px">&nbsp;</td></tr>
<tr><td style="background:#fff;padding:32px 24px 24px 24px;text-align:center;border-bottom:1px solid ${T.colors.grayScale[200]}">${logo}</td></tr>
${nav ? `<tr><td style="background:#fff;padding:12px 24px;text-align:center">${nav}</td></tr>` : ""}`;
}

function hero(b: Extract<KhadomEmailBlock, { type: "k_hero" }>, vars: Record<string, string>) {
  const variant = b.variant || "info";
  const tone = b.tone || "info";
  const toneColor = tone === "success" ? T.colors.royalGreen : tone === "warning" ? T.colors.warning : tone === "error" ? T.colors.error : T.colors.info;
  if (variant === "celebrate") {
    return `<tr><td style="background:linear-gradient(180deg,${T.colors.warmGray},#fff);padding:40px 24px;text-align:center">
      ${b.icon ? `<div style="font-size:64px;line-height:1;margin-bottom:16px">${esc(b.icon)}</div>` : ""}
      <h1 style="margin:0 0 8px;font-size:32px;font-weight:600;color:${T.colors.grayScale[900]};font-family:${T.font.primary}">${v(esc(b.title), vars)}</h1>
      ${b.subtitle ? `<p style="margin:0;font-size:16px;color:${T.colors.grayScale[600]};line-height:1.6">${v(esc(b.subtitle), vars)}</p>` : ""}
    </td></tr>`;
  }
  if (variant === "alert") {
    return `<tr><td style="background:${toneColor};padding:14px 24px;color:#fff;text-align:center;font-size:14px;font-weight:600">${b.icon ? esc(b.icon) + " " : ""}تنبيه</td></tr>
    <tr><td style="background:#fff;padding:32px 24px;text-align:center">
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${T.colors.grayScale[900]};font-family:${T.font.primary}">${v(esc(b.title), vars)}</h1>
      ${b.subtitle ? `<p style="margin:0;font-size:16px;color:${T.colors.grayScale[600]};line-height:1.6">${v(esc(b.subtitle), vars)}</p>` : ""}
    </td></tr>`;
  }
  return `<tr><td style="background:#fff;padding:40px 24px;text-align:center">
    ${b.icon ? `<div style="width:64px;height:64px;border-radius:50%;background:${toneColor}1A;color:${toneColor};font-size:32px;line-height:64px;margin:0 auto 16px;text-align:center">${esc(b.icon)}</div>` : ""}
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:600;color:${T.colors.grayScale[900]};font-family:${T.font.primary}">${v(esc(b.title), vars)}</h1>
    ${b.subtitle ? `<p style="margin:0;font-size:16px;color:${T.colors.grayScale[600]};line-height:1.6">${v(esc(b.subtitle), vars)}</p>` : ""}
  </td></tr>`;
}

function body(b: Extract<KhadomEmailBlock, { type: "k_body" }>, vars: Record<string, string>) {
  const greet = b.greeting ? `<p style="margin:0 0 16px;font-size:18px;color:${T.colors.grayScale[900]};font-weight:500">${v(esc(b.greeting), vars)}</p>` : "";
  const paras = (b.paragraphs || []).map(p => `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:${T.colors.grayScale[800]}">${v(esc(p), vars)}</p>`).join("");
  return `<tr><td style="background:#fff;padding:0 24px 24px 24px;direction:rtl;text-align:right">${greet}${paras}</td></tr>`;
}

function infoCard(b: Extract<KhadomEmailBlock, { type: "k_info_card" }>, vars: Record<string, string>) {
  const title = b.title ? `<div style="font-size:14px;color:${T.colors.grayScale[600]};margin-bottom:12px">${v(esc(b.title), vars)}</div>` : "";
  const rows = (b.rows || []).map((r, i, arr) => {
    const isLast = i === arr.length - 1;
    const valSize = r.emphasize ? "20px" : "16px";
    const valColor = r.emphasize ? T.colors.royalGreen : T.colors.grayScale[900];
    return `<tr><td style="padding:12px 0;color:${T.colors.grayScale[600]};font-weight:500;${isLast ? "" : `border-bottom:1px solid ${T.colors.grayScale[200]};`}">${v(esc(r.key), vars)}</td>
    <td style="padding:12px 0;color:${valColor};font-weight:600;font-size:${valSize};text-align:left;${isLast ? "" : `border-bottom:1px solid ${T.colors.grayScale[200]};`}">${v(esc(r.value), vars)}</td></tr>`;
  }).join("");
  return `<tr><td style="padding:0 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.colors.grayScale[50]};border-radius:12px;padding:24px"><tr><td style="padding:24px">${title}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr></table></td></tr>
  <tr><td style="height:24px;line-height:24px">&nbsp;</td></tr>`;
}

function ctaPrimary(b: Extract<KhadomEmailBlock, { type: "k_cta_primary" }>, vars: Record<string, string>) {
  const bg = b.whatsapp ? T.colors.waGreen : T.colors.royalGreen;
  const icon = b.icon ? `${esc(b.icon)} ` : "";
  return `<tr><td style="padding:0 24px 32px;text-align:center">
    <a href="${v(esc(b.href), vars)}" style="display:inline-block;background:${bg};color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;min-width:240px;box-shadow:${T.shadow.md};font-family:${T.font.primary}">${icon}${v(esc(b.text), vars)}</a>
  </td></tr>`;
}

function ctaSecondary(b: Extract<KhadomEmailBlock, { type: "k_cta_secondary" }>, vars: Record<string, string>) {
  return `<tr><td style="padding:0 24px 32px;text-align:center">
    <a href="${v(esc(b.href), vars)}" style="display:inline-block;background:transparent;color:${T.colors.royalGreen};padding:14px 32px;border:1.5px solid ${T.colors.royalGreen};border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;font-family:${T.font.primary}">${v(esc(b.text), vars)}</a>
  </td></tr>`;
}

function features(b: Extract<KhadomEmailBlock, { type: "k_features" }>, vars: Record<string, string>) {
  const cells = (b.items || []).slice(0, 4).map(it => `<td valign="top" align="center" style="padding:16px 8px;width:33%">
    ${it.icon ? `<div style="width:48px;height:48px;border-radius:50%;background:${T.colors.warmGray};color:${T.colors.royalGreen};font-size:24px;line-height:48px;text-align:center;margin:0 auto 12px">${esc(it.icon)}</div>` : ""}
    <div style="font-size:16px;font-weight:700;color:${T.colors.grayScale[900]};margin-bottom:4px">${v(esc(it.title), vars)}</div>
    <div style="font-size:14px;color:${T.colors.grayScale[600]};line-height:1.5">${v(esc(it.description), vars)}</div>
  </td>`).join("");
  return `<tr><td style="padding:0 16px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table></td></tr>`;
}

function testimonial(b: Extract<KhadomEmailBlock, { type: "k_testimonial" }>, vars: Record<string, string>) {
  const stars = "★".repeat(Math.max(0, Math.min(5, b.stars ?? 0)));
  return `<tr><td style="padding:24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.colors.grayScale[50]};border-radius:12px"><tr><td style="padding:32px;text-align:center">
    <div style="font-size:48px;line-height:1;color:${T.colors.luxuryGold};margin-bottom:8px">"</div>
    <p style="margin:0 0 16px;font-size:18px;font-style:italic;color:${T.colors.grayScale[800]};line-height:1.6">${v(esc(b.quote), vars)}</p>
    <div style="width:60px;height:1px;background:${T.colors.grayScale[200]};margin:0 auto 16px"></div>
    <div style="font-size:14px;font-weight:700;color:${T.colors.grayScale[900]}">${v(esc(b.author), vars)}</div>
    ${b.role ? `<div style="font-size:12px;color:${T.colors.grayScale[600]};margin-top:2px">${v(esc(b.role), vars)}</div>` : ""}
    ${stars ? `<div style="color:${T.colors.luxuryGold};margin-top:8px;letter-spacing:2px">${stars}</div>` : ""}
  </td></tr></table></td></tr>`;
}

function legal(b: Extract<KhadomEmailBlock, { type: "k_legal_notice" }>, vars: Record<string, string>) {
  return `<tr><td style="padding:0 24px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.colors.legalNoticeBg};border:1px solid ${T.colors.legalNoticeBorder};border-radius:8px"><tr>
    <td style="padding:16px;font-size:13px;color:${T.colors.legalNoticeText};line-height:1.6"><span style="margin-left:8px">${esc(b.emoji || "🛡️")}</span>${v(esc(b.text), vars)}</td>
  </tr></table></td></tr>`;
}

function footer(b: Extract<KhadomEmailBlock, { type: "k_footer" }>, vars: Record<string, string>) {
  const social = (b.social || []).map(s =>
    `<a href="${esc(s.url)}" style="display:inline-block;padding:8px 12px;background:#485869;color:#ffffff;text-align:center;text-decoration:none;margin:0 4px 4px;font-size:13px;border-radius:6px;font-weight:500">${esc(s.label)}</a>`
  ).join("");
  const year = new Date().getFullYear();
  return `<tr><td style="background:#2d3748;padding:40px 24px;text-align:center;border-top:4px solid #34cc30">
    <div style="margin-bottom:20px">
      <span style="font-size:26px;font-weight:700;color:#34cc30;font-family:Tahoma,Arial,sans-serif">خدوم</span>
      <span style="color:#a0aec0;font-size:13px;margin-right:8px">khadum.app</span>
    </div>
    ${b.description ? `<p style="margin:0 0 20px;font-size:13px;color:#a0aec0;line-height:1.6">${v(esc(b.description), vars)}</p>` : ""}
    ${social ? `<div style="margin:0 0 24px">${social}</div>` : ""}
    <div style="border-top:1px solid #4a5568;padding-top:20px;margin-top:8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="text-align:center;padding-bottom:12px">
          <a href="https://khadum.app/terms" style="color:#718096;font-size:11px;text-decoration:none;margin:0 8px">الشروط والأحكام</a>
          <span style="color:#4a5568">·</span>
          <a href="https://khadum.app/privacy" style="color:#718096;font-size:11px;text-decoration:none;margin:0 8px">سياسة الخصوصية</a>
          <span style="color:#4a5568">·</span>
          <a href="https://khadum.app/help" style="color:#718096;font-size:11px;text-decoration:none;margin:0 8px">مركز المساعدة</a>
          <span style="color:#4a5568">·</span>
          <a href="mailto:help@khadum.app" style="color:#718096;font-size:11px;text-decoration:none;margin:0 8px">help@khadum.app</a>
        </td>
      </tr></table>
      ${b.legalAddress ? `<p style="margin:0 0 8px;font-size:11px;color:#718096">${v(esc(b.legalAddress), vars)}</p>` : ""}
      ${b.unsubscribeUrl ? `<p style="margin:8px 0 0"><a href="${v(esc(b.unsubscribeUrl), vars)}" style="color:#718096;font-size:11px;text-decoration:underline">إلغاء الاشتراك من القائمة البريدية</a></p>` : ""}
      <p style="margin:12px 0 0;color:#4a5568;font-size:11px">© ${year} خدوم. جميع الحقوق محفوظة. 🇸🇦 منصة سعودية</p>
    </div>
  </td></tr>`;
}

export function isKhadomBlock(b: any): b is KhadomEmailBlock {
  return b && typeof b.type === "string" && b.type.startsWith("k_");
}

export function renderKhadomBlock(b: KhadomEmailBlock, vars: Record<string, string>): string {
  switch (b.type) {
    case "k_header":        return header(b);
    case "k_hero":          return hero(b, vars);
    case "k_body":          return body(b, vars);
    case "k_info_card":     return infoCard(b, vars);
    case "k_cta_primary":   return ctaPrimary(b, vars);
    case "k_cta_secondary": return ctaSecondary(b, vars);
    case "k_features":      return features(b, vars);
    case "k_testimonial":   return testimonial(b, vars);
    case "k_legal_notice":  return legal(b, vars);
    case "k_footer":        return footer(b, vars);
    default: return "";
  }
}

export function wrapKhadomEmail(innerRows: string): string {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>khadom</title>
  <style>@media (prefers-color-scheme: dark) { body { background:#1c1917 !important } }</style></head>
  <body style="margin:0;padding:24px 0;background:${T.colors.warmGray};font-family:${T.font.primary};direction:rtl">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.colors.warmGray}"><tr><td align="center">
      <table role="presentation" width="${T.email.width}" cellpadding="0" cellspacing="0" border="0" style="width:${T.email.width}px;max-width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:${T.shadow.sm}">
        ${innerRows}
      </table>
    </td></tr></table>
  </body></html>`;
}

export const KHADOM_BLOCK_PRESETS: { type: KhadomEmailBlock["type"]; label: string; preset: KhadomEmailBlock }[] = [
  { type: "k_header", label: "E-01 رأس البريد", preset: { type: "k_header", siteName: "خدوم", navLinks: [{ label: "لوحة التحكم", url: "{{dashboard_url}}" }, { label: "المساعدة", url: "{{help_url}}" }, { label: "تواصل معنا", url: "{{contact_url}}" }] } },
  { type: "k_hero", label: "E-02 عنوان البطل", preset: { type: "k_hero", variant: "info", icon: "✅", title: "أهلاً بك في خدوم", subtitle: "نحن سعداء بانضمامك إلينا", tone: "success" } },
  { type: "k_body", label: "E-03 جسم الرسالة", preset: { type: "k_body", greeting: "أهلاً {{name}}،", paragraphs: ["شكرًا لتسجيلك في منصة خدوم.", "لقد أنشأنا لك حسابًا جديدًا. يمكنك الآن الوصول لجميع الخدمات.", "في حال احتجت أي مساعدة، فريقنا متاح على مدار الساعة."] } },
  { type: "k_info_card", label: "E-04 بطاقة معلومات", preset: { type: "k_info_card", title: "تفاصيل الطلب", rows: [{ key: "رقم الطلب", value: "#{{order_id}}" }, { key: "الخدمة", value: "{{service_name}}" }, { key: "المستقل", value: "{{freelancer_name}}" }, { key: "المبلغ", value: "{{amount}} ر.س", emphasize: true }] } },
  { type: "k_cta_primary", label: "E-05 زر رئيسي", preset: { type: "k_cta_primary", text: "ابدأ الآن", href: "{{cta_url}}", icon: "→" } },
  { type: "k_cta_secondary", label: "E-06 زر ثانوي", preset: { type: "k_cta_secondary", text: "عرض التفاصيل", href: "{{secondary_url}}" } },
  { type: "k_features", label: "E-07 شبكة ميزات", preset: { type: "k_features", items: [{ icon: "⚡", title: "طلب سريع", description: "تواصل مباشر عبر واتساب" }, { icon: "🔒", title: "دفع آمن", description: "حساب ضمان معتمد" }, { icon: "⭐", title: "ضمان جودة", description: "استرداد كامل عند عدم الرضا" }] } },
  { type: "k_testimonial", label: "E-08 شهادة عميل", preset: { type: "k_testimonial", quote: "تجربة رائعة مع خدوم، تسليم في الوقت وجودة عالية.", author: "أحمد السالم", role: "صاحب متجر إلكتروني", stars: 5 } },
  { type: "k_legal_notice", label: "E-09 تنبيه قانوني", preset: { type: "k_legal_notice", emoji: "🛡️", text: "مبلغك محفوظ في حساب الضمان ولن يُحوّل للمستقل إلا بعد تأكيد استلامك للعمل." } },
  { type: "k_footer", label: "E-10 تذييل", preset: { type: "k_footer", description: "خدوم — منصة الخدمات المستقلة السعودية الأولى عبر واتساب", social: [{ label: "𝕏 تويتر", url: "https://x.com/khadum_app" }, { label: "📸 انستغرام", url: "https://instagram.com/khadum_app" }, { label: "in لينكدإن", url: "https://linkedin.com/company/khadum_app" }, { label: "▶ يوتيوب", url: "https://youtube.com/@khadum_app" }], legalAddress: "خدوم · الرياض، المملكة العربية السعودية · help@khadum.app", unsubscribeUrl: "{{unsubscribe_url}}" } },
];

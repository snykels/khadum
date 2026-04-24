/**
 * Contact-info leak detector for inbound WhatsApp messages.
 * Regex-only (no external AI calls). Flags phone numbers, emails,
 * social handles, shortened URLs, and explicit platform-evasion phrases.
 */

export type LeakSeverity = "low" | "medium" | "high" | "critical";
export type LeakAction = "warned" | "blocked" | "redacted" | "ignored";

export interface LeakPattern {
  type: string;
  match: string;
  severity: LeakSeverity;
}

export interface LeakDetectionResult {
  hasLeak: boolean;
  patterns: LeakPattern[];
  severity: LeakSeverity | null;
  action: LeakAction;
  redactedText: string;
  confidence: number;
  detectedBy: "regex" | "claude" | "hybrid";
}

// ─── خرائط تطبيع الأحرف ────────────────────────────────────────────────────

const ARABIC_DIGIT_MAP: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

// إيموجي الأرقام (keycap digits)
const EMOJI_DIGIT_MAP: Record<string, string> = {
  "0️⃣": "0", "1️⃣": "1", "2️⃣": "2", "3️⃣": "3", "4️⃣": "4",
  "5️⃣": "5", "6️⃣": "6", "7️⃣": "7", "8️⃣": "8", "9️⃣": "9",
  "🔟": "10",
};


function normalizeDigits(text: string): string {
  let out = text.replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGIT_MAP[d] || d);
  for (const [emoji, digit] of Object.entries(EMOJI_DIGIT_MAP)) {
    out = out.split(emoji).join(digit);
  }
  return out;
}

function collapseSpacedDigits(text: string): string {
  return text.replace(/(\d)[\s.\-_•·،,\/\\|]{0,3}(?=\d)/g, "$1");
}

// ─── أنماط رقم الجوال ─────────────────────────────────────────────────────

const PHONE_PATTERNS: { re: RegExp; severity: LeakSeverity }[] = [
  // سعودي صريح
  { re: /(?:\+|00)?9665\d{8}/g, severity: "critical" },
  // محلي سعودي
  { re: /(?<!\d)05\d{8}(?!\d)/g, severity: "critical" },
  // بدون 0
  { re: /(?<!\d)5\d{8}(?!\d)/g, severity: "high" },
  // أنماط دولية عامة xxx-xxx-xxxx
  { re: /(?<!\d)\d{3}[\s\-]\d{3}[\s\-]\d{4}(?!\d)/g, severity: "high" },
  // xxxx-xxxx-xxx
  { re: /(?<!\d)\d{4}[\s\-]\d{4}[\s\-]\d{2,3}(?!\d)/g, severity: "medium" },
  // 10-11 رقماً متتالياً (رقم جوال دولي محتمل)
  { re: /(?<!\d)\d{10,11}(?!\d)/g, severity: "medium" },
];

// ─── إيميل ────────────────────────────────────────────────────────────────

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// إيميل مكتوب بطريقة مبهمة: "ahmad at gmail dot com"
const OBFUSCATED_EMAIL_RE =
  /[\w.\-]+\s+(?:at|AT|آت|ات)\s+[\w.\-]+\s+(?:dot|DOT|دوت)\s+\w{2,}/gi;

// ─── شبكات التواصل الاجتماعي والروابط ──────────────────────────────────────

const SOCIAL_PATTERNS: { re: RegExp; type: string; severity: LeakSeverity }[] = [
  // واتساب
  { re: /(?:wa\.me|whatsapp\.com|api\.whatsapp)\/[\w\d\+]+/gi, type: "whatsapp_link", severity: "critical" },
  // تيليجرام
  { re: /\bt\.me\/[\w\d_]+/gi, type: "telegram", severity: "critical" },
  { re: /\btelegram(?:\.me)?\/[\w\d_]+/gi, type: "telegram", severity: "critical" },
  // انستقرام / سناب / تيك توك / تويتر / فيسبوك
  { re: /(?:instagram|insta|fb|facebook|snap|snapchat|tiktok|twitter|x\.com)[\s:]*@?[\w\d._]+/gi, type: "social", severity: "high" },
  // أي @يوزرنيم (3 أحرف+)
  { re: /@[\w\d._]{3,}/g, type: "handle", severity: "medium" },
  // لينكدإن
  { re: /linkedin\.com\/in\/[\w\d_\-]+/gi, type: "linkedin", severity: "high" },
];

// ─── مختصرات URL ──────────────────────────────────────────────────────────

const URL_SHORTENER_DOMAINS = [
  "bit.ly", "tinyurl.com", "t.co", "ow.ly", "short.io", "cutt.ly",
  "rb.gy", "tiny.cc", "is.gd", "buff.ly", "shorturl.at", "rebrand.ly",
  "tr.im", "v.gd", "qr.io", "url.ae", "lnkd.in",
];

const URL_SHORTENER_RE = new RegExp(
  `https?:\\/\\/(?:${URL_SHORTENER_DOMAINS.map(d => d.replace(".", "\\.")).join("|")})[\\/\\w\\d\\-._~:/?#\\[\\]@!$&'()*+,;=%]*`,
  "gi"
);

const URL_RE = /https?:\/\/[^\s]+/gi;

// ─── أنماط الكلمات العربية ────────────────────────────────────────────────

const ARABIC_KEYWORDS: { words: string[]; severity: LeakSeverity; type: string }[] = [
  // قنوات التواصل
  { words: ["واتساب", "واتس", "وتساب", "whatsapp", "whats app", "واتسابي", "واتسي"], severity: "high", type: "channel_mention" },
  { words: ["تليقرام", "تيليجرام", "تليجرام", "تيلقرام", "telegram"], severity: "high", type: "channel_mention" },
  { words: ["سنابي", "سناب شات", "snapchat", "سناب"], severity: "medium", type: "channel_mention" },
  { words: ["انستقرام", "انستجرام", "انستا", "instagram"], severity: "medium", type: "channel_mention" },
  { words: ["تيك توك", "تيكتوك", "tiktok"], severity: "medium", type: "channel_mention" },
  // طلب تواصل خارجي
  { words: ["جوالي", "رقمي", "رقم خاص", "رقمك", "موبايلي", "هاتفي"], severity: "high", type: "external_contact" },
  { words: ["تواصل خارج", "تواصل برا", "كلمني", "اتصل علي", "تصل علي", "تكلمني", "تواصل معي"], severity: "high", type: "external_contact" },
  { words: ["كلمني خارج", "خارج الموقع", "بدون المنصة", "تواصل خارجي"], severity: "critical", type: "platform_evasion" },
  // التحايل على المنصة
  { words: ["خصم خارج", "بدون منصة", "بدون عمولة", "بدون الموقع", "خارج خدوم", "بدون وسيط", "مباشرة معك", "بيننا"], severity: "critical", type: "platform_evasion" },
  { words: ["سعر أقل برا", "اتفقنا برا", "نتفق لحالنا", "اتعاملوا مباشرة"], severity: "critical", type: "platform_evasion" },
  // تلميحات للصور
  { words: ["صورة فيها رقم", "رقمي بالصورة", "شوف الصورة للتواصل", "الصورة تحتها رقم"], severity: "critical", type: "image_leak_hint" },
  // QR كود
  { words: ["qr", "كيو آر", "كيو ار", "باركود", "رمز الـ qr", "امسح الكود"], severity: "high", type: "qr_code" },
];


// ─── الكاشف الرئيسي بالـ Regex ───────────────────────────────────────────

function detectByRegex(text: string): LeakPattern[] {
  const norm = normalizeDigits(text);
  const found: LeakPattern[] = [];

  // ── 1. أرقام جوال مباشرة ──────────────────────────────────────────────
  for (const { re, severity } of PHONE_PATTERNS) {
    re.lastIndex = 0;
    const matches = norm.match(re);
    if (matches) {
      for (const m of matches) found.push({ type: "phone", match: m, severity });
    }
  }

  // ── 2. إيميل مباشر ────────────────────────────────────────────────────
  const emails = norm.match(EMAIL_RE);
  if (emails) {
    for (const m of emails) found.push({ type: "email", match: m, severity: "critical" });
  }

  // ── 3. إيميل مبهم ─────────────────────────────────────────────────────
  const obfEmails = text.match(OBFUSCATED_EMAIL_RE);
  if (obfEmails) {
    for (const m of obfEmails) found.push({ type: "email_obfuscated", match: m, severity: "critical" });
  }

  // ── 4. شبكات اجتماعية ─────────────────────────────────────────────────
  for (const { re, type, severity } of SOCIAL_PATTERNS) {
    re.lastIndex = 0;
    const matches = norm.match(re);
    if (matches) {
      for (const m of matches) found.push({ type, match: m, severity });
    }
  }

  // ── 5. مختصرات URL ────────────────────────────────────────────────────
  URL_SHORTENER_RE.lastIndex = 0;
  const shortUrls = norm.match(URL_SHORTENER_RE);
  if (shortUrls) {
    for (const m of shortUrls) found.push({ type: "url_shortener", match: m, severity: "critical" });
  }

  // ── 6. روابط أخرى غير الموقع ─────────────────────────────────────────
  URL_RE.lastIndex = 0;
  const urls = norm.match(URL_RE);
  if (urls) {
    for (const m of urls) {
      const safe = /khadom\.app|localhost|replit/i.test(m);
      const alreadyShort = URL_SHORTENER_DOMAINS.some((d) => m.includes(d));
      if (!safe && !alreadyShort) found.push({ type: "url", match: m, severity: "medium" });
    }
  }

  // ── 7. كلمات عربية تحريضية ────────────────────────────────────────────
  const lower = text.toLowerCase();
  for (const { words, severity, type } of ARABIC_KEYWORDS) {
    for (const w of words) {
      if (lower.includes(w.toLowerCase())) {
        found.push({ type, match: w, severity });
      }
    }
  }

  // ── 8. أرقام مفصولة بمسافات/فواصل ──────────────────────────────────
  const collapsed = collapseSpacedDigits(normalizeDigits(text));
  for (const { re, severity } of PHONE_PATTERNS) {
    re.lastIndex = 0;
    const matches = collapsed.match(re);
    if (matches) {
      for (const m of matches) {
        if (!found.some((f) => f.match === m)) {
          found.push({ type: "phone_spaced", match: m, severity });
        }
      }
    }
  }

  return found;
}

// ─── أدوات مساعدة ─────────────────────────────────────────────────────────

function highestSeverity(patterns: LeakPattern[]): LeakSeverity | null {
  if (!patterns.length) return null;
  const order: LeakSeverity[] = ["low", "medium", "high", "critical"];
  let max: LeakSeverity = "low";
  for (const p of patterns) {
    if (order.indexOf(p.severity) > order.indexOf(max)) max = p.severity;
  }
  return max;
}

function decideAction(severity: LeakSeverity | null): LeakAction {
  if (!severity) return "ignored";
  if (severity === "critical") return "blocked";
  if (severity === "high") return "redacted";
  if (severity === "medium") return "warned";
  return "ignored";
}

function redactText(text: string, patterns: LeakPattern[]): string {
  let out = text;
  for (const p of patterns) {
    if (p.severity === "low") continue;
    const escaped = p.match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      out = out.replace(new RegExp(escaped, "gi"), "███");
    } catch {
      // نمط معقد — نتخطاه
    }
  }
  return out;
}

// ─── Claude كمحلل ثانوي ──────────────────────────────────────────────────

async function detectByClaude(text: string): Promise<LeakPattern[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 600,
        system:
          "أنت كاشف محاولات تسريب معلومات تواصل في رسائل عربية بين عميل ومستقل على منصة وساطة. " +
          "ابحث بدقة عن: أرقام جوال مكتوبة بكلمات أو مقطّعة أو مشفرة أو معكوسة، إيميلات، " +
          "روابط واتس/تيليجرام/سناب/إنستا، أي إشارة للتواصل خارج المنصة، طلب QR كود، " +
          "أرقام مكتوبة بالإيموجي أو الأحرف اللاتينية بدلاً من الأرقام (o=0, l=1). " +
          'أعد JSON فقط بالشكل: {"leaks":[{"type":"phone|email|social|external_contact|platform_evasion|qr_code|image_leak|encoding","match":"النص","severity":"low|medium|high|critical"}]}. ' +
          "اعتبر أي محاولة تجاوز المنصة critical. لا تخترع. لا تشرح. إذا لا يوجد شيء مشبوه أعد: {\"leaks\":[]}",
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!resp.ok) return null;
    const data: unknown = await resp.json();
    const txt = (data as { content?: Array<{ text?: string }> })?.content?.[0]?.text || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]) as { leaks?: unknown[] };
    if (!Array.isArray(parsed?.leaks)) return null;
    return (parsed.leaks as Array<Record<string, unknown>>)
      .filter((l) => l && typeof l.match === "string")
      .map((l) => ({
        type: String(l.type || "unknown"),
        match: String(l.match),
        severity: (["low", "medium", "high", "critical"].includes(String(l.severity))
          ? l.severity
          : "medium") as LeakSeverity,
      }));
  } catch {
    return null;
  }
}

// ─── الدالة الرئيسية ──────────────────────────────────────────────────────

export async function detectLeak(
  text: string,
  opts: { useClaude?: boolean } = {},
): Promise<LeakDetectionResult> {
  const regexFindings = detectByRegex(text);
  let patterns = regexFindings;
  let detectedBy: "regex" | "claude" | "hybrid" = "regex";
  let confidence = regexFindings.length > 0 ? 0.95 : 0.5;

  if (opts.useClaude && process.env.ANTHROPIC_API_KEY) {
    const claudeFindings = await detectByClaude(text);
    if (claudeFindings) {
      const seen = new Set(patterns.map((p) => p.match.toLowerCase()));
      for (const c of claudeFindings) {
        if (!seen.has(c.match.toLowerCase())) {
          patterns.push(c);
          seen.add(c.match.toLowerCase());
        }
      }
      detectedBy = regexFindings.length ? "hybrid" : "claude";
      confidence = 0.99;
    }
  }

  const severity = highestSeverity(patterns);
  const action = decideAction(severity);
  const redactedText = patterns.length ? redactText(text, patterns) : text;

  return {
    hasLeak: patterns.length > 0,
    patterns,
    severity,
    action,
    redactedText,
    confidence,
    detectedBy,
  };
}

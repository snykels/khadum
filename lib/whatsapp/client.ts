/**
 * Meta WhatsApp Cloud API client.
 * Sends text messages, typing indicators, and utility template messages.
 *
<<<<<<< HEAD
 * المفاتيح تُقرأ أولاً من لوحة التحكم (DB settings ns="whatsapp")،
 * ثم تنتقل إلى متغيرات البيئة:
=======
 * ENV:
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
 *   WHATSAPP_TOKEN     — Meta access token
 *   WHATSAPP_PHONE_ID  — Meta phone-number id
 *   WHATSAPP_API_VERSION (optional, default v20.0)
 */

<<<<<<< HEAD
import { loadSettings } from "@/lib/settings";

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
const META_BASE = "https://graph.facebook.com";

function apiVersion(): string {
  return process.env.WHATSAPP_API_VERSION || "v20.0";
}

<<<<<<< HEAD
async function getCreds(): Promise<{ token: string; phoneId: string } | null> {
  const cfg = await loadSettings("whatsapp").catch(() => ({}));
  const token = (cfg as Record<string, string>).apiToken || process.env.WHATSAPP_TOKEN;
  const phoneId = (cfg as Record<string, string>).phoneNumberId || process.env.WHATSAPP_PHONE_ID;
=======
function getCreds(): { token: string; phoneId: string } | null {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  if (!token || !phoneId) return null;
  return { token, phoneId };
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export interface MetaSendResult {
  ok: boolean;
  provider: "graph" | "console";
  messageId?: string;
  info?: string;
}

async function postGraph(body: Record<string, unknown>): Promise<MetaSendResult> {
<<<<<<< HEAD
  const creds = await getCreds();
=======
  const creds = getCreds();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  if (!creds) {
    console.log("[WhatsApp DEV] missing creds, payload:", JSON.stringify(body));
    return { ok: true, provider: "console" };
  }
  try {
    const res = await fetch(
      `${META_BASE}/${apiVersion()}/${creds.phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${creds.token}`,
        },
        body: JSON.stringify(body),
      },
    );
    const data: { error?: { message?: string }; messages?: Array<{ id?: string }> } = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        provider: "graph",
        info: data?.error?.message || `HTTP ${res.status}`,
      };
    }
    const messageId = data?.messages?.[0]?.id;
    return { ok: true, provider: "graph", messageId };
  } catch (e) {
    return { ok: false, provider: "graph", info: String(e) };
  }
}

export async function sendText(
  phone: string,
  body: string,
): Promise<MetaSendResult> {
  return postGraph({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizePhone(phone),
    type: "text",
    text: { preview_url: true, body },
  });
}

/**
 * Send a typing indicator.
 * Meta requires marking an inbound message as read first; pass its id.
 */
export async function sendTypingIndicator(
  phone: string,
  inboundMessageId?: string,
): Promise<MetaSendResult> {
  if (!inboundMessageId) {
    // Without a real inbound id we cannot drive typing on Meta — just no-op.
    return { ok: true, provider: "console" };
  }
<<<<<<< HEAD
  const creds = await getCreds();
=======
  const creds = getCreds();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  if (!creds) return { ok: true, provider: "console" };
  try {
    const res = await fetch(
      `${META_BASE}/${apiVersion()}/${creds.phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${creds.token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: inboundMessageId,
          typing_indicator: { type: "text" },
        }),
      },
    );
    const data: { error?: { message?: string }; messages?: Array<{ id?: string }> } = await res.json().catch(() => ({}));
    if (!res.ok)
      return {
        ok: false,
        provider: "graph",
        info: data?.error?.message || `HTTP ${res.status}`,
      };
    return { ok: true, provider: "graph" };
  } catch (e) {
    return { ok: false, provider: "graph", info: String(e) };
  }
}

export async function markAsRead(
  inboundMessageId: string,
): Promise<MetaSendResult> {
<<<<<<< HEAD
  const creds = await getCreds();
=======
  const creds = getCreds();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  if (!creds) return { ok: true, provider: "console" };
  try {
    const res = await fetch(
      `${META_BASE}/${apiVersion()}/${creds.phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${creds.token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: inboundMessageId,
        }),
      },
    );
    if (!res.ok) {
      const data: { error?: { message?: string }; messages?: Array<{ id?: string }> } = await res.json().catch(() => ({}));
      return {
        ok: false,
        provider: "graph",
        info: data?.error?.message || `HTTP ${res.status}`,
      };
    }
    return { ok: true, provider: "graph" };
  } catch (e) {
    return { ok: false, provider: "graph", info: String(e) };
  }
}

export interface UtilityTemplateInput {
  phone: string;
  templateName: string;
  languageCode?: string; // default ar
  bodyParams?: string[];
}

export async function sendUtilityTemplate(
  input: UtilityTemplateInput,
): Promise<MetaSendResult> {
  return postGraph({
    messaging_product: "whatsapp",
    to: normalizePhone(input.phone),
    type: "template",
    template: {
      name: input.templateName,
      language: { code: input.languageCode || "ar" },
      components: input.bodyParams?.length
        ? [
            {
              type: "body",
              parameters: input.bodyParams.map((t) => ({ type: "text", text: t })),
            },
          ]
        : undefined,
    },
  });
}

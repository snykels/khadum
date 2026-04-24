/**
 * Meta WhatsApp Cloud API webhook.
 *
 * GET  — verification handshake using WHATSAPP_VERIFY_TOKEN
 * POST — inbound messages, signature verified by WHATSAPP_APP_SECRET
 *
 * We always return 200 immediately to stay under Meta's 10s timeout and
 * avoid retries.
 *
 * Reliability (Task #17): each inbound message is persisted to
 * `whatsapp_jobs` BEFORE we respond, so even if the runtime kills our
 * function the moment the response leaves, the message is safely durable
 * and the cron worker (`/api/cron/whatsapp-worker`) will pick it up
 * within ~60s. We also schedule `drainQueue()` via `after()` to process
 * the message immediately when the runtime keeps the function alive.
 */

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import crypto from "crypto";
import { enqueueInbound, drainQueue } from "@/lib/whatsapp/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && token === expected) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  // If no secret is configured (e.g. local dev), accept and warn.
  if (!appSecret) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn("[whatsapp/webhook] WHATSAPP_APP_SECRET not set — skipping signature check (dev only)");
    return true;
  }
  if (!signature) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

interface IncomingMessage {
  phone: string;
  text: string;
  waMessageId: string;
}

interface WaInteractiveReply {
  title?: string;
}
interface WaIncoming {
  from?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
  interactive?: {
    button_reply?: WaInteractiveReply;
    list_reply?: WaInteractiveReply;
  };
  button?: { text?: string };
}
interface WaChange {
  value?: { messages?: WaIncoming[] };
}
interface WaEntry {
  changes?: WaChange[];
}
interface WaPayload {
  entry?: WaEntry[];
}

function extractMessages(payload: WaPayload): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  const entries = payload?.entry || [];
  for (const entry of entries) {
    const changes = entry?.changes || [];
    for (const change of changes) {
      const value = change?.value;
      const msgs = value?.messages || [];
      for (const m of msgs) {
        const phone = m.from || "";
        const id = m.id || "";
        let text = "";
        if (m.type === "text") text = m.text?.body || "";
        else if (m.type === "interactive") {
          text =
            m.interactive?.button_reply?.title ||
            m.interactive?.list_reply?.title ||
            "";
        } else if (m.type === "button") {
          text = m.button?.text || "";
        } else {
          // Non-text messages are not yet handled by the agent.
          text = "";
        }
        if (phone && id && text) out.push({ phone, text, waMessageId: id });
      }
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-hub-signature-256");

  if (!verifySignature(raw, sig)) {
    console.warn("[whatsapp/webhook] invalid signature");
    return new NextResponse("forbidden", { status: 403 });
  }

  let payload: WaPayload = {};
  try {
    payload = JSON.parse(raw) as WaPayload;
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }

  const messages = extractMessages(payload);

  // Durable enqueue BEFORE responding. If ANY message fails to enqueue we
  // surface a 500 so Meta retries the whole webhook delivery — better to
  // re-process a duplicate (queue is idempotent on `wa_message_id`) than
  // to silently drop an inbound message.
  let enqueued = 0;
  if (messages.length) {
    try {
      const results = await Promise.all(messages.map((m) => enqueueInbound(m)));
      enqueued = results.filter(Boolean).length;
    } catch (e) {
      console.error("[whatsapp/webhook] enqueue failed, asking Meta to retry", e);
      return new NextResponse("enqueue failed", { status: 500 });
    }
  }

  // Drain the queue after returning 200. `after()` keeps the function
  // alive on runtimes that support it (Node serverless, edge with
  // waitUntil, and Replit's long-running server). The cron worker is
  // the safety net if this drain is killed mid-flight.
  if (enqueued > 0) {
    after(async () => {
      try {
        const report = await drainQueue();
        if (report.processed > 0) {
          console.log("[whatsapp/webhook] drain report", report);
        }
      } catch (e) {
        console.error("[whatsapp/webhook] drain error", e);
      }
    });
  }

  return NextResponse.json({ ok: true, enqueued });
}

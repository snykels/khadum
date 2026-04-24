/**
 * Human-like message sender.
 * Adds a "reading" pause + a typing pause that scales with reply length,
 * then sends the actual message via Meta Cloud API.
 *
 * Reliability (Task #17): we retry transient Meta failures (network errors,
 * HTTP 5xx, rate limit / "please retry" responses) up to MAX_SEND_ATTEMPTS
 * times with backoff. If every attempt fails we THROW so the queue worker
 * marks the job for retry with its own outer backoff — silent failures here
 * would lose the user's reply forever.
 */

import { sendText, sendTypingIndicator, type MetaSendResult } from "./client";

const READING_BASE_MS = 800;
const READING_PER_CHAR_MS = 12; // simulated reading time per inbound char
const TYPING_BASE_MS = 1200;
const TYPING_PER_CHAR_MS = 28; // simulated typing time per outbound char
const MIN_TOTAL_MS = 3000;
const MAX_TOTAL_MS = 8000;

const MAX_SEND_ATTEMPTS = 3;
const SEND_RETRY_BASE_MS = 800;

export interface HumanSendInput {
  phone: string;
  body: string;
  inboundMessageId?: string;
  inboundLength?: number;
}

export function computeDelayMs(
  outboundLength: number,
  inboundLength = 0,
): number {
  const reading = READING_BASE_MS + inboundLength * READING_PER_CHAR_MS;
  const typing = TYPING_BASE_MS + outboundLength * TYPING_PER_CHAR_MS;
  const total = reading + typing;
  return Math.max(MIN_TOTAL_MS, Math.min(MAX_TOTAL_MS, total));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Best-effort classifier for Meta failures: did this look transient?
 * We treat unknown failures as transient by default — better to retry
 * once than to drop the customer's message.
 */
function isTransientFailure(info?: string): boolean {
  if (!info) return true;
  const s = info.toLowerCase();
  if (/http\s*5\d\d/.test(s)) return true;
  if (s.includes("timeout") || s.includes("etimedout")) return true;
  if (s.includes("econnreset") || s.includes("econnrefused")) return true;
  if (s.includes("network") || s.includes("fetch failed")) return true;
  if (s.includes("rate") || s.includes("too many")) return true;
  if (s.includes("temporar") || s.includes("retry")) return true;
  // Permanent conditions we should NOT retry:
  if (s.includes("invalid") || s.includes("not allowed")) return false;
  if (s.includes("recipient") && s.includes("not")) return false;
  // Default: assume transient.
  return true;
}

export async function sendHumanLike(
  input: HumanSendInput,
): Promise<MetaSendResult> {
  const delay = computeDelayMs(input.body.length, input.inboundLength || 0);

  // Fire typing indicator (also marks inbound as read).
  if (input.inboundMessageId) {
    void sendTypingIndicator(input.phone, input.inboundMessageId).catch(
      () => undefined,
    );
  }

  await sleep(delay);

  let lastResult: MetaSendResult | null = null;
  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
    const result = await sendText(input.phone, input.body);
    if (result.ok) return result;
    lastResult = result;
    if (!isTransientFailure(result.info)) {
      // Permanent — no point retrying. Surface to caller as an error so
      // the queue records why the job failed.
      throw new Error(
        `[whatsapp/sender] permanent Meta failure: ${result.info || "unknown"}`,
      );
    }
    if (attempt < MAX_SEND_ATTEMPTS) {
      await sleep(SEND_RETRY_BASE_MS * Math.pow(2, attempt - 1));
    }
  }
  throw new Error(
    `[whatsapp/sender] Meta send failed after ${MAX_SEND_ATTEMPTS} attempts: ${lastResult?.info || "unknown"}`,
  );
}

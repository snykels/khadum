/**
 * Offer queue management for the WhatsApp matching stage.
 * - Sends offers to freelancers one-by-one with a 2-minute response window.
 * - Stores queue + current offer state in the client's session.context.
 * - Handles freelancer accept / reject and triggers payment-link creation.
 *
 * Timeout strategy: setTimeout fire-and-forget. Survives within a single
 * Node process; Task #17 (background queue) will harden durability later.
 * Every callback re-checks DB state to avoid acting on a stale offer.
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/notify";
import { mergeContext, setStage, type WhatsAppSession } from "./session";
import { createOrderPaymentLink } from "@/lib/payments";
import { detectLeak } from "@/lib/leakDetector";

export const OFFER_TIMEOUT_MS = 2 * 60 * 1000;

export interface OfferCandidate {
  id: number;
  name: string | null;
  phone: string;
}

export interface CurrentOffer {
  freelancer_id: number;
  phone: string;
  sent_at: string;
  expires_at: string;
}

interface OrderRow {
  id: number;
  amount: string | null;
  description: string | null;
  publicCode: string | null;
  clientPhone: string | null;
  freelancerId: number | null;
  status: string | null;
}

async function loadOrder(orderId: number): Promise<OrderRow | null> {
  const rows = (await db.execute(sql`
    SELECT id, amount, description, public_code AS "publicCode",
           client_phone AS "clientPhone", freelancer_id AS "freelancerId",
           status
    FROM orders WHERE id=${orderId} LIMIT 1
  `)) as unknown as OrderRow[];
  return rows[0] || null;
}

function normalizeDigits(p: string): string {
  return (p || "").replace(/[^\d]/g, "");
}

/**
 * Normalize a freelancer "yes/no" reply. Returns null if ambiguous.
 */
export function classifyOfferReply(text: string): "accept" | "reject" | null {
  const t = (text || "").trim().toLowerCase();
  if (!t) return null;
  // accept words (Arabic + Latin)
  const accept = /^(نعم|اي|أي|ايوه|أيوه|ايوا|تمام|تم|قبلت|أقبل|اقبل|اوافق|أوافق|موافق|نعمم|اوكي|أوكي|اوك|yes|y|ok|okay|sure|accept)/;
  const reject = /^(لا|لاء|كلا|ما|مارد|ارفض|أرفض|رفضت|مو|ما اقدر|ما أقدر|no|n|nope|reject)/;
  if (accept.test(t)) return "accept";
  if (reject.test(t)) return "reject";
  return null;
}

/**
 * Send one offer to the next candidate in the queue. If queue is empty,
 * notify the client and clear matching state.
 *
 * Returns the freelancer id we offered to (or null if queue empty).
 */
export async function sendNextOffer(
  clientPhone: string,
  orderId: number,
): Promise<number | null> {
  const order = await loadOrder(orderId);
  if (!order) return null;
  if (order.freelancerId) return null; // already accepted

  // Pull queue out of session.context
  const sessionRows = (await db.execute(sql`
    SELECT context FROM whatsapp_sessions WHERE phone=${normalizeDigits(clientPhone)} LIMIT 1
  `)) as unknown as Array<{ context: { offer_queue?: OfferCandidate[]; rejected_freelancer_ids?: number[] } | string | null }>;
  const ctxRaw = sessionRows[0]?.context;
  const ctx =
    typeof ctxRaw === "string"
      ? (JSON.parse(ctxRaw) as { offer_queue?: OfferCandidate[]; rejected_freelancer_ids?: number[] })
      : ctxRaw || {};
  const queue: OfferCandidate[] = Array.isArray(ctx.offer_queue) ? ctx.offer_queue : [];

  if (!queue.length) {
    // No one left to try.
    await mergeContext(clientPhone, { current_offer: null });
    await sendWhatsApp(
      clientPhone,
      "ما حصلت مستقل قبل العرض حتى الآن. أرجعلك أول ما يتوفر واحد متاح 🙏",
    );
    return null;
  }

  let next = queue.shift() as OfferCandidate;
  let remaining = queue;

  // Global uniqueness guard: skip any freelancer who is already the
  // target of another active (non-expired) offer from a different client
  // session. This makes the LIMIT 1 in findSessionByCurrentOfferPhone safe
  // because each freelancer can only hold ONE pending offer globally.
  while (next) {
    const freelancerDigits = normalizeDigits(next.phone);
    const busyRows = (await db.execute(sql`
      SELECT 1 FROM whatsapp_sessions
      WHERE phone <> ${normalizeDigits(clientPhone)}
        AND context->'current_offer'->>'phone' = ${freelancerDigits}
        AND (
          context->'current_offer'->>'expires_at' IS NULL
          OR (context->'current_offer'->>'expires_at')::timestamptz > NOW()
        )
      LIMIT 1
    `)) as unknown as unknown[];
    if (!busyRows.length) break; // not targeted by anyone else
    // This freelancer is currently waiting on another offer — skip them.
    next = queue.shift() as OfferCandidate;
    remaining = [...queue];
  }

  if (!next) {
    // All candidates are currently busy with other offers.
    await mergeContext(clientPhone, { offer_queue: [], current_offer: null });
    await sendWhatsApp(
      clientPhone,
      "المستقلون المتاحون مشغولون حالياً. أرجعلك أول ما يتوفر واحد متاح 🙏",
    );
    return null;
  }

  // Build the offer message (concise, per STAGE_MATCHING template).
  const amount = order.amount ? Number(order.amount).toFixed(0) : "—";
  const rawDesc = (order.description || "").slice(0, 300);
  const code = order.publicCode || `#${order.id}`;

  // ─── Leak guard: redact any contact info embedded in the description ──────
  let descSnippet = rawDesc.slice(0, 160);
  if (rawDesc.trim()) {
    const leakResult = await detectLeak(rawDesc, { useClaude: false }).catch(() => null);
    if (leakResult?.hasLeak && leakResult.redactedText) {
      descSnippet = leakResult.redactedText.slice(0, 160);
      // Log the attempt for admin review
      const leakTypes = leakResult.patterns.map((p) => p.type).join(", ");
      console.warn(
        `[offer leak guard] redacted ${leakResult.patterns.length} pattern(s) from order ${order.id} description — types: ${leakTypes}`,
      );
      await db.execute(sql`
        INSERT INTO escalations(phone, reason, priority, summary, conversation_snapshot)
        VALUES(
          ${normalizeDigits(clientPhone)},
          'offer_body_leak',
          'medium',
          ${`تسريب محتمل في وصف الطلب ${code} — تم الحجب. الأنماط: ${leakTypes}`},
          ${JSON.stringify([{ orderId: order.id, raw: rawDesc, redacted: descSnippet, patterns: leakResult.patterns }])}::jsonb
        )
      `).catch(() => undefined); // best-effort — never block offer sending
    }
  }

  const offerBody =
    `عندك مشروع جديد عبر خدوم 👋\n` +
    `${descSnippet}\n` +
    `الميزانية: ${amount} ريال\n` +
    `رمز المشروع: ${code}\n\n` +
    `تقبل العرض؟ رد بـ (نعم) أو (لا) خلال دقيقتين.`;

  // Try sending; if it fails, skip to next immediately.
  const result = await sendWhatsApp(next.phone, offerBody).catch(() => ({
    ok: false,
  }));
  if (!result.ok) {
    await mergeContext(clientPhone, { offer_queue: remaining, current_offer: null });
    return sendNextOffer(clientPhone, orderId);
  }

  const sentAt = new Date();
  const expiresAt = new Date(sentAt.getTime() + OFFER_TIMEOUT_MS);
  const current: CurrentOffer = {
    freelancer_id: next.id,
    phone: normalizeDigits(next.phone),
    sent_at: sentAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  };
  await mergeContext(clientPhone, {
    offer_queue: remaining,
    current_offer: current,
  });

  // Schedule a 2-minute timeout to advance if no response.
  scheduleOfferTimeout(clientPhone, orderId, next.id);

  return next.id;
}

function scheduleOfferTimeout(
  clientPhone: string,
  orderId: number,
  freelancerId: number,
): void {
  setTimeout(() => {
    void expireOfferIfStill(clientPhone, orderId, freelancerId).catch(() => {
      // swallow — best effort
    });
  }, OFFER_TIMEOUT_MS + 1000);
}

/**
 * DB-driven sweep: find all sessions whose current_offer has expired and
 * advance the queue. Called at the top of every drainQueue tick so that
 * a process restart during the 2-minute window never leaves an offer stuck.
 */
export async function sweepExpiredOffers(): Promise<void> {
  const expired = (await db.execute(sql`
    SELECT phone,
           COALESCE(project_id, (context->>'project_id')::int)        AS order_id,
           (context->'current_offer'->>'freelancer_id')::int           AS freelancer_id
    FROM whatsapp_sessions
    WHERE context->'current_offer' IS NOT NULL
      AND context->'current_offer' != 'null'::jsonb
      AND (context->'current_offer'->>'expires_at')::timestamptz < NOW()
      AND COALESCE(project_id, (context->>'project_id')::int) IS NOT NULL
  `)) as unknown as Array<{
    phone: string;
    order_id: number | null;
    freelancer_id: number | null;
  }>;

  await Promise.all(
    expired.map(async (row) => {
      if (!row.phone || !row.order_id || !row.freelancer_id) return;
      await expireOfferIfStill(row.phone, row.order_id, row.freelancer_id).catch(() => {
        // best effort
      });
    }),
  );
}

async function expireOfferIfStill(
  clientPhone: string,
  orderId: number,
  freelancerId: number,
): Promise<void> {
  const order = await loadOrder(orderId);
  if (!order || order.freelancerId) return; // already filled
  const rows = (await db.execute(sql`
    SELECT context FROM whatsapp_sessions WHERE phone=${normalizeDigits(clientPhone)} LIMIT 1
  `)) as unknown as Array<{ context: { current_offer?: CurrentOffer | null } | string | null }>;
  const ctxRaw = rows[0]?.context;
  const ctx =
    typeof ctxRaw === "string"
      ? (JSON.parse(ctxRaw) as { current_offer?: CurrentOffer | null })
      : ctxRaw || {};
  const cur = ctx.current_offer;
  if (!cur || cur.freelancer_id !== freelancerId) return; // superseded

  // Mark this freelancer as a no-response and try the next one.
  await db.execute(sql`
    UPDATE whatsapp_sessions
    SET context = COALESCE(context,'{}'::jsonb) ||
      jsonb_build_object(
        'no_response_freelancer_ids',
        COALESCE(context->'no_response_freelancer_ids','[]'::jsonb) || ${JSON.stringify([freelancerId])}::jsonb
      )
    WHERE phone=${normalizeDigits(clientPhone)}
  `);
  await mergeContext(clientPhone, { current_offer: null });
  await sendNextOffer(clientPhone, orderId);
}

/**
 * Process a freelancer's reply to a pending offer. Mutates DB + session.
 * Returns a status describing what happened so the orchestrator can
 * compose an appropriate acknowledgement back to the freelancer.
 */
export async function handleOfferReply(opts: {
  freelancerPhone: string;
  text: string;
  clientSession: WhatsAppSession;
}): Promise<{ kind: "accepted" | "rejected" | "ambiguous" | "stale" }> {
  const { freelancerPhone, text, clientSession } = opts;
  const decision = classifyOfferReply(text);
  if (!decision) return { kind: "ambiguous" };

  const cur = (clientSession.context as { current_offer?: CurrentOffer | null })
    .current_offer;
  if (!cur || normalizeDigits(cur.phone) !== normalizeDigits(freelancerPhone)) {
    return { kind: "stale" };
  }
  // Hard expiry guard: if already past expiry, don't accept either.
  if (new Date(cur.expires_at).getTime() < Date.now()) {
    return { kind: "stale" };
  }
  const orderId = clientSession.projectId;
  if (!orderId) return { kind: "stale" };
  const order = await loadOrder(orderId);
  if (!order) return { kind: "stale" };
  if (order.freelancerId) return { kind: "stale" }; // someone already accepted

  if (decision === "reject") {
    // Track rejection and move on.
    await db.execute(sql`
      UPDATE whatsapp_sessions
      SET context = COALESCE(context,'{}'::jsonb) ||
        jsonb_build_object(
          'rejected_freelancer_ids',
          COALESCE(context->'rejected_freelancer_ids','[]'::jsonb) || ${JSON.stringify([cur.freelancer_id])}::jsonb
        )
      WHERE phone=${clientSession.phone}
    `);
    await mergeContext(clientSession.phone, { current_offer: null });

    // Ask freelancer for rejection reason — set state on THEIR session.
    const freelancerDigits = normalizeDigits(freelancerPhone);
    await mergeContext(freelancerDigits, {
      awaiting_rejection_reason: true,
      rejection_order_id: orderId,
      rejection_freelancer_id: cur.freelancer_id,
    });

    await sendWhatsApp(
      freelancerPhone,
      "تمام، شكراً لك 🙏\n\nليش ما قبلت العرض؟ (اختر رقماً)\n\n1️⃣ خارج نطاق تخصصي\n2️⃣ مشغول حالياً\n3️⃣ الميزانية قليلة\n4️⃣ سبب آخر",
    );

    // Advance the queue for the client (don't wait for the reason).
    await sendNextOffer(clientSession.phone, orderId);
    return { kind: "rejected" };
  }

  // ACCEPT path
  await db.execute(sql`
    UPDATE orders
    SET freelancer_id=${cur.freelancer_id},
        accepted_at=NOW(),
        freelancer_phone=${normalizeDigits(freelancerPhone)}
    WHERE id=${orderId} AND freelancer_id IS NULL
  `);
  // Refresh and verify we actually claimed it (race with timeout / parallel accept).
  const claimed = await loadOrder(orderId);
  if (!claimed || claimed.freelancerId !== cur.freelancer_id) {
    return { kind: "stale" };
  }
  await mergeContext(clientSession.phone, {
    current_offer: null,
    offer_queue: [], // close the queue
    freelancer_id: cur.freelancer_id,
  });
  await setStage(clientSession.phone, "payment");

  // Notify freelancer
  await sendWhatsApp(
    freelancerPhone,
    `تم تأكيد قبولك للمشروع ${claimed.publicCode || `#${claimed.id}`} ✅\n` +
      `راح نرجعلك بعد ما يدفع العميل ويُعلَّق المبلغ في خدوم.`,
  );

  // Auto-create payment link for the client.
  try {
    const link = await createOrderPaymentLink(claimed);
    if (link) {
      await sendWhatsApp(
        clientSession.phone,
        `تم الاتفاق ✅\n` +
          `ادفع المبلغ (${Number(claimed.amount || 0).toFixed(0)} ريال) عبر الرابط، وراح يعلّق عندنا لين يخلص الشغل:\n` +
          link,
      );
    } else {
      await sendWhatsApp(
        clientSession.phone,
        "تم قبول العرض ✅ راح نرسلك رابط الدفع خلال دقايق.",
      );
    }
  } catch {
    await sendWhatsApp(
      clientSession.phone,
      "تم قبول العرض ✅ راح نرسلك رابط الدفع خلال دقايق.",
    );
  }
  return { kind: "accepted" };
}

// ─── Rejection Reason Handling ────────────────────────────────────────────────

const REASON_CODES: Record<string, string> = {
  outside_specialty: "خارج نطاق تخصصي",
  busy: "مشغول حالياً",
  low_budget: "الميزانية قليلة",
  other: "سبب آخر",
};

/**
 * Map a freelancer's free-text reply to a reason code.
 */
export function classifyRejectionReason(text: string): { code: string; label: string } {
  const t = (text || "").trim();
  if (/^1$|خارج|تخصص|مجال/i.test(t)) return { code: "outside_specialty", label: REASON_CODES.outside_specialty };
  if (/^2$|مشغول|مشغوله|انشغل|busy/i.test(t)) return { code: "busy", label: REASON_CODES.busy };
  if (/^3$|ميزانية|قليل|منخفض|budget|low/i.test(t)) return { code: "low_budget", label: REASON_CODES.low_budget };
  // Anything else → "other" with the raw text preserved
  return { code: "other", label: REASON_CODES.other };
}

/**
 * Called from the orchestrator when a freelancer sends a message and their
 * session has awaiting_rejection_reason: true.
 *
 * Persists the reason to DB, clears the awaiting flag, thanks the freelancer.
 */
export async function handleRejectionReasonResponse(opts: {
  freelancerPhone: string;
  text: string;
  orderId: number;
  freelancerId: number | null;
}): Promise<void> {
  const { freelancerPhone, text, orderId, freelancerId } = opts;
  const { code } = classifyRejectionReason(text);
  const digits = normalizeDigits(freelancerPhone);

  // Persist to DB
  await db.execute(sql`
    INSERT INTO offer_rejection_reasons(order_id, freelancer_phone, freelancer_id, reason_code, raw_text)
    VALUES(${orderId}, ${digits}, ${freelancerId}, ${code}, ${text.slice(0, 500)})
  `).catch(() => undefined); // best-effort

  // Clear the awaiting state on the freelancer's session
  await mergeContext(digits, {
    awaiting_rejection_reason: false,
    rejection_order_id: null,
    rejection_freelancer_id: null,
  });

  await sendWhatsApp(
    freelancerPhone,
    "شكراً لك على الملاحظة 🤝 راح تساعدنا نحسن العروض القادمة.",
  );
}


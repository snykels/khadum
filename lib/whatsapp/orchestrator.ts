/**
 * Orchestrates the complete inbound → AI → outbound flow.
 * Called from the webhook with one user message at a time.
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  getOrCreateSession,
  mergeContext,
  setSummary,
  setStage,
  bumpActivity,
  findSessionByCurrentOfferPhone,
} from "./session";
import { sendHumanLike } from "./sender";
import { analyzeSentiment } from "@/lib/ai/sentiment";
import { runAgent } from "@/lib/ai/agent";
import { TOOLS_BY_NAME } from "@/lib/ai/tools";
import { handleOfferReply, handleRejectionReasonResponse } from "./offers";
import { classifyDeliveryIntent, handleFreelancerDelivery, handleClientDeliveryResponse } from "./delivery";
import { detectLeak } from "@/lib/leakDetector";

export interface InboundMessage {
  phone: string;
  text: string;
  waMessageId: string;
}

/**
 * Archive the inbound user turn into `whatsapp_messages`. Idempotent on
 * `wa_message_id` so retries by the queue worker (Task #17) don't create
 * duplicate archive rows. IMPORTANT: this MUST NOT short-circuit
 * processing. Inbound-level deduplication of Meta webhook retries already
 * happens at the queue layer (`whatsapp_jobs.wa_message_id` unique index).
 * If we early-returned here on conflict, a job that failed *after* this
 * insert (e.g. OpenAI or Meta send error) would silently skip its reply
 * on the worker's retry — exactly the bug Task #17 must avoid.
 */
async function archiveInbound(
  phone: string,
  text: string,
  waMessageId: string,
): Promise<void> {
  if (!waMessageId) {
    await db.execute(sql`
      INSERT INTO whatsapp_messages(phone, direction, body, role)
      VALUES(${phone}, 'in', ${text}, 'user')
    `);
    return;
  }
  await db.execute(sql`
    INSERT INTO whatsapp_messages(phone, direction, body, role, wa_message_id)
    VALUES(${phone}, 'in', ${text}, 'user', ${waMessageId})
    ON CONFLICT (wa_message_id) DO NOTHING
  `);
}

/**
 * تسجيل محاولة التسريب في جدول escalations وزيادة العداد في سياق الجلسة.
 * يُعيد العداد الجديد بعد التسجيل.
 */
async function recordLeakAttempt(
  phone: string,
  leakInfo: {
    patterns: Array<{ type: string; match: string; severity: string }>;
    severity: string;
    detectedBy: string;
    rawText: string;
    redactedText: string;
    confidence: number;
  },
  currentCount: number,
): Promise<number> {
  const newCount = currentCount + 1;

  // سجّل في escalations كتصعيد أمني
  await db.execute(sql`
    INSERT INTO escalations(phone, reason, priority, summary, conversation_snapshot)
    VALUES(
      ${phone},
      'leak_attempt',
      ${newCount >= 3 ? "urgent" : "high"},
      ${`محاولة تسريب #${newCount} من الرقم ${phone} — نوع: ${leakInfo.patterns.map((p) => p.type).join(", ")} — شدة: ${leakInfo.severity}`},
      ${JSON.stringify([
        {
          role: "user",
          content: leakInfo.rawText,
          leaked: leakInfo.patterns,
          redacted: leakInfo.redactedText,
          detectedBy: leakInfo.detectedBy,
          confidence: leakInfo.confidence,
        },
      ])}::jsonb
    )
  `);

  // حدّث العداد في users إذا كان الرقم مسجلاً
  await db.execute(sql`
    UPDATE users
    SET leak_attempts_count = leak_attempts_count + 1,
        last_leak_attempt_at = NOW()
    WHERE phone = ${phone}
  `);

  // احفظ العداد في سياق الجلسة
  await mergeContext(phone, {
    leak_attempts_count: newCount,
    last_leak_attempt_at: new Date().toISOString(),
  });

  return newCount;
}

export async function handleInbound(msg: InboundMessage): Promise<void> {
  const phone = msg.phone.replace(/[^\d]/g, "");
  if (!msg.text || !phone) return;

  // Archive the inbound. On retries this is a no-op (ON CONFLICT DO NOTHING)
  // but processing continues so the user actually gets a reply.
  await archiveInbound(phone, msg.text, msg.waMessageId);

  // ─── التحقق من سبب الرفض ─────────────────────────────────────────────────
  // Must be FIRST: a freelancer waiting to give a rejection reason should not
  // be routed through the offer-reply or AI paths.
  const earlySession = await getOrCreateSession(phone);
  const earlyCtx = earlySession.context as {
    awaiting_rejection_reason?: boolean;
    rejection_order_id?: number;
    rejection_freelancer_id?: number;
  };
  if (earlyCtx.awaiting_rejection_reason && earlyCtx.rejection_order_id) {
    await handleRejectionReasonResponse({
      freelancerPhone: phone,
      text: msg.text,
      orderId: earlyCtx.rejection_order_id,
      freelancerId: earlyCtx.rejection_freelancer_id ?? null,
    });
    return;
  }

  // ─── فحص ردود العروض أولاً ──────────────────────────────────────────────
  // Offer-reply detection MUST happen before leak check so a freelancer's
  // "نعم" / "لا" is never blocked by a false-positive on normal wording.
  const offerOwnerSession = await findSessionByCurrentOfferPhone(phone);
  if (offerOwnerSession) {
    const result = await handleOfferReply({
      freelancerPhone: phone,
      text: msg.text,
      clientSession: offerOwnerSession,
    });
    if (result.kind === "ambiguous") {
      await sendHumanLike({
        phone,
        body: "ممكن ترد بـ (نعم) أو (لا) على عرض المشروع 🙏",
        inboundMessageId: msg.waMessageId,
        inboundLength: msg.text.length,
      });
      await db.execute(sql`
        INSERT INTO whatsapp_messages(phone, direction, body, role, metadata)
        VALUES(${phone}, 'out', 'ممكن ترد بـ (نعم) أو (لا) على عرض المشروع 🙏', 'assistant',
               ${JSON.stringify({ via: "offer_clarify" })}::jsonb)
      `);
      return;
    }
    if (result.kind === "accepted" || result.kind === "rejected") {
      return;
    }
    // stale → fall through to normal flow
  }

  // ─── تأكيد التسليم من العميل ─────────────────────────────────────────────
  // If this client's session is in delivery stage, handle their accept/dispute.
  // Reuse earlySession loaded above (same DB row — no need to re-query).
  const deliveryCtx = earlySession.context as {
    awaiting_delivery_confirm?: boolean;
    delivery_order_id?: number;
  };
  if (earlySession.stage === "delivery" && deliveryCtx.awaiting_delivery_confirm && deliveryCtx.delivery_order_id) {
    const deliveryResult = await handleClientDeliveryResponse(
      phone,
      msg.text,
      deliveryCtx.delivery_order_id,
    );
    if (deliveryResult === "accepted") {
      await sendHumanLike({
        phone,
        body: "✅ تم إتمام الطلب بنجاح وتحرير المبلغ للمستقل. شكراً لثقتك بخدوم! 🤝",
        inboundMessageId: msg.waMessageId,
        inboundLength: msg.text.length,
      });
      return;
    }
    if (deliveryResult === "disputed") {
      await sendHumanLike({
        phone,
        body: "تم تسجيل اعتراضك ✅ سيتواصل معك فريق الدعم خلال 24 ساعة. المبلغ محتجز بأمان. 🛡️",
        inboundMessageId: msg.waMessageId,
        inboundLength: msg.text.length,
      });
      return;
    }
    // ambiguous → prompt clearly
    await sendHumanLike({
      phone,
      body: "رد بـ *نعم* لتأكيد استلام العمل، أو *لا* إذا كان هناك مشكلة 🙏",
      inboundMessageId: msg.waMessageId,
      inboundLength: msg.text.length,
    });
    return;
  }

  // ─── إعلان التسليم من المستقل ────────────────────────────────────────────
  // If the sender is a freelancer announcing delivery, handle it before AI.
  if (classifyDeliveryIntent(msg.text)) {
    const announced = await handleFreelancerDelivery(phone);
    if (announced) {
      await sendHumanLike({
        phone,
        body: "✅ تم تسجيل إعلان التسليم. سنسأل العميل ليؤكد الاستلام — راح نخبرك بالنتيجة 🕐",
        inboundMessageId: msg.waMessageId,
        inboundLength: msg.text.length,
      });
      return;
    }
    // Not matched to any active order → fall through to AI agent
  }

  // ─── كاشف التسريب ────────────────────────────────────────────────────────
  // Regex-only (useClaude: false) — avoids sending inbound PII to Anthropic.
  // Only intercept on high/critical severity; medium is logged but not blocked
  // to prevent false positives on normal project descriptions.
  const leakResult = await detectLeak(msg.text, { useClaude: false });

  if (
    leakResult.hasLeak &&
    leakResult.action !== "ignored" &&
    (leakResult.severity === "critical" || leakResult.severity === "high")
  ) {
    // احصل على الجلسة لقراءة عداد المحاولات
    const leakSession = await getOrCreateSession(phone);
    await bumpActivity(phone);

    const prevCount: number =
      typeof leakSession.context.leak_attempts_count === "number"
        ? leakSession.context.leak_attempts_count
        : 0;

    const newCount = await recordLeakAttempt(
      phone,
      {
        patterns: leakResult.patterns,
        severity: leakResult.severity ?? "medium",
        detectedBy: leakResult.detectedBy,
        rawText: msg.text,
        redactedText: leakResult.redactedText,
        confidence: leakResult.confidence,
      },
      prevCount,
    );

    if (newCount >= 3) {
      // ─── الحظر التلقائي عند المحاولة الثالثة ───────────────────────────
      await setStage(phone, "dispute");

      // حظر في users إذا كان مسجلاً
      await db.execute(sql`
        UPDATE users
        SET is_blocked = true,
            blocked_by_system = true,
            blocked_at = NOW(),
            block_reason = 'تجاوز حد محاولات تسريب معلومات التواصل (3/3) — حظر تلقائي'
        WHERE phone = ${phone}
      `);

      // تصعيد فوري للأدمن
      const escalateTool = TOOLS_BY_NAME["escalate_to_admin"];
      if (escalateTool) {
        await escalateTool.execute(
          {
            reason: "auto_leak_block",
            priority: "urgent",
            summary: `🚨 حظر تلقائي: الرقم ${phone} تجاوز 3 محاولات تسريب معلومات تواصل. آخر محاولة: "${msg.text.slice(0, 150)}"`,
            phone,
          },
          { phone, projectId: leakSession.projectId },
        );
      }

      const blockedMsg =
        "🚫 تم تعليق حسابك مؤقتاً بسبب تكرار محاولة تبادل معلومات تواصل خارج المنصة. سيتواصل معك فريق الدعم قريباً.";

      await sendHumanLike({
        phone,
        body: blockedMsg,
        inboundMessageId: msg.waMessageId,
        inboundLength: msg.text.length,
      });

      await db.execute(sql`
        INSERT INTO whatsapp_messages(phone, direction, body, role, metadata)
        VALUES(${phone}, 'out', ${blockedMsg}, 'assistant',
               ${JSON.stringify({ via: "auto_leak_block", attempt: newCount })}::jsonb)
      `);

      return;
    }

    // ─── تحذير (المحاولة 1 أو 2) ────────────────────────────────────────
    const warningMsg =
      `⚠️ ممنوع تبادل أرقام أو طرق تواصل خارج المنصة. هذا تنبيه (${newCount}/3).\n` +
      (newCount === 2
        ? "عند المحاولة الثالثة سيُعلَّق حسابك تلقائياً."
        : "يرجى الالتزام بسياسة المنصة للحفاظ على حقوقك.");

    await sendHumanLike({
      phone,
      body: warningMsg,
      inboundMessageId: msg.waMessageId,
      inboundLength: msg.text.length,
    });

    await db.execute(sql`
      INSERT INTO whatsapp_messages(phone, direction, body, role, metadata)
      VALUES(${phone}, 'out', ${warningMsg}, 'assistant',
             ${JSON.stringify({ via: "leak_warning", attempt: newCount, severity: leakResult.severity, patterns: leakResult.patterns.map((p) => p.type) })}::jsonb)
    `);

    return;
  }
  // ─── نهاية كاشف التسريب ─────────────────────────────────────────────────

  const session = earlySession; // already loaded at top — no extra DB round-trip
  await bumpActivity(phone);

  let sentiment;
  try {
    sentiment = await analyzeSentiment(msg.text);
  } catch {
    sentiment = { emotion: "neutral", score: 0, action: "continue" } as const;
  }

  // Auto-escalate angry / threatening messages.
  if (
    sentiment.action === "escalate" ||
    (sentiment.emotion === "angry" && sentiment.score >= 7)
  ) {
    const def = TOOLS_BY_NAME["escalate_to_admin"];
    if (def) {
      await def.execute(
        {
          reason: "auto_sentiment",
          priority: "high",
          summary: `العميل ${phone} يبدو ${sentiment.emotion} (شدة ${sentiment.score}). آخر رسالة: ${msg.text.slice(0, 200)}`,
          phone,
        },
        { phone, projectId: session.projectId },
      );
    }
    await setStage(phone, "dispute");
    const handoff =
      "تم تحويل المحادثة لمشرف بشري، راح يدخل معك خلال وقت قصير 🙏";
    await sendHumanLike({
      phone,
      body: handoff,
      inboundMessageId: msg.waMessageId,
      inboundLength: msg.text.length,
    });
    await db.execute(sql`
      INSERT INTO whatsapp_messages(phone, direction, body, role, metadata)
      VALUES(${phone}, 'out', ${handoff}, 'assistant',
             ${JSON.stringify({ via: "auto_escalation" })}::jsonb)
    `);
    return;
  }

  // Run the AI agent with full context.
  const out = await runAgent({
    phone,
    userText: msg.text,
    stage: session.stage,
    projectId: session.projectId,
    context: session.context,
    summary: session.summary,
  });

  // Persist new summary if produced.
  if (out.newSummary && out.newSummary !== session.summary) {
    await setSummary(phone, out.newSummary);
  }

  // Pull stage / project_id hints from successful tool calls.
  const isOk = (r: unknown): boolean =>
    !!r && typeof r === "object" && (r as { ok?: unknown }).ok === true;
  for (const tc of out.toolCalls) {
    if (tc.name === "create_payment_link" && isOk(tc.result)) {
      await setStage(phone, "payment");
    }
    if (tc.name === "search_freelancers" && isOk(tc.result)) {
      await setStage(phone, "matching");
    }
    if (tc.name === "escalate_to_admin" && isOk(tc.result)) {
      await setStage(phone, "dispute");
    }
  }

  // Light auto-context capture: numbers that look like SAR budgets.
  const num = msg.text.match(/(\d{3,6})\s*(?:ريال|sar|ر\.?س)/i);
  if (num) {
    await mergeContext(phone, { budget: Number(num[1]) });
  }

  // Send the reply with human-like delay.
  await sendHumanLike({
    phone,
    body: out.reply,
    inboundMessageId: msg.waMessageId,
    inboundLength: msg.text.length,
  });
}

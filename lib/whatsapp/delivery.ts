/**
 * Order delivery & completion flow via WhatsApp.
 *
 * When a freelancer signals delivery:
 *  1. Bot asks the client to confirm receipt.
 *  2. Client confirms → order completed, freelancer wallet credited,
 *     rating prompt sent to client.
 *  3. Client disputes → order disputed, admin notified, funds held.
 *  4. No response for 48 hours → auto-confirmed (handled by sweepStaleDeliveries).
 *
 * Rating flow (triggered after step 2):
 *  - Client's session gets awaiting_rating: true
 *  - Client replies 1–5 (Arabic or Latin)
 *  - Rating saved to `reviews` + `users.rating` updated (running avg)
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/notify";
import { mergeContext, setStage } from "./session";

function normalizeDigits(p: string): string {
  return (p || "").replace(/[^\d]/g, "");
}

// ─── Arabic digit mapping ─────────────────────────────────────────────────────
const AR_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};
function normalizeAr(s: string): string {
  return s.replace(/[٠-٩]/g, (c) => AR_DIGITS[c] ?? c);
}

// ─── types ────────────────────────────────────────────────────────────────────

interface ActiveOrder {
  id: number;
  publicCode: string | null;
  clientPhone: string | null;
  freelancerPhone: string | null;
  amount: string | null;
  platformFee: string | null;
  description: string | null;
  freelancerId: number | null;
  clientId: number | null;
  deliveryAnnouncedAt: string | null;
}

// ─── loaders ─────────────────────────────────────────────────────────────────

async function loadActiveOrderByFreelancer(freelancerPhone: string): Promise<ActiveOrder | null> {
  const rows = (await db.execute(sql`
    SELECT id,
           public_code          AS "publicCode",
           client_phone         AS "clientPhone",
           freelancer_phone     AS "freelancerPhone",
           amount,
           platform_fee         AS "platformFee",
           description,
           freelancer_id        AS "freelancerId",
           client_id            AS "clientId",
           delivery_announced_at AS "deliveryAnnouncedAt"
    FROM orders
    WHERE freelancer_phone = ${normalizeDigits(freelancerPhone)}
      AND status = 'active'
    ORDER BY id DESC
    LIMIT 1
  `)) as unknown as ActiveOrder[];
  return rows[0] || null;
}

async function loadActiveOrderById(orderId: number): Promise<ActiveOrder | null> {
  const rows = (await db.execute(sql`
    SELECT id,
           public_code          AS "publicCode",
           client_phone         AS "clientPhone",
           freelancer_phone     AS "freelancerPhone",
           amount,
           platform_fee         AS "platformFee",
           description,
           freelancer_id        AS "freelancerId",
           client_id            AS "clientId",
           delivery_announced_at AS "deliveryAnnouncedAt"
    FROM orders
    WHERE id = ${orderId}
      AND status IN ('active', 'completed')
    LIMIT 1
  `)) as unknown as ActiveOrder[];
  return rows[0] || null;
}

// ─── intent classifiers ───────────────────────────────────────────────────────

/**
 * Returns true if the message signals "I have delivered the work".
 */
export function classifyDeliveryIntent(text: string): boolean {
  const t = (text || "").trim();
  return /^(تم|خلصت|انتهيت|سلمت|اكتمل|اكتملت|تسليم|خلص|جاهز|done|delivered|finished|complete|completed|ready)/i.test(t) ||
    /(تم التسليم|سلمت الشغل|خلصت الشغل|انتهيت من الشغل|جاهز للتسليم|تسليم المشروع|اكتمل المشروع|تم الانتهاء)/i.test(t);
}

/**
 * Returns "accept" | "dispute" | null.
 */
export function classifyClientDeliveryResponse(text: string): "accept" | "dispute" | null {
  const t = (text || "").trim().toLowerCase();
  if (!t) return null;
  const accept = /^(نعم|ايوه|أيوه|اي|أي|تمام|قبلت|استلمت|وافقت|موافق|اوكي|أوكي|yes|y|ok|okay|done|received|accepted|confirm)/;
  const dispute = /^(لا|لاء|كلا|مو|ما|ناقص|خطأ|غلط|مو صح|مش صح|اعتراض|dispute|no|nope|reject|wrong|incomplete|not done|not complete)/;
  if (accept.test(t)) return "accept";
  if (dispute.test(t)) return "dispute";
  return null;
}

/**
 * Parse a 1–5 rating from a client message.
 * Accepts: Arabic digits (١–٥), Latin digits (1-5), star words,
 * emoji stars (⭐, 🌟), or word maps (ممتاز → 5).
 * Returns null if not a recognisable rating.
 */
export function classifyRating(text: string): number | null {
  const t = normalizeAr((text || "").trim());

  // Word maps first (before digit check so "ممتاز" doesn't hit generic AI)
  const wordMap: Record<string, number> = {
    "ممتاز": 5, "رائع": 5, "عالي": 5, "خمسة": 5, "5 نجوم": 5,
    "جيد جداً": 4, "جيد جدا": 4, "جيد جدًا": 4, "أربعة": 4, "اربعة": 4,
    "مقبول": 3, "عادي": 3, "ثلاثة": 3,
    "ضعيف": 2, "اثنين": 2, "اثنان": 2,
    "سيء": 1, "واحد": 1, "سيئ": 1,
  };
  for (const [word, val] of Object.entries(wordMap)) {
    if (t.includes(word)) return val;
  }

  // Star emoji count
  const stars = (t.match(/⭐|🌟|★/g) || []).length;
  if (stars >= 1 && stars <= 5) return stars;

  // Digit — must be the whole message (or followed by /5 or نجوم)
  const m = t.match(/^([1-5])(?:\s*(?:\/5|نجوم|نجم|stars?))?\s*$/);
  if (m) return Number(m[1]);

  return null;
}

// ─── rating handler ───────────────────────────────────────────────────────────

/**
 * Called when a client in awaiting_rating state sends a message.
 * Saves rating to `reviews`, updates `users.rating` (running average),
 * clears the session state.
 */
export async function handleRatingResponse(
  clientPhone: string,
  text: string,
  orderId: number,
  freelancerId: number | null,
): Promise<"saved" | "ambiguous"> {
  const rating = classifyRating(text);
  const phone = normalizeDigits(clientPhone);

  if (!rating) {
    // Not a valid rating — send gentle reminder once, keep awaiting_rating
    await sendWhatsApp(
      phone,
      `الرجاء إرسال رقم من 1 إلى 5 لتقييم المستقل:\n1️⃣ ضعيف جداً · 2️⃣ ضعيف · 3️⃣ مقبول · 4️⃣ جيد · 5️⃣ ممتاز`,
    ).catch(() => {});
    return "ambiguous";
  }

  // Save rating to reviews table
  if (freelancerId) {
    // Get reviewer (client) id from users
    const clientRows = (await db.execute(sql`
      SELECT id FROM users WHERE phone = ${phone} LIMIT 1
    `)) as unknown as Array<{ id: number }>;
    const reviewerId = clientRows[0]?.id ?? null;

    await db.execute(sql`
      INSERT INTO reviews(order_id, reviewer_id, freelancer_id, rating)
      VALUES(${orderId}, ${reviewerId}, ${freelancerId}, ${rating})
      ON CONFLICT DO NOTHING
    `).catch(() => {});

    // Update freelancer's running average rating
    await db.execute(sql`
      UPDATE users
      SET rating = (
        SELECT ROUND(AVG(r.rating)::numeric, 2)
        FROM reviews r
        WHERE r.freelancer_id = ${freelancerId}
      )
      WHERE id = ${freelancerId}
    `).catch(() => {});
  }

  // Clear awaiting_rating state
  await mergeContext(phone, {
    awaiting_rating: false,
    rating_order_id: null,
    rating_freelancer_id: null,
  });
  await setStage(phone, "closed");

  // Star string for ack
  const stars = "⭐".repeat(rating);
  const ratingLabels: Record<number, string> = {
    1: "شكراً على صراحتك، سنعمل على التحسين.",
    2: "شكراً لتقييمك، سنأخذها بعين الاعتبار.",
    3: "شكراً لتقييمك! نسعى دائماً للتحسين.",
    4: "شكراً! سعيدون بتجربتك الجيدة. 😊",
    5: "شكراً على التقييم الرائع! يسعدنا خدمتك مجدداً. 🌟",
  };

  await sendWhatsApp(
    phone,
    `${stars} تم تسجيل تقييمك (${rating}/5).\n${ratingLabels[rating]}\n\nنتمنى نشوفك مرة ثانية في خدوم! 🤝`,
  ).catch(() => {});

  return "saved";
}

// ─── freelancer delivery announcement ────────────────────────────────────────

/**
 * Called when a freelancer announces delivery.
 * Stores delivery_announced_at on the order, sets client's session to
 * delivery stage, and asks the client to confirm.
 */
export async function handleFreelancerDelivery(freelancerPhone: string): Promise<boolean> {
  const order = await loadActiveOrderByFreelancer(freelancerPhone);
  if (!order || !order.clientPhone) return false;

  const ref = order.publicCode || `#${order.id}`;
  const descSnippet = order.description ? `\n📋 *الطلب:* ${order.description.slice(0, 120)}` : "";

  await db.execute(sql`
    UPDATE orders
    SET delivery_announced_at = NOW()
    WHERE id = ${order.id} AND status = 'active'
  `);

  const clientPhone = normalizeDigits(order.clientPhone);
  await mergeContext(clientPhone, {
    awaiting_delivery_confirm: true,
    delivery_order_id: order.id,
    delivery_announced_at: new Date().toISOString(),
  });
  await setStage(clientPhone, "delivery");

  await sendWhatsApp(
    freelancerPhone,
    `✅ تم تسجيل طلب التسليم للمشروع ${ref}.\nراح نسأل العميل ليؤكد الاستلام. بانتظار رده 🕐`,
  );

  await sendWhatsApp(
    clientPhone,
    `📦 *المستقل أعلن تسليم العمل!*\n\nالمشروع: ${ref}${descSnippet}\n\n` +
    `هل استلمت العمل وأنت راضٍ عنه؟\n` +
    `✅ رد بـ *نعم* لإتمام الطلب وتحرير المبلغ للمستقل\n` +
    `❌ رد بـ *لا* إذا كان هناك مشكلة — سيتدخل فريق الدعم`,
  );

  return true;
}

// ─── client delivery response ─────────────────────────────────────────────────

/**
 * Called when a client responds to a delivery confirmation request.
 * Completes or disputes the order accordingly.
 */
export async function handleClientDeliveryResponse(
  clientPhone: string,
  text: string,
  orderId: number,
): Promise<"accepted" | "disputed" | "ambiguous"> {
  const decision = classifyClientDeliveryResponse(text);
  if (!decision) return "ambiguous";

  const order = await loadActiveOrderById(orderId);
  if (!order || order.id !== orderId) {
    await mergeContext(normalizeDigits(clientPhone), {
      awaiting_delivery_confirm: false,
      delivery_order_id: null,
    });
    return "accepted";
  }

  const ref = order.publicCode || `#${order.id}`;

  if (decision === "accept") {
    await completeOrder(order, clientPhone);
    return "accepted";
  }

  // DISPUTE
  await db.execute(sql`
    UPDATE orders
    SET status = 'disputed'
    WHERE id = ${order.id} AND status = 'active'
  `);

  await mergeContext(normalizeDigits(clientPhone), {
    awaiting_delivery_confirm: false,
    delivery_order_id: null,
  });
  await setStage(normalizeDigits(clientPhone), "dispute");

  if (order.freelancerPhone) {
    await sendWhatsApp(
      order.freelancerPhone,
      `⚠️ *تم رفع نزاع على مشروع ${ref}*\n\nالعميل أبدى اعتراضاً على التسليم. سيتواصل معك فريق خدوم لحسم الموضوع. المبلغ محتجز حتى الحل. 🙏`,
    ).catch(() => {});
  }

  await sendWhatsApp(
    normalizeDigits(clientPhone),
    `تم رفع نزاعك للمشروع ${ref} ✅\nسيتواصل معك فريق الدعم خلال 24 ساعة لمساعدتك في حل المشكلة. المبلغ محتجز بأمان حتى يُحسم. 🛡️`,
  ).catch(() => {});

  await db.execute(sql`
    INSERT INTO escalations(phone, reason, priority, summary)
    VALUES(
      ${normalizeDigits(clientPhone)},
      'delivery_dispute',
      'high',
      ${`نزاع تسليم — مشروع ${ref} — العميل ${clientPhone} رفض التسليم. المستقل: ${order.freelancerPhone || "غير معروف"}`}
    )
  `).catch(() => {});

  return "disputed";
}

// ─── complete order ───────────────────────────────────────────────────────────

/**
 * Complete the order: set status=completed, credit freelancer wallet,
 * notify both parties, then request a rating from the client.
 */
async function completeOrder(order: ActiveOrder, clientPhone: string): Promise<void> {
  const ref = order.publicCode || `#${order.id}`;
  const gross = Number(order.amount || 0);
  const fee = Number(order.platformFee || 0);
  const freelancerPayout = +(gross - fee).toFixed(2);

  await db.execute(sql`
    UPDATE orders
    SET status = 'completed', completed_at = NOW()
    WHERE id = ${order.id} AND status = 'active'
  `);

  // Credit freelancer wallet
  if (order.freelancerId && freelancerPayout > 0) {
    await db.execute(sql`
      INSERT INTO wallets(user_id, balance, total_earned)
      VALUES(${order.freelancerId}, ${freelancerPayout}, ${freelancerPayout})
      ON CONFLICT (user_id) DO UPDATE
        SET balance      = wallets.balance + EXCLUDED.balance,
            total_earned = wallets.total_earned + EXCLUDED.total_earned,
            updated_at   = NOW()
    `);
  }

  // Increment counters
  if (order.clientId) {
    await db.execute(sql`
      UPDATE users SET orders_count = orders_count + 1 WHERE id = ${order.clientId}
    `).catch(() => {});
  }
  if (order.freelancerId) {
    await db.execute(sql`
      UPDATE users SET completed_projects = completed_projects + 1 WHERE id = ${order.freelancerId}
    `).catch(() => {});
  }

  // Clear delivery state, enter rating stage
  const phone = normalizeDigits(clientPhone);
  await mergeContext(phone, {
    awaiting_delivery_confirm: false,
    delivery_order_id: null,
    awaiting_rating: true,
    rating_order_id: order.id,
    rating_freelancer_id: order.freelancerId,
  });
  await setStage(phone, "rating");

  // Notify freelancer
  if (order.freelancerPhone) {
    await sendWhatsApp(
      order.freelancerPhone,
      `🎉 *تم اعتماد التسليم!*\n\nالعميل أكد استلامه للمشروع ${ref}.\nتم إضافة *${freelancerPayout} ريال* لمحفظتك في خدوم. يمكنك طلب السحب من تطبيق خدوم. شكراً لاحترافيتك! ⭐`,
    ).catch(() => {});
  }

  // Notify client + request rating in one message
  await sendWhatsApp(
    phone,
    `✅ *تم إتمام الطلب بنجاح!* 🎉\n\nشكراً لثقتك بخدوم، تم تحرير المبلغ للمستقل.\n\n` +
    `⭐ *كيف تقيّم تجربتك مع المستقل؟*\n` +
    `1️⃣ ضعيف جداً\n` +
    `2️⃣ ضعيف\n` +
    `3️⃣ مقبول\n` +
    `4️⃣ جيد\n` +
    `5️⃣ ممتاز\n\n` +
    `رد بالرقم من 1 إلى 5 ✏️`,
  ).catch(() => {});
}

// ─── sweep stale deliveries ───────────────────────────────────────────────────

/**
 * DB-driven sweep: auto-confirm deliveries that have been pending client
 * confirmation for more than 48 hours. Called from drainQueue each tick.
 */
export async function sweepStaleDeliveries(): Promise<void> {
  const stale = (await db.execute(sql`
    SELECT id, client_phone AS "clientPhone", freelancer_phone AS "freelancerPhone",
           public_code AS "publicCode", amount, platform_fee AS "platformFee",
           freelancer_id AS "freelancerId", client_id AS "clientId",
           delivery_announced_at AS "deliveryAnnouncedAt"
    FROM orders
    WHERE status = 'active'
      AND delivery_announced_at IS NOT NULL
      AND delivery_announced_at < NOW() - INTERVAL '48 hours'
  `)) as unknown as ActiveOrder[];

  await Promise.all(
    stale.map(async (order) => {
      if (!order.clientPhone) return;
      // Notify client before auto-completing
      await sendWhatsApp(
        normalizeDigits(order.clientPhone),
        `تم تأكيد استلام المشروع ${order.publicCode || `#${order.id}`} تلقائياً بعد مرور 48 ساعة دون رد. 🕐`,
      ).catch(() => {});
      await completeOrder(order, order.clientPhone).catch(() => {});
    }),
  );
}

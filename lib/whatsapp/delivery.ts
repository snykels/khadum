/**
 * Order delivery & completion flow via WhatsApp.
 *
 * When a freelancer signals delivery:
 *  1. Bot asks the client to confirm receipt.
 *  2. Client confirms → order completed, freelancer wallet credited.
 *  3. Client disputes → order disputed, admin notified, funds held.
 *  4. No response for 48 hours → auto-confirmed (handled by sweepStaleDeliveries).
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/notify";
import { mergeContext, setStage } from "./session";

function normalizeDigits(p: string): string {
  return (p || "").replace(/[^\d]/g, "");
}

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
      AND status = 'active'
    LIMIT 1
  `)) as unknown as ActiveOrder[];
  return rows[0] || null;
}

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
  if (!order) {
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

/**
 * Complete the order: set status=completed, credit freelancer wallet,
 * notify both parties.
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

  if (order.clientId) {
    await db.execute(sql`
      UPDATE users
      SET orders_count = orders_count + 1
      WHERE id = ${order.clientId}
    `).catch(() => {});
  }
  if (order.freelancerId) {
    await db.execute(sql`
      UPDATE users
      SET completed_projects = completed_projects + 1
      WHERE id = ${order.freelancerId}
    `).catch(() => {});
  }

  await mergeContext(normalizeDigits(clientPhone), {
    awaiting_delivery_confirm: false,
    delivery_order_id: null,
  });
  await setStage(normalizeDigits(clientPhone), "closed");

  if (order.freelancerPhone) {
    await sendWhatsApp(
      order.freelancerPhone,
      `🎉 *تم اعتماد التسليم!*\n\nالعميل أكد استلامه للمشروع ${ref}.\nتم إضافة *${freelancerPayout} ريال* لمحفظتك في خدوم. يمكنك طلب السحب من تطبيق خدوم. شكراً لاحترافيتك! ⭐`,
    ).catch(() => {});
  }

  await sendWhatsApp(
    normalizeDigits(clientPhone),
    `✅ *تم إتمام الطلب بنجاح!*\n\nشكراً لثقتك بخدوم. نتمنى أن العمل وافق توقعاتك.\nيسعدنا خدمتك مرة أخرى 🤝`,
  ).catch(() => {});
}

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
      await completeOrder(order, order.clientPhone).catch(() => {});
      await sendWhatsApp(
        normalizeDigits(order.clientPhone),
        `تم تأكيد استلام المشروع ${order.publicCode || `#${order.id}`} تلقائياً بعد مرور 48 ساعة دون رد. 🕐`,
      ).catch(() => {});
    }),
  );
}

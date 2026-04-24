/**
 * Function-calling tools the WhatsApp agent can invoke.
 * Each tool exposes:
 *   - schema:   OpenAI-style function description
 *   - execute:  async function that runs against the live DB / Tap
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { createCharge } from "@/lib/tap";
import { sendWhatsApp } from "@/lib/notify";
import { generateOrderCode } from "@/lib/conversationCode";
import { mergeContext, setProjectId, setStage } from "@/lib/whatsapp/session";
import { sendNextOffer, type OfferCandidate } from "@/lib/whatsapp/offers";

export interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (
    args: Record<string, unknown>,
    ctx: { phone: string; projectId: number | null },
  ) => Promise<ToolResult>;
}

/**
 * Authorization helper: verify that the WhatsApp caller (identified by
 * `ctx.phone`) actually owns the given order, either via session-bound
 * project_id or via the order's client phone matching the WA number.
 * Prevents IDOR where the LLM is coaxed into looking up arbitrary IDs.
 */
async function assertOrderOwnership(
  orderId: number,
  ctx: { phone: string; projectId: number | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!orderId) return { ok: false, error: "missing order id" };
  if (ctx.projectId && ctx.projectId === orderId) return { ok: true };
  interface OwnerRow {
    clientPhone: string | null;
  }
  const rows = (await db.execute(sql`
    SELECT u.phone AS "clientPhone"
    FROM orders o
    LEFT JOIN users u ON u.id = o.client_id
    WHERE o.id = ${orderId}
    LIMIT 1
  `)) as unknown as OwnerRow[];
  if (!rows.length) return { ok: false, error: "order not found" };
  const ownerDigits = (rows[0].clientPhone || "").replace(/[^\d]/g, "");
  const callerDigits = ctx.phone.replace(/[^\d]/g, "");
  if (!ownerDigits || ownerDigits !== callerDigits) {
    return { ok: false, error: "not authorized for this order" };
  }
  return { ok: true };
}

// ───────────────────────────────────────────────────────────────────
// 1. search_freelancers
// ───────────────────────────────────────────────────────────────────
const searchFreelancers: ToolDef = {
  name: "search_freelancers",
  description:
    "ابحث عن أفضل 3 مستقلين متاحين حسب التصنيف والميزانية والتقييم.",
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "اسم التصنيف بالعربي (مثلاً: تصميم، برمجة، كتابة).",
      },
      budget_max: {
        type: "number",
        description: "أقصى ميزانية متاحة بالريال السعودي.",
      },
      min_rating: {
        type: "number",
        description: "الحد الأدنى للتقييم (0–5). الافتراضي 0.",
      },
    },
    required: ["category"],
  },
  execute: async (args) => {
    try {
      const minRating = Number(args.min_rating ?? 0);
      const budgetMax = args.budget_max ? Number(args.budget_max) : null;
      const category = String(args.category || "").trim();

      interface FreelancerRow {
        id: number;
        name: string | null;
        rating: string | null;
        completedProjects: number | null;
        avgResponseTime: number | null;
        phone: string | null;
      }
      const rows = (await db.execute(sql`
        SELECT DISTINCT u.id, u.name, u.rating, u.completed_projects AS "completedProjects",
               u.avg_response_time AS "avgResponseTime", u.phone
        FROM users u
        LEFT JOIN services s ON s.freelancer_id = u.id AND s.status='published'
        LEFT JOIN categories c ON c.id = s.category_id
        WHERE u.role='freelancer'
          AND COALESCE(u.is_suspended,false) = false
          AND COALESCE(u.is_blocked,false) = false
          AND COALESCE(u.activation_status,'active') = 'active'
          AND u.phone IS NOT NULL AND length(u.phone) > 0
          AND u.rating::numeric >= ${minRating}
          AND (
            ${category} = '' OR c.name_ar ILIKE ${'%' + category + '%'}
          )
          AND (${budgetMax}::numeric IS NULL OR s.price::numeric <= ${budgetMax})
          -- Exclude freelancers who already have an active (pending or in-flight) project,
          -- so STAGE_MATCHING never offers to a busy freelancer.
          AND NOT EXISTS (
            SELECT 1 FROM orders o
            WHERE o.freelancer_id = u.id
              AND o.status IN ('pending','active')
          )
        ORDER BY u.avg_response_time ASC NULLS LAST,
                 u.rating DESC NULLS LAST,
                 u.completed_projects DESC NULLS LAST
        LIMIT 3
      `)) as unknown as FreelancerRow[];

      return { ok: true, data: rows };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// ───────────────────────────────────────────────────────────────────
// 2. create_payment_link
// ───────────────────────────────────────────────────────────────────
const createPaymentLink: ToolDef = {
  name: "create_payment_link",
  description:
    "أنشئ رابط دفع Tap لطلب محدد وأرجع الرابط ليُرسَل للعميل.",
  parameters: {
    type: "object",
    properties: {
      project_id: { type: "number", description: "معرف الطلب في DB." },
      amount: { type: "number", description: "المبلغ بالريال السعودي." },
      client_phone: {
        type: "string",
        description: "رقم العميل (يبدأ بـ 9665 أو دولي).",
      },
      description: {
        type: "string",
        description: "وصف قصير للمشروع (لإيصال Tap).",
      },
    },
    required: ["project_id", "amount", "client_phone"],
  },
  execute: async (args, ctx) => {
    try {
      const projectId = Number(args.project_id);
      const amount = Number(args.amount);
      // Always bind the payment to the WhatsApp caller — never trust an
      // arbitrary phone the model might pass.
      const phone = ctx.phone.replace(/[^\d]/g, "");
      if (!projectId || amount <= 0 || !phone) {
        return { ok: false, error: "missing project/amount/phone" };
      }
      const auth = await assertOrderOwnership(projectId, ctx);
      if (!auth.ok) return { ok: false, error: auth.error };
      const country = phone.startsWith("966")
        ? "966"
        : phone.startsWith("971")
          ? "971"
          : phone.startsWith("965")
            ? "965"
            : phone.startsWith("973")
              ? "973"
              : "966";
      const local = phone.replace(new RegExp(`^${country}`), "");

      const base =
        process.env.APP_BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "https://khadum.app";

      const charge = await createCharge({
        amount,
        currency: "SAR",
        description: String(args.description || `طلب رقم ${projectId}`),
        reference: `KHD-${projectId}-${Date.now()}`,
        source: "src_all",
        customer: {
          first_name: "Khadum Client",
          phone: { country_code: country, number: local },
        },
        redirectUrl: `${base}/payment/result?order=${projectId}`,
        webhookUrl: `${base}/api/payments/webhook/tap`,
        metadata: { project_id: String(projectId), via: "wa_agent" },
      });
      return {
        ok: true,
        data: {
          payment_url: charge.transaction?.url,
          charge_id: charge.id,
          status: charge.status,
        },
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// ───────────────────────────────────────────────────────────────────
// 3. get_order_status
// ───────────────────────────────────────────────────────────────────
const getOrderStatus: ToolDef = {
  name: "get_order_status",
  description: "اجلب حالة طلب محدد من قاعدة البيانات.",
  parameters: {
    type: "object",
    properties: {
      project_id: { type: "number", description: "معرف الطلب." },
    },
    required: ["project_id"],
  },
  execute: async (args, ctx) => {
    try {
      const id = Number(args.project_id);
      const auth = await assertOrderOwnership(id, ctx);
      if (!auth.ok) return { ok: false, error: auth.error };
      interface OrderRow {
        id: number;
        publicCode: string | null;
        status: string;
        paymentStatus: string | null;
        amount: string | null;
        paidAmount: string | null;
        createdAt: string;
        completedAt: string | null;
        clientName: string | null;
        freelancerName: string | null;
      }
      const rows = (await db.execute(sql`
        SELECT o.id, o.public_code AS "publicCode", o.status,
               o.payment_status AS "paymentStatus", o.amount,
               o.paid_amount AS "paidAmount",
               o.created_at AS "createdAt",
               o.completed_at AS "completedAt",
               c.name AS "clientName", f.name AS "freelancerName"
        FROM orders o
        LEFT JOIN users c ON c.id = o.client_id
        LEFT JOIN users f ON f.id = o.freelancer_id
        WHERE o.id = ${id} LIMIT 1
      `)) as unknown as OrderRow[];
      if (!rows.length) return { ok: false, error: "order not found" };
      return { ok: true, data: rows[0] };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// ───────────────────────────────────────────────────────────────────
// 4. escalate_to_admin
// ───────────────────────────────────────────────────────────────────
const escalateToAdmin: ToolDef = {
  name: "escalate_to_admin",
  description:
    "صعّد المحادثة لمشرف بشري عند النزاع، الغضب الشديد، أو حالات حرجة. ينشئ سجل في جدول escalations ويُبلّغ المشرفين.",
  parameters: {
    type: "object",
    properties: {
      reason: { type: "string", description: "سبب التصعيد." },
      priority: {
        type: "string",
        enum: ["low", "normal", "high", "urgent"],
        description: "مستوى الأولوية.",
      },
      summary: {
        type: "string",
        description: "ملخص قصير للموقف للمشرف.",
      },
      phone: {
        type: "string",
        description: "رقم العميل أو المستقل المعني (اختياري).",
      },
    },
    required: ["reason", "summary"],
  },
  execute: async (args, ctx) => {
    try {
      const phone = String(args.phone || ctx.phone).replace(/[^\d]/g, "");
      const priority = String(args.priority || "normal");
      const reason = String(args.reason);
      const summary = String(args.summary);

      interface SnapshotRow {
        role: string;
        body: string;
        direction: string;
        createdAt: string;
      }
      // Build a short conversation snapshot from last 10 messages.
      const snapshot = (await db.execute(sql`
        SELECT role, body, direction, created_at AS "createdAt"
        FROM whatsapp_messages
        WHERE phone = ${phone}
        ORDER BY created_at DESC LIMIT 10
      `)) as unknown as SnapshotRow[];

      const inserted = (await db.execute(sql`
        INSERT INTO escalations(phone, reason, priority, summary, conversation_snapshot, status)
        VALUES(${phone}, ${reason}, ${priority}, ${summary},
               ${JSON.stringify(snapshot.reverse())}::jsonb, 'new')
        RETURNING id
      `)) as unknown as Array<{ id: number }>;

      // Notify admins via in-app notifications (best-effort).
      try {
        await db.execute(sql`
          INSERT INTO notifications(user_id, type, title, message, channel, priority, link, data)
          SELECT u.id, 'escalation', 'تصعيد جديد من واتساب',
                 ${`أولوية ${priority} — ${summary.slice(0, 120)}`},
                 'inapp', ${priority === "urgent" || priority === "high" ? "high" : "normal"},
                 '/admin/escalations',
                 ${JSON.stringify({ escalation_id: inserted[0]?.id, phone })}
          FROM users u WHERE u.role='admin'
        `);
      } catch {
        // ignore notification failure
      }

      return {
        ok: true,
        data: { escalation_id: inserted[0]?.id, status: "new" },
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// ───────────────────────────────────────────────────────────────────
// 5. get_service_pricing
// ───────────────────────────────────────────────────────────────────
const getServicePricing: ToolDef = {
  name: "get_service_pricing",
  description:
    "اجلب نطاق السعر التقريبي (min/avg/max) لتصنيف خدمة معين بناءً على الخدمات المنشورة.",
  parameters: {
    type: "object",
    properties: {
      category_name: {
        type: "string",
        description: "اسم التصنيف بالعربي.",
      },
    },
    required: ["category_name"],
  },
  execute: async (args) => {
    try {
      const cat = String(args.category_name || "").trim();
      interface PricingRow {
        min: string | null;
        avg: string | null;
        max: string | null;
        samples: number;
      }
      const rows = (await db.execute(sql`
        SELECT
          MIN(s.price)::text AS min,
          AVG(s.price)::numeric(10,2)::text AS avg,
          MAX(s.price)::text AS max,
          COUNT(*)::int AS samples
        FROM services s
        JOIN categories c ON c.id = s.category_id
        WHERE c.name_ar ILIKE ${'%' + cat + '%'}
          AND s.status='published'
      `)) as unknown as PricingRow[];
      const r = rows[0] || ({} as Partial<PricingRow>);
      if (!r.samples) return { ok: false, error: "no pricing data" };
      return {
        ok: true,
        data: { min: r.min, avg: r.avg, max: r.max, samples: r.samples },
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// ───────────────────────────────────────────────────────────────────
// 6. create_order — turns the intake context into a real `orders` row
// ───────────────────────────────────────────────────────────────────
const createOrder: ToolDef = {
  name: "create_order",
  description:
    "أنشئ طلب جديد في قاعدة البيانات بعد اكتمال intake (وصف + ميزانية + مدة). " +
    "يربط الطلب بحساب العميل عبر رقم الواتساب، ويُرجع project_id ليُستخدم لاحقاً في عرض المشروع على المستقلين.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "عنوان قصير للمشروع." },
      description: { type: "string", description: "وصف تفصيلي للمشروع." },
      budget: { type: "number", description: "الميزانية المتفق عليها بالريال." },
      duration_days: {
        type: "number",
        description: "المدة المتوقعة بالأيام.",
      },
      category: {
        type: "string",
        description: "اسم التصنيف بالعربي (اختياري للتوثيق فقط).",
      },
    },
    required: ["description", "budget", "duration_days"],
  },
  execute: async (args, ctx) => {
    try {
      const description = String(args.description || "").trim();
      const budget = Number(args.budget);
      const durationDays = Number(args.duration_days);
      if (!description || !(budget > 0) || !(durationDays > 0)) {
        return { ok: false, error: "missing description / budget / duration" };
      }
      const phoneDigits = ctx.phone.replace(/[^\d]/g, "");
      if (!phoneDigits) return { ok: false, error: "no caller phone" };

      // ── Idempotency: reuse the existing pending order if this session
      //    already has a project_id.  Prevents duplicate rows from LLM
      //    re-invocations in the same conversation.
      if (ctx.projectId) {
        interface ExistRow { id: number; publicCode: string; status: string }
        const existing = (await db.execute(sql`
          SELECT id, public_code AS "publicCode", status
          FROM orders WHERE id=${ctx.projectId} LIMIT 1
        `)) as unknown as ExistRow[];
        if (existing[0] && existing[0].status === "pending") {
          return {
            ok: true,
            data: {
              project_id: existing[0].id,
              public_code: existing[0].publicCode,
              reused: true,
            },
          };
        }
      }

      // Resolve client account by phone (best-effort; orders.client_id may be null
      // for guest WhatsApp clients — orders.client_phone is always recorded).
      interface UserRow { id: number }
      const userRows = (await db.execute(sql`
        SELECT id FROM users
        WHERE role='client' AND regexp_replace(COALESCE(phone,''),'[^0-9]','','g') = ${phoneDigits}
        LIMIT 1
      `)) as unknown as UserRow[];
      const clientId = userRows[0]?.id ?? null;

      const publicCode = generateOrderCode();
      const dueDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      interface InsertedRow { id: number; publicCode: string }
      const inserted = (await db.execute(sql`
        INSERT INTO orders(public_code, client_id, status, amount, payment_status,
                           client_phone, description, due_date, created_at)
        VALUES(${publicCode}, ${clientId}, 'pending', ${budget.toFixed(2)}, 'pending',
               ${phoneDigits}, ${description}, ${dueDate.toISOString()}, NOW())
        RETURNING id, public_code AS "publicCode"
      `)) as unknown as InsertedRow[];

      const orderId = inserted[0]?.id;
      if (!orderId) return { ok: false, error: "insert failed" };

      // Bind the order to the client's session so subsequent tools / replies
      // know which project we are talking about.
      await setProjectId(ctx.phone, orderId);
      await mergeContext(ctx.phone, {
        order_id: orderId,
        budget,
        duration_days: durationDays,
        description,
        title: typeof args.title === "string" ? args.title : undefined,
        category: typeof args.category === "string" ? args.category : undefined,
      });

      return {
        ok: true,
        data: { project_id: orderId, public_code: inserted[0].publicCode },
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// ───────────────────────────────────────────────────────────────────
// 7. offer_to_freelancer — sends a single offer; queues remaining for
//    auto-advance after a 2-minute no-response window.
// ───────────────────────────────────────────────────────────────────
const offerToFreelancer: ToolDef = {
  name: "offer_to_freelancer",
  description:
    "أرسل عرض المشروع لمستقل واحد عبر الواتساب وانتظر رده دقيقتين. " +
    "إذا مرّت دقيقتان بدون رد ينتقل النظام تلقائياً للمستقل التالي في القائمة. " +
    "تتطلب أن يكون هناك project_id جاري في الجلسة (استخدم create_order أولاً).",
  parameters: {
    type: "object",
    properties: {
      freelancer_id: { type: "number", description: "معرف المستقل المُختار." },
      candidate_ids: {
        type: "array",
        items: { type: "number" },
        description:
          "بقية المرشحين بالترتيب (اختياري). يُستخدمون كـ fallback إذا لم يقبل الأول خلال دقيقتين.",
      },
    },
    required: ["freelancer_id"],
  },
  execute: async (args, ctx) => {
    try {
      // Defensive: if the orchestrator didn't pass projectId (e.g. between turns),
      // fall back to the project_id stored on the session by create_order.
      let orderId: number | null = ctx.projectId;
      if (!orderId) {
        const phoneDigits = ctx.phone.replace(/[^\d]/g, "");
        const sRows = (await db.execute(sql`
          SELECT project_id AS "projectId" FROM whatsapp_sessions WHERE phone=${phoneDigits} LIMIT 1
        `)) as unknown as Array<{ projectId: number | null }>;
        orderId = sRows[0]?.projectId ?? null;
      }
      if (!orderId) return { ok: false, error: "no active project_id; call create_order first" };
      const primaryId = Number(args.freelancer_id);
      if (!primaryId) return { ok: false, error: "missing freelancer_id" };

      const fallback = Array.isArray(args.candidate_ids)
        ? (args.candidate_ids as unknown[]).map((x) => Number(x)).filter((n) => Number.isFinite(n) && n !== primaryId)
        : [];

      // Fetch all candidate users in one query.
      const allIds = [primaryId, ...fallback];
      interface FreelancerRow { id: number; name: string | null; phone: string | null }
      const placeholders = sql.join(allIds.map((id) => sql`${id}`), sql`, `);
      const rows = (await db.execute(sql`
        SELECT id, name, phone FROM users
        WHERE role='freelancer'
          AND COALESCE(is_suspended,false)=false
          AND COALESCE(is_blocked,false)=false
          AND id IN (${placeholders})
      `)) as unknown as FreelancerRow[];

      const byId = new Map(rows.map((r) => [r.id, r]));
      const ordered: OfferCandidate[] = [];
      for (const id of allIds) {
        const r = byId.get(id);
        if (r && r.phone) ordered.push({ id: r.id, name: r.name, phone: r.phone });
      }
      if (!ordered.length) return { ok: false, error: "no reachable freelancer (missing phone or blocked)" };

      // Persist the queue (head will be popped by sendNextOffer) and start.
      await mergeContext(ctx.phone, { offer_queue: ordered, current_offer: null });
      await setStage(ctx.phone, "matching");
      const offeredId = await sendNextOffer(ctx.phone, orderId);
      if (!offeredId) return { ok: false, error: "could not send any offer" };
      return {
        ok: true,
        data: {
          offered_freelancer_id: offeredId,
          remaining_in_queue: Math.max(0, ordered.length - 1),
          response_window_seconds: 120,
        },
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// ───────────────────────────────────────────────────────────────────

export const TOOLS: ToolDef[] = [
  searchFreelancers,
  createOrder,
  offerToFreelancer,
  createPaymentLink,
  getOrderStatus,
  escalateToAdmin,
  getServicePricing,
];

export const TOOLS_BY_NAME: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [t.name, t]),
);

/** OpenAI Chat Completions tool array form. */
export function openAITools() {
  return TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

// re-export for convenience in places that already imported sendWhatsApp
export { sendWhatsApp };

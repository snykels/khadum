/**
 * POST /api/admin/disputes/resolve
 * Admin resolves a dispute: either "client_wins" (refund via Tap) or "freelancer_wins" (credit wallet).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { createRefund } from "@/lib/tap";
import { sendWhatsApp } from "@/lib/whatsapp/sender";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { disputeId, outcome, note } = body as {
    disputeId: number;
    outcome: "client_wins" | "freelancer_wins";
    note?: string;
  };

  if (!disputeId || !outcome) {
    return NextResponse.json({ error: "disputeId and outcome required" }, { status: 400 });
  }
  if (outcome !== "client_wins" && outcome !== "freelancer_wins") {
    return NextResponse.json({ error: "outcome must be client_wins or freelancer_wins" }, { status: 400 });
  }

  // ─── Load dispute + order data ────────────────────────────────────────────
  const disputeRows = await db.execute(sql`
    SELECT
      d.id, d.order_id, d.status, d.public_code,
      d.raised_by, d.raised_by_party,
      o.amount, o.platform_fee,
      o.client_id, o.freelancer_id,
      o.status AS order_status,
      -- phone numbers from users
      cu.phone AS client_phone,
      fu.phone AS freelancer_phone,
      fu.name  AS freelancer_name,
      -- tap charge id from payment_sessions
      ps.tap_charge_id,
      ps.amount AS session_amount
    FROM disputes d
    LEFT JOIN orders o ON o.id = d.order_id
    LEFT JOIN users cu ON cu.id = o.client_id
    LEFT JOIN users fu ON fu.id = o.freelancer_id
    LEFT JOIN payment_sessions ps ON ps.order_id = o.id AND ps.status = 'paid'
    WHERE d.id = ${disputeId}
    LIMIT 1
  `);

  if (!disputeRows.rows.length) {
    return NextResponse.json({ error: "dispute not found" }, { status: 404 });
  }

  const d = disputeRows.rows[0] as {
    id: number;
    order_id: number;
    status: string;
    public_code: string;
    raised_by: number;
    raised_by_party: string;
    amount: string;
    platform_fee: string;
    client_id: number;
    freelancer_id: number;
    order_status: string;
    client_phone: string;
    freelancer_phone: string;
    freelancer_name: string;
    tap_charge_id: string | null;
    session_amount: string;
  };

  if (d.status === "resolved" || d.status === "rejected") {
    return NextResponse.json({ error: "dispute already resolved" }, { status: 409 });
  }

  const gross = Number(d.session_amount || d.amount || 0);
  const fee   = Number(d.platform_fee || 0);
  const freelancerPayout = +(gross - fee).toFixed(2);
  const ref = d.public_code || `#${d.order_id}`;
  const resolution = note || (outcome === "client_wins" ? "استرداد المبلغ للعميل" : "صرف المبلغ للمستقل");

  let refundId: string | null = null;
  const errors: string[] = [];

  // ─── Execute outcome ──────────────────────────────────────────────────────
  if (outcome === "client_wins") {
    // 1. Refund via Tap Payments (if charge ID available)
    if (d.tap_charge_id) {
      try {
        const refund = await createRefund(
          d.tap_charge_id,
          gross,
          `Dispute ${ref} — client won — admin: ${session.userId}`,
        );
        refundId = refund.id;
      } catch (e) {
        errors.push(`Tap refund failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      errors.push("No tap_charge_id found — manual refund required");
    }

    // 2. Mark order cancelled/refunded
    await db.execute(sql`
      UPDATE orders
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${d.order_id}
    `).catch(() => {});

    // 3. Notify client
    if (d.client_phone) {
      await sendWhatsApp(
        d.client_phone,
        `✅ *تم حسم النزاع لصالحك — ${ref}*\n\n` +
        `بعد المراجعة، تقرر إعادة المبلغ إليك.\n` +
        (refundId ? `سيصلك المبلغ خلال 5–10 أيام عمل حسب جهة الإصدار. 💙` : `سيتواصل معك الفريق لترتيب الاسترداد. 💙`),
      ).catch(() => {});
    }

    // 4. Notify freelancer
    if (d.freelancer_phone) {
      await sendWhatsApp(
        d.freelancer_phone,
        `⚠️ *قرار النزاع — ${ref}*\n\n` +
        `بعد المراجعة، صدر القرار لصالح العميل وسيُعاد إليه المبلغ.\n` +
        `إذا كان لديك اعتراض، تواصل مع الدعم خلال 48 ساعة.`,
      ).catch(() => {});
    }

  } else {
    // freelancer_wins: credit wallet
    if (d.freelancer_id && freelancerPayout > 0) {
      await db.execute(sql`
        INSERT INTO wallets(user_id, balance, total_earned)
        VALUES(${d.freelancer_id}, ${freelancerPayout}, ${freelancerPayout})
        ON CONFLICT (user_id) DO UPDATE
          SET balance      = wallets.balance + EXCLUDED.balance,
              total_earned = wallets.total_earned + EXCLUDED.total_earned,
              updated_at   = NOW()
      `).catch(() => {});
    }

    // Update order to completed
    await db.execute(sql`
      UPDATE orders
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = ${d.order_id}
    `).catch(() => {});

    // Update freelancer counters
    if (d.freelancer_id) {
      await db.execute(sql`
        UPDATE users
        SET completed_projects = completed_projects + 1
        WHERE id = ${d.freelancer_id}
      `).catch(() => {});
    }

    // Notify freelancer
    if (d.freelancer_phone) {
      await sendWhatsApp(
        d.freelancer_phone,
        `✅ *تم حسم النزاع لصالحك — ${ref}*\n\n` +
        `بعد المراجعة، تقرر صرف المبلغ لك.\n` +
        `تم إضافة *${freelancerPayout} ريال* لمحفظتك في خدوم. 🎉`,
      ).catch(() => {});
    }

    // Notify client
    if (d.client_phone) {
      await sendWhatsApp(
        d.client_phone,
        `⚠️ *قرار النزاع — ${ref}*\n\n` +
        `بعد المراجعة، صدر القرار لصالح المستقل وسيُصرف له المبلغ.\n` +
        `إذا كان لديك اعتراض، تواصل مع الدعم خلال 48 ساعة.`,
      ).catch(() => {});
    }
  }

  // ─── Update dispute record ────────────────────────────────────────────────
  await db.execute(sql`
    UPDATE disputes
    SET
      status      = 'resolved',
      resolution  = ${resolution},
      resolved_by = ${session.userId ?? null},
      resolved_at = NOW(),
      refund_issued = ${outcome === "client_wins"},
      refund_amount = ${outcome === "client_wins" ? String(gross) : null},
      updated_at  = NOW()
    WHERE id = ${disputeId}
  `).catch(() => {});

  // ─── Log admin intervention ───────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO admin_interventions(
      order_id, dispute_id, admin_id, type, reason, details, amount
    ) VALUES (
      ${d.order_id},
      ${disputeId},
      ${session.userId ?? null},
      ${outcome === "client_wins" ? "refund" : "payout"},
      ${resolution},
      ${JSON.stringify({
        outcome,
        refundId,
        tap_charge_id: d.tap_charge_id,
        errors,
      })},
      ${outcome === "client_wins" ? String(gross) : String(freelancerPayout)}
    )
  `).catch(() => {});

  return NextResponse.json({
    ok: true,
    outcome,
    refundId,
    errors: errors.length ? errors : undefined,
  });
}

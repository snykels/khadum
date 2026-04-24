import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withdrawals, wallets } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
<<<<<<< HEAD
import { createTransfer } from "@/lib/tap";
import { sendWhatsApp } from "@/lib/notify";
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
<<<<<<< HEAD

  const { id } = await ctx.params;
  const wid = parseInt(id);
  const { status, note } = await req.json();

  const [w] = await db
    .update(withdrawals)
    .set({ status, note: note || undefined })
    .where(eq(withdrawals.id, wid))
    .returning();

  if (!w) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (status === "approved") {
    await db
      .update(wallets)
      .set({ balance: sql`${wallets.balance} - ${w.amount}` })
      .where(eq(wallets.userId, w.userId!));

    const freelancerRows = (await db.execute(sql`
      SELECT name, phone FROM users WHERE id = ${w.userId} LIMIT 1
    `)) as unknown as Array<{ name?: string; phone?: string }>;
    const freelancer = freelancerRows[0];

    let tapTransferId: string | null = null;
    let tapError: string | null = null;

    if (w.accountNumber && freelancer?.name) {
      try {
        const transfer = await createTransfer({
          amount: Number(w.amount),
          description: `سحب أرباح — خدوم — مستقل #${w.userId}`,
          beneficiary: {
            name: freelancer.name,
            iban: w.accountNumber,
            bankName: w.bankName || undefined,
          },
          reference: `withdraw-${wid}`,
          metadata: {
            withdrawal_id: wid,
            user_id: w.userId ?? 0,
          },
        });
        tapTransferId = transfer.id;

        await db.execute(sql`
          UPDATE withdrawals
          SET tap_transfer_id = ${tapTransferId},
              tap_transfer_status = ${transfer.status}
          WHERE id = ${wid}
        `);
      } catch (err) {
        tapError = err instanceof Error ? err.message : String(err);
        console.error("[withdrawal/approve] Tap transfer error:", tapError);

        await db.execute(sql`
          UPDATE withdrawals
          SET tap_transfer_status = 'tap_error'
          WHERE id = ${wid}
        `).catch(() => {});
      }
    }

    if (freelancer?.phone) {
      const amountNum = Number(w.amount).toFixed(2);
      const ibanMasked = w.accountNumber
        ? `****${w.accountNumber.slice(-4)}`
        : "حسابك البنكي";

      const msg = tapTransferId
        ? `✅ *تمت الموافقة على طلب سحبك!*\n\n` +
          `تم إرسال *${amountNum} ريال* إلى ${ibanMasked} عبر Tap Payments.\n` +
          `تتوقع وصول المبلغ خلال 1–3 أيام عمل حسب البنك.\n\n` +
          `رقم التحويل: \`${tapTransferId}\`\n` +
          `شكراً لاحترافيتك! ⭐`
        : `✅ *تمت الموافقة على طلب سحبك!*\n\n` +
          `سيُحوَّل مبلغ *${amountNum} ريال* إلى ${ibanMasked} خلال 1–3 أيام عمل.\n` +
          `شكراً لاحترافيتك! ⭐`;

      await sendWhatsApp(freelancer.phone, msg).catch(() => {});
    }

    return NextResponse.json({
      withdrawal: w,
      tapTransferId,
      tapError: tapError ?? undefined,
    });
  }

  if (status === "rejected" && w.userId) {
    const freelancerRows = (await db.execute(sql`
      SELECT phone FROM users WHERE id = ${w.userId} LIMIT 1
    `)) as unknown as Array<{ phone?: string }>;
    const freelancer = freelancerRows[0];

    if (freelancer?.phone) {
      await sendWhatsApp(
        freelancer.phone,
        `⚠️ *تعذّرت الموافقة على طلب السحب*\n\n` +
          `تعذّر معالجة طلب سحب *${Number(w.amount).toFixed(2)} ريال* في الوقت الحالي.\n` +
          (note ? `السبب: ${note}\n\n` : "\n") +
          `يرجى التحقق من بيانات الحساب البنكي أو التواصل مع الدعم. 💙`,
      ).catch(() => {});
    }
  }

=======
  const { id } = await ctx.params;
  const { status } = await req.json();
  const [w] = await db.update(withdrawals).set({ status }).where(eq(withdrawals.id, parseInt(id))).returning();
  if (status === "approved" && w) {
    await db.update(wallets).set({ balance: sql`${wallets.balance} - ${w.amount}` }).where(eq(wallets.userId, w.userId!));
  }
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return NextResponse.json({ withdrawal: w });
}

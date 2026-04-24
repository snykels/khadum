import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { withdrawals } from "@/lib/schema";

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const rows: any = await db.execute(sql`
    SELECT id, amount, status, bank_name AS "bankName", account_number AS "accountNumber", note, created_at AS "createdAt"
    FROM withdrawals WHERE user_id = ${s.userId}
    ORDER BY created_at DESC
  `);

  const [wallet]: any = await db.execute(sql`
    SELECT balance FROM wallets WHERE user_id = ${s.userId}
  `);

  return NextResponse.json({ withdrawals: rows, availableBalance: Number(wallet?.balance || 0) });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { amount, bankName, accountNumber, note } = body;

  if (!amount || Number(amount) < 100)
    return NextResponse.json({ error: "الحد الأدنى للسحب 100 ر.س" }, { status: 400 });

  const [wallet]: any = await db.execute(sql`
    SELECT balance FROM wallets WHERE user_id = ${s.userId}
  `);
  if (!wallet || Number(wallet.balance) < Number(amount))
    return NextResponse.json({ error: "الرصيد غير كافٍ" }, { status: 400 });

  if (!bankName || !accountNumber)
    return NextResponse.json({ error: "بيانات البنك مطلوبة" }, { status: 400 });

  await db.insert(withdrawals).values({
    userId: s.userId,
    amount: String(amount),
    bankName,
    accountNumber,
    note: note || null,
    status: "pending",
  });

  await db.execute(sql`
    UPDATE wallets SET balance = balance - ${Number(amount)}, updated_at = now()
    WHERE user_id = ${s.userId}
  `);

  return NextResponse.json({ ok: true });
}

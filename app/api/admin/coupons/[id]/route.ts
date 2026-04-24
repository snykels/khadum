import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (b.code !== undefined) await db.execute(sql`UPDATE coupons SET code=${b.code} WHERE id=${Number(id)}`);
  if (b.discountType !== undefined) await db.execute(sql`UPDATE coupons SET discount_type=${b.discountType} WHERE id=${Number(id)}`);
  if (b.discountValue !== undefined) await db.execute(sql`UPDATE coupons SET discount_value=${Number(b.discountValue)} WHERE id=${Number(id)}`);
  if (b.maxUses !== undefined) await db.execute(sql`UPDATE coupons SET max_uses=${Number(b.maxUses)} WHERE id=${Number(id)}`);
  if (b.expiresAt !== undefined) await db.execute(sql`UPDATE coupons SET expires_at=${b.expiresAt} WHERE id=${Number(id)}`);
  if (b.isActive !== undefined) await db.execute(sql`UPDATE coupons SET is_active=${!!b.isActive} WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM coupons WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

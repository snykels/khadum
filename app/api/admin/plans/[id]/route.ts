import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (b.name !== undefined) await db.execute(sql`UPDATE subscription_plans SET name=${b.name} WHERE id=${Number(id)}`);
  if (b.price !== undefined) await db.execute(sql`UPDATE subscription_plans SET price=${Number(b.price)} WHERE id=${Number(id)}`);
  if (b.features !== undefined) {
    const f = Array.isArray(b.features) ? JSON.stringify(b.features) : b.features;
    await db.execute(sql`UPDATE subscription_plans SET features=${f} WHERE id=${Number(id)}`);
  }
  if (b.isPopular !== undefined) await db.execute(sql`UPDATE subscription_plans SET is_popular=${!!b.isPopular} WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM subscription_plans WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

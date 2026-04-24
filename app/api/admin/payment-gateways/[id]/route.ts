import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (b.isActive !== undefined) await db.execute(sql`UPDATE payment_gateways SET is_active=${!!b.isActive} WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

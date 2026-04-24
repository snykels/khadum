import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (b.title !== undefined) await db.execute(sql`UPDATE banners SET title=${b.title} WHERE id=${Number(id)}`);
  if (b.position !== undefined) await db.execute(sql`UPDATE banners SET position=${b.position} WHERE id=${Number(id)}`);
  if (b.imageUrl !== undefined) await db.execute(sql`UPDATE banners SET image_url=${b.imageUrl} WHERE id=${Number(id)}`);
  if (b.link !== undefined) await db.execute(sql`UPDATE banners SET link=${b.link} WHERE id=${Number(id)}`);
  if (b.isActive !== undefined) await db.execute(sql`UPDATE banners SET is_active=${!!b.isActive} WHERE id=${Number(id)}`);
  if (b.expiresAt !== undefined) await db.execute(sql`UPDATE banners SET expires_at=${b.expiresAt} WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM banners WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  const fields = ['title','slug','content','status'].filter(f => b[f] !== undefined);
  if (!fields.length) return NextResponse.json({ ok: true });
  for (const f of fields) {
    const col = f === 'title' ? sql`title` : f === 'slug' ? sql`slug` : f === 'content' ? sql`content` : sql`status`;
    await db.execute(sql`UPDATE pages SET ${col}=${b[f]}, updated_at=NOW() WHERE id=${Number(id)}`);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM pages WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

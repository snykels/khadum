import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (b.title !== undefined) await db.execute(sql`UPDATE blog_posts SET title=${b.title} WHERE id=${Number(id)}`);
  if (b.content !== undefined) await db.execute(sql`UPDATE blog_posts SET content=${b.content} WHERE id=${Number(id)}`);
  if (b.author !== undefined) await db.execute(sql`UPDATE blog_posts SET author=${b.author} WHERE id=${Number(id)}`);
  if (b.status !== undefined) await db.execute(sql`UPDATE blog_posts SET status=${b.status} WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM blog_posts WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

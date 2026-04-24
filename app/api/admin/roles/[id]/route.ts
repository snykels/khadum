import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (b.name !== undefined) await db.execute(sql`UPDATE admin_roles SET name=${b.name} WHERE id=${Number(id)}`);
  if (b.permissions !== undefined) {
    const p = Array.isArray(b.permissions) ? JSON.stringify(b.permissions) : b.permissions;
    await db.execute(sql`UPDATE admin_roles SET permissions=${p} WHERE id=${Number(id)}`);
  }
  if (b.color !== undefined) await db.execute(sql`UPDATE admin_roles SET color=${b.color} WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  await db.execute(sql`DELETE FROM admin_roles WHERE id=${Number(id)}`);
  return NextResponse.json({ ok: true });
}

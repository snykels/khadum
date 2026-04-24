import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, name, permissions, color, users_count AS "usersCount" FROM admin_roles ORDER BY id`);
  return NextResponse.json({ roles: r.map((x: any) => ({ ...x, permissions: typeof x.permissions === 'string' ? JSON.parse(x.permissions) : x.permissions })) });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const perms = Array.isArray(b.permissions) ? JSON.stringify(b.permissions) : (b.permissions || '[]');
  await db.execute(sql`INSERT INTO admin_roles(name,permissions,color) VALUES(${b.name},${perms},${b.color||'bg-gray-100 text-gray-700'})`);
  return NextResponse.json({ ok: true });
}

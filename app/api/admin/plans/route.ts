import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, name, price, features, users_count AS "usersCount", is_popular AS "isPopular", sort_order AS "sortOrder" FROM subscription_plans ORDER BY sort_order`);
  return NextResponse.json({ plans: r.map((p: any) => ({ ...p, features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features })) });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const features = Array.isArray(b.features) ? JSON.stringify(b.features) : (b.features || '[]');
  await db.execute(sql`INSERT INTO subscription_plans(name,price,features,is_popular,sort_order) VALUES(${b.name},${Number(b.price)||0},${features},${!!b.isPopular},${Number(b.sortOrder)||999})`);
  return NextResponse.json({ ok: true });
}

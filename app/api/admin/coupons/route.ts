import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const r: any = await db.execute(sql`SELECT id, code, discount_type AS "discountType", discount_value AS "discountValue", used_count AS "usedCount", max_uses AS "maxUses", expires_at AS "expiresAt", is_active AS "isActive" FROM coupons ORDER BY id DESC`);
  return NextResponse.json({ coupons: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const b = await req.json();
  if (!b.code) return NextResponse.json({ error: "code required" }, { status: 400 });
  await db.execute(sql`INSERT INTO coupons(code,discount_type,discount_value,max_uses,expires_at,is_active) VALUES(${b.code},${b.discountType||'percent'},${Number(b.discountValue)||0},${Number(b.maxUses)||1000},${b.expiresAt||null},${b.isActive!==false})`);
  await db.execute(sql`INSERT INTO audit_log(user_id,user_name,action,target,type) VALUES(${s.userId || null},${s.name},'إنشاء كوبون',${b.code},'create')`);
  return NextResponse.json({ ok: true });
}

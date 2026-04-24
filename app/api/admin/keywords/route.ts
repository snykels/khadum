import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { keywords } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const r = await db.select().from(keywords).orderBy(desc(keywords.searches));
  return NextResponse.json({ keywords: r });
}

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { word } = await req.json();
  if (!word) return NextResponse.json({ error: "الكلمة مطلوبة" }, { status: 400 });
  try {
    const [k] = await db.insert(keywords).values({ word }).returning();
    return NextResponse.json({ keyword: k });
  } catch {
    return NextResponse.json({ error: "موجودة مسبقاً" }, { status: 409 });
  }
}

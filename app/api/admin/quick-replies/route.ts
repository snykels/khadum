import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quickReplies } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rows = await db.select().from(quickReplies).orderBy(desc(quickReplies.usageCount)).limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== "admin" && session.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { shortcode, title, body: text, category, variables } = body;
  if (!shortcode || !title || !text) {
    return NextResponse.json({ error: "shortcode, title, body مطلوبة" }, { status: 400 });
  }
  const [r] = await db
    .insert(quickReplies)
    .values({
      shortcode,
      title,
      body: text,
      category: category || "general",
      variables: (variables ?? []) as any,
      createdById: session.userId,
    })
    .returning();
  return NextResponse.json(r, { status: 201 });
}

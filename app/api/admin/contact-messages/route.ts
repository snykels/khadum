import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("contact-messages GET error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, subject, message } = body || {};
    if (!name || !phone || !message) {
      return NextResponse.json({ error: "الاسم ورقم الجوال والرسالة مطلوبة" }, { status: 400 });
    }
    const [row] = await db.insert(contactMessages).values({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      subject: subject ? String(subject).trim() : null,
      message: String(message).trim(),
    }).returning();
    return NextResponse.json({ ok: true, id: row.id, message: "تم إرسال رسالتك، سنعاود التواصل معك قريباً." });
  } catch {
    return NextResponse.json({ error: "تعذّر إرسال الرسالة، حاول لاحقاً" }, { status: 500 });
  }
}

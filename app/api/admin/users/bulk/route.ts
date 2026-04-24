import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, notifications } from "@/lib/schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth";

async function admin() {
  const s = await getSession();
  if (!s || s.role !== "admin") return null;
  return s;
}

export async function PATCH(req: NextRequest) {
  if (!(await admin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  const ids: number[] = (body.ids || []).map((x: any) => parseInt(x)).filter(Boolean);
  if (!ids.length) return NextResponse.json({ error: "اختر مستخدماً واحداً على الأقل" }, { status: 400 });

  const upd: any = {};
  if (typeof body.isSuspended === "boolean") {
    upd.isSuspended = body.isSuspended;
    upd.suspensionReason = body.isSuspended ? (body.reason || "تم الإيقاف بواسطة الإدارة") : null;
    upd.suspendedAt = body.isSuspended ? new Date() : null;
  }
  if (typeof body.isVerified === "boolean") upd.isVerified = body.isVerified;
  if (typeof body.isBlocked === "boolean") {
    upd.isBlocked = body.isBlocked;
    upd.blockReason = body.isBlocked ? (body.reason || "حظر إداري") : null;
    upd.blockedAt = body.isBlocked ? new Date() : null;
  }
  if (Object.keys(upd).length === 0) return NextResponse.json({ error: "لا تحديثات" }, { status: 400 });

  // protect locked accounts
  const targets = await db.select({ id: users.id, isLocked: users.isLocked, role: users.role }).from(users).where(inArray(users.id, ids));
  const allowedIds = targets.filter(t => !t.isLocked).map(t => t.id);
  if (!allowedIds.length) return NextResponse.json({ error: "كل الحسابات محمية" }, { status: 403 });

  // Enforce mutually-exclusive status for clients (active/suspended/blocked)
  const clientIds = targets.filter(t => !t.isLocked && t.role === "client").map(t => t.id);
  const nonClientIds = allowedIds.filter(id => !clientIds.includes(id));

  if (clientIds.length && (upd.isBlocked === true || upd.isSuspended === true)) {
    const clientUpd: any = { ...upd };
    if (upd.isBlocked === true) {
      clientUpd.isSuspended = false;
      clientUpd.suspensionReason = null;
      clientUpd.suspendedAt = null;
    } else if (upd.isSuspended === true) {
      clientUpd.isBlocked = false;
      clientUpd.blockReason = null;
      clientUpd.blockedAt = null;
    }
    await db.update(users).set(clientUpd).where(inArray(users.id, clientIds));
    if (nonClientIds.length) {
      await db.update(users).set(upd).where(inArray(users.id, nonClientIds));
    }
    return NextResponse.json({ ok: true, count: allowedIds.length, skipped: ids.length - allowedIds.length });
  }

  const updated = await db.update(users).set(upd).where(inArray(users.id, allowedIds)).returning({ id: users.id });
  return NextResponse.json({ ok: true, count: updated.length, skipped: ids.length - updated.length });
}

export async function DELETE(req: NextRequest) {
  if (!(await admin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ids: number[] = (body.ids || []).map((x: any) => parseInt(x)).filter(Boolean);
  if (!ids.length) return NextResponse.json({ error: "اختر مستخدماً واحداً على الأقل" }, { status: 400 });

  const targets = await db.select({ id: users.id, isLocked: users.isLocked }).from(users).where(inArray(users.id, ids));
  const allowedIds = targets.filter(t => !t.isLocked).map(t => t.id);
  if (!allowedIds.length) return NextResponse.json({ error: "كل الحسابات محمية" }, { status: 403 });

  const deleted = await db.delete(users).where(inArray(users.id, allowedIds)).returning({ id: users.id });
  return NextResponse.json({ ok: true, count: deleted.length, skipped: ids.length - deleted.length });
}

export async function POST(req: NextRequest) {
  // bulk in-app notification (and channel placeholder for whatsapp)
  if (!(await admin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  const ids: number[] = (body.ids || []).map((x: any) => parseInt(x)).filter(Boolean);
  const title = (body.title || "").trim();
  const message = (body.message || "").trim();
  const channel = body.channel === "whatsapp" ? "whatsapp" : "inapp";
  if (!ids.length || !title || !message) {
    return NextResponse.json({ error: "العنوان والرسالة والمستلمون مطلوبون" }, { status: 400 });
  }
  const rows = ids.map(uid => ({
    userId: uid,
    type: "admin_broadcast",
    title,
    message,
    channel,
    priority: "normal",
  }));
  await db.insert(notifications).values(rows);
  return NextResponse.json({ ok: true, count: rows.length });
}

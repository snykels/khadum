import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, hashPassword } from "@/lib/auth";

<<<<<<< HEAD
async function adminOnly() {
=======
async function admin() {
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const s = await getSession();
  if (!s || s.role !== "admin") return null;
  return s;
}

<<<<<<< HEAD
async function adminOrSupervisor() {
  const s = await getSession();
  if (!s || (s.role !== "admin" && s.role !== "supervisor")) return null;
  return s;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await adminOrSupervisor();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const isSupervisor = session.role === "supervisor";
=======
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await admin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const { id } = await ctx.params;
  const userId = parseInt(id);
  const [target] = await db.select().from(users).where(eq(users.id, userId));
  if (!target) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (target.isLocked) return NextResponse.json({ error: "حساب محمي" }, { status: 403 });

  const body = await req.json();
  const upd: any = {};
<<<<<<< HEAD
  if (!isSupervisor) {
    if (typeof body.name === "string") upd.name = body.name.trim();
    if (typeof body.email === "string") upd.email = body.email.trim().toLowerCase();
    if (typeof body.username === "string") upd.username = body.username.trim() || null;
    if (typeof body.phone === "string") upd.phone = body.phone.trim() || null;
    if (typeof body.location === "string") upd.location = body.location.trim() || null;
    if (typeof body.bio === "string") upd.bio = body.bio.trim() || null;
    if (typeof body.avatar === "string") upd.avatar = body.avatar.trim() || null;
    if (typeof body.role === "string") upd.role = body.role;
    if (typeof body.adminRole === "string" || body.adminRole === null) upd.adminRole = body.adminRole || null;
    if (typeof body.isVerified === "boolean") upd.isVerified = body.isVerified;
    if (body.password) upd.passwordHash = await hashPassword(body.password);
  }
=======
  if (typeof body.name === "string") upd.name = body.name.trim();
  if (typeof body.email === "string") upd.email = body.email.trim().toLowerCase();
  if (typeof body.username === "string") upd.username = body.username.trim() || null;
  if (typeof body.phone === "string") upd.phone = body.phone.trim() || null;
  if (typeof body.location === "string") upd.location = body.location.trim() || null;
  if (typeof body.bio === "string") upd.bio = body.bio.trim() || null;
  if (typeof body.avatar === "string") upd.avatar = body.avatar.trim() || null;
  if (typeof body.role === "string") upd.role = body.role;
  if (typeof body.adminRole === "string" || body.adminRole === null) upd.adminRole = body.adminRole || null;
  if (typeof body.isVerified === "boolean") upd.isVerified = body.isVerified;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  if (typeof body.isSuspended === "boolean") {
    upd.isSuspended = body.isSuspended;
    upd.suspensionReason = body.isSuspended ? (body.reason || "تم الإيقاف بواسطة الإدارة") : null;
    upd.suspendedAt = body.isSuspended ? new Date() : null;
  }
  if (typeof body.isBlocked === "boolean") {
    upd.isBlocked = body.isBlocked;
    upd.blockReason = body.isBlocked ? (body.reason || "حظر إداري") : null;
    upd.blockedAt = body.isBlocked ? new Date() : null;
  }
  if (target.role === "client") {
    if (upd.isBlocked === true) {
      upd.isSuspended = false;
      upd.suspensionReason = null;
      upd.suspendedAt = null;
    } else if (upd.isSuspended === true) {
      upd.isBlocked = false;
      upd.blockReason = null;
      upd.blockedAt = null;
    }
  }
<<<<<<< HEAD
=======
  if (body.password) upd.passwordHash = await hashPassword(body.password);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  const [u] = await db.update(users).set(upd).where(eq(users.id, userId)).returning();
  return NextResponse.json({ user: u });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
<<<<<<< HEAD
  if (!(await adminOnly())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
=======
  if (!(await admin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const { id } = await ctx.params;
  const userId = parseInt(id);
  const [target] = await db.select().from(users).where(eq(users.id, userId));
  if (!target) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (target.isLocked) return NextResponse.json({ error: "حساب المالك محمي ولا يمكن حذفه" }, { status: 403 });
  await db.delete(users).where(eq(users.id, userId));
  return NextResponse.json({ ok: true });
}

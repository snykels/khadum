import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth";
import { getIronSession } from "iron-session";
import { sessionOptions, sessionOptionsShort, type SessionData } from "@/lib/session-options";
import { cookies } from "next/headers";
import crypto from "crypto";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صحيح").max(120),
  password: z.string().min(1, "كلمة المرور مطلوبة").max(100),
  rememberMe: z.boolean().optional().default(false),
});

function hashUA(ua: string): string {
  return crypto.createHash("sha256").update(ua).digest("hex").slice(0, 16);
}

function getIpPrefix(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0].trim() || "unknown";
  const parts = ip.split(".");
  if (parts.length >= 3) return parts.slice(0, 3).join(".");
  const v6parts = ip.split(":");
  if (v6parts.length >= 3) return v6parts.slice(0, 3).join(":");
  return ip;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة" },
      { status: 400 }
    );
  }
  const { email, password, rememberMe } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "تم تعليق حسابك. يرجى التواصل مع الإدارة" },
        { status: 403 }
      );
    }

    const ua = req.headers.get("user-agent") ?? "";
    const uaHash = hashUA(ua);
    const ipPrefix = getIpPrefix(req);

    const opts = rememberMe ? sessionOptions : sessionOptionsShort;
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, opts);

    session.userId = user.id;
    session.email = user.email;
    session.name = user.name;
    session.role = user.role;
    session.rememberMe = rememberMe;
    session.uaHash = uaHash;
    session.ipPrefix = ipPrefix;
    session.loginAt = Date.now();
    await session.save();

    const avatarUrl = (user as any).avatarUrl ?? null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

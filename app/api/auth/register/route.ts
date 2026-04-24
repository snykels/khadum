import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword, getSession } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(80),
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صحيح").max(120),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .max(100)
    .refine((p) => /[A-Z]/.test(p), "يجب أن تحتوي على حرف إنجليزي كبير على الأقل")
    .refine((p) => /[a-z]/.test(p), "يجب أن تحتوي على حرف إنجليزي صغير على الأقل")
    .refine((p) => /[0-9]/.test(p), "يجب أن تحتوي على رقم على الأقل"),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  role: z.enum(["client", "freelancer"]).optional().default("client"),
});

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "بيانات غير صحيحة";
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const { name, email, password, phone, role } = parsed.data;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجّل مسبقاً" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        phone: phone ?? null,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    const session = await getSession();
    session.userId = created.id;
    session.email = created.email;
    session.name = created.name;
    session.role = created.role;
    await session.save();

    return NextResponse.json({ user: created });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجّل مسبقاً" },
        { status: 409 }
      );
    }
    console.error("register error:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

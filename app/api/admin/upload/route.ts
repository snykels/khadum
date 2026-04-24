import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || (s.role !== "admin" && s.role !== "supervisor")) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "لا يوجد ملف" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "صورة فقط" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "أكبر من 10MB" }, { status: 400 });

  const dir = join(process.cwd(), "public", "uploads");
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6) || "bin";
  const fname = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, fname), buf);

  const url = `/uploads/${fname}`;
  await logAudit(s, "رفع ملف", url, "create");
  return NextResponse.json({ ok: true, url });
}

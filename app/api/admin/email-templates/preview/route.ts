import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { renderBlocksToHtml, applyVars, sendEmail } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const s = await getSession(); if (!s || s.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const b = await req.json();
  const blocks = Array.isArray(b.blocks) ? b.blocks : [];
  const vars = b.vars && typeof b.vars === "object" ? b.vars : {};
  const html = renderBlocksToHtml(blocks, vars);
  const subject = applyVars(b.subject || "", vars);
  if (b.sendTo) {
    const r = await sendEmail(b.sendTo, subject, html);
    return NextResponse.json({ ok: r.ok, html, subject, provider: r.provider });
  }
  return NextResponse.json({ ok: true, html, subject });
}

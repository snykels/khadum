import { db } from "./db";
import { sql } from "drizzle-orm";

type Settings = Record<string, string>;

export async function loadSettings(ns: string): Promise<Settings> {
  try {
    const rows = (await db.execute(sql`SELECT key, value FROM settings WHERE ns=${ns}`)) as Array<{ key: string; value: string }>;
    const out: Settings = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  } catch {
    return {};
  }
}

export async function sendWhatsApp(phone: string, message: string): Promise<{ ok: boolean; provider: string; info?: string }> {
  const cfg = await loadSettings("whatsapp");
  const token = cfg.apiToken || process.env.WHATSAPP_TOKEN;
  const phoneId = cfg.phoneNumberId || process.env.WHATSAPP_PHONE_ID;
  if (token && phoneId) {
    try {
      const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messaging_product: "whatsapp", to: phone.replace(/[^\d]/g, ""), type: "text", text: { body: message } }),
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, provider: "graph", info: data?.error?.message || "send failed" };
      return { ok: true, provider: "graph" };
    } catch (e) {
      return { ok: false, provider: "graph", info: String(e) };
    }
  }
  console.log(`[WhatsApp DEV] To ${phone}: ${message}`);
  return { ok: true, provider: "console" };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; provider: string; info?: string }> {
  const cfg = await loadSettings("email");

  // 1. Resend (primary — uses RESEND_API_KEY or admin-configured key)
  const resendKey = cfg.resendApiKey || process.env.RESEND_API_KEY;
  const fromEmail = cfg.fromEmail || "خدوم <help@khadum.app>";
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({ from: fromEmail, to, subject, html });
      if (error) return { ok: false, provider: "resend", info: error.message };
      return { ok: true, provider: "resend" };
    } catch (e) {
      return { ok: false, provider: "resend", info: String(e) };
    }
  }

  // 2. SMTP fallback
  const host = cfg.smtpHost || process.env.SMTP_HOST;
  const port = Number(cfg.smtpPort || process.env.SMTP_PORT || "587");
  const user = cfg.smtpUser || process.env.SMTP_USER;
  const pass = cfg.smtpPassword || process.env.SMTP_PASSWORD;
  const smtpFrom = cfg.fromEmail || user || "noreply@khadum.app";
  if (host && user && pass) {
    try {
      const nodemailer = await import("nodemailer");
      const t = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
      await t.sendMail({ from: smtpFrom, to, subject, html });
      return { ok: true, provider: "smtp" };
    } catch (e) {
      return { ok: false, provider: "smtp", info: String(e) };
    }
  }

  // 3. Console fallback (development)
  console.log(`[Email DEV] To ${to} | ${subject}\n${html.slice(0, 500)}...`);
  return { ok: true, provider: "console" };
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ===== Email block templates =====
export type EmailBlock =
  | { type: "heading"; text: string; color?: string; align?: "right" | "center" | "left"; size?: "sm" | "md" | "lg" }
  | { type: "text"; text: string; color?: string; align?: "right" | "center" | "left"; size?: "small" | "normal" | "large"; bold?: boolean }
  | { type: "button"; text: string; href: string; color?: string; align?: "right" | "center" | "left" }
  | { type: "image"; src: string; alt?: string; width?: number; align?: "right" | "center" | "left" }
  | { type: "divider"; color?: string }
  | { type: "spacer"; height?: number }
  | { type: "html"; html: string };

export function applyVars(s: string, vars: Record<string, string>): string {
  return s.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

import { isKhadomBlock, renderKhadomBlock, wrapKhadomEmail, type KhadomEmailBlock } from "./blocks/emailKhadom";

export function renderBlocksToHtml(blocks: any[], vars: Record<string, string> = {}): string {
  const usesKhadom = (blocks || []).some(b => isKhadomBlock(b));
  if (usesKhadom) {
    const rows = (blocks || []).map(b => {
      if (isKhadomBlock(b)) return renderKhadomBlock(b as KhadomEmailBlock, vars);
      const html = renderLegacyBlock(b, vars);
      return html ? `<tr><td style="background:#fff;padding:0 24px">${html}</td></tr>` : "";
    }).join("");
    return wrapKhadomEmail(rows);
  }
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;color:#333">${(blocks || []).map(b => renderLegacyBlock(b, vars)).join("")}</div>`;
}

function renderLegacyBlock(b: any, vars: Record<string, string>): string {
    const align = (b as any).align || "right";
    if (b.type === "heading") {
      const sz = b.size === "lg" ? 28 : b.size === "sm" ? 18 : 22;
      return `<h2 style="color:${b.color || "#34cc30"};text-align:${align};font-size:${sz}px;margin:18px 0 10px">${applyVars(b.text, vars)}</h2>`;
    }
    if (b.type === "text") {
      const sz = b.size === "small" ? 13 : b.size === "large" ? 18 : 15;
      const fw = b.bold ? "bold" : "normal";
      return `<p style="color:${b.color || "#333"};text-align:${align};font-size:${sz}px;font-weight:${fw};line-height:1.7;margin:10px 0">${applyVars(b.text, vars)}</p>`;
    }
    if (b.type === "button") {
      return `<p style="text-align:${align};margin:24px 0"><a href="${applyVars(b.href, vars)}" style="background:${b.color || "#34cc30"};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">${applyVars(b.text, vars)}</a></p>`;
    }
    if (b.type === "image") {
      const w = b.width ? `width:${b.width}px;` : "max-width:100%;";
      return `<p style="text-align:${align};margin:14px 0"><img src="${applyVars(b.src, vars)}" alt="${applyVars(b.alt || "", vars)}" style="${w}height:auto;border-radius:8px"/></p>`;
    }
    if (b.type === "divider") return `<hr style="border:none;border-top:1px solid ${b.color || "#e5e7eb"};margin:18px 0"/>`;
    if (b.type === "spacer") return `<div style="height:${b.height || 16}px"></div>`;
    if (b.type === "html") return applyVars(b.html, vars);
    return "";
}

export async function sendTemplatedEmail(slug: string, to: string, vars: Record<string, string>): Promise<{ ok: boolean; provider: string; info?: string }> {
  try {
    const rows = (await db.execute(sql`SELECT subject, blocks, is_active FROM email_templates WHERE slug=${slug} LIMIT 1`)) as Array<{ subject: string; blocks: any; is_active: boolean }>;
    if (rows.length && rows[0].is_active) {
      const subject = applyVars(rows[0].subject, vars);
      const blocks = (typeof rows[0].blocks === "string" ? JSON.parse(rows[0].blocks) : rows[0].blocks) as EmailBlock[];
      const html = renderBlocksToHtml(blocks, vars);
      return sendEmail(to, subject, html);
    }
  } catch (e) {
    console.error("template error:", e);
  }
  return { ok: false, provider: "none", info: "template not found" };
}

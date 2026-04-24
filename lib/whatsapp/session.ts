/**
 * WhatsApp session management.
 * Stores per-phone conversational state in PostgreSQL `whatsapp_sessions`.
 * Sessions auto-expire after 24h of inactivity (lazy check on load).
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export type Stage =
  | "intake"
  | "matching"
  | "payment"
  | "in_progress"
  | "delivery"
  | "dispute"
  | "rating"
  | "closed";

export interface SessionContext {
  category?: string;
  budget?: number;
  duration_days?: number;
  description?: string;
  title?: string;
  freelancer_id?: number;
  client_name?: string;
  agreed_amount?: number;
  [k: string]: unknown;
}

export interface WhatsAppSession {
  id: number;
  phone: string;
  stage: Stage;
  projectId: number | null;
  context: SessionContext;
  summary: string | null;
  messageCount: number;
  lastActivity: string;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function normalizePhone(p: string): string {
  return p.replace(/[^\d]/g, "");
}

interface RawSessionRow {
  id: number;
  phone: string;
  stage: Stage;
  projectId: number | null;
  context: SessionContext | string | null;
  summary: string | null;
  messageCount: number;
  lastActivity: string;
}

function normalizeRow(s: RawSessionRow): WhatsAppSession {
  const ctx =
    typeof s.context === "string"
      ? (JSON.parse(s.context) as SessionContext)
      : s.context || {};
  return {
    id: s.id,
    phone: s.phone,
    stage: s.stage,
    projectId: s.projectId,
    context: ctx,
    summary: s.summary,
    messageCount: s.messageCount,
    lastActivity: s.lastActivity,
  };
}

export async function getOrCreateSession(
  phone: string,
): Promise<WhatsAppSession> {
  const normalized = normalizePhone(phone);
  const rows = (await db.execute(sql`
    SELECT id, phone, stage, project_id AS "projectId",
           context, summary, message_count AS "messageCount",
           last_activity AS "lastActivity"
    FROM whatsapp_sessions WHERE phone=${normalized} LIMIT 1
  `)) as unknown as RawSessionRow[];

  if (rows.length) {
    const s = rows[0];
    const lastMs = new Date(s.lastActivity).getTime();
    if (Date.now() - lastMs > SESSION_TTL_MS) {
      // Expired — reset to intake but preserve phone.
      await db.execute(sql`
        UPDATE whatsapp_sessions
        SET stage='intake', project_id=NULL, context='{}'::jsonb,
            summary=NULL, message_count=0, last_activity=NOW()
        WHERE id=${s.id}
      `);
      return {
        id: s.id,
        phone: normalized,
        stage: "intake",
        projectId: null,
        context: {},
        summary: null,
        messageCount: 0,
        lastActivity: new Date().toISOString(),
      };
    }
    return normalizeRow(s);
  }

  const created = (await db.execute(sql`
    INSERT INTO whatsapp_sessions(phone) VALUES(${normalized})
    RETURNING id, phone, stage, project_id AS "projectId",
              context, summary, message_count AS "messageCount",
              last_activity AS "lastActivity"
  `)) as unknown as RawSessionRow[];
  return normalizeRow(created[0]);
}

/**
 * Bumps message_count and last_activity. Cheap, called on every inbound.
 */
export async function bumpActivity(phone: string): Promise<void> {
  const normalized = normalizePhone(phone);
  await db.execute(sql`
    UPDATE whatsapp_sessions
    SET message_count = message_count + 1, last_activity = NOW()
    WHERE phone = ${normalized}
  `);
}

export async function setStage(phone: string, stage: Stage): Promise<void> {
  const normalized = normalizePhone(phone);
  await db.execute(sql`
    UPDATE whatsapp_sessions SET stage=${stage}, last_activity=NOW() WHERE phone=${normalized}
  `);
}

export async function setProjectId(
  phone: string,
  projectId: number | null,
): Promise<void> {
  const normalized = normalizePhone(phone);
  await db.execute(sql`
    UPDATE whatsapp_sessions SET project_id=${projectId}, last_activity=NOW() WHERE phone=${normalized}
  `);
}

export async function mergeContext(
  phone: string,
  patch: SessionContext,
): Promise<void> {
  const normalized = normalizePhone(phone);
  await db.execute(sql`
    UPDATE whatsapp_sessions
    SET context = context || ${JSON.stringify(patch)}::jsonb,
        last_activity = NOW()
    WHERE phone = ${normalized}
  `);
}

/**
 * Find a client session whose `current_offer.phone` matches the given
 * freelancer phone. Used to route freelancer replies (نعم/لا) back to the
 * right pending order. Returns null if no active offer is targeting them.
 */
export async function findSessionByCurrentOfferPhone(
  freelancerPhone: string,
): Promise<WhatsAppSession | null> {
  const normalized = normalizePhone(freelancerPhone);
  if (!normalized) return null;
  const rows = (await db.execute(sql`
    SELECT id, phone, stage, project_id AS "projectId",
           context, summary, message_count AS "messageCount",
           last_activity AS "lastActivity"
    FROM whatsapp_sessions
    WHERE context->'current_offer'->>'phone' = ${normalized}
      AND project_id IS NOT NULL
      -- Only return sessions whose offer has not yet expired.
      -- expires_at is stored as ISO string inside the JSONB.
      AND (
        context->'current_offer'->>'expires_at' IS NULL
        OR (context->'current_offer'->>'expires_at')::timestamptz > NOW()
      )
    ORDER BY (context->'current_offer'->>'expires_at')::timestamptz DESC
    LIMIT 1
  `)) as unknown as RawSessionRow[];
  return rows.length ? normalizeRow(rows[0]) : null;
}

export async function setSummary(
  phone: string,
  summary: string,
): Promise<void> {
  const normalized = normalizePhone(phone);
  await db.execute(sql`
    UPDATE whatsapp_sessions SET summary=${summary}, last_activity=NOW() WHERE phone=${normalized}
  `);
}

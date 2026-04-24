import { db } from "./db";
import { sql } from "drizzle-orm";
import type { SessionData } from "./auth";

export type AuditType = "info" | "create" | "update" | "delete" | "approve" | "reject" | "login" | "view" | "export" | "warning";

export async function logAudit(session: SessionData | null | undefined, action: string, target: string = "", type: AuditType = "info") {
  try {
    await db.execute(sql`
      INSERT INTO audit_log(user_id, user_name, action, target, type)
      VALUES(${session?.userId ?? null}, ${session?.name ?? "نظام"}, ${action}, ${target}, ${type})
    `);
  } catch { /* swallow audit errors */ }
}

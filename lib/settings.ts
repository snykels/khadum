/**
 * Shared DB settings loader — قراءة الإعدادات من جدول settings
 * Usage: const cfg = await loadSettings("tap");
 *        const key = cfg.secretKey || process.env.TAP_SECRET_KEY || "";
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

export type Settings = Record<string, string>;

let cache: Record<string, { data: Settings; ts: number }> = {};
const TTL_MS = 30_000; // 30 seconds

export async function loadSettings(ns: string): Promise<Settings> {
  const now = Date.now();
  if (cache[ns] && now - cache[ns].ts < TTL_MS) return cache[ns].data;
  try {
    const rows = (await db.execute(
      sql`SELECT key, value FROM settings WHERE ns=${ns}`,
    )) as Array<{ key: string; value: string }>;
    const out: Settings = {};
    for (const r of rows) out[r.key] = r.value;
    cache[ns] = { data: out, ts: now };
    return out;
  } catch {
    return cache[ns]?.data ?? {};
  }
}

export function bustSettingsCache(ns?: string) {
  if (ns) delete cache[ns];
  else cache = {};
}

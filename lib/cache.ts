import { db } from "./db";
import { cacheStore } from "./schema";
import { eq, lte, sql } from "drizzle-orm";

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const rows = await db.select().from(cacheStore).where(eq(cacheStore.key, key)).limit(1);
  if (!rows.length) return null;
  const row = rows[0];
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    await db.delete(cacheStore).where(eq(cacheStore.key, key));
    return null;
  }
  return row.value as T;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;
  await db
    .insert(cacheStore)
    .values({ key, value: value as any, expiresAt, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: cacheStore.key,
      set: { value: value as any, expiresAt, updatedAt: new Date() },
    });
}

export async function cacheDel(key: string): Promise<void> {
  await db.delete(cacheStore).where(eq(cacheStore.key, key));
}

export async function cacheCleanupExpired(): Promise<number> {
  const result = await db.delete(cacheStore).where(lte(cacheStore.expiresAt, new Date()));
  return (result as any).rowCount ?? 0;
}

function lockKeyToInt(key: string): bigint {
  const MULT = BigInt(131);
  const MASK = BigInt("9223372036854775807"); // 0x7fffffffffffffff
  let h = BigInt(0);
  for (const ch of key) {
    h = (h * MULT + BigInt(ch.charCodeAt(0))) & MASK;
  }
  return h;
}

export async function withAdvisoryLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const lockId = lockKeyToInt(key);
  await db.execute(sql`SELECT pg_advisory_lock(${lockId.toString()}::bigint)`);
  try {
    return await fn();
  } finally {
    await db.execute(sql`SELECT pg_advisory_unlock(${lockId.toString()}::bigint)`);
  }
}

export async function tryAdvisoryLock(key: string): Promise<boolean> {
  const lockId = lockKeyToInt(key);
  const r: any = await db.execute(sql`SELECT pg_try_advisory_lock(${lockId.toString()}::bigint) AS got`);
  return Boolean(r?.rows?.[0]?.got ?? r?.[0]?.got);
}

export async function releaseAdvisoryLock(key: string): Promise<void> {
  const lockId = lockKeyToInt(key);
  await db.execute(sql`SELECT pg_advisory_unlock(${lockId.toString()}::bigint)`);
}

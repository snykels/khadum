import Database from "@replit/database";

export type ConversationState =
  | "idle"
  | "greeting"
  | "collecting_request"
  | "matching_freelancer"
  | "awaiting_payment"
  | "in_progress"
  | "completed";

export interface ConversationSession {
  phone: string;
  state: ConversationState;
  step: string;
  context: Record<string, unknown>;
  lastActivity: number;
  expiresAt: number;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const KEY_PREFIX = "wa_session:";

let dbInstance: Database | null = null;
function getDb(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

function keyFor(phone: string): string {
  return `${KEY_PREFIX}${phone}`;
}

function unwrap<T>(res: unknown): T | null {
  if (res && typeof res === "object" && "value" in (res as Record<string, unknown>)) {
    return ((res as { value: T | null }).value) ?? null;
  }
  return (res as T | null) ?? null;
}

export async function getSession(phone: string): Promise<ConversationSession | null> {
  if (!phone) return null;
  const db = getDb();
  const raw = await db.get(keyFor(phone));
  const session = unwrap<ConversationSession>(raw);
  if (!session) return null;

  if (typeof session.expiresAt !== "number" || Date.now() > session.expiresAt) {
    await clearSession(phone);
    return null;
  }
  return session;
}

export async function setSession(
  phone: string,
  data: Partial<Omit<ConversationSession, "phone" | "lastActivity" | "expiresAt">>
): Promise<ConversationSession> {
  if (!phone) throw new Error("phone is required");
  const db = getDb();
  const existing = await getSession(phone);
  const now = Date.now();
  const session: ConversationSession = {
    phone,
    state: data.state ?? existing?.state ?? "idle",
    step: data.step ?? existing?.step ?? "start",
    context: { ...(existing?.context ?? {}), ...(data.context ?? {}) },
    lastActivity: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  await db.set(keyFor(phone), session);
  return session;
}

export async function clearSession(phone: string): Promise<void> {
  if (!phone) return;
  const db = getDb();
  await db.delete(keyFor(phone));
}

export async function touchSession(phone: string): Promise<ConversationSession | null> {
  const existing = await getSession(phone);
  if (!existing) return null;
  return setSession(phone, {
    state: existing.state,
    step: existing.step,
    context: existing.context,
  });
}

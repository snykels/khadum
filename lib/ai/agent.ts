/**
 * Core WhatsApp AI agent.
 * Loads conversation context, builds the system prompt, calls GPT-4o-mini
 * with function calling in a tool-loop until a final text reply is produced.
 */

import OpenAI from "openai";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { buildSystemPrompt, type Stage } from "@/lib/ai/prompts";
import { TOOLS_BY_NAME, openAITools } from "@/lib/ai/tools";
<<<<<<< HEAD
import { loadSettings } from "@/lib/settings";
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

interface HistoryRow {
  role: "user" | "assistant" | "tool" | "system";
  body: string;
  toolCallId: string | null;
  toolName: string | null;
  metadata: Record<string, unknown> | null;
}

interface CountRow {
  n: number;
}

interface ToolCallLike {
  id: string;
  type?: string;
  function?: { name: string; arguments?: string };
}

const MODEL = "gpt-4o-mini";
const MAX_TURNS = 6; // hard cap on tool-loop iterations
const HISTORY_LIMIT = 10;
const SUMMARIZE_THRESHOLD = 10;

let openai: OpenAI | null = null;
<<<<<<< HEAD
let openaiKey: string | null = null;

async function getOpenAIClient(): Promise<OpenAI> {
  const cfg = await loadSettings("ai").catch(() => ({}));
  const key =
    (cfg as Record<string, string>).openaiApiKey ||
    process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured — أضفه في لوحة التحكم ← الذكاء الاصطناعي");
  if (openai && openaiKey === key) return openai;
  openai = new OpenAI({ apiKey: key });
  openaiKey = key;
=======
function client(): OpenAI {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");
  openai = new OpenAI({ apiKey: key });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return openai;
}

interface AgentInput {
  phone: string;
  userText: string;
  stage: Stage;
  projectId: number | null;
  context: Record<string, unknown>;
  summary: string | null;
}

interface AgentOutput {
  reply: string;
  toolCalls: Array<{
    name: string;
    args: Record<string, unknown>;
    result: unknown;
  }>;
  newSummary?: string;
}

type ChatMsg = OpenAI.Chat.Completions.ChatCompletionMessageParam;

async function loadHistory(phone: string): Promise<ChatMsg[]> {
  const rows = (await db.execute(sql`
    SELECT role, body, tool_call_id AS "toolCallId", tool_name AS "toolName",
           metadata
    FROM whatsapp_messages
    WHERE phone = ${phone}
      AND role IN ('user','assistant','tool')
    ORDER BY created_at DESC
    LIMIT ${HISTORY_LIMIT}
  `)) as unknown as HistoryRow[];

  // We can't reconstruct OpenAI tool_call objects perfectly from history,
  // so we keep history as plain text turns to stay safe.
  return rows
    .reverse()
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.body,
    }));
}

interface PersistMeta {
  toolName?: string;
  toolCallId?: string;
  [k: string]: unknown;
}

async function persistTurn(
  phone: string,
  role: "user" | "assistant" | "tool" | "system",
  body: string,
  meta: PersistMeta = {},
  direction: "in" | "out" = role === "assistant" ? "out" : "in",
  waMessageId?: string,
): Promise<void> {
  await db.execute(sql`
    INSERT INTO whatsapp_messages(phone, direction, body, role, wa_message_id, metadata, tool_name, tool_call_id)
    VALUES(${phone}, ${direction}, ${body}, ${role},
           ${waMessageId || null},
           ${JSON.stringify(meta)}::jsonb,
           ${meta.toolName || null},
           ${meta.toolCallId || null})
    ON CONFLICT (wa_message_id) DO NOTHING
  `);
}

async function maybeSummarize(
  phone: string,
  current: string | null,
): Promise<string | null> {
  const cnt = (await db.execute(sql`
    SELECT COUNT(*)::int AS n FROM whatsapp_messages
    WHERE phone=${phone} AND role IN ('user','assistant')
  `)) as unknown as CountRow[];
  const n = cnt[0]?.n || 0;
  if (n < SUMMARIZE_THRESHOLD) return current;

  const rows = (await db.execute(sql`
    SELECT role, body FROM whatsapp_messages
    WHERE phone=${phone} AND role IN ('user','assistant')
    ORDER BY created_at DESC LIMIT ${SUMMARIZE_THRESHOLD}
  `)) as unknown as Array<{ role: string; body: string }>;
  const transcript = rows
    .reverse()
    .map((r) => `${r.role}: ${r.body}`)
    .join("\n");

  try {
<<<<<<< HEAD
    const c = await getOpenAIClient();
    const res = await c.chat.completions.create({
=======
    const res = await client().chat.completions.create({
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      model: MODEL,
      temperature: 0.2,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content:
            "لخّص المحادثة التالية في 3 أسطر بالعربية. اذكر: ماذا يريد العميل، الميزانية، المرحلة الحالية، أي قرار معلق.",
        },
        { role: "user", content: transcript },
      ],
    });
    return res.choices[0]?.message?.content?.trim() || current;
  } catch {
    return current;
  }
}

export async function runAgent(input: AgentInput): Promise<AgentOutput> {
<<<<<<< HEAD
  const c = await getOpenAIClient();
=======
  const c = client();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const sys = buildSystemPrompt({
    stage: input.stage,
    projectId: String(input.projectId ?? ""),
    projectCode: String(input.projectId ?? "—"),
    projectTitle: String(
      (input.context as { title?: unknown }).title || "طلب جديد",
    ),
    senderRole: "client",
    clientName:
      typeof (input.context as { client_name?: unknown }).client_name === "string"
        ? ((input.context as { client_name?: string }).client_name as string)
        : undefined,
  });

  const history = await loadHistory(input.phone);

  const messages: ChatMsg[] = [
    { role: "system", content: sys },
  ];
  if (input.summary) {
    messages.push({
      role: "system",
      content: `ملخص ما سبق من المحادثة:\n${input.summary}`,
    });
  }
  if (Object.keys(input.context || {}).length) {
    messages.push({
      role: "system",
      content: `سياق الجلسة الحالية (لا تكشفه): ${JSON.stringify(input.context)}`,
    });
  }
  messages.push(...history);
  messages.push({ role: "user", content: input.userText });

  const toolCallsLog: AgentOutput["toolCalls"] = [];
  let finalReply = "";
  // projectId can be set mid-loop by create_order; subsequent tools in the
  // same turn (e.g. offer_to_freelancer) need the fresh value via ctx.
  let liveProjectId: number | null = input.projectId;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await c.chat.completions.create({
      model: MODEL,
      temperature: 0.85,
      max_tokens: 250,
      tools: openAITools(),
      messages,
    });
    const choice = res.choices[0];
    const msg = choice?.message;
    if (!msg) break;

    const rawCalls = (msg.tool_calls || []) as unknown as ToolCallLike[];
    const functionCalls = rawCalls.filter(
      (tc): tc is ToolCallLike & { function: { name: string; arguments?: string } } =>
        !!tc.function && (tc.type === "function" || tc.type === undefined),
    );
    if (!functionCalls.length) {
      finalReply = (msg.content || "").trim();
      break;
    }

    // Append assistant message with tool_calls to keep loop coherent.
    messages.push({
      role: "assistant",
      content: msg.content || "",
      tool_calls: msg.tool_calls,
    } as ChatMsg);

    for (const tc of functionCalls) {
      const name = tc.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
      } catch {
        args = {};
      }
      const def = TOOLS_BY_NAME[name];
      const result = !def
        ? { ok: false, error: `unknown tool: ${name}` }
        : await def
            .execute(args, { phone: input.phone, projectId: liveProjectId })
            .catch((e: unknown) => ({ ok: false, error: String(e) }));
      toolCallsLog.push({ name, args, result });

      // Refresh liveProjectId from create_order so a subsequent
      // offer_to_freelancer call in the same turn sees the new id.
      if (
        name === "create_order" &&
        result &&
        typeof result === "object" &&
        (result as { ok?: unknown }).ok === true
      ) {
        const data = (result as { data?: { project_id?: unknown } }).data;
        const pid = Number(data?.project_id);
        if (Number.isFinite(pid) && pid > 0) liveProjectId = pid;
      }
      await persistTurn(
        input.phone,
        "tool",
        JSON.stringify({ name, args, result }).slice(0, 4000),
        { toolName: name, toolCallId: tc.id },
        "out",
      );
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result).slice(0, 4000),
      } as ChatMsg);
    }
  }

  if (!finalReply) {
    finalReply = "عذراً، صار خلل بسيط. ممكن تعيد رسالتك؟";
  }

  await persistTurn(input.phone, "assistant", finalReply, {}, "out");
  const newSummary = await maybeSummarize(input.phone, input.summary);

  return { reply: finalReply, toolCalls: toolCallsLog, newSummary: newSummary || undefined };
}

import { STYLE_RULES, HARD_LIMITS, HEADER_FORMAT } from "./core";
import {
  STAGE_INTAKE,
  STAGE_MATCHING,
  STAGE_PAYMENT,
  STAGE_IN_PROGRESS,
  STAGE_DELIVERY,
  STAGE_DISPUTE,
  STAGE_CLOSED,
} from "./stages";
import {
  ANTI_LEAK,
  FILE_HANDLING,
  CONTEXT_ISOLATION,
  KNOWLEDGE_BASE,
} from "./safety";

export type Stage =
  | "intake"
  | "matching"
  | "payment"
  | "in_progress"
  | "delivery"
  | "dispute"
  | "closed";

const STAGE_MAP: Record<Stage, string> = {
  intake: STAGE_INTAKE,
  matching: STAGE_MATCHING,
  payment: STAGE_PAYMENT,
  in_progress: STAGE_IN_PROGRESS,
  delivery: STAGE_DELIVERY,
  dispute: STAGE_DISPUTE,
  closed: STAGE_CLOSED,
};

export interface PromptContext {
  stage: Stage;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  senderRole: "client" | "freelancer" | "admin";
  clientName?: string;
  freelancerName?: string;
}

/**
 * يبني system prompt كامل للمرحلة الحالية.
 * يجب تمريره مع كل استدعاء للنموذج.
 */
export function buildSystemPrompt(ctx: PromptContext): string {
  return [
    "أنت مساعد منصة خدوم داخل واتساب.",
    STYLE_RULES,
    HARD_LIMITS,
    CONTEXT_ISOLATION,
    ANTI_LEAK,
    FILE_HANDLING,
    KNOWLEDGE_BASE,
    HEADER_FORMAT,
    `المرحلة الحالية: ${ctx.stage}`,
    STAGE_MAP[ctx.stage],
    `سياق الجلسة (لا تكشفه للمستخدم):`,
    JSON.stringify(
      {
        project_id: ctx.projectId,
        project_code: ctx.projectCode,
        sender_role: ctx.senderRole,
      },
      null,
      0,
    ),
  ].join("\n\n");
}

export {
  STYLE_RULES,
  HARD_LIMITS,
  HEADER_FORMAT,
  STAGE_INTAKE,
  STAGE_MATCHING,
  STAGE_PAYMENT,
  STAGE_IN_PROGRESS,
  STAGE_DELIVERY,
  STAGE_DISPUTE,
  STAGE_CLOSED,
  ANTI_LEAK,
  FILE_HANDLING,
  CONTEXT_ISOLATION,
  KNOWLEDGE_BASE,
};

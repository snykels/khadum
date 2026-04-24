import { randomBytes } from "node:crypto";

export function generatePublicCode(prefix: string = "K"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function generateOrderCode(): string {
  return generatePublicCode("ORD");
}

export function generateConversationCode(): string {
  return generatePublicCode("CNV");
}

export function generateDisputeCode(): string {
  return generatePublicCode("DSP");
}

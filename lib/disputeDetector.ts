export interface DisputeSignal {
  type: string;
  weight: number;
  evidence: string;
}

export interface DisputeDetectionResult {
  shouldRaise: boolean;
  confidence: number;
  category: string;
  signals: DisputeSignal[];
  suggestedPriority: "low" | "normal" | "high" | "urgent";
}

const ANGER_KEYWORDS = [
  { words: ["نصاب", "نصب", "احتيال", "محتال", "سرقة"], weight: 0.9, type: "fraud_accusation" },
  { words: ["مش راضي", "مو راضي", "مش حلو", "سيء", "زفت", "كذب"], weight: 0.5, type: "dissatisfaction" },
  { words: ["استرداد", "ارجع فلوسي", "رد المبلغ", "refund", "ابي فلوسي"], weight: 0.7, type: "refund_request" },
  { words: ["ما سلم", "لم يسلم", "تأخر", "مايرد", "ما يرد", "اختفى"], weight: 0.6, type: "non_delivery" },
  { words: ["شكوى", "اشتكي", "ابلاغ", "report"], weight: 0.7, type: "complaint" },
  { words: ["نزاع", "خلاف", "مشكلة كبيرة"], weight: 0.8, type: "explicit_dispute" },
];

export function detectDispute(text: string): DisputeDetectionResult {
  const lower = text.toLowerCase();
  const signals: DisputeSignal[] = [];
  let total = 0;
  const categories = new Map<string, number>();

  for (const { words, weight, type } of ANGER_KEYWORDS) {
    for (const w of words) {
      if (lower.includes(w.toLowerCase())) {
        signals.push({ type, weight, evidence: w });
        total += weight;
        categories.set(type, (categories.get(type) || 0) + weight);
      }
    }
  }

  const exclamations = (text.match(/[!؟]{2,}/g) || []).length;
  if (exclamations) {
    signals.push({ type: "high_emotion", weight: 0.2 * exclamations, evidence: `${exclamations} علامات تعجب متكررة` });
    total += 0.2 * exclamations;
  }

  const allCaps = text.split(/\s+/).filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  if (allCaps >= 2) {
    signals.push({ type: "shouting", weight: 0.3, evidence: `${allCaps} كلمات بحروف كبيرة` });
    total += 0.3;
  }

  const confidence = Math.min(1, total);
  const shouldRaise = confidence >= 0.7;

  let category = "general";
  let maxWeight = 0;
  for (const [k, v] of categories.entries()) {
    if (v > maxWeight) { maxWeight = v; category = k; }
  }

  let priority: "low" | "normal" | "high" | "urgent" = "normal";
  if (confidence >= 0.9) priority = "urgent";
  else if (confidence >= 0.7) priority = "high";
  else if (confidence < 0.3) priority = "low";

  return { shouldRaise, confidence, category, signals, suggestedPriority: priority };
}

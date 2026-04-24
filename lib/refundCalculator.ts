export interface RefundContext {
  orderAmount: number;
  paidAmount: number;
  refundedAmount: number;
  status: "pending" | "active" | "completed" | "cancelled" | "disputed";
  acceptedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  dueDate?: Date | null;
  freelancerDelivered?: boolean;
  clientApproved?: boolean;
}

export interface RefundCalculation {
  refundable: number;
  percentage: number;
  retainedFee: number;
  rationale: string;
  policy: "full" | "partial_75" | "partial_50" | "partial_25" | "none";
}

const PLATFORM_FEE_PERCENT = 5;

export function calculateRefund(ctx: RefundContext): RefundCalculation {
  const remaining = Math.max(0, ctx.paidAmount - ctx.refundedAmount);

  if (remaining <= 0) {
    return { refundable: 0, percentage: 0, retainedFee: 0, rationale: "لا يوجد مبلغ مدفوع متاح للاسترداد", policy: "none" };
  }

  if (ctx.status === "pending") {
    return {
      refundable: remaining,
      percentage: 100,
      retainedFee: 0,
      rationale: "الطلب لم يبدأ بعد — استرداد كامل",
      policy: "full",
    };
  }

  if (ctx.status === "completed" && ctx.clientApproved) {
    return {
      refundable: 0,
      percentage: 0,
      retainedFee: 0,
      rationale: "الطلب مكتمل ومُعتمد من العميل — لا استرداد",
      policy: "none",
    };
  }

  if (ctx.status === "active" && !ctx.startedAt) {
    return {
      refundable: remaining,
      percentage: 100,
      retainedFee: 0,
      rationale: "تم القبول لكن العمل لم يبدأ — استرداد كامل",
      policy: "full",
    };
  }

  if (ctx.status === "active" && ctx.startedAt && !ctx.freelancerDelivered) {
    const fee = round2((remaining * PLATFORM_FEE_PERCENT) / 100);
    return {
      refundable: round2(remaining * 0.75) - 0,
      percentage: 75,
      retainedFee: fee,
      rationale: "العمل بدأ ولم يُسلَّم بعد — استرداد 75%",
      policy: "partial_75",
    };
  }

  if (ctx.freelancerDelivered && !ctx.clientApproved) {
    return {
      refundable: round2(remaining * 0.5),
      percentage: 50,
      retainedFee: round2((remaining * PLATFORM_FEE_PERCENT) / 100),
      rationale: "تم التسليم بانتظار اعتماد العميل — استرداد 50%",
      policy: "partial_50",
    };
  }

  if (ctx.status === "disputed") {
    return {
      refundable: round2(remaining * 0.5),
      percentage: 50,
      retainedFee: 0,
      rationale: "الطلب في نزاع — يحدد الأدمن النسبة النهائية. الاقتراح الافتراضي 50%",
      policy: "partial_50",
    };
  }

  if (ctx.status === "cancelled") {
    return {
      refundable: remaining,
      percentage: 100,
      retainedFee: 0,
      rationale: "الطلب ملغي — استرداد كامل",
      policy: "full",
    };
  }

  return {
    refundable: round2(remaining * 0.25),
    percentage: 25,
    retainedFee: 0,
    rationale: "حالة غير معتادة — استرداد جزئي 25% للمراجعة اليدوية",
    policy: "partial_25",
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

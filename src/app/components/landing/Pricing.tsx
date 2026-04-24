'use client';

import { motion } from "motion/react";
import { Check, X, Crown } from "lucide-react";
import { useEffect, useState } from "react";

interface Plan {
  id: number;
  name: string;
  price: string | number;
  features: string[];
  isPopular?: boolean;
  badge?: string;
  description?: string;
  commission?: string;
  period?: string;
  cta?: string;
}

const fallback: Plan[] = [
  { id: 0, name: "مجاني", price: "0", period: "للأبد", description: "مثالية للبداية واختبار المنصة", commission: "15% على كل طلب", features: ["نشر حتى 3 خدمات", "استقبال طلبات غير محدودة", "محادثة مع العملاء", "محفظة رقمية"], cta: "ابدأ مجاناً", isPopular: false },
  { id: 1, name: "أساسي", price: "49", period: "شهرياً", description: "للمستقلين الجادين", commission: "10% على كل طلب", features: ["نشر حتى 10 خدمات", "استقبال طلبات غير محدودة", "أولوية متوسطة في البحث", "شارة موثّق"], cta: "اشترك", isPopular: false },
  { id: 2, name: "احترافي", price: "99", period: "شهرياً", description: "للمستقلين المحترفين", commission: "7% على كل طلب", features: ["نشر حتى 25 خدمة", "أولوية عالية", "إحصاءات متقدمة", "دعم خلال 4 ساعات"], cta: "اشترك", isPopular: true, badge: "الأكثر طلباً" },
  { id: 3, name: "نخبة", price: "199", period: "شهرياً", description: "للخبراء", commission: "5% على كل طلب", features: ["خدمات غير محدودة", "ظهور في الأعلى دائماً", "إحصاءات احترافية", "مدير حساب مخصص"], cta: "انضم", isPopular: false },
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<Plan[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/plans")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.plans) && d.plans.length) setPlans(d.plans); })
      .finally(() => setLoading(false));
  }, []);

  const display = plans.map(p => ({
    ...p,
    period: p.period || "شهرياً",
    commission: p.commission || "",
    cta: p.cta || "اشترك الآن",
    description: p.description || "",
    badge: p.isPopular ? (p.badge || "الأكثر طلباً") : undefined,
    displayPrice: billingPeriod === "yearly" ? Math.round(Number(p.price) * 12 * 0.8).toString() : String(p.price),
  }));

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] dark:text-white mb-4">اختر الباقة المناسبة لك</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">ابدأ مجاناً وطوّر حسابك متى أردت</p>
          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full p-1">
            <button onClick={() => setBillingPeriod("monthly")} className={`px-6 py-2 rounded-full transition-all ${billingPeriod === "monthly" ? "bg-[#485869] text-white" : "text-gray-600 dark:text-gray-300"}`}>شهري</button>
            <button onClick={() => setBillingPeriod("yearly")} className={`px-6 py-2 rounded-full transition-all ${billingPeriod === "yearly" ? "bg-[#485869] text-white" : "text-gray-600 dark:text-gray-300"}`}>سنوي <span className="text-[#34cc30] text-xs mr-1">(وفّر 20%)</span></button>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{[0,1,2,3].map(i => <div key={i} className="h-96 bg-white dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
        ) : (
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {display.map((plan, index) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} viewport={{ once: true }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] ${plan.isPopular ? "border-4 border-[#34cc30] lg:scale-105" : "border-2 border-gray-100 dark:border-gray-700"}`}>
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#34cc30] to-[#2eb829] text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                  <Crown size={14} />{plan.badge}
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#485869] dark:text-white mb-2">{plan.name}</h3>
                {plan.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 h-10">{plan.description}</p>}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-[#485869] dark:text-white">{plan.displayPrice}</span>
                    <span className="text-gray-600 dark:text-gray-300">ريال</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{billingPeriod === "yearly" ? "سنوياً" : plan.period}</div>
                </div>
                {plan.commission && (
                  <div className="bg-gradient-to-r from-[#34cc30]/10 to-[#34cc30]/5 rounded-lg p-3 mb-6 text-sm text-center">
                    <span className="text-gray-600 dark:text-gray-300">العمولة: </span><span className="font-bold text-[#485869] dark:text-white">{plan.commission}</span>
                  </div>
                )}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2"><Check className="text-[#34cc30] flex-shrink-0 mt-0.5" size={18} /><span className="text-sm text-gray-700 dark:text-gray-200">{f}</span></li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-medium transition-all ${plan.isPopular ? "bg-[#34cc30] text-white hover:bg-[#2eb829] shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-[#485869] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"}`}>{plan.cta}</button>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">جميع الباقات تشمل: حماية المدفوعات · دعم النزاعات · شهادة SSL · تشفير البيانات</div>
      </div>
    </section>
  );
}

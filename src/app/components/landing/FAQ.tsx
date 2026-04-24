'use client';

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = {
  clients: [
    {
      q: "هل دفعي محمي إذا لم يُسلَّم العمل؟",
      a: "نعم تماماً. مبلغك محفوظ في حساب ضمان (Escrow) داخل المنصة ولا يُحوَّل للمستقل إلا بعد تأكيدك على استلام العمل. في حال أي مشكلة فريق الدعم يضمن استرداد مبلغك كاملاً."
    },
    {
      q: "كيف أختار المستقل المناسب؟",
      a: "يمكنك مقارنة المستقلين بناءً على تقييماتهم، أعمالهم السابقة في معرض البورتفوليو، عدد الطلبات المكتملة، ومستوى الحساب. كما يمكنك التواصل معهم قبل الطلب لتوضيح احتياجاتك."
    },
    {
      q: "ماذا يحدث إذا لم يعجبني العمل المُسلَّم؟",
      a: "لديك حق طلب التعديل حسب عدد مرات التعديل المتفق عليها في الخدمة. إذا استمرت المشكلة يمكنك فتح نزاع وسيتدخل فريقنا للفصل وضمان حقك."
    },
    {
      q: "ما طرق الدفع المتاحة؟",
      a: "نقبل Mada، Visa، Mastercard، Apple Pay، STC Pay، وPayPal. جميع المدفوعات مؤمّنة بأعلى معايير التشفير."
    }
  ],
  freelancers: [
    {
      q: "هل التسجيل مجاني؟",
      a: "نعم، التسجيل مجاني تماماً ويمكنك نشر حتى 3 خدمات في الباقة المجانية واستقبال طلبات غير محدودة. لا تحتاج بطاقة بنكية للتسجيل."
    },
    {
      q: "كيف ومتى أستلم أرباحي؟",
      a: "بعد تأكيد العميل على استلام العمل تُودَع أرباحك فوراً في محفظتك الرقمية على المنصة. يمكنك طلب السحب لحسابك البنكي أو محفظة STC Pay في أي وقت."
    },
    {
      q: "كم تأخذ المنصة عمولة؟",
      a: "العمولة تتراوح بين 5% إلى 15% حسب باقتك. الباقة المجانية عمولتها 15%، وكلما رقيت بباقتك كلما انخفضت العمولة حتى تصل لـ 5% في باقة النخبة."
    },
    {
      q: "هل يمكنني العمل من أي دولة عربية؟",
      a: "نعم، خدوم مفتوحة لجميع الدول العربية. يمكن للمستقل من أي دولة التسجيل ونشر خدماته واستقبال طلبات من عملاء عبر المنطقة."
    }
  ]
};

export default function FAQ() {
  const [activeTab, setActiveTab] = useState<"clients" | "freelancers">("clients");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const currentFaqs = activeTab === "clients" ? faqs.clients : faqs.freelancers;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] mb-4">
            أسئلة يسألها الجميع
          </h2>
          <p className="text-gray-600">
            إجابات واضحة على أكثر ما يدور في ذهنك
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setActiveTab("clients")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "clients"
                ? "bg-[#485869] text-white"
                : "bg-gray-100 text-[#485869]"
            }`}
          >
            للعملاء
          </button>
          <button
            onClick={() => setActiveTab("freelancers")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "freelancers"
                ? "bg-[#485869] text-white"
                : "bg-gray-100 text-[#485869]"
            }`}
          >
            للمستقلين
          </button>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {currentFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#34cc30] transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-right flex justify-between items-center gap-4"
              >
                <span className="font-bold text-[#485869]">{faq.q}</span>
                <ChevronDown
                  className={`flex-shrink-0 text-[#34cc30] transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  size={24}
                />
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  suppressHydrationWarning
                  className="px-6 pb-6"
                >
                  <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="#" className="text-[#34cc30] hover:text-[#2eb829] font-medium">
            لديك سؤال آخر؟ تواصل مع الدعم ←
          </a>
        </div>
      </div>
    </section>
  );
}

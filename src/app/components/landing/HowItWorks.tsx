'use client';

import { motion } from "motion/react";
import { Search, CreditCard, CheckCircle, User, Inbox, DollarSign } from "lucide-react";
import { useState } from "react";

const clientSteps = [
  {
    icon: Search,
    title: "راسلنا على واتساب",
    subtitle: "أرسل رسالة وقل لنا وش تحتاج",
    description: "أرسل رسالة واتساب لرقم خدوم واوصف الخدمة اللي تبيها. نظامنا الذكي يفهم طلبك ويعرض عليك أفضل المستقلين المناسبين.",
  },
  {
    icon: CreditCard,
    title: "اختر وادفع",
    subtitle: "اختر المستقل المناسب وادفع بأمان",
    description: "قارن بين المستقلين المقترحين، اختر اللي يناسبك، وادفع بطريقتك المفضلة. مبلغك محفوظ ولن يصل للمستقل إلا بعد تأكيدك.",
  },
  {
    icon: CheckCircle,
    title: "استلم وقيّم",
    subtitle: "استلم عملك وقيّم تجربتك",
    description: "المستقل يتواصل معك مباشرة عبر واتساب، يسلّم العمل في الوقت المحدد، وإن لم يعجبك لديك حق التعديل أو الاسترداد.",
  },
];

const freelancerSteps = [
  {
    icon: User,
    title: "أنشئ ملفك",
    subtitle: "أنشئ ملفك الاحترافي مجاناً",
    description: "سجّل، أضف مهاراتك وأعمالك السابقة، وانشر خدماتك أمام مئات الآلاف من العملاء.",
  },
  {
    icon: Inbox,
    title: "استقبل الطلبات",
    subtitle: "استقبل طلبات العملاء وتواصل معهم",
    description: "تواصل مع عملائك، افهم احتياجاتهم، ونفّذ الطلب في الوقت المتفق عليه.",
  },
  {
    icon: DollarSign,
    title: "سلّم واكسب",
    subtitle: "سلّم عملك واستلم أرباحك",
    description: "بعد قبول العميل للعمل، تُودَع أرباحك مباشرة في محفظتك وتستطيع سحبها لحسابك البنكي.",
  },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");

  const steps = activeTab === "client" ? clientSteps : freelancerSteps;

  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] mb-4">
            بسيطة، سريعة، موثوقة.
          </h2>
          <p className="text-gray-600">
            ثلاث خطوات تفصلك عن إنجاز مشروعك أو بدء كسبك كمستقل
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={() => setActiveTab("client")}
            className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "client"
                ? "bg-[#485869] text-white shadow-lg"
                : "bg-gray-100 text-[#485869] hover:bg-gray-200"
            }`}
          >
            🛒 أنا عميل أبحث عن خدمة
          </button>
          <button
            onClick={() => setActiveTab("freelancer")}
            className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "freelancer"
                ? "bg-[#485869] text-white shadow-lg"
                : "bg-gray-100 text-[#485869] hover:bg-gray-200"
            }`}
          >
            💼 أنا مستقل أريد العمل
          </button>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 right-0 w-full h-0.5 bg-gradient-to-l from-[#34cc30] to-[#485869] opacity-20 -z-10" />
              )}

              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-xl p-6 hover:border-[#34cc30] hover:shadow-lg transition-all">
                {/* Icon */}
                <div className="bg-gradient-to-br from-[#34cc30] to-[#2eb829] w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <step.icon className="text-white" size={28} />
                </div>

                {/* Step Number */}
                <div className="text-[#34cc30] font-bold text-sm mb-2">
                  الخطوة {index + 1}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#485869] mb-2">
                  {step.title}
                </h3>

                {/* Subtitle */}
                <h4 className="text-[#34cc30] font-medium mb-3">
                  {step.subtitle}
                </h4>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
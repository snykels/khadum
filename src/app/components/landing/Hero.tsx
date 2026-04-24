'use client';

import { motion } from "motion/react";
import { CheckCircle2, Star } from "lucide-react";
import Link from "next/link";

function toEnglishDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-right"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#34cc30]/20 rounded-full px-4 py-2 mb-6">
              <span className="text-[#34cc30]">✦</span>
              <span className="text-sm text-[#485869]">منصة المستقلين السعودية الأولى</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#485869] mb-6 leading-tight">
              اطلب ما تحتاج،<br />
              اربح من مهارتك.
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto md:mx-0">
              خدوم منصة سعودية تربطك بمستقلين محترفين عبر واتساب فقط — بدون تطبيق، بدون تعقيد. أرسل رسالة واتساب، وصف اللي تحتاجه، وخلّنا نتكفل بالباقي.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-6">
              <a 
                href="https://wa.me/966511809878?text=مرحبا، أبغى أطلب خدمة"
                target="_blank"
                rel="noreferrer"
                className="bg-[#34cc30] text-white px-8 py-4 rounded-lg hover:bg-[#2eb829] transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                اطلب خدمة الآن عبر واتساب
              </a>
              <a 
                href="#services"
                className="bg-white border-2 border-[#485869] text-[#485869] px-8 py-4 rounded-lg hover:bg-[#485869] hover:text-white transition-all"
              >
                استعرض الخدمات
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-gray-600">
              <CheckCircle2 size={16} className="text-[#34cc30]" />
              <span>لا توجد رسوم تسجيل</span>
              <span className="text-gray-400">·</span>
              <CheckCircle2 size={16} className="text-[#34cc30]" />
              <span>الدفع آمن</span>
              <span className="text-gray-400">·</span>
              <CheckCircle2 size={16} className="text-[#34cc30]" />
              <span>دعم على مدار الساعة</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-[#485869]">{toEnglishDigits("+50,000")}</div>
                <div className="text-sm text-gray-600">مستقل محترف</div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-[#485869]">{toEnglishDigits("+120,000")}</div>
                <div className="text-sm text-gray-600">خدمة منشورة</div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-[#485869]">{toEnglishDigits("+300,000")}</div>
                <div className="text-sm text-gray-600">طلب مكتمل</div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-[#485869] flex items-center justify-center md:justify-start gap-1">
                  4.9 <Star size={20} className="fill-[#34cc30] text-[#34cc30]" />
                </div>
                <div className="text-sm text-gray-600">متوسط التقييم</div>
              </div>
            </div>
          </motion.div>

          {/* Left Side - WhatsApp Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto border-8 border-gray-200">
              {/* WhatsApp Header */}
              <div className="bg-[#34cc30] text-white p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold">خدوم - منصة الخدمات</div>
                  <div className="text-xs text-white/80">نشط الآن</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 bg-[#e5ddd5] min-h-[400px] space-y-3">
                {/* Incoming Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-lg p-3 shadow max-w-[80%]">
                    <p className="text-sm">مرحباً! أحتاج مصمم لإنشاء هوية بصرية لمشروعي</p>
                    <span className="text-xs text-gray-500">10:23 ص</span>
                  </div>
                </motion.div>

                {/* Outgoing Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex justify-end"
                >
                  <div className="bg-[#dcf8c6] rounded-lg p-3 shadow max-w-[80%]">
                    <p className="text-sm">تم! وجدت لك 127 مصمم محترف 🎨</p>
                    <span className="text-xs text-gray-500">10:24 ص</span>
                  </div>
                </motion.div>

                {/* Service Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ delay: 1.6 }}
                  className="flex justify-end"
                >
                  <div className="bg-white rounded-lg p-3 shadow max-w-[85%] border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#34cc30]/20 flex items-center justify-center text-sm">
                        م
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold">محمد الغامدي</div>
                        <div className="flex items-center gap-1 text-xs text-[#34cc30]">
                          <Star size={12} className="fill-current" />
                          <span>4.9</span>
                          <span className="text-gray-400">(312 تقييم)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mb-2">تصميم هوية بصرية كاملة احترافية</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#485869]">يبدأ من 150 ر.س</span>
                      <button className="bg-[#34cc30] text-white text-xs px-3 py-1 rounded">
                        اطلب الآن
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Typing Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0 }}
                  transition={{ delay: 2, repeat: Infinity, duration: 1.5 }}
                  suppressHydrationWarning
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-lg p-3 shadow">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="bg-white p-3 border-t flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="اكتب رسالة..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
                  disabled
                />
                <button className="bg-[#34cc30] text-white w-10 h-10 rounded-full flex items-center justify-center">
                  ←
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
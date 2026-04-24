'use client';

import { motion } from "motion/react";
import { MessageCircle, Zap, Shield, Clock, Send } from "lucide-react";

export default function AppDownload() {
  return (
    <section className="py-16 bg-gradient-to-br from-[#485869] to-[#3a4655] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-[#34cc30]/20 rounded-full px-4 py-2 mb-6">
              <MessageCircle size={18} className="text-[#34cc30]" />
              <span className="text-sm text-[#34cc30] font-medium">بدون تحميل · بدون تطبيق</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              كل شي عبر واتساب — بس أرسل رسالة
            </h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              ما تحتاج تحمّل أي تطبيق. ارسل رسالة واتساب لرقم خدوم، واطلب الخدمة اللي تبيها. نوصلك بأفضل المستقلين مباشرة ونتابع طلبك من البداية للنهاية.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Zap, text: "رد فوري — المحادثة تبدأ خلال ثوانٍ" },
                { icon: MessageCircle, text: "تواصل مباشر مع المستقل عبر واتساب" },
                { icon: Shield, text: "دفع آمن ومحمي — مبلغك محفوظ حتى تستلم" },
                { icon: Clock, text: "متابعة حالة الطلب لحظة بلحظة في المحادثة" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <feature.icon size={20} />
                  </div>
                  <span className="text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/966XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl hover:bg-[#1ebe5b] transition-all shadow-lg hover:shadow-2xl"
            >
              <Send size={22} />
              <div className="text-right">
                <div className="text-xs text-white/80">ابدأ الآن</div>
                <div className="font-bold">راسلنا على واتساب</div>
              </div>
            </a>

            <p className="text-white/50 text-sm mt-4">
              +85,000 عميل طلبوا خدماتهم عبر واتساب هذا الشهر
            </p>
          </motion.div>

          {/* Left - WhatsApp Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative max-w-sm mx-auto">
              {/* Phone Frame */}
              <div className="bg-white rounded-[3rem] shadow-2xl p-4 border-8 border-gray-800">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2.5rem] overflow-hidden">
                  {/* WhatsApp Header */}
                  <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#34cc30] flex items-center justify-center text-xs font-bold">خ</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">خدوم</div>
                      <div className="text-xs text-white/70">متصل</div>
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="p-3 bg-[#e5ddd5] space-y-2.5 min-h-[350px]">
                    {/* User message */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      viewport={{ once: true }}
                      className="flex justify-start"
                    >
                      <div className="bg-white rounded-lg p-2.5 shadow max-w-[80%]">
                        <p className="text-sm">السلام عليكم، أبي مصمم شعار لمشروعي</p>
                        <span className="text-[10px] text-gray-400">2:30 م</span>
                      </div>
                    </motion.div>

                    {/* Bot reply */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      viewport={{ once: true }}
                      className="flex justify-end"
                    >
                      <div className="bg-[#dcf8c6] rounded-lg p-2.5 shadow max-w-[80%]">
                        <p className="text-sm">أهلاً! وجدت لك 3 مصممين متخصصين بالشعارات 🎨</p>
                        <span className="text-[10px] text-gray-400">2:30 م ✓✓</span>
                      </div>
                    </motion.div>

                    {/* Service card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      viewport={{ once: true }}
                      className="flex justify-end"
                    >
                      <div className="bg-white rounded-lg p-3 shadow max-w-[85%] border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#34cc30]/20 flex items-center justify-center text-xs font-bold text-[#485869]">أ</div>
                          <div>
                            <div className="text-xs font-bold text-[#485869]">أحمد المالكي</div>
                            <div className="text-[10px] text-[#34cc30]">⭐ 4.9 · 215 طلب</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">تصميم شعار احترافي مع الهوية البصرية</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#485869]">200 ر.س</span>
                          <span className="bg-[#34cc30] text-white text-[10px] px-2 py-1 rounded">اختر</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* User choosing */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 }}
                      viewport={{ once: true }}
                      className="flex justify-start"
                    >
                      <div className="bg-white rounded-lg p-2.5 shadow max-w-[80%]">
                        <p className="text-sm">أبيه هو 👍</p>
                        <span className="text-[10px] text-gray-400">2:31 م</span>
                      </div>
                    </motion.div>

                    {/* Confirmation */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 }}
                      viewport={{ once: true }}
                      className="flex justify-end"
                    >
                      <div className="bg-[#dcf8c6] rounded-lg p-2.5 shadow max-w-[80%]">
                        <p className="text-sm">تم! ✅ أحمد بيتواصل معك الحين مباشرة</p>
                        <span className="text-[10px] text-gray-400">2:31 م ✓✓</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                suppressHydrationWarning
                className="absolute -top-4 -right-4 bg-[#25D366] text-white p-3 rounded-full shadow-xl"
              >
                <MessageCircle size={20} />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                suppressHydrationWarning
                className="absolute -bottom-4 -left-4 bg-white text-[#485869] p-3 rounded-full shadow-xl"
              >
                <Zap size={20} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

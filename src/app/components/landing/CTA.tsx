'use client';

import { motion } from "motion/react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#485869] via-[#3a4655] to-[#485869] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#34cc30] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#34cc30] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            جاهز تبدأ؟
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            سواء كنت تبحث عن خدمة أو تريد تقديمها — خدوم هي وجهتك. انضم اليوم وكن جزءاً من أكبر مجتمع عمل حر في العالم العربي.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/apply"
              className="bg-[#34cc30] text-white px-10 py-4 rounded-xl hover:bg-[#2eb829] transition-all hover:shadow-2xl text-lg font-medium flex items-center justify-center gap-2"
            >
              سجّل كمستقل ←
            </Link>
            <a
              href="#services"
              className="bg-white text-[#485869] px-10 py-4 rounded-xl hover:bg-gray-100 transition-all text-lg font-medium"
            >
              استعرض الخدمات
            </a>
          </div>

          <p className="text-sm text-white/70">
            +50,000 شخص انضموا هذا العام · لا بطاقة بنكية مطلوبة للبدء
          </p>
        </motion.div>
      </div>
    </section>
  );
}

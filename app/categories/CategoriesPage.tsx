"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Palette, Code, FileText, Megaphone, Video, Mic, BarChart3, Cpu, Camera, Globe, Music, BookOpen, PenTool, Layout, Shield, Truck } from "lucide-react";

const allCategories = [
  { icon: Palette, name: "تصميم جرافيك", sub: "شعارات، هويات بصرية، مطبوعات", count: "+12,000", color: "#e91e8c", bg: "#fce4f3", slug: "design" },
  { icon: Code, name: "برمجة وتطوير", sub: "مواقع، تطبيقات، API، أتمتة", count: "+9,500", color: "#2196f3", bg: "#e3f2fd", slug: "programming" },
  { icon: FileText, name: "كتابة وترجمة", sub: "محتوى، مقالات، ترجمة احترافية", count: "+8,200", color: "#34cc30", bg: "#e8f5e9", slug: "writing" },
  { icon: Megaphone, name: "تسويق رقمي", sub: "سوشيال ميديا، إعلانات، SEO", count: "+7,800", color: "#ff9800", bg: "#fff3e0", slug: "marketing" },
  { icon: Video, name: "فيديو ومونتاج", sub: "مونتاج، موشن، إعلانات فيديو", count: "+6,400", color: "#9c27b0", bg: "#f3e5f5", slug: "video" },
  { icon: Mic, name: "تسجيل صوتي", sub: "تعليق صوتي، بودكاست، مؤثرات", count: "+3,100", color: "#f44336", bg: "#ffebee", slug: "audio" },
  { icon: BarChart3, name: "إدارة أعمال", sub: "إدارة مشاريع، بيانات، خطط", count: "+4,600", color: "#3f51b5", bg: "#e8eaf6", slug: "business" },
  { icon: Cpu, name: "الذكاء الاصطناعي", sub: "برومتات، نماذج، أتمتة AI", count: "+2,900", color: "#00bcd4", bg: "#e0f7fa", slug: "ai" },
  { icon: Camera, name: "التصوير والفوتوغرافيا", sub: "تصوير منتجات، رياضة، طبيعة", count: "+1,800", color: "#607d8b", bg: "#eceff1", slug: "photography" },
  { icon: Globe, name: "خدمات عالمية", sub: "بحث، تواصل دولي، تمثيل تجاري", count: "+2,200", color: "#009688", bg: "#e0f2f1", slug: "global" },
  { icon: Music, name: "موسيقى وصوتيات", sub: "ألحان، موسيقى خلفية، مكسجة", count: "+1,500", color: "#e91e63", bg: "#fce4ec", slug: "music" },
  { icon: BookOpen, name: "التعليم والتدريب", sub: "دروس، شروحات، كتب إلكترونية", count: "+3,400", color: "#4caf50", bg: "#e8f5e9", slug: "education" },
  { icon: PenTool, name: "فنون وإبداع", sub: "رسم يدوي، خط عربي، فن رقمي", count: "+2,700", color: "#ff5722", bg: "#fbe9e7", slug: "art" },
  { icon: Layout, name: "تصميم UI/UX", sub: "واجهات تطبيقات، تجربة مستخدم", count: "+4,100", color: "#673ab7", bg: "#ede7f6", slug: "ux" },
  { icon: Shield, name: "أمن المعلومات", sub: "اختبار اختراق، حماية، مراجعة", count: "+900", color: "#f44336", bg: "#ffebee", slug: "security" },
  { icon: Truck, name: "خدمات ميدانية", sub: "توصيل، جولات، خدمات محلية", count: "+1,200", color: "#795548", bg: "#efebe9", slug: "field" },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-[#34cc30]"><ArrowRight size={20} /></Link>
          <div>
            <h1 className="text-lg font-bold text-[#485869]">جميع التصنيفات</h1>
            <p className="text-xs text-gray-500">{allCategories.length} تخصص · أرسل رسالة واتساب وابدأ فوراً</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {allCategories.map((cat, i) => (
            <motion.a
              key={cat.slug}
              href={`https://wa.me/966511809878?text=${encodeURIComponent(`أبغى خدمة في تخصص: ${cat.name}`)}`}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-2xl border-2 border-gray-100 p-5 cursor-pointer group transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: cat.bg }}
              >
                <cat.icon size={24} style={{ color: cat.color }} />
              </div>
              <h3 className="font-bold text-[#485869] mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.sub}</p>
              <div
                className="inline-block text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: cat.bg, color: cat.color }}
              >
                {cat.count} خدمة
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-l from-[#34cc30] to-[#2bb028] rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">لم تجد ما تبحث عنه؟</h2>
          <p className="text-white/80 mb-4 text-sm">أرسل لنا رسالة واتساب وسنجد لك المستقل المناسب</p>
          <a
            href={`https://wa.me/966511809878?text=${encodeURIComponent("مرحبا، أبغى خدمة")}`}
            target="_blank"
            rel="noreferrer"
            className="bg-white text-[#34cc30] font-bold px-6 py-3 rounded-xl inline-block hover:bg-gray-50 transition"
          >
            تواصل عبر واتساب
          </a>
        </div>
      </main>
    </div>
  );
}

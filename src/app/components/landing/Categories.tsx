'use client';

import { motion } from "motion/react";
import { Palette, Code, FileText, Megaphone, Video, Mic, BarChart3, Cpu } from "lucide-react";

const categories = [
  { icon: Palette, name: "تصميم جرافيك", count: "+12,000 خدمة", color: "text-pink-500", bg: "bg-pink-50" },
  { icon: Code, name: "برمجة وتطوير", count: "+9,500 خدمة", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: FileText, name: "كتابة وترجمة", count: "+8,200 خدمة", color: "text-green-500", bg: "bg-green-50" },
  { icon: Megaphone, name: "تسويق رقمي", count: "+7,800 خدمة", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Video, name: "فيديو ومونتاج", count: "+6,400 خدمة", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Mic, name: "تسجيل صوتي", count: "+3,100 خدمة", color: "text-red-500", bg: "bg-red-50" },
  { icon: BarChart3, name: "إدارة أعمال", count: "+4,600 خدمة", color: "text-indigo-500", bg: "bg-indigo-50" },
  { icon: Cpu, name: "الذكاء الاصطناعي", count: "+2,900 خدمة", color: "text-cyan-500", bg: "bg-cyan-50" },
];

export default function Categories() {
  return (
    <section className="py-16 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] mb-4">
            تصفّح حسب التخصص
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-[#34cc30] hover:shadow-lg transition-all">
                <div className={`${category.bg} w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className={`${category.color} w-7 h-7`} />
                </div>
                <h3 className="font-bold text-[#485869] mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/categories" className="text-[#34cc30] hover:text-[#2eb829] font-medium flex items-center gap-2 mx-auto justify-center">
            عرض جميع التصنيفات (16 تخصص) ←
          </a>
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from "motion/react";
import { Star, TrendingUp, Award } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const topEarners = [
  {
    name: "محمد الغامدي",
    title: "مصمم جرافيك وهوية بصرية",
    location: "الرياض",
    rating: 5.0,
    orders: 847,
    totalEarned: "312,000",
    badge: "🏆 الأعلى أرباحاً",
    image: "https://images.unsplash.com/photo-1720722023448-8e67fca07e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
  },
  {
    name: "سارة القحطاني",
    title: "كاتبة محتوى ومصممة",
    location: "جدة",
    rating: 4.9,
    orders: 1203,
    totalEarned: "289,500",
    badge: "🥈 الثانية في الأرباح",
    image: "https://images.unsplash.com/photo-1606593320367-47b1069ea23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
  },
  {
    name: "خالد الدوسري",
    title: "خبير تسويق رقمي",
    location: "الدمام",
    rating: 4.8,
    orders: 519,
    totalEarned: "198,000",
    badge: "🥉 الثالث في الأرباح",
    image: "https://images.unsplash.com/photo-1589114207353-1fc98a11070b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
  },
];

export default function TopFreelancers() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 mb-4">
            <TrendingUp size={16} className="text-yellow-600" />
            <span className="text-sm text-yellow-700 font-medium">أكثر ربحاً هذا الشهر</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] mb-3">
            أبرز مستقلينا
          </h2>
          <p className="text-gray-500 text-sm">
            أعلى ثلاثة مستقلين أرباحاً هذا الشهر على خدوم
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {topEarners.map((freelancer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group cursor-pointer relative ${index === 0 ? "ring-2 ring-yellow-400" : ""}`}
            >
              {index === 0 && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full">#1</div>
              )}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#34cc30]/20 shrink-0">
                    <ImageWithFallback src={freelancer.image} alt={freelancer.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#485869] mb-1 truncate">{freelancer.name}</h3>
                    <p className="text-xs text-gray-500 mb-1 truncate">{freelancer.title}</p>
                    <span className="text-xs text-gray-400">📍 {freelancer.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <div className="flex justify-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className={i < Math.floor(freelancer.rating) ? "fill-[#34cc30] text-[#34cc30]" : "text-gray-300"} />
                      ))}
                    </div>
                    <div className="text-xs font-bold text-[#485869]">{freelancer.rating}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <div className="text-xs text-gray-500 mb-1">طلبات</div>
                    <div className="text-xs font-bold text-[#485869]">{freelancer.orders}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#34cc30]/10 to-[#34cc30]/5 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500 mb-0.5">إجمالي الأرباح</div>
                  <div className="font-bold text-[#485869] text-sm">{freelancer.totalEarned} ر.س</div>
                  <div className="text-[10px] text-[#34cc30] mt-0.5">{freelancer.badge}</div>
                </div>

                <a
                  href="https://wa.me/966511809878?text=مرحبا، أبغى خدمة"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-[#34cc30] text-white py-2.5 rounded-lg hover:bg-[#2eb829] transition-colors text-center text-sm"
                >
                  تواصل معه عبر خدوم
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

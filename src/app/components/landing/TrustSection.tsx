'use client';

import { motion } from "motion/react";
import { Users, CheckCircle2, Star, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    number: "+50,000",
    label: "مستقل محترف مسجّل",
    subtitle: "من 14 دولة عربية",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: CheckCircle2,
    number: "+300,000",
    label: "طلب مكتمل بنجاح",
    subtitle: "بمعدل رضا 97%",
    color: "from-[#34cc30] to-[#2eb829]",
  },
  {
    icon: Star,
    number: "4.9 ★",
    label: "متوسط تقييم المستقلين",
    subtitle: "من أصل 5 نجوم",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Clock,
    number: "98%",
    label: "معدل حل النزاعات",
    subtitle: "خلال 48 ساعة",
    color: "from-purple-500 to-pink-500",
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#485869] to-[#3a4655] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            أرقام تتكلم عن نفسها
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all border border-white/20"
            >
              <div className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <stat.icon size={28} className="text-white" />
              </div>
              <div className="text-4xl font-bold mb-2">{stat.number}</div>
              <div className="font-medium mb-1">{stat.label}</div>
              <div className="text-sm text-white/70">{stat.subtitle}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

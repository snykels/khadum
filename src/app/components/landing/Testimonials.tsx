'use client';

import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "فيصل العتيبي",
    role: "صاحب مشروع تجاري، الرياض",
    rating: 5,
    text: "وجدت مصمماً رائعاً خلال ساعات، نفّذ الهوية البصرية لمتجري بشكل احترافي فاق توقعاتي. الدفع كان آمناً ومريحاً."
  },
  {
    name: "منى الزهراني",
    role: "مستقلة، جدة",
    rating: 5,
    text: "بدأت على خدوم قبل سنة بلا خبرة في العمل الحر. اليوم أكسب راتباً ثابتاً من خدمات الكتابة. المنصة غيّرت حياتي فعلاً."
  },
  {
    name: "طارق محمود",
    role: "مدير تسويق، القاهرة",
    rating: 5,
    text: "طلبت مونتاج لسلسلة فيديوهات. المستقلة نفّذت الطلب قبل الموعد المحدد وبجودة عالية جداً. سأعود بالتأكيد."
  },
  {
    name: "أحمد بن علي",
    role: "رائد أعمال، تونس",
    rating: 5,
    text: "استخدمت منصات أخرى قبلها لكن خدوم تميّزت بالدعم الفوري وسهولة التعامل. المنصة العربية الأفضل بلا منازع."
  },
  {
    name: "لينا المنصور",
    role: "مستقلة، الكويت",
    rating: 5,
    text: "نظام الدفع والسحب سريع ومضمون. أحصل على أرباحي في نفس اليوم. لا أتخيل أعمل بدون خدوم الآن."
  },
  {
    name: "سلطان الهاجري",
    role: "صاحب شركة، دبي",
    rating: 5,
    text: "فريق الدعم يرد خلال دقائق. واجهت مشكلة صغيرة وحُلّت فوراً. هذا ما يجعل الفرق بين منصة محترمة وأخرى."
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] mb-4">
            ماذا يقول عملاؤنا؟
          </h2>
          <p className="text-gray-600">
            تجارب حقيقية من عملاء ومستقلين استخدموا خدوم
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-xl p-6 hover:border-[#34cc30] hover:shadow-lg transition-all"
            >
              {/* Quote Icon */}
              <div className="text-[#34cc30]/20 mb-4">
                <Quote size={40} />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-[#34cc30] text-[#34cc30]"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#485869]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

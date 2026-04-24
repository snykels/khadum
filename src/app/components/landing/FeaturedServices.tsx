'use client';

import { useState } from "react";
import { motion } from "motion/react";
import { Star, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const services = [
  {
    freelancer: "محمد الغامدي",
    verified: true,
    category: "تصميم",
    title: "تصميم هوية بصرية كاملة لمشروعك التجاري",
    rating: 4.9,
    reviews: 312,
    price: "150 ريال",
    image: "https://images.unsplash.com/photo-1695891689981-0be360e84d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
  },
  {
    freelancer: "سارة القحطاني",
    verified: true,
    category: "كتابة",
    title: "كتابة محتوى احترافي لموقعك ومنصاتك الاجتماعية",
    rating: 4.8,
    reviews: 198,
    price: "80 ريال",
    image: "https://images.unsplash.com/photo-1606593320367-47b1069ea23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
  },
  {
    freelancer: "عبدالله العمري",
    verified: true,
    category: "برمجة",
    title: "تطوير تطبيق جوال iOS وAndroid بالكامل",
    rating: 5.0,
    reviews: 87,
    price: "1,200 ريال",
    image: "https://images.unsplash.com/photo-1633250391894-397930e3f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
  },
  {
    freelancer: "نورة الشمري",
    verified: true,
    category: "فيديو",
    title: "مونتاج احترافي لفيديوهات يوتيوب وسوشيال ميديا",
    rating: 4.9,
    reviews: 241,
    price: "120 ريال",
    image: "https://images.unsplash.com/photo-1749410342681-3510f9edb7ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
  },
  {
    freelancer: "خالد الدوسري",
    verified: true,
    category: "تسويق",
    title: "إدارة حملات إعلانية على جوجل وميتا",
    rating: 4.7,
    reviews: 156,
    price: "300 ريال",
    image: "https://images.unsplash.com/photo-1589114207353-1fc98a11070b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
  },
  {
    freelancer: "ريم الحربي",
    verified: true,
    category: "كتابة",
    title: "ترجمة احترافية عربي/إنجليزي لجميع أنواع المستندات",
    rating: 4.9,
    reviews: 389,
    price: "60 ريال",
    image: "https://images.unsplash.com/photo-1720722023448-8e67fca07e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
  }
];

const filters = ["الكل", "تصميم", "برمجة", "كتابة", "تسويق", "فيديو"];

export default function FeaturedServices() {
  const [active, setActive] = useState("الكل");

  const visible = active === "الكل" ? services : services.filter(s => s.category === active);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#485869] mb-4">
            خدمات اختارها لك فريقنا
          </h2>
          <p className="text-gray-600">
            خدمات من مستقلين موثّقين بتقييمات عالية وسجل إنجاز مثبت
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 justify-center">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                active === filter
                  ? "bg-[#34cc30] text-white shadow-sm"
                  : "bg-white text-[#485869] hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.07 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-white/90 text-[#485869] text-xs font-medium px-2 py-1 rounded-full">
                  {service.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Freelancer Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#34cc30]/20 flex items-center justify-center text-sm font-bold text-[#485869]">
                    {service.freelancer.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-[#485869]">{service.freelancer}</span>
                      {service.verified && (
                        <CheckCircle className="w-4 h-4 text-[#34cc30]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-[#485869] mb-3 line-clamp-2 h-12">
                  {service.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < Math.floor(service.rating)
                          ? "fill-[#34cc30] text-[#34cc30]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-[#485869] mr-1">
                    {service.rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({service.reviews} تقييم)
                  </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">يبدأ من</div>
                    <div className="font-bold text-[#485869]">{service.price}</div>
                  </div>
                  <a
                    href="https://wa.me/966511809878?text=أبغى أطلب خدمة"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#34cc30] text-white px-5 py-2 rounded-lg hover:bg-[#2eb829] transition-colors"
                  >
                    اطلب الخدمة
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/categories" className="text-[#34cc30] hover:text-[#2eb829] font-medium flex items-center gap-2 mx-auto w-fit">
            استعرض جميع التصنيفات ←
          </a>
        </div>
      </div>
    </section>
  );
}

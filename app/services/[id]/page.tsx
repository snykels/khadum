"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/app/components/landing/Navbar";

type Service = {
  id: number;
  title: string;
  description: string | null;
  price: string;
  deliveryDays: number | null;
  rating: string | null;
  ordersCount: number | null;
  categoryName: string | null;
  subcategoryName: string | null;
  freelancerName: string | null;
  freelancerId: number | null;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/services/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setService(d.service);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/services" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#34cc30] mb-4">
          <ArrowRight size={16} />
          كل الخدمات
        </Link>

        {loading ? (
          <div className="text-center py-16 text-gray-500">جارٍ التحميل...</div>
        ) : error || !service ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <p className="text-gray-500">{error ?? "لم يتم العثور على الخدمة"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs flex-wrap mb-3">
                {service.categoryName && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{service.categoryName}</span>}
                {service.subcategoryName && <span className="bg-green-50 text-[#34cc30] px-2 py-1 rounded">{service.subcategoryName}</span>}
              </div>
              <h1 className="text-2xl font-bold text-[#485869] mb-3">{service.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
                <span>المستقل: <span className="font-medium text-[#485869]">{service.freelancerName ?? "—"}</span></span>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star size={14} fill="currentColor" />
                  <span>{Number(service.rating ?? 0).toFixed(1)}</span>
                  <span className="text-gray-400">({service.ordersCount ?? 0} طلب)</span>
                </div>
              </div>
              <h2 className="font-bold text-[#485869] mb-2">وصف الخدمة</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{service.description}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm h-fit md:sticky md:top-20">
              <p className="text-xs text-gray-400">يبدأ من</p>
              <p className="text-3xl font-bold text-[#34cc30] mb-4">{service.price} ر.س</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock size={16} />
                <span>التسليم خلال {service.deliveryDays} أيام</span>
              </div>
              <button className="w-full bg-[#34cc30] text-white py-3 rounded-lg hover:bg-[#2eb829] font-medium">
                اطلب الخدمة الآن
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                ميزة الطلبات قيد التطوير — قريباً
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

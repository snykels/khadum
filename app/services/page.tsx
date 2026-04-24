"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, Star } from "lucide-react";
import Navbar from "@/app/components/landing/Navbar";

type Sub = { id: number; nameAr: string };
type Cat = { id: number; nameAr: string; subcategories: Sub[] };
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
};

export default function ServicesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (categoryId) params.set("categoryId", String(categoryId));
    if (subcategoryId) params.set("subcategoryId", String(subcategoryId));
    const t = setTimeout(() => {
      fetch(`/api/services?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          setServices(d.services ?? []);
          setLoading(false);
        });
    }, 250);
    return () => clearTimeout(t);
  }, [q, categoryId, subcategoryId]);

  const selectedCat = useMemo(
    () => categories.find((c) => c.id === Number(categoryId)),
    [categories, categoryId]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#485869] mb-2">استعرض الخدمات</h1>
        <p className="text-gray-500 mb-6">اكتشف خدمات مميزة من مستقلين عرب محترفين</p>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1 relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن خدمة..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none"
              />
            </div>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value ? Number(e.target.value) : "");
                setSubcategoryId("");
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none bg-white"
            >
              <option value="">كل التصنيفات الرئيسية</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameAr}</option>
              ))}
            </select>
            <select
              value={subcategoryId}
              disabled={!selectedCat}
              onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : "")}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none bg-white disabled:bg-gray-50"
            >
              <option value="">{selectedCat ? "كل التصنيفات الفرعية" : "اختر تصنيفاً رئيسياً"}</option>
              {selectedCat?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.nameAr}</option>
              ))}
            </select>
          </div>
          {(q || categoryId || subcategoryId) && (
            <button
              onClick={() => { setQ(""); setCategoryId(""); setSubcategoryId(""); }}
              className="mt-3 text-sm text-gray-500 hover:text-[#34cc30] flex items-center gap-1"
            >
              <Filter size={14} />
              مسح المرشحات
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">جارٍ البحث...</div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <p className="text-gray-500 mb-2">لم يتم العثور على خدمات</p>
            <p className="text-sm text-gray-400">جرّب تعديل المرشحات أو ابحث بكلمات مختلفة</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{services.length} خدمة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#34cc30] transition-all"
                >
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2 flex-wrap">
                    {s.categoryName && <span className="bg-gray-100 px-2 py-0.5 rounded">{s.categoryName}</span>}
                    {s.subcategoryName && <span className="bg-green-50 text-[#34cc30] px-2 py-0.5 rounded">{s.subcategoryName}</span>}
                  </div>
                  <h3 className="font-bold text-[#485869] mb-2 line-clamp-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{s.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">يبدأ من</p>
                      <p className="text-lg font-bold text-[#34cc30]">{s.price} ر.س</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{s.freelancerName ?? "مستقل"}</p>
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Star size={12} fill="currentColor" />
                        <span>{Number(s.rating ?? 0).toFixed(1)}</span>
                        <span className="text-gray-400">({s.ordersCount ?? 0})</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";

type Sub = { id: number; nameAr: string };
type Cat = { id: number; nameAr: string; subcategories: Sub[] };
type Service = {
  id: number;
  title: string;
  description: string | null;
  price: string;
  deliveryDays: number | null;
  status: "draft" | "pending" | "published" | "rejected";
  rejectionReason: string | null;
  ordersCount: number | null;
  rating: string | null;
  categoryName: string | null;
  subcategoryName: string | null;
  categoryId: number | null;
  subcategoryId: number | null;
};

function StatusBadge({ status }: { status: Service["status"] }) {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    published: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
  } as const;
  const labels = {
    pending: "بانتظار الموافقة",
    published: "منشورة",
    rejected: "مرفوضة",
    draft: "مسودة",
  } as const;
  const icons = {
    pending: <Clock size={14} />,
    published: <CheckCircle2 size={14} />,
    rejected: <XCircle size={14} />,
    draft: <Clock size={14} />,
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
}

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [svcRes, catRes] = await Promise.all([
      fetch("/api/services/mine", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    const svc = await svcRes.json();
    const cat = await catRes.json();
    setServices(svc.services ?? []);
    setCategories(cat.categories ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setCategoryId("");
    setSubcategoryId("");
    setTitle("");
    setDescription("");
    setPrice("");
    setDeliveryDays("3");
    setError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setCategoryId(s.categoryId ?? "");
    setSubcategoryId(s.subcategoryId ?? "");
    setTitle(s.title);
    setDescription(s.description ?? "");
    setPrice(s.price);
    setDeliveryDays(String(s.deliveryDays ?? 3));
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!categoryId || !subcategoryId) {
      setError("اختر التصنيف الرئيسي والفرعي");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        categoryId: Number(categoryId),
        subcategoryId: Number(subcategoryId),
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        deliveryDays: Number(deliveryDays),
      };
      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر حفظ الخدمة");
        return;
      }
      setShowForm(false);
      resetForm();
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  const selectedCat = categories.find((c) => c.id === Number(categoryId));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/freelancer" className="text-sm text-gray-500 hover:text-[#34cc30]">
              ← لوحة المستقل
            </Link>
            <h1 className="text-3xl font-bold text-[#485869] mt-1">خدماتي</h1>
            <p className="text-gray-500 mt-1">أدر خدماتك المعروضة على المنصة</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"
          >
            <Plus size={18} />
            إضافة خدمة
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">جارٍ التحميل...</div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">لا توجد خدمات بعد</p>
            <button
              onClick={openCreate}
              className="bg-[#34cc30] text-white px-6 py-2 rounded-lg hover:bg-[#2eb829]"
            >
              أضف خدمتك الأولى
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <StatusBadge status={s.status} />
                      {s.categoryName && (
                        <span className="text-xs text-gray-500">
                          {s.categoryName} • {s.subcategoryName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#485869] text-lg mb-1 truncate">{s.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{s.description}</p>
                    {s.rejectionReason && (
                      <div className="text-xs bg-red-50 border border-red-200 text-red-700 p-2 rounded mb-3">
                        سبب الرفض: {s.rejectionReason}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-bold text-[#34cc30]">{s.price} ر.س</span>
                      <span>تسليم خلال {s.deliveryDays} أيام</span>
                      <span>{s.ordersCount ?? 0} طلب</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 text-gray-600 hover:text-[#34cc30] hover:bg-gray-50 rounded"
                      aria-label="تعديل"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded"
                      aria-label="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-[#485869] mb-4">
              {editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#485869] mb-1">
                  التصنيف الرئيسي *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value ? Number(e.target.value) : "");
                    setSubcategoryId("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none bg-white"
                >
                  <option value="">— اختر التصنيف الرئيسي —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameAr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#485869] mb-1">
                  التصنيف الفرعي *
                </label>
                <select
                  required
                  disabled={!selectedCat}
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none bg-white disabled:bg-gray-50"
                >
                  <option value="">
                    {selectedCat ? "— اختر التصنيف الفرعي —" : "اختر التصنيف الرئيسي أولاً"}
                  </option>
                  {selectedCat?.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.nameAr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#485869] mb-1">
                  عنوان الخدمة *
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none"
                  placeholder="مثال: سأصمم لك شعاراً احترافياً خلال 24 ساعة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#485869] mb-1">
                  وصف الخدمة *
                </label>
                <textarea
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none resize-y"
                  placeholder="اشرح ما الذي ستقدمه للعميل بالتفصيل..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#485869] mb-1">
                    السعر (ر.س) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#485869] mb-1">
                    مدة التسليم (أيام) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#34cc30] text-white py-2.5 rounded-lg hover:bg-[#2eb829] disabled:opacity-60"
                >
                  {submitting ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "نشر الخدمة"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                ستُراجَع الخدمة من قبل الإدارة قبل النشر للجمهور
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

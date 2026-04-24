'use client';

import {
  FileText, Bell, Mail, Settings, CreditCard, Shield, Activity,
  Download, Edit, Trash2, Plus, CheckCircle, X, Save, Eye, Send, Tag, Megaphone, Search, Image as ImageIcon,
  ThumbsDown, RefreshCw
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFetch, useToast, Loading, Empty, patchJson, postJson, delJson, dateAr, fmt, timeAgo } from "./_helpers";
import { confirmDialog, alertDialog } from "../ui/confirmBus";
import ImageUpload from "../ui/ImageUpload";
import { PageBuilder } from "./PageBuilder";

// Re-exports kept here so AdminDashboard.tsx imports still resolve. The
// transactions/coupons/revenue legacy pages live in AdminPages.tsx already.
export { AllOrdersPage as TransactionsPage } from "./AdminPages";

// =================== العروض والكوبونات ===================
export function CouponsPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/coupons", "coupons");
  const { node, show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ code: "", discountType: "percent", discountValue: "", maxUses: "1000", expiresAt: "" });
  const coupons = data || [];
  async function create() {
    if (!f.code) return show("أدخل كود الكوبون", false);
    const r = await postJson("/api/admin/coupons", f);
    if (r.ok) { show("تم إنشاء الكوبون"); setShowForm(false); setF({ code: "", discountType: "percent", discountValue: "", maxUses: "1000", expiresAt: "" }); reload(); }
    else show("فشل الإنشاء", false);
  }
  async function toggle(c: any) { await patchJson(`/api/admin/coupons/${c.id}`, { isActive: !c.isActive }); reload(); }
  async function remove(id: number) { if (!(await confirmDialog({ message: "حذف الكوبون؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return; await delJson(`/api/admin/coupons/${id}`); show("تم الحذف"); reload(); }
  return (
    <div className="space-y-6">{node}
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">العروض والكوبونات</h1><button onClick={() => setShowForm(!showForm)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">{showForm ? <><X size={16} /> إلغاء</> : <><Plus size={16} /> كوبون جديد</>}</button></div>
      {showForm && <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30"><h3 className="text-lg font-bold text-[#485869] mb-4">إنشاء كوبون</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1.5">كود الكوبون</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.code} onChange={e => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">نوع الخصم</label><select className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.discountType} onChange={e => setF({ ...f, discountType: e.target.value })}><option value="percent">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">القيمة</label><input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.discountValue} onChange={e => setF({ ...f, discountValue: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">الحد الأقصى</label><input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.maxUses} onChange={e => setF({ ...f, maxUses: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">تاريخ الانتهاء</label><input type="date" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.expiresAt} onChange={e => setF({ ...f, expiresAt: e.target.value })} /></div>
          <div className="flex items-end"><button onClick={create} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] w-full flex items-center justify-center gap-2"><Save size={16} /> إنشاء</button></div>
        </div>
      </div>}
      {loading ? <Loading /> : !coupons.length ? <Empty icon={Tag} msg="لا توجد كوبونات" /> :
        <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full"><thead className="bg-gray-50 text-sm text-gray-600"><tr><th className="text-right p-4">الكود</th><th className="text-right p-4">الخصم</th><th className="text-right p-4">النوع</th><th className="text-right p-4">الاستخدام</th><th className="text-right p-4">الانتهاء</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">إجراءات</th></tr></thead>
          <tbody className="text-sm">{coupons.map((c: any) => <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="p-4 font-mono font-bold text-[#34cc30]">{c.code}</td>
            <td className="p-4 font-medium">{c.discountType === 'percent' ? `${c.discountValue}%` : `${c.discountValue} ر.س`}</td>
            <td className="p-4">{c.discountType === 'percent' ? 'نسبة' : 'مبلغ ثابت'}</td>
            <td className="p-4">{c.usedCount}/{c.maxUses}</td>
            <td className="p-4 text-gray-500">{dateAr(c.expiresAt)}</td>
            <td className="p-4"><button onClick={() => toggle(c)} className={`px-2 py-1 rounded-full text-xs ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.isActive ? "نشط" : "متوقف"}</button></td>
            <td className="p-4"><button onClick={() => remove(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>
          </tr>)}</tbody></table></div>
      }
    </div>
  );
}

// =================== تقارير الإيرادات (RevenuePage) ===================
export function RevenuePage() {
  const { data, loading } = useFetch<any>("/api/admin/overview");
  if (loading) return <Loading />;
  const stats = data?.stats || {};
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869]">تقارير الإيرادات</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#34cc30] to-[#2eb829] rounded-xl p-5 text-white"><div className="text-sm text-white/80">إجمالي المبيعات (GMV)</div><div className="text-3xl font-bold mt-1">{fmt(stats.gmv)} <span className="text-base">ر.س</span></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm"><div className="text-sm text-gray-500">عمولات المنصة</div><div className="text-3xl font-bold text-[#485869] mt-1">{fmt(stats.platformRevenue)} <span className="text-base text-gray-400">ر.س</span></div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm"><div className="text-sm text-gray-500">طلبات نشطة</div><div className="text-3xl font-bold text-[#485869] mt-1">{stats.activeOrders || 0}</div></div>
        <div className="bg-white rounded-xl p-5 shadow-sm"><div className="text-sm text-gray-500">سحوبات معلقة</div><div className="text-3xl font-bold text-[#485869] mt-1">{stats.pendingWithdrawals || 0}</div></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-gray-600">جميع الأرقام محسوبة لحظياً من قاعدة البيانات.</div>
    </div>
  );
}

// =================== الصفحات الثابتة ===================
export function StaticPagesPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/pages", "pages");
  const { node, show } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [f, setF] = useState({ title: "", slug: "", content: "", status: "draft" });
  const pages = data || [];

  async function save() {
    if (!f.title || !f.slug) return show("الاسم والرابط مطلوبان", false);
    const r = editing ? await patchJson(`/api/admin/pages/${editing.id}`, f) : await postJson("/api/admin/pages", f);
    if (r.ok) { show("تم الحفظ"); setEditing(null); setShowNew(false); setF({ title: "", slug: "", content: "", status: "draft" }); reload(); }
    else show("فشل الحفظ", false);
  }
  function startEdit(p: any) { setEditing(p); setShowNew(false); setF({ title: p.title, slug: p.slug, content: p.content || "", status: p.status }); }
  async function remove(id: number) { if (!(await confirmDialog({ message: "حذف الصفحة؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return; await delJson(`/api/admin/pages/${id}`); show("تم الحذف"); reload(); }

  return (
    <div className="space-y-6">{node}
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">الصفحات الثابتة</h1><button onClick={() => { setShowNew(true); setEditing(null); setF({ title: "", slug: "", content: "", status: "draft" }); }} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Plus size={16} /> صفحة جديدة</button></div>
      {(showNew || editing) && <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30 space-y-4">
        <h3 className="text-lg font-bold text-[#485869]">{editing ? "تعديل صفحة" : "صفحة جديدة"}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1.5">العنوان</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">الرابط</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-sm" value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} placeholder="/about" /></div>
        </div>
        <div><label className="block text-sm text-gray-600 mb-1.5 font-semibold">المحتوى (منشئ كتل خدوم)</label>
          <PageBuilder value={f.content} onChange={v => setF({ ...f, content: v })} />
        </div>
        <div className="flex items-center gap-3">
          <select className="border border-gray-200 rounded-lg px-4 py-2.5" value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option value="draft">مسودة</option><option value="published">منشورة</option></select>
          <button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button>
          <a href={`/p/${f.slug}`} target="_blank" rel="noreferrer" className="border border-gray-200 px-4 py-2.5 rounded-lg flex items-center gap-2"><Eye size={16} /> فتح الصفحة</a>
          <button onClick={() => { setEditing(null); setShowNew(false); }} className="border border-gray-200 px-6 py-2.5 rounded-lg">إلغاء</button>
        </div>
      </div>}
      {loading ? <Loading /> : !pages.length ? <Empty icon={FileText} msg="لا توجد صفحات" /> :
        <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full"><thead className="bg-gray-50 text-sm text-gray-600"><tr><th className="text-right p-4">العنوان</th><th className="text-right p-4">الرابط</th><th className="text-right p-4">آخر تحديث</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">إجراءات</th></tr></thead>
          <tbody className="text-sm">{pages.map((p: any) => <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="p-4 font-medium text-[#485869]">{p.title}</td>
            <td className="p-4 text-gray-500 font-mono text-xs">{p.slug}</td>
            <td className="p-4 text-gray-500">{dateAr(p.updatedAt)}</td>
            <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status === "published" ? "منشورة" : "مسودة"}</span></td>
            <td className="p-4"><div className="flex gap-2"><button onClick={() => startEdit(p)} className="text-[#34cc30]"><Edit size={16} /></button><button onClick={() => remove(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div></td>
          </tr>)}</tbody></table></div>
      }
    </div>
  );
}

// =================== المدونة ===================
export function BlogPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/blog", "posts");
  const { node, show } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [f, setF] = useState({ title: "", content: "", author: "فريق خدوم", status: "draft" });
  const posts = data || [];

  async function save() {
    if (!f.title) return show("أدخل العنوان", false);
    const r = editing ? await patchJson(`/api/admin/blog/${editing.id}`, f) : await postJson("/api/admin/blog", f);
    if (r.ok) { show("تم الحفظ"); setEditing(null); setShowNew(false); setF({ title: "", content: "", author: "فريق خدوم", status: "draft" }); reload(); }
    else show("فشل الحفظ", false);
  }
  function startEdit(p: any) { setEditing(p); setShowNew(false); setF({ title: p.title, content: p.content || "", author: p.author, status: p.status }); }
  async function remove(id: number) { if (!(await confirmDialog({ message: "حذف المقال؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return; await delJson(`/api/admin/blog/${id}`); show("تم الحذف"); reload(); }

  return (
    <div className="space-y-6">{node}
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">المدونة</h1><button onClick={() => { setShowNew(true); setEditing(null); setF({ title: "", content: "", author: "فريق خدوم", status: "draft" }); }} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Plus size={16} /> مقال جديد</button></div>
      {(showNew || editing) && <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30 space-y-4">
        <h3 className="text-lg font-bold text-[#485869]">{editing ? "تعديل مقال" : "مقال جديد"}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1.5">العنوان</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">الكاتب</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.author} onChange={e => setF({ ...f, author: e.target.value })} /></div>
        </div>
        <div><label className="block text-sm text-gray-600 mb-1.5 font-semibold">المحتوى (منشئ كتل خدوم)</label>
          <PageBuilder value={f.content} onChange={v => setF({ ...f, content: v })} />
        </div>
        <div className="flex items-center gap-3">
          <select className="border border-gray-200 rounded-lg px-4 py-2.5" value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option value="draft">مسودة</option><option value="published">منشور</option></select>
          <button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button>
          <button onClick={() => { setEditing(null); setShowNew(false); }} className="border border-gray-200 px-6 py-2.5 rounded-lg">إلغاء</button>
        </div>
      </div>}
      {loading ? <Loading /> : !posts.length ? <Empty icon={FileText} msg="لا توجد مقالات" /> :
        <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full"><thead className="bg-gray-50 text-sm text-gray-600"><tr><th className="text-right p-4">العنوان</th><th className="text-right p-4">الكاتب</th><th className="text-right p-4">المشاهدات</th><th className="text-right p-4">التاريخ</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">إجراءات</th></tr></thead>
          <tbody className="text-sm">{posts.map((p: any) => <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="p-4 font-medium text-[#485869]">{p.title}</td>
            <td className="p-4 text-gray-600">{p.author}</td>
            <td className="p-4">{fmt(p.views)}</td>
            <td className="p-4 text-gray-500">{dateAr(p.createdAt)}</td>
            <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status === "published" ? "منشور" : "مسودة"}</span></td>
            <td className="p-4"><div className="flex gap-2"><button onClick={() => startEdit(p)} className="text-[#34cc30]"><Edit size={16} /></button><button onClick={() => remove(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div></td>
          </tr>)}</tbody></table></div>
      }
    </div>
  );
}

// =================== البانرات ===================
export function BannersPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/banners", "banners");
  const { node, show } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [f, setF] = useState({ title: "", position: "freelancer-dashboard", imageUrl: "", link: "", expiresAt: "", isActive: true });
  const banners = data || [];

  async function save() {
    if (!f.title) return show("أدخل العنوان", false);
    const r = editing ? await patchJson(`/api/admin/banners/${editing.id}`, f) : await postJson("/api/admin/banners", f);
    if (r.ok) { show("تم الحفظ"); setEditing(null); setShowNew(false); setF({ title: "", position: "freelancer-dashboard", imageUrl: "", link: "", expiresAt: "", isActive: true }); reload(); }
    else show("فشل الحفظ", false);
  }
  function startEdit(b: any) { setEditing(b); setShowNew(false); setF({ title: b.title, position: b.position, imageUrl: b.imageUrl || "", link: b.link || "", expiresAt: b.expiresAt ? new Date(b.expiresAt).toISOString().slice(0, 10) : "", isActive: b.isActive }); }
  async function toggle(b: any) { await patchJson(`/api/admin/banners/${b.id}`, { isActive: !b.isActive }); reload(); }
  async function remove(id: number) { if (!(await confirmDialog({ message: "حذف البانر؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return; await delJson(`/api/admin/banners/${id}`); show("تم الحذف"); reload(); }

  return (
    <div className="space-y-6">{node}
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">البانرات والإعلانات</h1><button onClick={() => { setShowNew(true); setEditing(null); }} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Plus size={16} /> بانر جديد</button></div>
      {(showNew || editing) && <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30 space-y-4">
        <h3 className="text-lg font-bold text-[#485869]">{editing ? "تعديل بانر" : "بانر جديد"}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1.5">العنوان</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">الموضع</label><select className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.position} onChange={e => setF({ ...f, position: e.target.value })}>
            <option value="home">الصفحة الرئيسية</option>
            <option value="freelancer-dashboard">لوحة المستقل</option>
            <option value="orders">صفحة الطلبات</option>
            <option value="all">كل الصفحات</option>
          </select></div>
          <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1.5">صورة البانر</label>
            <ImageUpload value={f.imageUrl} onChange={url => setF({ ...f, imageUrl: url })} />
          </div>
          <div><label className="block text-sm text-gray-600 mb-1.5">رابط النقر</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.link} onChange={e => setF({ ...f, link: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">تاريخ الانتهاء</label><input type="date" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.expiresAt} onChange={e => setF({ ...f, expiresAt: e.target.value })} /></div>
          <div className="flex items-end gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={e => setF({ ...f, isActive: e.target.checked })} /> نشط</label></div>
        </div>
        <div className="flex gap-3"><button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button><button onClick={() => { setEditing(null); setShowNew(false); }} className="border border-gray-200 px-6 py-2.5 rounded-lg">إلغاء</button></div>
      </div>}
      {loading ? <Loading /> : !banners.length ? <Empty icon={Megaphone} msg="لا توجد بانرات" /> :
        <div className="space-y-4">{banners.map((b: any) => {
          const ctr = b.impressions ? ((b.clicks / b.impressions) * 100).toFixed(1) + '%' : '0%';
          return <div key={b.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="font-bold text-[#485869] text-lg">{b.title}</h3><span className="text-sm text-gray-500">{b.position} {b.expiresAt ? `· ينتهي ${dateAr(b.expiresAt)}` : ''}</span></div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(b)} className={`px-3 py-1 rounded-full text-xs font-medium ${b.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{b.isActive ? "نشط" : "متوقف"}</button>
                <button onClick={() => startEdit(b)} className="text-gray-400 hover:text-gray-600"><Edit size={16} /></button>
                <button onClick={() => remove(b.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-[#485869]">{fmt(b.impressions)}</div><div className="text-xs text-gray-500">مشاهدة</div></div>
              <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-[#34cc30]">{fmt(b.clicks)}</div><div className="text-xs text-gray-500">نقرة</div></div>
              <div className="bg-gray-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-blue-600">{ctr}</div><div className="text-xs text-gray-500">CTR</div></div>
            </div>
          </div>;
        })}</div>
      }
    </div>
  );
}

// =================== النشرة البريدية ===================
export function NewsletterPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/newsletter");
  const { node, show } = useToast();
  const [showCompose, setShowCompose] = useState(false);
  const [f, setF] = useState({ title: "", body: "", target: "all" });
  const stats = data?.stats || {};
  const campaigns = data?.campaigns || [];

  async function send() {
    if (!f.title) return show("أدخل العنوان", false);
    const r = await postJson("/api/admin/newsletter", f);
    if (r.ok) { show(`تم الإرسال إلى ${r.data.sentCount} مشترك`); setShowCompose(false); setF({ title: "", body: "", target: "all" }); reload(); }
    else show("فشل الإرسال", false);
  }
  return (
    <div className="space-y-6">{node}
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">النشرة البريدية</h1><button onClick={() => setShowCompose(!showCompose)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">{showCompose ? <><X size={16} /> إلغاء</> : <><Mail size={16} /> إرسال نشرة</>}</button></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5"><div className="text-sm text-gray-500">المشتركين</div><div className="text-3xl font-bold text-[#485869] mt-1">{fmt(stats.subscribers)}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-5"><div className="text-sm text-gray-500">معدل الفتح</div><div className="text-3xl font-bold text-[#34cc30] mt-1">{(stats.openRate || 0).toFixed(1)}%</div></div>
        <div className="bg-white rounded-xl shadow-sm p-5"><div className="text-sm text-gray-500">المرسلة</div><div className="text-3xl font-bold text-[#485869] mt-1">{fmt(stats.sent)}</div></div>
      </div>
      {showCompose && <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30">
        <h3 className="text-lg font-bold text-[#485869] mb-4">نشرة جديدة</h3>
        <div className="space-y-4">
          <div><label className="block text-sm text-gray-600 mb-1.5">العنوان</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">المحتوى</label><textarea rows={5} className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></div>
          <div className="flex gap-3">
            <select className="border border-gray-200 rounded-lg px-4 py-2.5" value={f.target} onChange={e => setF({ ...f, target: e.target.value })}><option value="all">جميع المشتركين</option><option value="freelancers">المستقلين</option><option value="clients">العملاء</option></select>
            <button onClick={send} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Send size={16} /> إرسال</button>
          </div>
        </div>
      </div>}
      {loading ? <Loading /> : <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-[#485869]">النشرات السابقة</h3></div>
        {!campaigns.length ? <div className="p-8 text-center text-gray-400">لا توجد نشرات</div> : campaigns.map((c: any) => {
          const openPct = c.sentCount > 0 ? ((c.openedCount / c.sentCount) * 100).toFixed(1) : '0';
          return <div key={c.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex items-center justify-between">
            <div><div className="font-medium text-[#485869]">{c.title}</div><div className="text-xs text-gray-500">{dateAr(c.sentAt)}</div></div>
            <div className="flex items-center gap-6 text-sm"><span className="text-gray-500">{fmt(c.sentCount)} مرسلة</span><span className="text-[#34cc30] font-medium">{openPct}% فتح</span></div>
          </div>;
        })}
      </div>}
    </div>
  );
}

// =================== إشعارات جماعية ===================
export function MassNotificationsPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/mass-notifications", "notifications");
  const { node, show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState<{ title: string; body: string; target: string; channels: string[] }>({ title: "", body: "", target: "all", channels: ["inapp"] });
  const list = data || [];

  function toggleCh(c: string) {
    setF(prev => ({ ...prev, channels: prev.channels.includes(c) ? prev.channels.filter(x => x !== c) : [...prev.channels, c] }));
  }

  async function send() {
    if (!f.title) return show("أدخل العنوان", false);
    if (!f.channels.length) return show("اختر قناة واحدة على الأقل", false);
    const r = await postJson("/api/admin/mass-notifications", f);
    if (r.ok) { show(`تم الإرسال إلى ${r.data.sentCount} مستخدم (نجح ${r.data.deliveredCount}، فشل ${r.data.failedCount})`); setShowForm(false); setF({ title: "", body: "", target: "all", channels: ["inapp"] }); reload(); }
    else show("فشل الإرسال", false);
  }
  const targetLabel: Record<string, string> = { all: "الجميع", freelancers: "المستقلين", clients: "العملاء", new_freelancers: "مستقلين جدد" };
  const channelLabel: Record<string, string> = { inapp: "داخل المنصة", email: "بريد إلكتروني", whatsapp: "واتساب", sms: "SMS" };
  const allChannels = [
    { key: "inapp", label: "داخل المنصة" },
    { key: "email", label: "بريد إلكتروني" },
    { key: "whatsapp", label: "واتساب" },
    { key: "sms", label: "SMS" },
  ];

  return (
    <div className="space-y-6">{node}
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">إشعارات جماعية / إعلانات</h1><button onClick={() => setShowForm(!showForm)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">{showForm ? <><X size={16} /> إلغاء</> : <><Bell size={16} /> إعلان جديد</>}</button></div>
      {showForm && <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30">
        <h3 className="text-lg font-bold text-[#485869] mb-4">إنشاء إعلان</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1.5">العنوان</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">الفئة المستهدفة</label><select className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.target} onChange={e => setF({ ...f, target: e.target.value })}><option value="all">الجميع</option><option value="freelancers">المستقلين</option><option value="clients">العملاء</option></select></div>
          <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1.5">النص</label><textarea rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1.5">قنوات الإرسال</label>
            <div className="flex flex-wrap gap-2">
              {allChannels.map(c => (
                <button key={c.key} type="button" onClick={() => toggleCh(c.key)} className={`px-3 py-2 rounded-lg text-sm border transition ${f.channels.includes(c.key) ? "bg-[#34cc30] text-white border-[#34cc30]" : "bg-white text-gray-600 border-gray-200 hover:border-[#34cc30]"}`}>{c.label}</button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">القنوات الخارجية (بريد/واتساب/SMS) تتطلب إعدادًا فعّالًا في مزود الخدمة.</p>
          </div>
        </div>
        <div className="flex justify-end mt-4"><button onClick={send} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Send size={16} /> إرسال</button></div>
      </div>}
      {loading ? <Loading /> : <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-[#485869]">سجل الإعلانات والتحليلات</h3></div>
        {!list.length ? <div className="p-8 text-center text-gray-400">لا توجد إعلانات</div> : list.map((n: any) => {
          const channels = Array.isArray(n.channels) ? n.channels : (typeof n.channels === "string" ? JSON.parse(n.channels || "[]") : []);
          return (
            <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#485869]">{n.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{timeAgo(n.sentAt)} · {targetLabel[n.target] || n.target}</div>
                  {channels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {channels.map((c: string) => <span key={c} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{channelLabel[c] || c}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-center"><div className="font-bold text-gray-700">{fmt(n.sentCount || 0)}</div><div className="text-gray-400">المستهدف</div></div>
                  <div className="text-center"><div className="font-bold text-green-600">{fmt(n.deliveredCount || 0)}</div><div className="text-gray-400">سُلِّم</div></div>
                  <div className="text-center"><div className="font-bold text-red-600">{fmt(n.failedCount || 0)}</div><div className="text-gray-400">فشل</div></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}

// =================== Settings shared helpers ===================
function useSettings(ns: string) {
  const [values, setValues] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try { const r = await fetch(`/api/admin/settings?ns=${ns}`); const j = await r.json(); if (alive) setValues(j.settings || {}); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [ns]);
  return { values, setValues, loading };
}
async function saveSettings(ns: string, values: Record<string, any>) {
  return patchJson("/api/admin/settings", { ns, values });
}
function setVal(set: any, k: string, v: any) { set((p: any) => ({ ...(p || {}), [k]: v })); }

// =================== إعدادات عامة ===================
export function GeneralSettingsPage() {
  const { values, setValues, loading } = useSettings("general");
  const { node, show } = useToast();
  if (loading || !values) return <Loading />;
  async function save() { const r = await saveSettings("general", values!); if (r.ok) show("تم الحفظ"); else show("فشل الحفظ", false); }
  return (
    <div className="space-y-6">{node}
      <h1 className="text-2xl font-bold text-[#485869]">إعدادات عامة</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div><h3 className="text-lg font-bold text-[#485869] mb-4">معلومات المنصة</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-600 mb-1.5">اسم المنصة</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.platformName || ""} onChange={e => setVal(setValues, "platformName", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">الوصف</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.description || ""} onChange={e => setVal(setValues, "description", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">البريد</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.email || ""} onChange={e => setVal(setValues, "email", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">الهاتف</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.phone || ""} onChange={e => setVal(setValues, "phone", e.target.value)} /></div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1.5">شعار الموقع (Logo)</label>
              <div className="flex items-center gap-4">
                {values.siteLogoUrl && <img src={values.siteLogoUrl} alt="logo" className="w-16 h-16 object-contain rounded border border-gray-200 bg-gray-50" />}
                <input type="file" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  if (f.size > 2 * 1024 * 1024) { alert("حجم الملف يجب ألا يتجاوز 2MB"); return; }
                  const r = new FileReader();
                  r.onload = () => setVal(setValues, "siteLogoUrl", r.result as string);
                  r.readAsDataURL(f);
                }} className="text-sm" />
                {values.siteLogoUrl && <button onClick={() => setVal(setValues, "siteLogoUrl", "")} className="text-red-600 text-xs hover:underline">إزالة</button>}
              </div>
              <p className="text-xs text-gray-400 mt-1">يُستخدم في القائمة العلوية ونموذج التقديم وغيرها (مفضل: مربّع، PNG شفاف)</p>
            </div>
          </div>
        </div>
        <hr />
        <div><h3 className="text-lg font-bold text-[#485869] mb-4">التشغيل</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-600 mb-1.5">وضع الصيانة</label><select className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.maintenanceMode || "false"} onChange={e => setVal(setValues, "maintenanceMode", e.target.value)}><option value="false">معطل</option><option value="true">مفعل</option></select></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">التسجيل</label><select className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.registrationMode || "open"} onChange={e => setVal(setValues, "registrationMode", e.target.value)}><option value="open">مفتوح</option><option value="invite">بدعوة</option><option value="closed">مغلق</option></select></div>
          </div>
        </div>
        <div className="flex justify-end"><button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button></div>
      </div>
    </div>
  );
}

// =================== العمولات ===================
export function FeesPage() {
  const { values, setValues, loading } = useSettings("fees");
  const { node, show } = useToast();
  if (loading || !values) return <Loading />;
  const fields = [
    { k: "platformFeePct", t: "عمولة المنصة", d: "النسبة من كل طلب", u: "%" },
    { k: "withdrawalFee", t: "رسوم السحب", d: "رسوم ثابتة", u: "ر.س" },
    { k: "minWithdrawal", t: "الحد الأدنى للسحب", d: "أقل مبلغ", u: "ر.س" },
    { k: "cancellationFeePct", t: "رسوم الإلغاء", d: "بعد البدء", u: "%" },
  ];
  async function save() { const r = await saveSettings("fees", values!); if (r.ok) show("تم الحفظ"); else show("فشل الحفظ", false); }
  return (
    <div className="space-y-6">{node}
      <h1 className="text-2xl font-bold text-[#485869]">العمولات والرسوم</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid md:grid-cols-2 gap-6">{fields.map(f => <div key={f.k} className="border border-gray-200 rounded-xl p-5"><h3 className="font-bold text-[#485869] mb-1">{f.t}</h3><p className="text-sm text-gray-500 mb-4">{f.d}</p><div className="flex items-center gap-3"><input type="number" className="w-24 border border-gray-200 rounded-lg px-4 py-2.5 text-center" value={values[f.k] || ""} onChange={e => setVal(setValues, f.k, e.target.value)} /><span className="text-gray-600">{f.u}</span></div></div>)}</div>
        <div className="flex justify-end mt-6"><button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button></div>
      </div>
    </div>
  );
}

// =================== بوابات الدفع ===================
export function PaymentGatewaysPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/payment-gateways", "gateways");
  const { node, show } = useToast();
  const list = data || [];
  async function toggle(g: any) { const r = await patchJson(`/api/admin/payment-gateways/${g.id}`, { isActive: !g.isActive }); if (r.ok) { show("تم التحديث"); reload(); } }
  if (loading) return <Loading />;
  return (
    <div className="space-y-6">{node}
      <h1 className="text-2xl font-bold text-[#485869]">بوابات الدفع</h1>
      <div className="space-y-4">{list.map((g: any) => <div key={g.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${g.isActive ? "bg-[#34cc30]/10" : "bg-gray-100"}`}><CreditCard size={24} className={g.isActive ? "text-[#34cc30]" : "text-gray-400"} /></div>
          <div><h3 className="font-bold text-[#485869]">{g.name}</h3><span className="text-sm text-gray-500">{g.provider} · {fmt(g.txCount)} معاملة</span></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => toggle(g)} className={`px-3 py-1 rounded-full text-xs font-medium ${g.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{g.isActive ? "مفعلة" : "معطلة"}</button>
        </div>
      </div>)}</div>
    </div>
  );
}

// =================== إعدادات البريد ===================
export function EmailSettingsPage() {
  const { values, setValues, loading } = useSettings("email");
  const { node, show } = useToast();
  if (loading || !values) return <Loading />;
  async function save() { const r = await saveSettings("email", values!); if (r.ok) show("تم الحفظ"); else show("فشل الحفظ", false); }
  return (
    <div className="space-y-6">{node}
      <h1 className="text-2xl font-bold text-[#485869]">إعدادات البريد</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div><h3 className="text-lg font-bold text-[#485869] mb-4">SMTP</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-600 mb-1.5">خادم SMTP</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.smtpHost || ""} onChange={e => setVal(setValues, "smtpHost", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">المنفذ</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.smtpPort || ""} onChange={e => setVal(setValues, "smtpPort", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">المستخدم</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.smtpUser || ""} onChange={e => setVal(setValues, "smtpUser", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">كلمة المرور</label><input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={values.smtpPassword || ""} onChange={e => setVal(setValues, "smtpPassword", e.target.value)} /></div>
          </div>
        </div>
        <div className="flex justify-end"><button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button></div>
      </div>
    </div>
  );
}

// =================== واتساب و SMS ===================
export function MessagingSettingsPage() {
  const wa = useSettings("whatsapp");
  const sm = useSettings("sms");
  const { node, show } = useToast();
  if (wa.loading || sm.loading || !wa.values || !sm.values) return <Loading />;
  async function save() {
    const r1 = await saveSettings("whatsapp", wa.values!);
    const r2 = await saveSettings("sms", sm.values!);
    if (r1.ok && r2.ok) show("تم الحفظ"); else show("فشل الحفظ", false);
  }
  return (
    <div className="space-y-6">{node}
      <h1 className="text-2xl font-bold text-[#485869]">واتساب والـ SMS</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6"><h3 className="text-lg font-bold text-[#485869] mb-4">واتساب API</h3>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-600 mb-1.5">الرقم</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={wa.values.phone || ""} onChange={e => setVal(wa.setValues, "phone", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">API Token</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-xs" value={wa.values.apiToken || ""} onChange={e => setVal(wa.setValues, "apiToken", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">Webhook URL</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-xs" value={wa.values.webhookUrl || ""} onChange={e => setVal(wa.setValues, "webhookUrl", e.target.value)} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6"><h3 className="text-lg font-bold text-[#485869] mb-4">SMS</h3>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-600 mb-1.5">المزود</label><select className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={sm.values.provider || "Unifonic"} onChange={e => setVal(sm.setValues, "provider", e.target.value)}><option>Unifonic</option><option>Twilio</option></select></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">API Key</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-xs" value={sm.values.apiKey || ""} onChange={e => setVal(sm.setValues, "apiKey", e.target.value)} /></div>
            <div><label className="block text-sm text-gray-600 mb-1.5">اسم المرسل</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={sm.values.senderName || ""} onChange={e => setVal(sm.setValues, "senderName", e.target.value)} /></div>
          </div>
        </div>
      </div>
      <div className="flex justify-end"><button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button></div>
    </div>
  );
}

// =================== الباقات ===================
export function SubscriptionsManagementPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/plans", "plans");
  const { node, show } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [f, setF] = useState({ name: "", price: "", features: "", isPopular: false });
  const plans = data || [];
  async function save() {
    if (!f.name) return show("أدخل الاسم", false);
    const features = f.features.split("\n").map(s => s.trim()).filter(Boolean);
    const body = { name: f.name, price: f.price, features, isPopular: f.isPopular };
    const r = editing ? await patchJson(`/api/admin/plans/${editing.id}`, body) : await postJson("/api/admin/plans", body);
    if (r.ok) { show("تم الحفظ"); setEditing(null); setShowNew(false); setF({ name: "", price: "", features: "", isPopular: false }); reload(); }
    else show("فشل الحفظ", false);
  }
  function startEdit(p: any) { setEditing(p); setShowNew(false); setF({ name: p.name, price: String(p.price), features: (p.features || []).join("\n"), isPopular: p.isPopular }); }
  async function remove(id: number) { if (!(await confirmDialog({ message: "حذف الباقة؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return; await delJson(`/api/admin/plans/${id}`); show("تم الحذف"); reload(); }

  return (
    <div className="space-y-6">{node}
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">الاشتراكات والباقات</h1><button onClick={() => { setShowNew(true); setEditing(null); }} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Plus size={16} /> باقة جديدة</button></div>
      {(showNew || editing) && <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30 space-y-4">
        <h3 className="text-lg font-bold text-[#485869]">{editing ? "تعديل باقة" : "باقة جديدة"}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1.5">الاسم</label><input className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-600 mb-1.5">السعر شهرياً</label><input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></div>
        </div>
        <div><label className="block text-sm text-gray-600 mb-1.5">المميزات (سطر لكل ميزة)</label><textarea rows={5} className="w-full border border-gray-200 rounded-lg px-4 py-2.5" value={f.features} onChange={e => setF({ ...f, features: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isPopular} onChange={e => setF({ ...f, isPopular: e.target.checked })} /> الأكثر شعبية</label>
        <div className="flex gap-3"><button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button><button onClick={() => { setEditing(null); setShowNew(false); }} className="border border-gray-200 px-6 py-2.5 rounded-lg">إلغاء</button></div>
      </div>}
      {loading ? <Loading /> : <div className="grid md:grid-cols-3 gap-6">{plans.map((p: any) => <div key={p.id} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${p.isPopular ? "border-[#34cc30]" : "border-gray-200"} relative`}>
        {p.isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#34cc30] text-white text-xs px-3 py-1 rounded-full">الأكثر شعبية</span>}
        <h3 className="text-xl font-bold text-[#485869] mb-2">{p.name}</h3>
        <div className="text-3xl font-bold text-[#485869] mb-1">{fmt(p.price)} <span className="text-base text-gray-400">ر.س/شهر</span></div>
        <div className="text-sm text-gray-500 mb-4">{fmt(p.usersCount)} مشترك</div>
        <ul className="space-y-2 mb-6">{(p.features || []).map((feat: string) => <li key={feat} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle size={14} className="text-[#34cc30]" />{feat}</li>)}</ul>
        <div className="flex gap-2">
          <button onClick={() => startEdit(p)} className="flex-1 border border-gray-200 text-[#485869] py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"><Edit size={14} /> تعديل</button>
          <button onClick={() => remove(p.id)} className="border border-red-200 text-red-500 py-2 px-3 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
        </div>
      </div>)}</div>}
    </div>
  );
}

// =================== الأمان ===================
export function AdminSecurityPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/roles", "roles");
  const { values, setValues, loading: lo2 } = useSettings("security");
  const { node, show } = useToast();
  const [showRole, setShowRole] = useState(false);
  const [rf, setRf] = useState({ name: "", color: "bg-gray-100 text-gray-700" });
  const roles = data || [];
  async function saveSec() { const r = await saveSettings("security", values!); if (r.ok) show("تم الحفظ"); else show("فشل الحفظ", false); }
  async function createRole() {
    if (!rf.name) return show("أدخل اسم الدور", false);
    const r = await postJson("/api/admin/roles", rf);
    if (r.ok) { show("تم الإنشاء"); setShowRole(false); setRf({ name: "", color: "bg-gray-100 text-gray-700" }); reload(); }
  }
  async function removeRole(id: number) { if (!(await confirmDialog({ message: "حذف الدور؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return; await delJson(`/api/admin/roles/${id}`); show("تم الحذف"); reload(); }

  if (loading || lo2 || !values) return <Loading />;
  const toggles = [
    { k: "force2faAdmin", l: "إجبار 2FA للمشرفين", d: "جميع الحسابات تتطلب تحقق" },
    { k: "notifyNewDevice", l: "إشعار دخول جهاز جديد", d: "تنبيه المشرف" },
  ];
  return (
    <div className="space-y-6">{node}
      <h1 className="text-2xl font-bold text-[#485869]">الأمان والصلاحيات</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-[#485869]">الأدوار</h3><button onClick={() => setShowRole(!showRole)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2 text-sm"><Plus size={14} /> دور جديد</button></div>
        {showRole && <div className="mb-4 p-4 border-2 border-dashed border-[#34cc30]/30 rounded-xl flex gap-3"><input className="flex-1 border border-gray-200 rounded-lg px-4 py-2" placeholder="اسم الدور" value={rf.name} onChange={e => setRf({ ...rf, name: e.target.value })} /><button onClick={createRole} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg">حفظ</button></div>}
        <div className="space-y-3">{roles.map((r: any) => <div key={r.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200">
          <div className="flex items-center gap-4"><span className={`${r.color} px-3 py-1.5 rounded-lg text-sm font-medium`}>{r.name}</span><span className="text-sm text-gray-600">{(r.permissions || []).join(", ")}</span></div>
          <div className="flex items-center gap-4"><span className="text-sm text-gray-500">{r.usersCount || 0} مستخدم</span><button onClick={() => removeRole(r.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div>
        </div>)}</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] mb-4">إعدادات الأمان</h3>
        <div className="space-y-4">
          {toggles.map(s => {
            const v = values[s.k] === "true";
            return <div key={s.k} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
              <div><div className="font-medium text-[#485869]">{s.l}</div><div className="text-sm text-gray-500">{s.d}</div></div>
              <button onClick={() => setVal(setValues, s.k, v ? "false" : "true")} className={`w-12 h-7 rounded-full ${v ? "bg-[#34cc30]" : "bg-gray-300"} relative cursor-pointer`}><div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${v ? "right-1" : "right-6"}`} /></button>
            </div>;
          })}
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"><div><div className="font-medium text-[#485869]">خروج تلقائي بعد (دقيقة)</div><div className="text-sm text-gray-500">عدم النشاط</div></div><input type="number" className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-center" value={values.autoLogoutMin || ""} onChange={e => setVal(setValues, "autoLogoutMin", e.target.value)} /></div>
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"><div><div className="font-medium text-[#485869]">قفل بعد محاولات خاطئة</div><div className="text-sm text-gray-500">حماية من الاختراق</div></div><input type="number" className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-center" value={values.lockAfterFailedAttempts || ""} onChange={e => setVal(setValues, "lockAfterFailedAttempts", e.target.value)} /></div>
        </div>
        <div className="flex justify-end mt-4"><button onClick={saveSec} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ</button></div>
      </div>
    </div>
  );
}

// =================== SEO ===================
export function SeoPage() {
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const { node, show } = useToast();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/seo"); const d = await r.json();
      if (r.ok) setValues(d.seo || {});
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!values) return;
    const r = await postJson("/api/admin/seo", values);
    show(r.ok ? "تم الحفظ" : "فشل الحفظ", r.ok);
  }

  function setV(k: string, v: any) { setValues(prev => ({ ...(prev || {}), [k]: typeof v === "boolean" ? String(v) : v })); }

  if (loading || !values) return <Loading />;
  const v = values;
  return (
    <div className="space-y-6" dir="rtl">{node}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white flex items-center gap-2"><Search className="text-[#34cc30]" /> SEO و sitemap</h1>
        <a href="/sitemap.xml" target="_blank" className="text-sm text-[#34cc30] hover:underline flex items-center gap-1"><FileText size={14}/> عرض sitemap.xml</a>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white">البيانات الوصفية الافتراضية</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">عنوان الموقع <span className="text-xs text-gray-400">(≤ 60 حرف)</span></label>
            <input className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5" value={v.siteTitle || ""} onChange={e => setV("siteTitle", e.target.value)} maxLength={70} />
            <div className="text-xs text-gray-400 mt-1">{(v.siteTitle || "").length} / 60</div>
          </div>
          <div><label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">الكلمات المفتاحية</label>
            <input className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5" value={v.keywords || ""} onChange={e => setV("keywords", e.target.value)} />
          </div>
          <div className="md:col-span-2"><label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">الوصف <span className="text-xs text-gray-400">(≤ 160 حرف)</span></label>
            <textarea rows={2} className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5" value={v.siteDescription || ""} onChange={e => setV("siteDescription", e.target.value)} maxLength={180} />
            <div className="text-xs text-gray-400 mt-1">{(v.siteDescription || "").length} / 160</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white">المشاركة الاجتماعية</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">صورة OG (1200×630)</label>
            <ImageUpload value={v.ogImage} onChange={u => setV("ogImage", u)} />
          </div>
          <div className="space-y-3">
            <div><label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">حساب تويتر</label>
              <input dir="ltr" className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5" placeholder="@khadom_app" value={v.twitterHandle || ""} onChange={e => setV("twitterHandle", e.target.value)} />
            </div>
            <div><label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">النطاق الكنسي</label>
              <input dir="ltr" className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5" placeholder="https://khadom.app" value={v.canonicalDomain || ""} onChange={e => setV("canonicalDomain", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white">إعدادات متقدمة</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">رمز التحقق من Google</label>
            <input dir="ltr" className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5" placeholder="google-site-verification..." value={v.googleVerification || ""} onChange={e => setV("googleVerification", e.target.value)} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 border border-gray-100 dark:border-[#2a2d36] rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
            <span className="font-medium text-[#485869] dark:text-gray-200">السماح للمحركات بالفهرسة</span>
            <input type="checkbox" checked={v.robotsAllowAll === "true"} onChange={e => setV("robotsAllowAll", e.target.checked)} />
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-100 dark:border-[#2a2d36] rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
            <span className="font-medium text-[#485869] dark:text-gray-200">تفعيل sitemap.xml</span>
            <input type="checkbox" checked={v.sitemapEnabled === "true"} onChange={e => setV("sitemapEnabled", e.target.checked)} />
          </label>
        </div>
      </div>

      <div className="flex justify-end"><button onClick={save} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Save size={16} /> حفظ التغييرات</button></div>
    </div>
  );
}

// =================== سجل الأنشطة ===================
export function AuditLogPage() {
  const { data, loading } = useFetch<any>("/api/admin/audit", "logs");
  const logs = data || [];
  const tc: Record<string, string> = { approve: "bg-green-100 text-green-700", resolve: "bg-blue-100 text-blue-700", payment: "bg-purple-100 text-purple-700", suspend: "bg-red-100 text-red-700", settings: "bg-yellow-100 text-yellow-700", reject: "bg-red-100 text-red-700", create: "bg-[#34cc30]/10 text-[#34cc30]" };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#485869]">سجل الأنشطة</h1></div>
      {loading ? <Loading /> : !logs.length ? <Empty icon={Activity} msg="لا توجد أنشطة" /> :
        <div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="divide-y divide-gray-100">{logs.map((l: any) => <div key={l.id} className="p-4 hover:bg-gray-50 transition-colors"><div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center text-white font-bold text-sm shrink-0">{(l.userName || "?").charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-[#485869]">{l.userName || "النظام"}</span><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${tc[l.type] || "bg-gray-100 text-gray-600"}`}>{l.action}</span></div>
            <p className="text-sm text-gray-600 mt-0.5">{l.target}</p>
            <span className="text-xs text-gray-400">{timeAgo(l.createdAt)}</span>
          </div>
        </div></div>)}</div></div>
      }
    </div>
  );
}

// =================== إحصائيات رفض العروض ===================
const REASON_LABELS: Record<string, string> = {
  outside_specialty: "خارج نطاق تخصصي",
  busy: "مشغول حالياً",
  low_budget: "الميزانية قليلة",
  other: "سبب آخر",
};
const REASON_COLORS: Record<string, string> = {
  outside_specialty: "bg-purple-100 text-purple-700",
  busy: "bg-yellow-100 text-yellow-700",
  low_budget: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-600",
};

export function RejectionStatsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load(d: number) {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/rejection-stats?days=${d}`);
      const json = await r.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(days); }, [days]);

  const summary: any[] = data?.summary || [];
  const byFreelancer: any[] = data?.byFreelancer || [];
  const byOrder: any[] = data?.byOrder || [];
  const total = summary.reduce((s: number, r: any) => s + (r.count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ThumbsDown size={22} className="text-[#485869]" />
          <h1 className="text-2xl font-bold text-[#485869]">إحصائيات رفض العروض</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-[#485869]">
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوم</option>
            <option value={90}>آخر 3 أشهر</option>
            <option value={365}>آخر سنة</option>
          </select>
          <button onClick={() => load(days)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className={`text-[#485869] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? <Loading /> : (
        <>
          {/* ملخص الأسباب */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["outside_specialty","busy","low_budget","other"].map(code => {
              const row = summary.find((r: any) => r.reason_code === code);
              const count = row?.count || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={code} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${REASON_COLORS[code]}`}>
                    {REASON_LABELS[code]}
                  </span>
                  <p className="text-3xl font-bold text-[#485869] mt-3">{count}</p>
                  <p className="text-sm text-gray-500">{pct}% من الإجمالي</p>
                </div>
              );
            })}
          </div>

          {/* جدول المستقلين */}
          {byFreelancer.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#485869]">رفض العروض حسب المستقل</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">المستقل</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">إجمالي الرفض</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">خارج تخصصي</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">مشغول</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">ميزانية قليلة</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">أخرى</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">آخر رفض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {byFreelancer.map((f: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#485869]">{f.freelancer_name || "—"}</p>
                          <p className="text-xs text-gray-400 font-mono">{f.freelancer_phone}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-lg ${f.total_rejections >= 10 ? "text-red-600" : f.total_rejections >= 5 ? "text-yellow-600" : "text-[#485869]"}`}>
                            {f.total_rejections}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-purple-600">{f.outside_specialty || 0}</td>
                        <td className="px-4 py-3 text-center text-yellow-600">{f.busy || 0}</td>
                        <td className="px-4 py-3 text-center text-red-600">{f.low_budget || 0}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{f.other || 0}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{f.last_rejection_at ? dateAr(f.last_rejection_at) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* الطلبات الأكثر رفضاً */}
          {byOrder.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#485869]">الطلبات الأكثر رفضاً من المستقلين</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {byOrder.map((o: any, i: number) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#485869] truncate">{o.description || "—"}</p>
                      <p className="text-xs text-gray-400">{o.public_code || `#${o.order_id}`} · {o.reasons}</p>
                    </div>
                    <span className={`shrink-0 font-bold text-lg ${o.rejection_count >= 5 ? "text-red-600" : "text-yellow-600"}`}>
                      {o.rejection_count} رفض
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!byFreelancer.length && !byOrder.length && (
            <Empty icon={ThumbsDown} msg="لا توجد بيانات رفض في هذه الفترة" />
          )}
        </>
      )}
    </div>
  );
}

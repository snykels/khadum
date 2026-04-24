'use client';

import { useState } from "react";
import {
  Search, Eye, Edit, Trash2, Plus, CheckCircle, X, Ban, Star, Clock, Lock,
  MessageSquare, Activity, Wallet, Tag, FileText, ShoppingBag, AlertCircle,
} from "lucide-react";
import FilterPanel, { FilterGroup, FilterChip } from "./FilterPanel";
import { useFetch, useToast, Loading, Empty, patchJson, postJson, delJson, fmt, dateAr, timeAgo } from "./_helpers";
import FreelancersPage from "./freelancers/FreelancersPage";
import ClientsPage from "./clients/ClientsPage";

// ============== Freelancers (redesigned with full feature set) ==============
export const FreelancersManagementPage = FreelancersPage;
// ============== Clients (redesigned with full feature set) ==============
export const ClientsManagementPage = ClientsPage;

// ============== Legacy Freelancers (kept for reference, not exported by default) ==============
function _LegacyFreelancersManagementPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/users?role=freelancer", "users");
  const { show, node } = useToast();
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("الكل");
  const [statusF, setStatusF] = useState("الكل");
  const list: any[] = data || [];
  const filtered = list.filter(f =>
    (f.name?.includes(search) || f.email?.includes(search)) &&
    (verified === "الكل" || (verified === "موثّق" ? f.isVerified : !f.isVerified)) &&
    (statusF === "الكل" || (statusF === "نشط" ? !f.isSuspended : f.isSuspended))
  );

  async function suspend(id: number, on: boolean) {
    const reason = on ? prompt("سبب الإيقاف؟") || "مخالفة شروط الخدمة" : "";
    const { ok, data } = await patchJson(`/api/admin/users/${id}`, { isSuspended: on, reason });
    show(ok ? (on ? "تم إيقاف المستقل" : "تم إلغاء الإيقاف") : data.error || "فشل الإجراء", ok);
    if (ok) reload();
  }
  async function verify(id: number, on: boolean) {
    const { ok } = await patchJson(`/api/admin/users/${id}`, { isVerified: on });
    show(ok ? "تم التحديث" : "فشل", ok); if (ok) reload();
  }
  const activeFilters = (verified !== "الكل" ? 1 : 0) + (statusF !== "الكل" ? 1 : 0);

  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white">إدارة المستقلين</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{list.length} مستقل مسجل</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد..." className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-sm rounded-lg pr-10 pl-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30" />
        </div>
        <FilterPanel active={activeFilters} onReset={() => { setVerified("الكل"); setStatusF("الكل"); }}>
          <FilterGroup label="التوثيق">{["الكل","موثّق","غير موثّق"].map(v => <FilterChip key={v} active={verified===v} onClick={()=>setVerified(v)}>{v}</FilterChip>)}</FilterGroup>
          <FilterGroup label="الحالة">{["الكل","نشط","موقوف"].map(v => <FilterChip key={v} active={statusF===v} onClick={()=>setStatusF(v)}>{v}</FilterChip>)}</FilterGroup>
        </FilterPanel>
      </div>

      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-4">المستقل</th><th className="text-right p-4">الجوال</th>
                <th className="text-right p-4">طلبات مكتملة</th><th className="text-right p-4">إجمالي الأرباح</th>
                <th className="text-right p-4">الحالة</th><th className="text-right p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map(f => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold">{f.name?.charAt(0)}</div>
                      <div>
                        <div className="flex items-center gap-1 font-medium text-[#485869] dark:text-white">{f.name} {f.isVerified && <CheckCircle size={14} className="text-[#34cc30]" />}</div>
                        <div className="text-xs text-gray-500">{f.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs" dir="ltr">{f.phone || "—"}</td>
                  <td className="p-4">{f.ordersCount}</td>
                  <td className="p-4 font-medium">{fmt(f.earned)} ر.س</td>
                  <td className="p-4">
                    {f.isSuspended
                      ? <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">موقوف</span>
                      : <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">نشط</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={()=>verify(f.id, !f.isVerified)} className="text-[#34cc30] hover:text-[#2eb829]" title={f.isVerified ? "إلغاء التوثيق" : "توثيق"}><CheckCircle size={16} /></button>
                      <button onClick={()=>suspend(f.id, !f.isSuspended)} className={f.isSuspended ? "text-green-500" : "text-gray-400 hover:text-red-500"} title={f.isSuspended ? "إلغاء الإيقاف" : "إيقاف"}><Ban size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-gray-400">لا توجد نتائج</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Clients ==============
function _LegacyClientsManagementPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/users?role=client", "users");
  const { show, node } = useToast();
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("الكل");
  const list: any[] = data || [];
  const filtered = list.filter(c =>
    (c.name?.includes(search) || c.phone?.includes(search)) &&
    (statusF === "الكل" || (statusF === "نشط" ? !c.isSuspended : c.isSuspended))
  );
  async function suspend(id: number, on: boolean) {
    const reason = on ? prompt("سبب الإيقاف؟") || "إيقاف من الإدارة" : "";
    const { ok } = await patchJson(`/api/admin/users/${id}`, { isSuspended: on, reason });
    show(ok ? "تم التحديث" : "فشل", ok); if (ok) reload();
  }
  const activeFilters = statusF !== "الكل" ? 1 : 0;

  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white">إدارة العملاء</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"><MessageSquare size={13} className="text-[#34cc30]" /> تعريف العميل عبر رقم الجوال — الاسم من واتساب</p>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{list.length} عميل</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث برقم الجوال أو الاسم..." className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-sm rounded-lg pr-10 pl-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30" />
        </div>
        <FilterPanel active={activeFilters} onReset={() => setStatusF("الكل")}>
          <FilterGroup label="الحالة">{["الكل","نشط","موقوف"].map(v => <FilterChip key={v} active={statusF===v} onClick={()=>setStatusF(v)}>{v}</FilterChip>)}</FilterGroup>
        </FilterPanel>
      </div>

      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-4">رقم الجوال (المعرّف)</th><th className="text-right p-4">اسم واتساب</th>
                <th className="text-right p-4">الطلبات</th><th className="text-right p-4">إجمالي الإنفاق</th>
                <th className="text-right p-4">آخر طلب</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white"><MessageSquare size={16} /></div>
                      <div>
                        <div className="font-mono font-bold text-[#485869] dark:text-white" dir="ltr">{c.phone || "—"}</div>
                        <div className="text-[11px] text-gray-400">عميل #{String(c.id).padStart(5,"0")}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{c.name}</td>
                  <td className="p-4">{c.ordersCount}</td>
                  <td className="p-4 font-medium">{fmt(c.spent)} ر.س</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{dateAr(c.lastOrder)}</td>
                  <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${c.isSuspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{c.isSuspended ? "موقوف" : "نشط"}</span></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <a href={`https://wa.me/${(c.phone||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="text-[#34cc30] hover:text-[#2eb829]" title="فتح واتساب"><MessageSquare size={16} /></a>
                      <button onClick={()=>suspend(c.id, !c.isSuspended)} className={c.isSuspended ? "text-green-500" : "text-gray-400 hover:text-red-500"} title={c.isSuspended ? "إلغاء الإيقاف" : "إيقاف"}><Ban size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-gray-400">لا توجد نتائج</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Staff ==============
export function StaffManagementPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/users?adminRole=any", "users");
  const { show, node } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("الكل");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", username:"", email:"", password:"", adminRole:"support" });
  const list: any[] = data || [];
  const roleLabel: any = { owner: "المالك", general: "مشرف عام", support: "دعم فني", finance: "مالي" };
  const filtered = list.filter(s =>
    (s.name?.includes(search) || s.username?.includes(search) || s.email?.includes(search)) &&
    (roleFilter === "الكل" || roleLabel[s.adminRole] === roleFilter)
  );

  async function add() {
    if (!form.name || !form.email || !form.password) return show("املأ الحقول المطلوبة", false);
    const { ok, data } = await postJson("/api/admin/users", { ...form, role: "admin" });
    show(ok ? "تمت إضافة الموظف" : data.error || "فشل", ok);
    if (ok) { setShowAdd(false); setForm({ name:"", username:"", email:"", password:"", adminRole:"support" }); reload(); }
  }
  async function remove(s: any) {
    if (s.isLocked) return show("حساب المالك محمي ولا يمكن حذفه", false);
    if (!(await confirmDialog({ message: `حذف الموظف ${s.name}؟`, variant: "danger", confirmLabel: "تأكيد" })).ok) return;
    const { ok, data } = await delJson(`/api/admin/users/${s.id}`);
    show(ok ? "تم الحذف" : data.error || "فشل", ok); if (ok) reload();
  }

  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white">المشرفين والموظفين</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة فريق العمل وصلاحياتهم — حساب المالك مثبّت ولا يمكن حذفه</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">{showAdd ? <><X size={16}/> إلغاء</> : <><Plus size={16}/> إضافة موظف</>}</button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30">
          <h3 className="font-bold text-[#485869] dark:text-white mb-4">موظف جديد</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5 text-sm" placeholder="الاسم الكامل" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className="border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5 text-sm" placeholder="اسم المستخدم" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
            <input type="email" className="border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5 text-sm" placeholder="البريد الإلكتروني" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input type="password" className="border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5 text-sm" placeholder="كلمة المرور" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            <select className="border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5 text-sm md:col-span-2" value={form.adminRole} onChange={e=>setForm({...form,adminRole:e.target.value})}>
              <option value="support">دعم فني</option><option value="general">مشرف عام</option><option value="finance">مالي</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={()=>setShowAdd(false)} className="border border-gray-200 dark:border-[#2a2d36] px-6 py-2 rounded-lg text-gray-600 dark:text-gray-400">إلغاء</button>
            <button onClick={add} className="bg-[#34cc30] text-white px-6 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Plus size={16}/> إضافة</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث بالاسم أو اسم المستخدم..." className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-sm rounded-lg pr-10 pl-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30" />
        </div>
        <FilterPanel active={roleFilter !== "الكل" ? 1 : 0} onReset={()=>setRoleFilter("الكل")}>
          <FilterGroup label="الدور">{["الكل","المالك","مشرف عام","دعم فني","مالي"].map(r => <FilterChip key={r} active={roleFilter===r} onClick={()=>setRoleFilter(r)}>{r}</FilterChip>)}</FilterGroup>
        </FilterPanel>
      </div>

      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">الموظف</th><th className="text-right p-4">الدور</th><th className="text-right p-4">آخر دخول</th><th className="text-right p-4">إجراءات</th></tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map(s => (
                <tr key={s.id} className={`border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5 ${s.isLocked ? "bg-gradient-to-l from-[#34cc30]/5 to-transparent" : ""}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${s.isLocked ? "bg-gradient-to-br from-[#34cc30] to-[#2eb829]" : "bg-gradient-to-br from-[#485869] to-[#3a4655]"}`}>{s.isLocked ? "★" : s.name?.charAt(0)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#485869] dark:text-white">{s.name}</span>
                          {s.isLocked && <span className="text-[10px] bg-[#34cc30] text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Lock size={10}/> مالك</span>}
                        </div>
                        <div className="text-xs text-gray-400 font-mono" dir="ltr">@{s.username || s.email?.split("@")[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{roleLabel[s.adminRole] || "—"}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{timeAgo(s.lastLoginAt)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className={s.isLocked ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600"} disabled={s.isLocked}><Edit size={16}/></button>
                      <button onClick={()=>remove(s)} className={s.isLocked ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-500"} disabled={s.isLocked}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Verifications (uses freelancers needing verify) ==============
export function VerificationsPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/users?role=freelancer", "users");
  const { show, node } = useToast();
  const list: any[] = (data || []).filter((u: any) => !u.isVerified);
  async function verify(id: number, on: boolean) {
    const { ok } = await patchJson(`/api/admin/users/${id}`, { isVerified: on });
    show(ok ? "تم التحديث" : "فشل", ok); if (ok) reload();
  }
  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">طلبات التحقق</h1>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">{list.length} بانتظار التوثيق</span>
      </div>
      {loading ? <Loading /> : list.length === 0 ? <Empty icon={CheckCircle} msg="جميع المستقلين موثّقون" /> : (
        <div className="space-y-4">
          {list.map(r => (
            <div key={r.id} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border border-gray-100 dark:border-[#2a2d36]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center text-white font-bold">{r.name?.charAt(0)}</div>
                  <div><div className="font-bold text-[#485869] dark:text-white">{r.name}</div><div className="text-sm text-gray-600 dark:text-gray-400">{r.email} • {r.phone || "—"}</div></div>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">غير موثّق</span>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>verify(r.id, true)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] text-sm flex items-center gap-2"><CheckCircle size={14}/> توثيق</button>
                <button onClick={async()=>{ const { ok } = await patchJson(`/api/admin/users/${r.id}`, { isSuspended: true, reason: "فشل التحقق" }); show(ok?"تم الإيقاف":"فشل", ok); if (ok) reload(); }} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm flex items-center gap-2"><X size={14}/> رفض وإيقاف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== Suspended Users ==============
export function SuspendedUsersPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/users?status=suspended", "users");
  const { show, node } = useToast();
  const list: any[] = data || [];
  async function unsuspend(id: number) {
    const { ok } = await patchJson(`/api/admin/users/${id}`, { isSuspended: false });
    show(ok ? "تم إلغاء الإيقاف" : "فشل", ok); if (ok) reload();
  }
  return (
    <div className="space-y-6">
      {node}
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">المستخدمون الموقوفون</h1>
      {loading ? <Loading /> : list.length === 0 ? <Empty icon={CheckCircle} msg="لا يوجد مستخدمون موقوفون" /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">المستخدم</th><th className="text-right p-4">النوع</th><th className="text-right p-4">السبب</th><th className="text-right p-4">تاريخ الإيقاف</th><th className="text-right p-4">إجراءات</th></tr>
            </thead>
            <tbody className="text-sm">
              {list.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-[#2a2d36]">
                  <td className="p-4 font-medium text-[#485869] dark:text-white">{s.name}</td>
                  <td className="p-4">{s.role === "freelancer" ? "مستقل" : s.role === "client" ? "عميل" : "موظف"}</td>
                  <td className="p-4 text-red-600">{s.suspensionReason || "—"}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{dateAr(s.suspendedAt)}</td>
                  <td className="p-4"><button onClick={()=>unsuspend(s.id)} className="bg-[#34cc30] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#2eb829]">إلغاء الإيقاف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Published Services ==============
export function PublishedServicesPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/services?status=published", "services");
  const { show, node } = useToast();
  async function suspend(id: number) {
    if (!(await confirmDialog({ message: "إيقاف الخدمة؟", variant: "danger", confirmLabel: "تأكيد" })).ok) return;
    const { ok } = await postJson(`/api/admin/services/${id}/moderate`, { action: "suspend" });
    show(ok ? "تم الإيقاف" : "فشل", ok); if (ok) reload();
  }
  const list: any[] = data || [];
  return (
    <div className="space-y-6">
      {node}
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الخدمات المنشورة</h1>
      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">الخدمة</th><th className="text-right p-4">المستقل</th><th className="text-right p-4">السعر</th><th className="text-right p-4">الطلبات</th><th className="text-right p-4">التصنيف</th><th className="text-right p-4">إجراءات</th></tr>
            </thead>
            <tbody className="text-sm">
              {list.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-[#2a2d36]">
                  <td className="p-4 font-medium text-[#485869] dark:text-white">{s.title}</td>
                  <td className="p-4">{s.freelancerName}</td>
                  <td className="p-4">{fmt(s.price)} ر.س</td>
                  <td className="p-4">{s.ordersCount}</td>
                  <td className="p-4"><span className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">{s.categoryName}</span></td>
                  <td className="p-4"><div className="flex gap-2"><button onClick={()=>suspend(s.id)} className="text-gray-400 hover:text-red-500" title="إيقاف"><Ban size={16}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Pending Services ==============
export function PendingServicesPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/services?status=pending", "services");
  const { show, node } = useToast();
  async function moderate(id: number, action: "approve" | "reject") {
    const reason = action === "reject" ? prompt("سبب الرفض") || "غير مطابق للمعايير" : "";
    const { ok } = await postJson(`/api/admin/services/${id}/moderate`, { action, reason });
    show(ok ? (action === "approve" ? "تمت الموافقة" : "تم الرفض") : "فشل", ok); if (ok) reload();
  }
  const list: any[] = data || [];
  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">خدمات بانتظار الموافقة</h1>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">{list.length} خدمة</span>
      </div>
      {loading ? <Loading /> : list.length === 0 ? <Empty icon={CheckCircle} msg="لا توجد خدمات بانتظار الموافقة" /> : (
        <div className="space-y-4">
          {list.map(p => (
            <div key={p.id} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border border-gray-100 dark:border-[#2a2d36]">
              <div className="flex items-center justify-between mb-3">
                <div><div className="font-bold text-[#485869] dark:text-white text-lg">{p.title}</div><div className="text-sm text-gray-600 dark:text-gray-400">{p.freelancerName} • {p.categoryName} • {fmt(p.price)} ر.س</div></div>
                <span className="text-sm text-gray-500">{dateAr(p.createdAt)}</span>
              </div>
              {p.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{p.description}</p>}
              <div className="flex gap-3">
                <button onClick={()=>moderate(p.id,"approve")} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] text-sm flex items-center gap-2"><CheckCircle size={14}/> موافقة</button>
                <button onClick={()=>moderate(p.id,"reject")} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm flex items-center gap-2"><X size={14}/> رفض</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== Categories ==============
export function CategoriesManagementPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/categories", "categories");
  const { show, node } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nameAr: "", icon: "📂" });

  async function add() {
    if (!form.nameAr) return;
    const { ok } = await postJson("/api/admin/categories", form);
    show(ok ? "تمت الإضافة" : "فشل", ok); if (ok) { setForm({ nameAr:"", icon:"📂" }); setShowAdd(false); reload(); }
  }
  async function rename(c: any) {
    const nameAr = prompt("الاسم الجديد", c.nameAr); if (!nameAr) return;
    const { ok } = await patchJson(`/api/admin/categories/${c.id}`, { nameAr });
    show(ok ? "تم التعديل" : "فشل", ok); if (ok) reload();
  }
  async function remove(c: any) {
    if (!(await confirmDialog({ message: `حذف ${c.nameAr}؟ سيتم فك ربط الخدمات منه.`, variant: "danger", confirmLabel: "تأكيد" })).ok) return;
    const { ok } = await delJson(`/api/admin/categories/${c.id}`);
    show(ok ? "تم الحذف" : "فشل", ok); if (ok) reload();
  }
  const list: any[] = data || [];
  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">إدارة التصنيفات</h1>
        <button onClick={()=>setShowAdd(!showAdd)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">{showAdd ? <><X size={16}/> إلغاء</> : <><Plus size={16}/> تصنيف جديد</>}</button>
      </div>
      {showAdd && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border-2 border-dashed border-[#34cc30]/30 flex gap-3 items-end">
          <div className="flex-1"><label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">الاسم</label><input value={form.nameAr} onChange={e=>setForm({...form, nameAr: e.target.value})} className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5 text-sm" /></div>
          <div><label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">الأيقونة</label><input value={form.icon} onChange={e=>setForm({...form, icon: e.target.value})} className="w-20 border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2.5 text-sm text-center" /></div>
          <button onClick={add} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg">حفظ</button>
        </div>
      )}
      {loading ? <Loading /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(c => (
            <div key={c.id} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 dark:border-[#2a2d36]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{c.icon}</div>
                <div className="flex gap-2"><button onClick={()=>rename(c)} className="text-gray-400 hover:text-gray-600"><Edit size={16}/></button><button onClick={()=>remove(c)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div>
              </div>
              <h3 className="font-bold text-[#485869] dark:text-white mb-1">{c.nameAr}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{c.servicesCount} خدمة</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== Keywords ==============
export function KeywordsPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/keywords", "keywords");
  const { show, node } = useToast();
  const [w, setW] = useState("");
  async function add() {
    if (!w.trim()) return;
    const { ok, data } = await postJson("/api/admin/keywords", { word: w.trim() });
    show(ok ? "تمت الإضافة" : data.error || "فشل", ok); if (ok) { setW(""); reload(); }
  }
  const list: any[] = data || [];
  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الكلمات المفتاحية</h1>
        <div className="flex gap-2">
          <input value={w} onChange={e=>setW(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="كلمة جديدة..." className="border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg px-4 py-2 text-sm" />
          <button onClick={add} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2"><Plus size={16}/> إضافة</button>
        </div>
      </div>
      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border border-gray-100 dark:border-[#2a2d36]">
          <div className="flex flex-wrap gap-3">
            {list.map(k => (
              <span key={k.id} className="bg-[#485869]/10 dark:bg-white/10 text-[#485869] dark:text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                {k.word} <span className="text-xs text-gray-400">{k.searches}</span>
              </span>
            ))}
            {list.length === 0 && <p className="text-gray-400 text-sm">لا توجد كلمات بعد</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============== All Orders ==============
const orderStatusLabel: any = { pending: "بانتظار الدفع", active: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغى", disputed: "في نزاع" };
const orderStatusColor: any = { pending: "bg-yellow-100 text-yellow-700", active: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-600", disputed: "bg-red-100 text-red-700" };

export function AllOrdersPage() {
  const { data, loading } = useFetch<any>("/api/admin/orders", "orders");
  const list: any[] = data || [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">كل الطلبات</h1>
      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">رقم الطلب</th><th className="text-right p-4">الخدمة</th><th className="text-right p-4">المستقل</th><th className="text-right p-4">العميل</th><th className="text-right p-4">المبلغ</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">التاريخ</th></tr>
            </thead>
            <tbody className="text-sm">
              {list.map((o:any) => (
                <tr key={o.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 font-medium text-[#485869] dark:text-white">#ORD-{String(o.id).padStart(4,"0")}</td>
                  <td className="p-4">{o.serviceTitle}</td>
                  <td className="p-4">{o.freelancerName}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{o.clientName}</td>
                  <td className="p-4 font-medium">{fmt(o.amount)} ر.س</td>
                  <td className="p-4"><span className={`${orderStatusColor[o.status]} px-3 py-1 rounded-full text-xs font-medium`}>{orderStatusLabel[o.status]}</span></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{dateAr(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Active Orders ==============
export function ActiveOrdersPage() {
  const { data, loading } = useFetch<any>("/api/admin/orders", "orders");
  const list: any[] = data || [];
  const counts: any = { active: 0, pending: 0, completed: 0, disputed: 0 };
  list.forEach((o:any) => counts[o.status] !== undefined && counts[o.status]++);
  const active = list.filter(o => o.status === "active");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الطلبات النشطة</h1>
      <div className="grid md:grid-cols-4 gap-4">
        {[{l:"قيد التنفيذ",v:counts.active,c:"bg-blue-500"},{l:"بانتظار الدفع",v:counts.pending,c:"bg-yellow-500"},{l:"مكتملة",v:counts.completed,c:"bg-green-500"},{l:"في نزاع",v:counts.disputed,c:"bg-red-500"}].map(s => (
          <div key={s.l} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-4 border border-gray-100 dark:border-[#2a2d36]">
            <div className="flex items-center gap-3 mb-2"><div className={`w-3 h-3 rounded-full ${s.c}`}/><span className="text-sm text-gray-600 dark:text-gray-400">{s.l}</span></div>
            <div className="text-2xl font-bold text-[#485869] dark:text-white">{s.v}</div>
          </div>
        ))}
      </div>
      {loading ? <Loading /> : active.length === 0 ? <Empty icon={Activity} msg="لا توجد طلبات نشطة حالياً" /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">الرقم</th><th className="text-right p-4">الخدمة</th><th className="text-right p-4">المستقل</th><th className="text-right p-4">المبلغ</th><th className="text-right p-4">التسليم</th></tr>
            </thead>
            <tbody className="text-sm">
              {active.map((o:any) => (
                <tr key={o.id} className="border-b border-gray-100 dark:border-[#2a2d36]">
                  <td className="p-4 font-medium">#ORD-{String(o.id).padStart(4,"0")}</td>
                  <td className="p-4">{o.serviceTitle}</td>
                  <td className="p-4">{o.freelancerName}</td>
                  <td className="p-4 font-medium">{fmt(o.amount)} ر.س</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{dateAr(o.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Disputes ==============
export function DisputesPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/orders?status=disputed", "orders");
  const { show, node } = useToast();
  const list: any[] = data || [];
  async function resolve(id: number, target: "freelancer" | "client") {
    if (!(await confirmDialog({ message: `تأكيد الحل لصالح ${target === "freelancer" ? "المستقل" : "العميل"}؟`, variant: "danger", confirmLabel: "تأكيد" })).ok) return;
    const status = target === "freelancer" ? "completed" : "cancelled";
    const { ok } = await patchJson(`/api/admin/orders/${id}`, { status });
    show(ok ? "تم الحل" : "فشل", ok); if (ok) reload();
  }
  return (
    <div className="space-y-6">
      {node}
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الطلبات في نزاع</h1>
      {loading ? <Loading /> : list.length === 0 ? <Empty icon={CheckCircle} msg="لا توجد نزاعات حالياً" /> : (
        <div className="space-y-4">
          {list.map((d:any) => (
            <div key={d.id} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border border-gray-100 dark:border-[#2a2d36]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-[#485869] dark:text-white">#ORD-{String(d.id).padStart(4,"0")}</span>
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">في نزاع</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{d.serviceTitle}</div>
                </div>
                <span className="font-bold text-[#485869] dark:text-white">{fmt(d.amount)} ر.س</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div><span className="text-gray-500">المستقل: </span><span className="font-medium">{d.freelancerName}</span></div>
                <div><span className="text-gray-500">العميل: </span><span className="font-medium">{d.clientName}</span></div>
                <div><span className="text-gray-500">التاريخ: </span><span className="font-medium">{dateAr(d.createdAt)}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>resolve(d.id,"freelancer")} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2eb829]">حل لصالح المستقل</button>
                <button onClick={()=>resolve(d.id,"client")} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">حل لصالح العميل</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== Cancelled Orders ==============
export function CancelledOrdersPage() {
  const { data, loading } = useFetch<any>("/api/admin/orders?status=cancelled", "orders");
  const list: any[] = data || [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الطلبات الملغاة</h1>
      {loading ? <Loading /> : list.length === 0 ? <Empty icon={CheckCircle} msg="لا توجد طلبات ملغاة" /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">رقم الطلب</th><th className="text-right p-4">الخدمة</th><th className="text-right p-4">العميل</th><th className="text-right p-4">التاريخ</th><th className="text-right p-4">المبلغ</th></tr>
            </thead>
            <tbody className="text-sm">
              {list.map((c:any) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-[#2a2d36]">
                  <td className="p-4 font-medium">#ORD-{String(c.id).padStart(4,"0")}</td>
                  <td className="p-4">{c.serviceTitle}</td>
                  <td className="p-4">{c.clientName}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{dateAr(c.createdAt)}</td>
                  <td className="p-4">{fmt(c.amount)} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Wallets ==============
export function WalletsPage() {
  const { data, loading } = useFetch<any>("/api/admin/wallets", "summary");
  const w = useFetch<any>("/api/admin/wallets", "wallets");
  const s: any = data || {};
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">المحافظ والأرصدة</h1>
      {loading ? <Loading /> : (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { l:"إجمالي الأرصدة", v: s.totalBalance, c:"from-[#34cc30] to-[#2eb829]" },
              { l:"أرصدة المستقلين", v: s.freelancerBalance, c:"from-blue-500 to-blue-600" },
              { l:"أرصدة معلقة", v: s.pendingBalance, c:"from-yellow-500 to-orange-500" },
              { l:"أرباح المنصة", v: s.platformProfit, c:"from-purple-500 to-pink-500" },
            ].map(c => (
              <div key={c.l} className={`bg-gradient-to-br ${c.c} rounded-xl p-6 text-white`}>
                <div className="text-sm opacity-80 mb-2">{c.l}</div>
                <div className="text-2xl font-bold">{fmt(c.v)} ر.س</div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#15171c] text-gray-600 dark:text-gray-400"><tr><th className="text-right p-4">المستخدم</th><th className="text-right p-4">الدور</th><th className="text-right p-4">الرصيد</th><th className="text-right p-4">معلّق</th><th className="text-right p-4">إجمالي ما تم كسبه</th></tr></thead>
              <tbody>
                {(w.data||[]).map((row:any) => (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-[#2a2d36]">
                    <td className="p-4 font-medium">{row.name}</td>
                    <td className="p-4">{row.role}</td>
                    <td className="p-4 font-bold text-[#34cc30]">{fmt(row.balance)} ر.س</td>
                    <td className="p-4 text-yellow-600">{fmt(row.pending)} ر.س</td>
                    <td className="p-4">{fmt(row.totalEarned)} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============== Withdrawals ==============
export function AdminWithdrawalsPage() {
  const { data, loading, reload } = useFetch<any>("/api/admin/withdrawals", "withdrawals");
  const { show, node } = useToast();
  const list: any[] = data || [];
  async function action(id: number, status: "approved" | "rejected") {
    const { ok } = await patchJson(`/api/admin/withdrawals/${id}`, { status });
    show(ok ? (status === "approved" ? "تم تأكيد التحويل" : "تم الرفض") : "فشل", ok); if (ok) reload();
  }
  const statusColor: any = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
  const statusLabel: any = { pending: "بانتظار التحويل", approved: "تم التحويل", rejected: "مرفوض" };
  return (
    <div className="space-y-6">
      {node}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">طلبات السحب</h1>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">{list.filter(w=>w.status==="pending").length} بانتظار</span>
      </div>
      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-sm text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">الرقم</th><th className="text-right p-4">المستقل</th><th className="text-right p-4">المبلغ</th><th className="text-right p-4">البنك</th><th className="text-right p-4">آيبان</th><th className="text-right p-4">التاريخ</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">إجراء</th></tr>
            </thead>
            <tbody className="text-sm">
              {list.map((w:any) => (
                <tr key={w.id} className="border-b border-gray-100 dark:border-[#2a2d36]">
                  <td className="p-4 font-medium">WD-{String(w.id).padStart(4,"0")}</td>
                  <td className="p-4">{w.freelancerName}</td>
                  <td className="p-4 font-bold">{fmt(w.amount)} ر.س</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{w.bankName}</td>
                  <td className="p-4 text-xs font-mono" dir="ltr">{w.accountNumber}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{dateAr(w.createdAt)}</td>
                  <td className="p-4"><span className={`${statusColor[w.status]} px-3 py-1 rounded-full text-xs font-medium`}>{statusLabel[w.status]}</span></td>
                  <td className="p-4">
                    {w.status === "pending" ? (
                      <div className="flex gap-1">
                        <button onClick={()=>action(w.id,"approved")} className="bg-[#34cc30] text-white px-3 py-1 rounded text-xs">تأكيد</button>
                        <button onClick={()=>action(w.id,"rejected")} className="bg-red-500 text-white px-3 py-1 rounded text-xs">رفض</button>
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Admin Transactions (Real) ==============
export function AdminTransactionsPage() {
  const { data, loading } = useFetch<any>("/api/admin/transactions", "summary");
  const orders = useFetch<any>("/api/admin/transactions", "orders");
  const s: any = data || {};
  const list: any[] = orders.data || [];
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("الكل");
  const filtered = list.filter((o: any) =>
    (o.publicCode?.includes(search) || o.clientName?.includes(search) || o.freelancerName?.includes(search) || o.clientPhone?.includes(search)) &&
    (statusF === "الكل" || o.paymentStatus === statusF)
  );
  const statusLabel: any = { paid: "مدفوع", pending: "معلّق", failed: "فشل" };
  const statusColor: any = { paid: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", failed: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">المعاملات المالية</h1>
      {loading ? <Loading /> : (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { l: "إجمالي الإيرادات", v: s.totalRevenue, c: "from-[#34cc30] to-[#2eb829]" },
              { l: "أرباح المنصة", v: s.platformProfit, c: "from-purple-500 to-pink-500" },
              { l: "مدفوع للمستقلين", v: s.paidOut, c: "from-blue-500 to-blue-600" },
              { l: "أمانة (escrow)", v: s.escrow, c: "from-yellow-500 to-orange-500" },
            ].map(c => (
              <div key={c.l} className={`bg-gradient-to-br ${c.c} rounded-xl p-5 text-white`}>
                <div className="text-xs text-white/80 mb-1">{c.l}</div>
                <div className="text-2xl font-bold">{fmt(c.v)} ر.س</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالرقم أو الاسم..." className="w-full border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-sm rounded-lg pr-9 pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30" />
            </div>
            <div className="flex gap-1">
              {["الكل","paid","pending","failed"].map(v => (
                <button key={v} onClick={() => setStatusF(v)} className={`px-3 py-1 rounded-full text-xs ${statusF===v ? "bg-[#34cc30] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#2a2d36] dark:text-gray-400"}`}>
                  {v === "الكل" ? "الكل" : statusLabel[v]}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#15171c] text-gray-600 dark:text-gray-400">
                <tr><th className="text-right p-4">رقم الطلب</th><th className="text-right p-4">العميل</th><th className="text-right p-4">المستقل</th><th className="text-right p-4">المبلغ</th><th className="text-right p-4">عمولة المنصة</th><th className="text-right p-4">التاريخ</th><th className="text-right p-4">الحالة</th></tr>
              </thead>
              <tbody>
                {filtered.map((o: any) => (
                  <tr key={o.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4 font-medium text-[#485869] dark:text-white">#{o.publicCode || String(o.id).padStart(4,"0")}</td>
                    <td className="p-4">{o.clientName || o.clientPhone || "—"}</td>
                    <td className="p-4">{o.freelancerName || "—"}</td>
                    <td className="p-4 font-bold">{fmt(o.paidAmount || o.amount)} ر.س</td>
                    <td className="p-4 text-[#34cc30]">{fmt(o.platformFee)} ر.س</td>
                    <td className="p-4 text-gray-500">{dateAr(o.createdAt)}</td>
                    <td className="p-4"><span className={`${statusColor[o.paymentStatus] || "bg-gray-100 text-gray-700"} px-2 py-1 rounded-full text-xs`}>{statusLabel[o.paymentStatus] || o.paymentStatus || "—"}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-gray-400">لا توجد معاملات</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============== Admin Invoices (Placeholder with real data) ==============
export function AdminInvoicesPage() {
  const { data, loading } = useFetch<any>("/api/admin/transactions", "orders");
  const list: any[] = (data || []).filter((o: any) => o.paymentStatus === "paid");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الفواتير</h1>
      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">رقم الفاتورة</th><th className="text-right p-4">العميل</th><th className="text-right p-4">المستقل</th><th className="text-right p-4">المبلغ</th><th className="text-right p-4">عمولة</th><th className="text-right p-4">الصافي</th><th className="text-right p-4">التاريخ</th></tr>
            </thead>
            <tbody>
              {list.map((o: any, i: number) => (
                <tr key={o.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 font-medium">INV-{String(i+1).padStart(4,"0")}</td>
                  <td className="p-4">{o.clientName || o.clientPhone || "—"}</td>
                  <td className="p-4">{o.freelancerName || "—"}</td>
                  <td className="p-4 font-bold">{fmt(o.paidAmount || o.amount)} ر.س</td>
                  <td className="p-4 text-[#34cc30]">{fmt(o.platformFee)} ر.س</td>
                  <td className="p-4">{fmt(Number(o.paidAmount || o.amount) - Number(o.platformFee))} ر.س</td>
                  <td className="p-4 text-gray-500">{dateAr(o.completedAt || o.createdAt)}</td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-gray-400">لا توجد فواتير مدفوعة بعد</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Admin Payment Links ==============
export function AdminPaymentLinksPage() {
  const { data, loading } = useFetch<any>("/api/admin/transactions", "paymentSessions");
  const sessions: any[] = data || [];
  const statusLabel: any = { pending: "بانتظار الدفع", paid: "مدفوع", expired: "انتهت", cancelled: "ملغي" };
  const statusColor: any = { pending: "bg-yellow-100 text-yellow-700", paid: "bg-green-100 text-green-700", expired: "bg-gray-100 text-gray-500", cancelled: "bg-red-100 text-red-700" };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">روابط الدفع</h1>
      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-[#2a2d36]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#15171c] text-gray-600 dark:text-gray-400">
              <tr><th className="text-right p-4">رقم الطلب</th><th className="text-right p-4">جوال العميل</th><th className="text-right p-4">المبلغ</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">انتهاء الصلاحية</th><th className="text-right p-4">تاريخ الإنشاء</th></tr>
            </thead>
            <tbody>
              {sessions.map((ps: any) => (
                <tr key={ps.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 font-medium">{ps.orderId ? `#${ps.orderId}` : "—"}</td>
                  <td className="p-4 font-mono text-xs" dir="ltr">{ps.clientPhone}</td>
                  <td className="p-4 font-bold">{fmt(ps.amount)} ر.س</td>
                  <td className="p-4"><span className={`${statusColor[ps.status] || "bg-gray-100 text-gray-700"} px-2 py-1 rounded-full text-xs`}>{statusLabel[ps.status] || ps.status}</span></td>
                  <td className="p-4 text-gray-500 text-xs">{ps.expiresAt ? dateAr(ps.expiresAt) : "—"}</td>
                  <td className="p-4 text-gray-500 text-xs">{dateAr(ps.createdAt)}</td>
                </tr>
              ))}
              {sessions.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-gray-400">لا توجد روابط دفع بعد</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Generic placeholder ==============
export function GenericAdminPage({ title, icon: Icon, description }: { title: string; icon: any; description: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">{title}</h1>
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-[#2a2d36]">
        <Icon size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
        <p className="text-sm text-gray-400 mt-4">قيد التطوير</p>
      </div>
    </div>
  );
}

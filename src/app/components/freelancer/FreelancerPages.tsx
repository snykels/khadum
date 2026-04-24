'use client';

import { useState, useEffect } from "react";
<<<<<<< HEAD
import Link from "next/link";
import ChatView from "../chat/ChatView";
import {
  User, ShoppingBag, MessageCircle, Briefcase, Award, Star,
  Wallet, FileText, TrendingUp, Download, Settings, Shield, Phone,
  HelpCircle, Plus, Edit, Eye,
  CheckCircle, Clock, AlertCircle, Send, Paperclip,
  X, Save, Lock,
  ArrowLeft, RefreshCw, Zap, AlertTriangle,
  DollarSign, Info, Check, Smartphone, Laptop, Calendar, Bell, Globe, ExternalLink
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

// =================== Status badge helpers ===================
const orderStatusBadge: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent",
  active:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-transparent",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-transparent",
  disputed:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-transparent",
};
const orderStatusLabel: Record<string, string> = {
  pending: "بانتظار الدفع", active: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغي", disputed: "نزاع",
};
=======
import ChatView from "../chat/ChatView";
import {
  User, ShoppingBag, MessageCircle, Briefcase, FolderOpen, Award, Star,
  Wallet, FileText, TrendingUp, Download, Settings, Bell, Shield, Phone,
  Calendar, HelpCircle, Plus, Edit, Trash2, Eye,
  CheckCircle, Clock, AlertCircle, Send, Paperclip,
  Upload, X, Save, Lock,
  ArrowLeft, RefreshCw, Zap, AlertTriangle,
  DollarSign, Info, Check, Smartphone, Laptop
} from "lucide-react";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

// =================== الملف الشخصي ===================
export function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationLoading, setVacationLoading] = useState(false);
  const [showVacationConfirm, setShowVacationConfirm] = useState(false);
  const [pendingVacation, setPendingVacation] = useState(false);
  const [vacationMsg, setVacationMsg] = useState("");

  const reload = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/freelancer/profile").then(r => r.json()),
      fetch("/api/freelancer/availability").then(r => r.json()).catch(() => ({ vacationMode: false })),
    ]).then(([pd, av]) => {
      setProfile(pd.profile);
      setVacationMode(!!av.vacationMode);
=======
  const [editing, setEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "professional">("personal");
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const reload = () => {
    setLoading(true);
    fetch("/api/freelancer/profile").then(r => r.json()).then(d => {
      setProfile(d.profile);
      setForm({
        name: d.profile?.name || "",
        bio: d.profile?.bio || "",
        location: d.profile?.location || "",
      });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    }).finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

<<<<<<< HEAD
  const requestVacationToggle = () => {
    setPendingVacation(!vacationMode);
    setShowVacationConfirm(true);
  };

  const confirmVacationToggle = async () => {
    setShowVacationConfirm(false);
    setVacationLoading(true);
    try {
      const r = await fetch("/api/freelancer/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacationMode: pendingVacation }),
      });
      if (r.ok) {
        setVacationMode(pendingVacation);
        setVacationMsg(pendingVacation ? "تم تفعيل وضع الإجازة — ملفك مخفي مؤقتاً عن العملاء" : "أنت متوفر للعمل الآن");
      } else {
        setVacationMsg("تعذر تحديث حالة التوفر");
      }
    } catch {
      setVacationMsg("خطأ في الاتصال");
    }
    setVacationLoading(false);
    setTimeout(() => setVacationMsg(""), 4000);
  };

  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;
  if (!profile) return <Card className="p-12 text-center text-muted-foreground">تعذّر تحميل الملف الشخصي</Card>;

  const initial = (profile.name || "م").charAt(0);
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long" }) : "—";
  const skills = (profile.skills || "").split(/[,،]/).map((s: string) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {vacationMsg && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 ${vacationMode ? "bg-yellow-500 text-white" : "bg-[#34cc30] text-white"}`}>
          <Check size={18} /> {vacationMsg}
        </div>
      )}

      {/* Vacation confirm dialog */}
      {showVacationConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${pendingVacation ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                  <Calendar size={24} className={pendingVacation ? "text-yellow-600" : "text-green-600"} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {pendingVacation ? "تفعيل وضع الإجازة" : "إيقاف وضع الإجازة"}
                </h3>
              </div>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                {pendingVacation
                  ? "عند تفعيل وضع الإجازة سيتم إخفاء ملفك وخدماتك مؤقتاً عن العملاء ولن تتلقى طلبات جديدة. يمكنك إنهاء طلباتك الجارية بشكل طبيعي."
                  : "عند إيقاف وضع الإجازة ستعود خدماتك للظهور للعملاء وتبدأ باستقبال الطلبات مجدداً."}
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowVacationConfirm(false)}>إلغاء</Button>
                <Button
                  variant="brand"
                  className={pendingVacation ? "!bg-yellow-500 hover:!bg-yellow-600" : ""}
                  onClick={confirmVacationToggle}
                  disabled={vacationLoading}
                >
                  {vacationLoading ? "جارٍ التحديث..." : "تأكيد"}
                </Button>
              </div>
            </CardContent>
          </Card>
=======
  async function save() {
    setSaving(true);
    const r = await fetch("/api/freelancer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (r.ok) {
      setEditing(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
      reload();
    }
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;
  if (!profile) return <div className="bg-white rounded-xl p-12 text-center text-gray-400">تعذّر تحميل الملف الشخصي</div>;

  const initial = (profile.name || "م").charAt(0);
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long" }) : "—";

  return (
    <div className="space-y-6">
      {showSaved && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#34cc30] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <Check size={18} /> تم حفظ التغييرات بنجاح
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        </div>
      )}

      <div className="flex items-center justify-between">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-foreground">ملفي الشخصي</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{vacationMode ? "وضع الإجازة مفعّل" : "متوفر للعمل"}</span>
          <button
            onClick={requestVacationToggle}
            disabled={vacationLoading}
            className={`w-12 h-7 rounded-full relative transition-colors disabled:opacity-60 ${vacationMode ? "bg-yellow-500" : "bg-[#34cc30]"}`}
            aria-label="تبديل وضع الإجازة"
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${vacationMode ? "right-1" : "right-6"}`} />
          </button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#485869] to-[#3a4655] h-32" />
        <CardContent className="px-8 pt-6 pb-4 flex items-center gap-5 p-0">
          <div className="-mt-14 px-8">
            {profile.avatar ? (
              <img src={profile.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white text-3xl font-bold border-4 border-background shadow-lg">{initial}</div>
            )}
          </div>
          <div className="min-w-0 flex-1 py-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              {profile.isVerified && <CheckCircle size={18} className="text-[#34cc30]" />}
            </div>
            <p className="text-sm text-muted-foreground">{profile.mainCategory || "مستقل"} · عضو منذ {memberSince}</p>
          </div>
        </CardContent>

        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <ReadField label="الاسم الكامل" value={profile.name} />
            <ReadField label="البريد الإلكتروني" value={profile.email} />
            <ReadField label="رقم الواتساب" value={profile.phone} />
            <ReadField label="المدينة" value={profile.location} />
            <ReadField label="التخصص الرئيسي" value={profile.mainCategory} />
            <ReadField label="التخصص الفرعي" value={profile.subCategory} />
            {profile.bio && (
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-1.5">نبذة عني</label>
                <div className="border border-input rounded-md px-3 py-2 bg-muted text-sm min-h-[80px] text-foreground whitespace-pre-line">{profile.bio}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {skills.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-foreground mb-3">المهارات</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: string, i: number) => (
                <span key={i} className="bg-[#34cc30]/10 text-[#34cc30] px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
=======
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">ملفي الشخصي</h1>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); reload(); }} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50">إلغاء</button>
              <button onClick={save} disabled={saving} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2 disabled:opacity-60">
                <Save size={16} /> {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">
              <Edit size={16} /> تعديل الملف
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#485869] to-[#3a4655] h-32" />
        <div className="px-8 pt-6 pb-4 flex items-center gap-5">
          <div className="-mt-14">
            {profile.avatar ? (
              <img src={profile.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#1a1d24] shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-[#1a1d24] shadow-lg">{initial}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#485869] dark:text-white">{profile.name}</h2>
              {profile.isVerified && <CheckCircle size={18} className="text-[#34cc30]" />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.mainCategory || "مستقل"} · عضو منذ {memberSince}</p>
          </div>
        </div>

        <div className="px-8 border-b border-gray-100 dark:border-[#2a2d36]">
          <div className="flex gap-6">
            {([["personal", "المعلومات الشخصية"], ["professional", "المعلومات المهنية"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`pb-3 text-sm font-medium border-b-2 ${activeTab === key ? "border-[#34cc30] text-[#34cc30]" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === "personal" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">الاسم الكامل</label>
                <input disabled={!editing} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5 disabled:bg-gray-50 dark:disabled:bg-[#1a1d24]" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">البريد الإلكتروني</label>
                <input disabled value={profile.email || ""} dir="ltr" className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#1a1d24] dark:text-gray-400 rounded-lg px-4 py-2.5 bg-gray-50 text-right" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">رقم الواتساب</label>
                <input disabled value={profile.phone || "—"} dir="ltr" className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#1a1d24] dark:text-gray-400 rounded-lg px-4 py-2.5 bg-gray-50 text-right" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">المدينة</label>
                <input disabled={!editing} value={form.location || ""} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5 disabled:bg-gray-50 dark:disabled:bg-[#1a1d24]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">نبذة عني</label>
                <textarea disabled={!editing} rows={4} value={form.bio || ""} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5 disabled:bg-gray-50 dark:disabled:bg-[#1a1d24]" placeholder="اكتب نبذة عن نفسك..." />
              </div>
            </div>
          )}
          {activeTab === "professional" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="التخصص الرئيسي" value={profile.mainCategory} />
              <Field label="التخصص الفرعي" value={profile.subCategory} />
              <Field label="سنوات الخبرة" value={profile.yearsExperience} />
              <Field label="اللغات" value={profile.languages} />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">المهارات</label>
                <div className="bg-gray-50 dark:bg-[#252830] rounded-lg px-4 py-3 text-sm text-[#485869] dark:text-white">{profile.skills || "—"}</div>
              </div>
              <Field label="رابط الأعمال (Behance/Dribbble)" value={profile.portfolioUrl} link />
              <Field label="LinkedIn" value={profile.linkedinUrl} link />
              <p className="md:col-span-2 text-xs text-gray-500">لتعديل المعلومات المهنية، تواصل مع الدعم الفني.</p>
            </div>
          )}
        </div>
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "طلب مكتمل", value: profile.completedProjects ?? 0, icon: ShoppingBag, color: "text-blue-600 bg-blue-100" },
          { label: "تقييم عام", value: `${(Number(profile.rating) || 0).toFixed(1)} ★`, icon: Star, color: "text-yellow-600 bg-yellow-100" },
          { label: "وقت الاستجابة", value: profile.avgResponseTime ? `${profile.avgResponseTime} د` : "—", icon: Clock, color: "text-purple-600 bg-purple-100" },
          { label: "الحالة", value: profile.isVerified ? "موثّق" : "قيد المراجعة", icon: CheckCircle, color: "text-[#34cc30] bg-[#34cc30]/10" },
        ].map(s => (
<<<<<<< HEAD
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon size={20} /></div>
              <div>
                <div className="text-xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
=======
          <div key={s.label} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon size={20} /></div>
            <div>
              <div className="text-xl font-bold text-[#485869] dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        ))}
      </div>
    </div>
  );
}

<<<<<<< HEAD
function ReadField({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <div className="border border-input rounded-md px-3 py-2 bg-muted text-sm min-h-[38px] text-foreground">
        {value || <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function Field({ label, value, link }: { label: string; value: any; link?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <div className="border border-input rounded-md px-3 py-2 bg-muted text-sm min-h-[38px] text-foreground">
        {value ? (link ? <a href={value} target="_blank" rel="noreferrer" className="text-[#34cc30] hover:underline" dir="ltr">{value}</a> : value) : <span className="text-muted-foreground">—</span>}
=======
function Field({ label, value, link }: { label: string; value: any; link?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      <div className="border border-gray-200 dark:border-[#2a2d36] dark:bg-[#1a1d24] rounded-lg px-4 py-2.5 bg-gray-50 dark:text-gray-300 text-sm min-h-[42px]">
        {value ? (link ? <a href={value} target="_blank" rel="noreferrer" className="text-[#34cc30] hover:underline" dir="ltr">{value}</a> : value) : <span className="text-gray-400">—</span>}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      </div>
    </div>
  );
}

// =================== الطلبات ===================
<<<<<<< HEAD
=======
const orderStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "بانتظار الدفع", color: "bg-yellow-100 text-yellow-700" },
  active: { label: "قيد التنفيذ", color: "bg-blue-100 text-blue-700" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-700" },
  disputed: { label: "نزاع", color: "bg-orange-100 text-orange-700" },
};

>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export function OrdersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/freelancer/orders").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;
=======
  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  const orders: any[] = data?.orders || [];
  const counts = data?.counts || { all: 0 };
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
<<<<<<< HEAD
  const filters = [
=======
  const filters: { key: string; label: string }[] = [
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    { key: "all", label: "الكل" },
    { key: "pending", label: "بانتظار الدفع" },
    { key: "active", label: "قيد التنفيذ" },
    { key: "completed", label: "مكتمل" },
    { key: "cancelled", label: "ملغي" },
    { key: "disputed", label: "نزاع" },
  ];

  if (selected) {
<<<<<<< HEAD
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelected(null)} className="gap-2 text-muted-foreground hover:text-[#34cc30]">
          <ArrowLeft size={18}/> العودة لقائمة الطلبات
        </Button>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">#{selected.publicCode || selected.id}</h1>
                  <Badge className={orderStatusBadge[selected.status] || "bg-gray-100 text-gray-600 border-transparent"}>{orderStatusLabel[selected.status] || selected.status}</Badge>
                </div>
                <p className="text-muted-foreground">{selected.serviceTitle || "—"}</p>
              </div>
              <div className="text-2xl font-bold text-[#34cc30]">{Number(selected.amount).toLocaleString()} ر.س</div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <Cell label="العميل" value={selected.clientName || "—"} />
              <Cell label="تاريخ الطلب" value={selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("ar-SA") : "—"} />
              <Cell label="موعد التسليم" value={selected.dueDate ? new Date(selected.dueDate).toLocaleDateString("ar-SA") : "—"} />
              <Cell label="رصيد للتحرير" value={`${(Number(selected.paidAmount) - Number(selected.platformFee)).toLocaleString()} ر.س`} />
            </div>
          </CardContent>
        </Card>
        {selected.description && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-3">تفاصيل الطلب</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{selected.description}</p>
            </CardContent>
          </Card>
=======
    const st = orderStatusMap[selected.status] || { label: selected.status, color: "bg-gray-100 text-gray-700" };
    return (
      <div className="space-y-6">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-600 hover:text-[#34cc30]">
          <ArrowLeft size={18} /> العودة لقائمة الطلبات
        </button>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#485869]">#{selected.publicCode || selected.id}</h1>
                <span className={`${st.color} px-3 py-1 rounded-full text-xs font-medium`}>{st.label}</span>
              </div>
              <p className="text-gray-600">{selected.serviceTitle || "—"}</p>
            </div>
            <div className="text-2xl font-bold text-[#34cc30]">{Number(selected.amount).toLocaleString()} ر.س</div>
          </div>
          <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <Cell label="العميل" value={selected.clientName || "—"} />
            <Cell label="تاريخ الطلب" value={selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("ar-SA") : "—"} />
            <Cell label="موعد التسليم" value={selected.dueDate ? new Date(selected.dueDate).toLocaleDateString("ar-SA") : "—"} />
            <Cell label="رصيد للتحرير" value={`${(Number(selected.paidAmount) - Number(selected.platformFee)).toLocaleString()} ر.س`} />
          </div>
        </div>
        {selected.description && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#485869] mb-3">تفاصيل الطلب</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selected.description}</p>
          </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
        <div className="text-sm text-muted-foreground">{counts.all || 0} طلب إجمالي</div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <Button key={f.key} size="sm" variant={filter === f.key ? "brand" : "outline"} onClick={() => setFilter(f.key)} className="gap-2">
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20" : "bg-muted"}`}>{counts[f.key] || 0}</span>
          </Button>
        ))}
      </div>
      <Card className="shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <CardContent className="p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">لا توجد طلبات في هذه الفئة</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right p-4">رقم الطلب</TableHead>
                <TableHead className="text-right p-4">الخدمة</TableHead>
                <TableHead className="text-right p-4">العميل</TableHead>
                <TableHead className="text-right p-4">المبلغ</TableHead>
                <TableHead className="text-right p-4">الحالة</TableHead>
                <TableHead className="text-right p-4">التاريخ</TableHead>
                <TableHead className="text-right p-4">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id} className="cursor-pointer" onClick={() => setSelected(o)}>
                  <TableCell className="p-4 font-medium text-foreground">#{o.publicCode || o.id}</TableCell>
                  <TableCell className="p-4">{o.serviceTitle || "—"}</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{o.clientName || "—"}</TableCell>
                  <TableCell className="p-4 font-medium">{Number(o.amount).toLocaleString()} ر.س</TableCell>
                  <TableCell className="p-4"><Badge className={orderStatusBadge[o.status] || "bg-gray-100 text-gray-600 border-transparent"}>{orderStatusLabel[o.status] || o.status}</Badge></TableCell>
                  <TableCell className="p-4 text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("ar-SA") : "—"}</TableCell>
                  <TableCell className="p-4"><Eye size={16} className="text-[#34cc30]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
=======
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">طلباتي</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">{counts.all || 0} طلب إجمالي</div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${filter === f.key ? "bg-[#34cc30] text-white" : "bg-white dark:bg-[#1a1d24] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-[#252830]"}`}>
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20" : "bg-gray-100 dark:bg-[#252830]"}`}>{counts[f.key] || 0}</span>
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">لا توجد طلبات في هذه الفئة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#252830] text-sm text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="text-right p-4">رقم الطلب</th>
                  <th className="text-right p-4">الخدمة</th>
                  <th className="text-right p-4">العميل</th>
                  <th className="text-right p-4">المبلغ</th>
                  <th className="text-right p-4">الحالة</th>
                  <th className="text-right p-4">التاريخ</th>
                  <th className="text-right p-4">إجراء</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map(o => {
                  const st = orderStatusMap[o.status] || { label: o.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={o.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-[#252830] cursor-pointer" onClick={() => setSelected(o)}>
                      <td className="p-4 font-medium text-[#485869] dark:text-white">#{o.publicCode || o.id}</td>
                      <td className="p-4 dark:text-gray-300">{o.serviceTitle || "—"}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{o.clientName || "—"}</td>
                      <td className="p-4 font-medium dark:text-white">{Number(o.amount).toLocaleString()} ر.س</td>
                      <td className="p-4"><span className={`${st.color} px-3 py-1 rounded-full text-xs font-medium`}>{st.label}</span></td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
                      <td className="p-4"><Eye size={16} className="text-[#34cc30]" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

function Cell({ label, value }: { label: string; value: any }) {
<<<<<<< HEAD
  return <div><span className="text-xs text-muted-foreground">{label}</span><div className="font-medium text-foreground">{value}</div></div>;
=======
  return <div><span className="text-xs text-gray-500">{label}</span><div className="font-medium text-[#485869]">{value}</div></div>;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
}

// =================== الرسائل ===================
function FreelancerMessagesPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [meId, setMeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => setMeId(j?.user?.id || j?.id || null)).catch(() => {});
  }, []);

  const refresh = () => {
    fetch("/api/freelancer/conversations").then(r => r.json()).then(j => Array.isArray(j) && setConvs(j)).finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); const i = setInterval(refresh, 30000); return () => clearInterval(i); }, []);

  const list = convs.filter(c => !search || c.publicCode?.includes(search) || (c.clientName || "").includes(search) || (c.subject || "").includes(search));
  const selected = list.find(c => c.id === selectedId) || null;
  const otherName = (c: any) => c.clientId === meId ? c.freelancerName : c.clientName;

  return (
    <div className="space-y-3">
<<<<<<< HEAD
      <h1 className="text-2xl font-bold text-foreground">الرسائل</h1>
      <Card className="shadow-sm overflow-hidden flex h-[calc(100vh-200px)] min-h-[500px]">
        <div className="w-72 border-l border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="p-4 text-center text-muted-foreground text-sm">جاري التحميل...</div>}
            {!loading && list.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">لا توجد محادثات</div>}
            {list.map(c => {
              const unread = c.clientId === meId ? c.unreadByClient : c.unreadByFreelancer;
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-right p-3 border-b border-border hover:bg-muted/50 ${selectedId === c.id ? "bg-[#34cc30]/10 border-r-4 border-r-[#34cc30]" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">{c.publicCode}</span>
                    {unread > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unread}</span>}
                  </div>
                  <div className="text-sm font-bold truncate text-foreground">{otherName(c) || "—"}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.subject || "—"}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
=======
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الرسائل</h1>
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden flex h-[calc(100vh-200px)] min-h-[500px]">
        <div className="w-72 border-l border-gray-200 dark:border-[#2a2d36] flex flex-col">
          <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36]">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="p-4 text-center text-gray-500 text-sm">جاري التحميل...</div>}
            {!loading && list.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">لا توجد محادثات</div>}
            {list.map(c => {
              const unread = c.clientId === meId ? c.unreadByClient : c.unreadByFreelancer;
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-right p-3 border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-[#252830] ${selectedId === c.id ? "bg-[#34cc30]/10 border-r-4 border-r-[#34cc30]" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-gray-500">{c.publicCode}</span>
                    {unread > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unread}</span>}
                  </div>
                  <div className="text-sm font-bold truncate dark:text-white">{otherName(c) || "—"}</div>
                  <div className="text-xs text-gray-500 truncate">{c.subject || "—"}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                    {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString("ar", { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {selected ? (
            <ChatView key={selected.id} conversationId={selected.id} myParty={selected.clientId === meId ? "client" : "freelancer"} conversationStatus={selected.status} onAfterSend={refresh} />
          ) : (
<<<<<<< HEAD
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-3">
              <MessageCircle size={40} className="text-muted-foreground/30" />
              <p>اختر محادثة لعرضها</p>
            </div>
          )}
        </div>
      </Card>
=======
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                اختر محادثة من القائمة
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">⚠️ ممنوع تبادل أرقام التواصل أو الروابط الخارجية. النظام يكتشف ذلك تلقائياً وقد يؤدي إلى حظر الحساب.</p>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

<<<<<<< HEAD
export { FreelancerMessagesPage as MessagesPage };

// =================== الخدمات ===================
export function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ categoryId: "", subcategoryId: "", title: "", description: "", price: "", deliveryDays: "3" });
  const [formErr, setFormErr] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/services/mine", { cache: "no-store" }).then(r => r.json()).catch(() => ({ services: [] })),
      fetch("/api/categories", { cache: "no-store" }).then(r => r.json()).catch(() => ({ categories: [] })),
    ]).then(([s, c]) => { setServices(s.services || []); setCategories(c.categories || []); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const svcBadge: Record<string, string> = {
    published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent",
    pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent",
    rejected:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-transparent",
    draft:     "bg-gray-100 text-gray-600 border-transparent",
  };
  const svcLabel: Record<string, string> = { published: "منشورة", pending: "بانتظار المراجعة", rejected: "مرفوضة", draft: "مسودة" };
  const filterMap: Record<string, string> = { "all": "الكل", "published": "منشورة", "pending": "بانتظار المراجعة", "rejected": "مرفوضة" };
  const filtered = filter === "all" ? services : services.filter(s => s.status === filter);
  const selectedCat = categories.find((c: any) => c.id === Number(form.categoryId));

  function openCreate() {
    setEditingId(null); setFormErr("");
    setForm({ categoryId: "", subcategoryId: "", title: "", description: "", price: "", deliveryDays: "3" });
    setShowForm(true);
  }
  function openEdit(s: any) {
    setEditingId(s.id); setFormErr("");
    setForm({ categoryId: String(s.categoryId || ""), subcategoryId: String(s.subcategoryId || ""), title: s.title || "", description: s.description || "", price: String(s.price || ""), deliveryDays: String(s.deliveryDays || 3) });
    setShowForm(true);
  }
  async function submitForm(e: React.FormEvent) {
    e.preventDefault(); setFormErr("");
    if (!form.categoryId || !form.subcategoryId) return setFormErr("اختر التصنيف الرئيسي والفرعي");
    if (!form.title.trim() || form.title.length < 5) return setFormErr("العنوان يجب أن يكون 5 أحرف على الأقل");
    if (!form.description.trim() || form.description.length < 20) return setFormErr("الوصف يجب أن يكون 20 حرفاً على الأقل");
    if (!form.price || Number(form.price) <= 0) return setFormErr("أدخل سعراً صحيحاً");
    setFormLoading(true);
    const payload = { categoryId: Number(form.categoryId), subcategoryId: Number(form.subcategoryId), title: form.title.trim(), description: form.description.trim(), price: Number(form.price), deliveryDays: Number(form.deliveryDays) };
    const url = editingId ? `/api/services/${editingId}` : "/api/services";
    const method = editingId ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    setFormLoading(false);
    if (!r || !r.ok) { const j = r ? await r.json().catch(() => ({})) : {}; return setFormErr(j.error || "فشل الحفظ"); }
    setShowForm(false); setToast(editingId ? "تم تحديث الخدمة" : "تم إرسال الخدمة للمراجعة");
    setTimeout(() => setToast(""), 4000); load();
  }
  async function deleteService(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    const r = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (r.ok) { load(); setToast("تم حذف الخدمة"); setTimeout(() => setToast(""), 3000); }
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#34cc30] text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"><Check size={18}/>{toast}</div>}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">{editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</h3>
              {formErr && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-3 text-sm mb-4">{formErr}</div>}
              <form onSubmit={submitForm} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">التصنيف الرئيسي *</label>
                    <select required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value, subcategoryId: ""})} className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30">
                      <option value="">— اختر التصنيف —</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">التصنيف الفرعي *</label>
                    <select required disabled={!selectedCat} value={form.subcategoryId} onChange={e => setForm({...form, subcategoryId: e.target.value})} className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 disabled:opacity-50">
                      <option value="">{selectedCat ? "— اختر الفرعي —" : "اختر الرئيسي أولاً"}</option>
                      {selectedCat?.subcategories?.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">عنوان الخدمة *</label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="مثال: سأصمم لك شعاراً احترافياً خلال 24 ساعة" minLength={5} maxLength={120} required/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">وصف الخدمة *</label>
                  <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-y" placeholder="اشرح ما ستقدمه للعميل بالتفصيل..." minLength={20} maxLength={5000} required/>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">السعر (ر.س) *</label>
                    <Input type="number" min={1} value={form.price} onChange={e => setForm({...form, price: e.target.value})} required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">مدة التسليم (أيام) *</label>
                    <Input type="number" min={1} max={60} value={form.deliveryDays} onChange={e => setForm({...form, deliveryDays: e.target.value})} required/>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                  <Button type="submit" variant="brand" disabled={formLoading}>{formLoading ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "إرسال للمراجعة"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">خدماتي</h1>
        <Button variant="brand" onClick={openCreate}><Plus size={16}/> إضافة خدمة</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(filterMap).map(([k, v]) => (
          <Button key={k} size="sm" variant={filter === k ? "brand" : "outline"} onClick={() => setFilter(k)}>{v}</Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Briefcase size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">لا توجد خدمات بعد</p>
            <Button variant="brand" className="mt-4" onClick={openCreate}><Plus size={16}/> إضافة أول خدمة</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => (
            <Card key={s.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={svcBadge[s.status] || "bg-gray-100 text-gray-600 border-transparent"}>{svcLabel[s.status] || s.status}</Badge>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-[#34cc30]"><Edit size={15}/></button>
                    <button onClick={() => deleteService(s.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive"><X size={15}/></button>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-1 line-clamp-2">{s.title}</h3>
                {s.categoryName && <p className="text-xs text-muted-foreground mb-2">{s.categoryName} · {s.subcategoryName}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-[#34cc30]">{Number(s.price).toLocaleString()} ر.س</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><ShoppingBag size={12}/>{s.ordersCount || 0} طلب · {s.deliveryDays} يوم</span>
                </div>
                {s.rejectionReason && <p className="mt-3 text-xs text-destructive bg-destructive/10 rounded-lg p-2">سبب الرفض: {s.rejectionReason}</p>}
              </CardContent>
            </Card>
          ))}
=======
export function MessagesPage() { return <FreelancerMessagesPage />; }

// =================== خدماتي ===================
const serviceStatusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700" },
  published: { label: "منشورة", color: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوضة", color: "bg-red-100 text-red-700" },
};

export function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/services").then(r => r.json()).then(d => setServices(d.services || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;

  const active = services.filter(s => s.status === "published").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#485869] dark:text-white">خدماتي</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{active} خدمة منشورة من أصل {services.length}</p>
        </div>
        <a href="https://wa.me/966511809878?text=مرحبا، أبغى أضيف خدمة جديدة" target="_blank" rel="noreferrer" className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">
          <Plus size={16} /> إضافة خدمة
        </a>
      </div>

      {services.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-[#485869] dark:text-white mb-2">لا توجد خدمات بعد</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">ابدأ بإضافة خدمتك الأولى عبر التواصل مع فريق الدعم على واتساب</p>
          <a href="https://wa.me/966511809878?text=مرحبا، أبغى أضيف خدمة جديدة" target="_blank" rel="noreferrer" className="inline-flex bg-[#34cc30] text-white px-5 py-2.5 rounded-lg hover:bg-[#2eb829] items-center gap-2">
            <Plus size={16} /> إضافة خدمتك الأولى
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => {
            const st = serviceStatusMap[s.status] || serviceStatusMap.draft;
            return (
              <div key={s.id} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="h-32 bg-gradient-to-br from-[#485869]/10 to-[#34cc30]/10 flex items-center justify-center relative">
                  <Briefcase size={36} className="text-[#485869]/20" />
                  <span className={`absolute top-3 left-3 ${st.color} text-xs px-3 py-1 rounded-full font-medium`}>{st.label}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#485869] dark:text-white mb-1 truncate">{s.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{s.categoryName}{s.subcategoryName ? ` · ${s.subcategoryName}` : ""}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-[#34cc30]">{Number(s.price).toLocaleString()} ر.س</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {s.deliveryDays || 1} أيام</div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><ShoppingBag size={12} /> {s.ordersCount || 0} طلب</span>
                    <span className="flex items-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400" /> {Number(s.rating || 0).toFixed(1)}</span>
                  </div>
                  {s.rejectionReason && <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-2">سبب الرفض: {s.rejectionReason}</p>}
                </div>
              </div>
            );
          })}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        </div>
      )}
    </div>
  );
}

<<<<<<< HEAD
// =================== الشهادات (سابقاً: مهاراتي ولغاتي) ===================
export function SkillsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", issuer: "", certificateUrl: "", description: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showEditProf, setShowEditProf] = useState(false);
  const [editProfForm, setEditProfForm] = useState({ skills: "", languages: "", yearsExperience: "" });
  const [editProfLoading, setEditProfLoading] = useState(false);
  const [editProfMsg, setEditProfMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const reload = () => {
    Promise.all([
      fetch("/api/freelancer/profile").then(r => r.json()).then(d => setProfile(d.profile)),
      fetch("/api/freelancer/certificates").then(r => r.json()).then(d => setCerts(d.certificates || [])),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

  function openEditProf() {
    setEditProfForm({
      skills: profile?.skills || "",
      languages: profile?.languages || "",
      yearsExperience: profile?.yearsExperience != null ? String(profile.yearsExperience) : "",
    });
    setEditProfMsg(null);
    setShowEditProf(true);
  }

  async function saveEditProf(e: React.FormEvent) {
    e.preventDefault();
    setEditProfLoading(true);
    setEditProfMsg(null);
    try {
      const r = await fetch("/api/freelancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: editProfForm.skills.trim(),
          languages: editProfForm.languages.trim(),
          yearsExperience: editProfForm.yearsExperience !== "" ? Number(editProfForm.yearsExperience) : null,
        }),
      });
      if (r.ok) {
        setEditProfMsg({ type: "ok", text: "تم حفظ معلوماتك المهنية بنجاح" });
        reload();
        setTimeout(() => setShowEditProf(false), 1200);
      } else {
        const j = await r.json().catch(() => ({}));
        setEditProfMsg({ type: "err", text: j.error || "فشل الحفظ" });
      }
    } catch {
      setEditProfMsg({ type: "err", text: "خطأ في الاتصال" });
    }
    setEditProfLoading(false);
  }

  async function submitCert(e: React.FormEvent) {
    e.preventDefault(); setFormMsg(null);
    if (!form.title.trim() || !form.issuer.trim()) return setFormMsg({ type: "err", text: "اسم الشهادة والجهة مطلوبان" });
    setFormLoading(true);
    const r = await fetch("/api/freelancer/certificates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setFormLoading(false);
    if (r.ok) {
      setFormMsg({ type: "ok", text: "تم إرسال الشهادة للمراجعة — ستظهر في ملفك بعد الموافقة" });
      setForm({ title: "", issuer: "", certificateUrl: "", description: "" });
      setShowForm(false);
      reload();
    } else {
      const j = await r.json().catch(() => ({}));
      setFormMsg({ type: "err", text: j.error || "فشل الإرسال" });
    }
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;

  const skills = (profile?.skills || "").split(/[,،]/).map((s: string) => s.trim()).filter(Boolean);
  const langs = (profile?.languages || "").split(/[,،]/).map((s: string) => s.trim()).filter(Boolean);

  const certStatusBadge: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-transparent",
  };
  const certStatusLabel: Record<string, string> = { pending: "قيد المراجعة", approved: "موافَق عليها", rejected: "مرفوضة" };

  return (
    <div className="space-y-6">
      {showEditProf && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Edit size={18} className="text-[#34cc30]"/> تعديل المعلومات المهنية</h3>
              {editProfMsg && (
                <div className={`rounded-lg p-3 text-sm mb-4 ${editProfMsg.type === "ok" ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"}`}>{editProfMsg.text}</div>
              )}
              <form onSubmit={saveEditProf} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">المهارات</label>
                  <textarea
                    rows={3}
                    value={editProfForm.skills}
                    onChange={e => setEditProfForm(f => ({ ...f, skills: e.target.value }))}
                    className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-none"
                    placeholder="مثال: تصميم جرافيك، Adobe Illustrator، Figma"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">افصل المهارات بفاصلة</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">اللغات</label>
                  <textarea
                    rows={2}
                    value={editProfForm.languages}
                    onChange={e => setEditProfForm(f => ({ ...f, languages: e.target.value }))}
                    className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-none"
                    placeholder="مثال: العربية، الإنجليزية"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">افصل اللغات بفاصلة</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">سنوات الخبرة</label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={editProfForm.yearsExperience}
                    onChange={e => setEditProfForm(f => ({ ...f, yearsExperience: e.target.value }))}
                    placeholder="مثال: 5"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowEditProf(false)}>إلغاء</Button>
                  <Button type="submit" variant="brand" disabled={editProfLoading}>{editProfLoading ? "جارٍ الحفظ..." : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">إضافة شهادة جديدة</h3>
              {formMsg && (
                <div className={`rounded-lg p-3 text-sm mb-4 ${formMsg.type === "ok" ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"}`}>{formMsg.text}</div>
              )}
              <form onSubmit={submitCert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">اسم الشهادة *</label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="مثال: Google Data Analytics Certificate" required/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الجهة المانحة *</label>
                  <Input value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})} placeholder="مثال: Google / Coursera / Udemy" required/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">رابط الشهادة (اختياري)</label>
                  <Input type="url" value={form.certificateUrl} onChange={e => setForm({...form, certificateUrl: e.target.value})} placeholder="https://www.credly.com/..."/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">ملاحظات (اختياري)</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-none"/>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                  <Button type="submit" variant="brand" disabled={formLoading}>{formLoading ? "جارٍ الإرسال..." : "إرسال للمراجعة"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {formMsg?.type === "ok" && !showForm && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg p-3 text-sm">{formMsg.text}</div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">الشهادات والمهارات</h1>
        <Button variant="outline" size="sm" onClick={openEditProf}><Edit size={14}/> تعديل المعلومات المهنية</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2"><Award size={18} className="text-[#34cc30]"/> المهارات</h3>
            {skills.length === 0 ? <p className="text-muted-foreground text-sm">—</p> : (
              <div className="flex flex-wrap gap-2">
                {skills.map((s: string, i: number) => (
                  <span key={i} className="bg-[#34cc30]/10 text-[#34cc30] px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2"><Globe size={18} className="text-[#485869] dark:text-muted-foreground"/> اللغات</h3>
              {langs.length === 0 ? <p className="text-muted-foreground text-sm">—</p> : (
                <div className="flex flex-wrap gap-2">
                  {langs.map((l: string, i: number) => (
                    <span key={i} className="bg-muted text-foreground px-3 py-1.5 rounded-full text-sm border border-border">{l}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">سنوات الخبرة</h3>
              <div className="text-3xl font-bold text-[#34cc30]">{profile?.yearsExperience ?? "—"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2"><Award size={18} className="text-[#34cc30]"/> الشهادات والدورات</h3>
            <Button variant="brand" size="sm" onClick={() => { setShowForm(true); setFormMsg(null); }}><Plus size={14}/> إضافة شهادة</Button>
          </div>
          {certs.length === 0 ? (
            <div className="flex items-center justify-center p-10 border-2 border-dashed border-border rounded-lg flex-col gap-2">
              <Award size={32} className="text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">لا توجد شهادات بعد — أضف شهاداتك المهنية لتعزيز ملفك</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map(c => (
                <div key={c.id} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">{c.title}</span>
                      <Badge className={certStatusBadge[c.status]}>{certStatusLabel[c.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.issuer}</p>
                    {c.rejectionReason && <p className="text-xs text-destructive mt-1">سبب الرفض: {c.rejectionReason}</p>}
                    {c.certificateUrl && (
                      <a href={c.certificateUrl} target="_blank" rel="noreferrer" className="text-xs text-[#34cc30] hover:underline flex items-center gap-1 mt-1">
                        <ExternalLink size={11}/> عرض الشهادة
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5 shrink-0">{new Date(c.createdAt).toLocaleDateString("ar-SA")}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
=======
// =================== معرض الأعمال ===================
export function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">معرض أعمالي</h1>
      </div>
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-12 text-center">
        <FolderOpen size={48} className="mx-auto text-gray-300 mb-3" />
        <h3 className="font-bold text-[#485869] dark:text-white mb-2">معرض الأعمال — قريباً</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          نعمل على تطوير معرض أعمال متكامل يتيح لك عرض مشاريعك السابقة بشكل احترافي. حالياً يمكنك إضافة رابط معرض أعمالك في ملفك الشخصي.
        </p>
      </div>
    </div>
  );
}

// =================== المهارات والشهادات ===================
export function SkillsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/profile").then(r => r.json()).then(d => setProfile(d.profile)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;

  const skillsList = (profile?.skills || "").split(/[,،]/).map((s: string) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">مهاراتي وشهاداتي</h1>
        <a href="https://wa.me/966511809878?text=مرحبا، أبغى أحدّث مهاراتي/شهاداتي" target="_blank" rel="noreferrer" className="text-[#34cc30] text-sm hover:text-[#2eb829] flex items-center gap-1">
          <Edit size={14} /> طلب تحديث
        </a>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">المهارات ({skillsList.length})</h3>
        {skillsList.length === 0 ? (
          <p className="text-gray-400 text-sm">لم تقم بإضافة مهارات بعد. تواصل مع الدعم لإضافتها.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skillsList.map((s: string, i: number) => (
              <span key={i} className="bg-[#34cc30]/10 text-[#34cc30] px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-2">سنوات الخبرة</h3>
        <div className="text-3xl font-bold text-[#34cc30]">{profile?.yearsExperience || "—"}</div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-2">اللغات</h3>
        <div className="text-sm text-gray-700 dark:text-gray-300">{profile?.languages || "—"}</div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 text-center">
        <Award size={40} className="mx-auto text-gray-300 mb-2" />
        <h3 className="font-bold text-[#485869] dark:text-white mb-1">إدارة الشهادات — قريباً</h3>
        <p className="text-sm text-gray-500">سنوفر قريباً إمكانية رفع وتوثيق الشهادات المهنية.</p>
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

// =================== التقييمات ===================
export function ReviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    fetch("/api/freelancer/reviews").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;
=======
  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  const reviews: any[] = data?.reviews || [];
  const stats = data?.stats || { total: 0, average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const filtered = filterRating === 0 ? reviews : reviews.filter(r => Number(r.rating) === filterRating);

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      <h1 className="text-2xl font-bold text-foreground">تقييماتي</h1>
      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-foreground mb-2">{stats.average.toFixed(1)}</div>
            <div className="flex justify-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className={i < Math.round(stats.average) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{stats.total} تقييم</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(r => (
                <button key={r} onClick={() => setFilterRating(filterRating === r ? 0 : r)} className={`flex items-center gap-3 w-full p-1.5 rounded-lg ${filterRating === r ? "bg-[#34cc30]/10" : "hover:bg-muted/50"}`}>
                  <span className="text-sm w-8 text-muted-foreground">{r} ★</span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${stats.total > 0 ? (stats.distribution[r] / stats.total) * 100 : 0}%` }}/>
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{stats.distribution[r] || 0}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Star size={48} className="mx-auto text-muted-foreground/30 mb-3"/>
            <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <Card key={r.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold">{(r.reviewerName || "—").charAt(0)}</div>
                    <div>
                      <div className="font-bold text-foreground">{r.reviewerName || "عميل"}</div>
                      <div className="text-xs text-muted-foreground">{r.serviceTitle || "خدمة"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-SA") : "—"}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < Number(r.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}/>)}
                  </div>
                </div>
                {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
              </CardContent>
            </Card>
=======
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">تقييماتي</h1>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 text-center">
          <div className="text-5xl font-bold text-[#485869] dark:text-white mb-2">{stats.average.toFixed(1)}</div>
          <div className="flex justify-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} className={i < Math.round(stats.average) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
            ))}
          </div>
          <div className="text-sm text-gray-500">{stats.total} تقييم</div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(r => (
              <button key={r} onClick={() => setFilterRating(filterRating === r ? 0 : r)} className={`flex items-center gap-3 w-full p-1.5 rounded-lg ${filterRating === r ? "bg-[#34cc30]/10" : "hover:bg-gray-50 dark:hover:bg-[#252830]"}`}>
                <span className="text-sm w-8 text-gray-600 dark:text-gray-400">{r} ★</span>
                <div className="flex-1 h-2.5 bg-gray-100 dark:bg-[#252830] rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${stats.total > 0 ? (stats.distribution[r] / stats.total) * 100 : 0}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-8">{stats.distribution[r] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-12 text-center">
          <Star size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold">{(r.reviewerName || "—").charAt(0)}</div>
                  <div>
                    <div className="font-bold text-[#485869] dark:text-white">{r.reviewerName || "عميل"}</div>
                    <div className="text-xs text-gray-500">{r.serviceTitle || "خدمة"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-SA") : "—"}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Number(r.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-gray-700 dark:text-gray-300">{r.comment}</p>}
            </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          ))}
        </div>
      )}
    </div>
  );
}

// =================== المحفظة ===================
export function WalletPage() {
  const [data, setData] = useState<any>(null);
<<<<<<< HEAD
  const [profile, setProfile] = useState<any>(null);
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("الكل");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wdAmount, setWdAmount] = useState("");
<<<<<<< HEAD
  const [wdLoading, setWdLoading] = useState(false);
  const [wdMsg, setWdMsg] = useState("");

  const reload = () => {
    Promise.all([
      fetch("/api/freelancer/wallet").then(r => r.json()).catch(() => null),
      fetch("/api/freelancer/profile").then(r => r.json()).then(d => d.profile).catch(() => null),
    ]).then(([w, p]) => { setData(w); setProfile(p); }).finally(() => setLoading(false));
  };
=======
  const [wdBank, setWdBank] = useState("");
  const [wdIban, setWdIban] = useState("");
  const [wdLoading, setWdLoading] = useState(false);
  const [wdMsg, setWdMsg] = useState("");

  const reload = () => fetch("/api/freelancer/wallet").then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  useEffect(() => { reload(); }, []);

  const balance = data?.balance ?? 0;
  const pending = data?.pending ?? 0;
  const totalEarned = data?.totalEarned ?? 0;
  const transactions: any[] = data?.transactions ?? [];
  const filtered = filterType === "الكل" ? transactions : transactions.filter((t: any) => t.type === filterType);

<<<<<<< HEAD
  const bankName = profile?.bankName || null;
  const iban = profile?.iban || null;
  const maskedIban = iban ? `****${iban.slice(-4)}` : null;

  async function submitWithdrawal() {
    if (!wdAmount || !bankName || !iban) return;
=======
  async function submitWithdrawal() {
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    setWdLoading(true); setWdMsg("");
    const r = await fetch("/api/freelancer/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
      body: JSON.stringify({ amount: Number(wdAmount), bankName, accountNumber: iban }),
    });
    const j = await r.json();
    if (r.ok) { setWdMsg("تم إرسال طلب السحب بنجاح"); setShowWithdraw(false); setWdAmount(""); reload(); }
    else setWdMsg(j.error || "فشل الطلب");
    setWdLoading(false);
    setTimeout(() => setWdMsg(""), 4000);
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">محفظتي</h1>
      {wdMsg && <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm">{wdMsg}</div>}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#34cc30] to-[#2eb829] rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full"/>
=======
      body: JSON.stringify({ amount: Number(wdAmount), bankName: wdBank, accountNumber: wdIban }),
    });
    const j = await r.json();
    if (r.ok) { setWdMsg("تم إرسال طلب السحب بنجاح"); setShowWithdraw(false); reload(); }
    else setWdMsg(j.error || "فشل الطلب");
    setWdLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">محفظتي</h1>
      {wdMsg && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 text-sm">{wdMsg}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#34cc30] to-[#2eb829] rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full" />
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          <div className="relative">
            <div className="text-sm text-white/80 mb-2">الرصيد المتاح</div>
            <div className="text-4xl font-bold mb-4">{Number(balance).toLocaleString()} <span className="text-lg">ر.س</span></div>
            <button onClick={() => setShowWithdraw(!showWithdraw)} className="bg-white text-[#34cc30] px-5 py-2 rounded-lg font-medium hover:bg-white/90 flex items-center gap-2">
<<<<<<< HEAD
              <Download size={16}/> طلب سحب
            </button>
          </div>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Clock size={20} className="text-blue-600"/></div><div className="text-sm text-muted-foreground">قيد المعالجة (أمانة)</div></div>
            <div className="text-3xl font-bold text-foreground">{Number(pending).toLocaleString()} <span className="text-lg text-muted-foreground">ر.س</span></div>
            <div className="text-xs text-muted-foreground mt-2">تُحرَّر بعد اكتمال الطلب</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><TrendingUp size={20} className="text-green-600"/></div><div className="text-sm text-muted-foreground">إجمالي الأرباح</div></div>
            <div className="text-3xl font-bold text-foreground">{Number(totalEarned).toLocaleString()} <span className="text-lg text-muted-foreground">ر.س</span></div>
          </CardContent>
        </Card>
      </div>
      {showWithdraw && (
        <Card className="shadow-sm border-2 border-[#34cc30]/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">طلب سحب جديد</h3>
            {!bankName || !iban ? (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-700 dark:text-yellow-300">
                لا يوجد حساب بنكي مسجل. يرجى التواصل مع الدعم لإضافة بياناتك البنكية.
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">المبلغ (ر.س)</label>
                    <Input type="number" value={wdAmount} onChange={e => setWdAmount(e.target.value)} placeholder="الحد الأدنى 100"/>
                    <p className="text-xs text-muted-foreground mt-1">الحد الأقصى: {Number(balance).toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">الحساب البنكي</label>
                    <div className="border border-input rounded-md px-3 py-2 bg-muted text-sm text-foreground">
                      <div className="font-medium">{bankName}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{maskedIban}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">الحساب المسجل من ملف التقديم فقط</p>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <Info size={16} className="text-yellow-600 mt-0.5 shrink-0"/>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">يتم التحويل خلال 1-3 أيام عمل. الحد الأدنى للسحب 100 ر.س.</p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowWithdraw(false)}>إلغاء</Button>
                  <Button variant="brand" onClick={submitWithdrawal} disabled={wdLoading || !wdAmount}><Send size={16}/> {wdLoading ? "جارٍ الإرسال..." : "تأكيد السحب"}</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border px-6 py-4 flex-row items-center justify-between">
          <CardTitle className="text-base">سجل المعاملات</CardTitle>
          <div className="flex gap-2">
            {["الكل", "إيداع", "معلّق", "بانتظار الدفع"].map(f => (
              <Button key={f} size="sm" variant={filterType === f ? "brand" : "outline"} onClick={() => setFilterType(f)}>{f}</Button>
            ))}
          </div>
        </CardHeader>
        {filtered.length === 0 ? (
          <CardContent className="p-12 text-center text-muted-foreground">لا توجد معاملات بعد</CardContent>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t: any) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === "إيداع" ? "bg-green-100 dark:bg-green-900/30" : t.type === "معلّق" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
                    {t.type === "إيداع" ? <TrendingUp size={18} className="text-green-600"/> : t.type === "معلّق" ? <Clock size={18} className="text-blue-600"/> : <AlertCircle size={18} className="text-orange-600"/>}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{t.desc}</div>
                    <div className="text-xs text-muted-foreground">{t.date ? new Date(t.date).toLocaleDateString("ar-SA") : "—"} • {t.type}</div>
                  </div>
                </div>
                <span className={`font-bold ${t.type === "إيداع" ? "text-green-600" : t.type === "معلّق" ? "text-blue-600" : "text-orange-600"}`}>{t.sign}{Number(t.amount).toLocaleString()} ر.س</span>
=======
              <Download size={16} /> طلب سحب
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Clock size={20} className="text-blue-600" /></div>
            <div className="text-sm text-gray-600 dark:text-gray-400">قيد المعالجة (أمانة)</div>
          </div>
          <div className="text-3xl font-bold text-[#485869] dark:text-white">{Number(pending).toLocaleString()} <span className="text-lg text-gray-400">ر.س</span></div>
          <div className="text-xs text-gray-500 mt-2">تُحرَّر بعد اكتمال الطلب</div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div>
            <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرباح</div>
          </div>
          <div className="text-3xl font-bold text-[#485869] dark:text-white">{Number(totalEarned).toLocaleString()} <span className="text-lg text-gray-400">ر.س</span></div>
        </div>
      </div>

      {showWithdraw && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border-2 border-[#34cc30]/20">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">طلب سحب جديد</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">المبلغ (ر.س)</label>
              <input type="number" value={wdAmount} onChange={e => setWdAmount(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="الحد الأدنى 100" />
              <p className="text-xs text-gray-400 mt-1">الحد الأقصى: {Number(balance).toLocaleString()} ر.س</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">اسم البنك</label>
              <input value={wdBank} onChange={e => setWdBank(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="مثال: مصرف الراجحي" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">رقم الحساب / آيبان</label>
              <input value={wdIban} onChange={e => setWdIban(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="SA..." dir="ltr" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 flex items-start gap-2">
            <Info size={16} className="text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-700">يتم تحويل المبلغ خلال 1-3 أيام عمل. الحد الأدنى للسحب 100 ر.س.</p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowWithdraw(false)} className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50">إلغاء</button>
            <button onClick={submitWithdrawal} disabled={wdLoading} className="bg-[#34cc30] text-white px-6 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2 disabled:opacity-60">
              <Send size={16} /> {wdLoading ? "جارٍ الإرسال..." : "تأكيد السحب"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-[#2a2d36] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white">سجل المعاملات</h3>
          <div className="flex gap-2">
            {["الكل", "إيداع", "معلّق", "بانتظار الدفع"].map(f => (
              <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1 rounded-full text-xs ${filterType === f ? "bg-[#34cc30] text-white" : "bg-gray-100 dark:bg-[#252830] text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا توجد معاملات بعد</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#2a2d36]">
            {filtered.map((t: any) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#252830]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === "إيداع" ? "bg-green-100" : t.type === "معلّق" ? "bg-blue-100" : "bg-orange-100"}`}>
                    {t.type === "إيداع" ? <TrendingUp size={18} className="text-green-600" /> : t.type === "معلّق" ? <Clock size={18} className="text-blue-600" /> : <AlertCircle size={18} className="text-orange-600" />}
                  </div>
                  <div>
                    <div className="font-medium text-[#485869] dark:text-white text-sm">{t.desc}</div>
                    <div className="text-xs text-gray-500">{t.date ? new Date(t.date).toLocaleDateString("ar-SA") : "—"} • {t.type}</div>
                  </div>
                </div>
                <span className={`font-bold ${t.type === "إيداع" ? "text-green-600" : t.type === "معلّق" ? "text-blue-600" : "text-orange-600"}`}>
                  {t.sign}{Number(t.amount).toLocaleString()} ر.س
                </span>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
              </div>
            ))}
          </div>
        )}
<<<<<<< HEAD
      </Card>
=======
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

// =================== الفواتير ===================
export function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/freelancer/invoices").then(r => r.json()).then(d => setInvoices(d.invoices || [])).finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;
=======
  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  if (selected) {
    return (
      <div className="space-y-4">
<<<<<<< HEAD
        <Button variant="ghost" onClick={() => setSelected(null)} className="gap-2 text-muted-foreground hover:text-[#34cc30]"><ArrowLeft size={18}/> العودة</Button>
        <Card className="shadow-sm">
          <CardContent className="p-8" id="invoice-print">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-foreground">فاتورة #{selected.invoiceNumber || selected.id}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("ar-SA") : "—"}</p>
              </div>
              <Badge className={selected.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent"}>
                {selected.status === "paid" ? "مدفوعة" : "قيد الدفع"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div><div className="text-xs text-muted-foreground mb-1">من (المستقل)</div><div className="font-bold text-foreground">{selected.freelancerName || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground mb-1">الخدمة المقدمة</div><div className="font-medium text-foreground">{selected.serviceTitle || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground mb-1">القيمة الإجمالية</div><div className="text-2xl font-bold text-[#34cc30]">{Number(selected.amount).toLocaleString()} ر.س</div></div>
              <div><div className="text-xs text-muted-foreground mb-1">صافي المستقل</div><div className="text-xl font-bold text-foreground">{Number(selected.freelancerAmount || selected.amount).toLocaleString()} ر.س</div></div>
            </div>
            <div className="flex gap-3 justify-end border-t border-border pt-4">
              <Button variant="outline" onClick={() => window.print()}><Download size={16}/> طباعة / PDF</Button>
            </div>
          </CardContent>
        </Card>
=======
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-600 hover:text-[#34cc30]"><ArrowLeft size={18} /> العودة</button>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-[#485869]">فاتورة #{selected.invoiceNumber || selected.id}</h2>
              <p className="text-sm text-gray-500 mt-1">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("ar-SA") : "—"}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${selected.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {selected.status === "paid" ? "مدفوعة" : "قيد الدفع"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div><div className="text-xs text-gray-500 mb-1">من</div><div className="font-bold text-[#485869]">{selected.freelancerName || "—"}</div></div>
            <div><div className="text-xs text-gray-500 mb-1">إلى</div><div className="font-bold text-[#485869]">{selected.clientName || "—"}</div></div>
            <div><div className="text-xs text-gray-500 mb-1">الخدمة</div><div className="font-medium">{selected.serviceTitle || "—"}</div></div>
            <div><div className="text-xs text-gray-500 mb-1">المبلغ</div><div className="text-2xl font-bold text-[#34cc30]">{Number(selected.amount).toLocaleString()} ر.س</div></div>
          </div>
        </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-foreground">الفواتير</h1>
        <span className="text-sm text-muted-foreground">{invoices.length} فاتورة</span>
      </div>
      <Card className="shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <CardContent className="p-12 text-center">
            <FileText size={48} className="mx-auto text-muted-foreground/30 mb-3"/>
            <p className="text-muted-foreground">لا توجد فواتير بعد — تظهر الفواتير تلقائياً بعد اكتمال كل طلب</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right p-4">رقم الفاتورة</TableHead>
                <TableHead className="text-right p-4">الخدمة</TableHead>
                <TableHead className="text-right p-4">المبلغ</TableHead>
                <TableHead className="text-right p-4">التاريخ</TableHead>
                <TableHead className="text-right p-4">الحالة</TableHead>
                <TableHead className="text-right p-4">عرض</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id} className="cursor-pointer" onClick={() => setSelected(inv)}>
                  <TableCell className="p-4 font-medium text-foreground">#{inv.invoiceNumber || inv.id}</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{inv.serviceTitle || "—"}</TableCell>
                  <TableCell className="p-4 font-bold text-[#34cc30]">{Number(inv.amount).toLocaleString()} ر.س</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("ar-SA") : "—"}</TableCell>
                  <TableCell className="p-4">
                    <Badge className={inv.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent"}>
                      {inv.status === "paid" ? "مدفوعة" : "قيد الدفع"}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-4"><Eye size={16} className="text-[#34cc30]"/></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
=======
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الفواتير</h1>
        <span className="text-sm text-gray-500">{invoices.length} فاتورة</span>
      </div>
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">لا توجد فواتير بعد</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252830] text-sm text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-4">رقم الفاتورة</th>
                <th className="text-right p-4">العميل</th>
                <th className="text-right p-4">المبلغ</th>
                <th className="text-right p-4">التاريخ</th>
                <th className="text-right p-4">الحالة</th>
                <th className="text-right p-4">عرض</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-[#252830] cursor-pointer" onClick={() => setSelected(inv)}>
                  <td className="p-4 font-medium text-[#485869] dark:text-white">{inv.invoiceNumber || `INV-${inv.id}`}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{inv.clientName || "—"}</td>
                  <td className="p-4 font-bold dark:text-white">{Number(inv.amount).toLocaleString()} ر.س</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {inv.status === "paid" ? "مدفوعة" : "قيد الدفع"}
                    </span>
                  </td>
                  <td className="p-4"><Eye size={16} className="text-[#34cc30]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

// =================== تقرير الأرباح ===================
export function EarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/earnings").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;

  const summary = data?.summary || {};
  const monthly: any[] = data?.monthly || [];
=======
  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;

  const summary = data?.summary || { totalNet: 0, totalGross: 0, totalFees: 0, ordersCount: 0 };
  const monthly: any[] = (data?.monthly || []).slice().reverse();
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const maxNet = Math.max(...monthly.map(m => Number(m.net)), 1);

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      <h1 className="text-2xl font-bold text-foreground">تقرير الأرباح</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: "الأرباح هذا الشهر", value: `${Number(summary.thisMonth || 0).toLocaleString()} ر.س`, icon: TrendingUp, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
          { label: "الأرباح هذا العام", value: `${Number(summary.thisYear || 0).toLocaleString()} ر.س`, icon: DollarSign, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
          { label: "إجمالي الطلبات", value: summary.totalOrders || 0, icon: ShoppingBag, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
        ].map(c => (
          <Card key={c.label} className="shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${c.color}`}><c.icon size={22}/></div>
              <div>
                <div className="text-xl font-bold text-foreground">{c.value}</div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {monthly.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">الأرباح الشهرية (آخر {monthly.length} شهر)</h3>
            <div className="flex items-end gap-3 h-[220px] px-2">
              {monthly.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">{(Number(m.net) / 1000).toFixed(1)}k</span>
                  <div className="w-full bg-gradient-to-t from-[#34cc30] to-[#34cc30]/60 rounded-t-lg" style={{ height: `${(Number(m.net) / maxNet) * 180}px`, minHeight: 4 }}/>
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle className="text-base">تفصيل شهري</CardTitle>
        </CardHeader>
        {monthly.length === 0 ? (
          <CardContent className="p-12 text-center text-muted-foreground">لا توجد أرباح مسجلة بعد</CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right p-4">الشهر</TableHead>
                <TableHead className="text-right p-4">الطلبات</TableHead>
                <TableHead className="text-right p-4">الصافي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthly.map(m => (
                <TableRow key={m.month}>
                  <TableCell className="p-4 font-medium text-foreground">{m.month}</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{m.orders}</TableCell>
                  <TableCell className="p-4 font-bold text-[#34cc30]">{Number(m.net).toLocaleString()} ر.س</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
=======
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">تقرير الأرباح</h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#34cc30] to-[#2eb829] rounded-xl p-6 text-white">
          <div className="text-sm text-white/80 mb-1">صافي الأرباح</div>
          <div className="text-3xl font-bold">{Number(summary.totalNet).toLocaleString()} <span className="text-lg">ر.س</span></div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">الإيراد الإجمالي</div>
          <div className="text-3xl font-bold text-[#485869] dark:text-white">{Number(summary.totalGross).toLocaleString()} <span className="text-lg text-gray-400">ر.س</span></div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">عمولة المنصة</div>
          <div className="text-3xl font-bold text-red-500">-{Number(summary.totalFees).toLocaleString()} <span className="text-lg text-gray-400">ر.س</span></div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">عدد الطلبات</div>
          <div className="text-3xl font-bold text-[#485869] dark:text-white">{summary.ordersCount}</div>
        </div>
      </div>

      {monthly.length > 0 && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-6">الأرباح الشهرية (آخر {monthly.length} شهر)</h3>
          <div className="flex items-end gap-3 h-[220px] px-2">
            {monthly.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">{(Number(m.net) / 1000).toFixed(1)}k</span>
                <div className="w-full bg-gradient-to-t from-[#34cc30] to-[#34cc30]/60 rounded-t-lg" style={{ height: `${(Number(m.net) / maxNet) * 180}px`, minHeight: 4 }} />
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-[#2a2d36]">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white">تفصيل شهري</h3>
        </div>
        {monthly.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا توجد أرباح مسجلة بعد</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252830] text-sm text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-4">الشهر</th>
                <th className="text-right p-4">الطلبات</th>
                <th className="text-right p-4">الصافي</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {monthly.map(m => (
                <tr key={m.month} className="border-b border-gray-100 dark:border-[#2a2d36]">
                  <td className="p-4 font-medium dark:text-white">{m.month}</td>
                  <td className="p-4 dark:text-gray-300">{m.orders}</td>
                  <td className="p-4 font-bold text-[#34cc30]">{Number(m.net).toLocaleString()} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

<<<<<<< HEAD
// =================== طلبات السحب (للعرض فقط - الطلب من المحفظة) ===================
export function WithdrawalsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => { setLoading(true); fetch("/api/freelancer/withdrawals").then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false)); };
  useEffect(() => { reload(); }, []);

  const withdrawals: any[] = data?.withdrawals ?? [];
  const statusBadge: any = {
    pending:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-transparent",
  };
  const statusLabel: any = { pending: "بانتظار التحويل", approved: "تم التحويل", rejected: "مرفوض" };

  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;
=======
// =================== طلبات السحب ===================
export function WithdrawalsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [wdAmount, setWdAmount] = useState("");
  const [wdBank, setWdBank] = useState("");
  const [wdIban, setWdIban] = useState("");
  const [wdLoading, setWdLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const reload = () => {
    setLoading(true);
    fetch("/api/freelancer/withdrawals").then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

  const withdrawals: any[] = data?.withdrawals ?? [];
  const balance = data?.availableBalance ?? 0;
  const statusLabel: any = { pending: "بانتظار التحويل", approved: "تم التحويل", rejected: "مرفوض" };
  const statusColor: any = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

  const totalApproved = withdrawals.filter((w: any) => w.status === "approved").reduce((s: number, w: any) => s + Number(w.amount), 0);
  const totalPending = withdrawals.filter((w: any) => w.status === "pending").reduce((s: number, w: any) => s + Number(w.amount), 0);

  async function submit() {
    setWdLoading(true); setMsg("");
    const r = await fetch("/api/freelancer/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(wdAmount), bankName: wdBank, accountNumber: wdIban }),
    });
    const j = await r.json();
    if (r.ok) { setMsg("تم إرسال طلب السحب بنجاح"); setShowNew(false); reload(); }
    else setMsg(j.error || "فشل الطلب");
    setWdLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-foreground">سجل طلبات السحب</h1>
        <Link href="/freelancer/wallet">
          <Button variant="brand"><Wallet size={16}/> طلب سحب جديد</Button>
        </Link>
      </div>
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        لإنشاء طلب سحب جديد، انتقل إلى <Link href="/freelancer/wallet" className="underline font-medium">محفظتي</Link> واضغط "طلب سحب".
      </div>
      <Card className="shadow-sm overflow-hidden">
        {withdrawals.length === 0 ? (
          <CardContent className="p-12 text-center">
            <Wallet size={48} className="mx-auto text-muted-foreground/30 mb-3"/>
            <p className="text-muted-foreground">لا توجد طلبات سحب بعد</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right p-4">الرقم</TableHead>
                <TableHead className="text-right p-4">المبلغ</TableHead>
                <TableHead className="text-right p-4">البنك</TableHead>
                <TableHead className="text-right p-4">التاريخ</TableHead>
                <TableHead className="text-right p-4">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w: any) => (
                <TableRow key={w.id}>
                  <TableCell className="p-4 font-medium text-foreground">WD-{String(w.id).padStart(4, "0")}</TableCell>
                  <TableCell className="p-4 font-bold">{Number(w.amount).toLocaleString()} ر.س</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{w.bankName || "—"}</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{w.createdAt ? new Date(w.createdAt).toLocaleDateString("ar-SA") : "—"}</TableCell>
                  <TableCell className="p-4"><Badge className={statusBadge[w.status] || "bg-gray-100 text-gray-600 border-transparent"}>{statusLabel[w.status] || w.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
=======
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">طلبات السحب</h1>
        <button onClick={() => setShowNew(!showNew)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">
          {showNew ? <><X size={16} /> إلغاء</> : <><Plus size={16} /> طلب سحب جديد</>}
        </button>
      </div>
      {msg && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 text-sm">{msg}</div>}

      {showNew && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border-2 border-[#34cc30]/20">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">طلب سحب جديد</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">المبلغ (ر.س)</label>
              <input type="number" value={wdAmount} onChange={e => setWdAmount(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="100" />
              <p className="text-xs text-gray-400 mt-1">الرصيد المتاح: {Number(balance).toLocaleString()} ر.س</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">اسم البنك</label>
              <input value={wdBank} onChange={e => setWdBank(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="مصرف الراجحي" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">رقم الآيبان</label>
              <input value={wdIban} onChange={e => setWdIban(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="SA..." dir="ltr" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowNew(false)} className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg">إلغاء</button>
            <button onClick={submit} disabled={wdLoading} className="bg-[#34cc30] text-white px-6 py-2 rounded-lg hover:bg-[#2eb829] disabled:opacity-60">{wdLoading ? "جارٍ الإرسال..." : "تأكيد الطلب"}</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><Check size={18} className="text-green-600" /></div>
          <div><div className="text-lg font-bold text-[#485869] dark:text-white">{totalApproved.toLocaleString()} ر.س</div><div className="text-xs text-gray-500">إجمالي المسحوب</div></div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><Clock size={18} className="text-blue-600" /></div>
          <div><div className="text-lg font-bold text-[#485869] dark:text-white">{totalPending.toLocaleString()} ر.س</div><div className="text-xs text-gray-500">قيد المعالجة</div></div>
        </div>
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="p-2 bg-[#34cc30]/10 rounded-lg"><Wallet size={18} className="text-[#34cc30]" /></div>
          <div><div className="text-lg font-bold text-[#485869] dark:text-white">{withdrawals.length} طلبات</div><div className="text-xs text-gray-500">إجمالي الطلبات</div></div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
        {withdrawals.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا توجد طلبات سحب بعد</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252830] text-sm text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-4">رقم الطلب</th>
                <th className="text-right p-4">المبلغ</th>
                <th className="text-right p-4">البنك</th>
                <th className="text-right p-4">الحساب</th>
                <th className="text-right p-4">تاريخ الطلب</th>
                <th className="text-right p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {withdrawals.map((w: any) => (
                <tr key={w.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-[#252830]">
                  <td className="p-4 font-medium text-[#485869] dark:text-white">WD-{String(w.id).padStart(4, "0")}</td>
                  <td className="p-4 font-bold dark:text-white">{Number(w.amount).toLocaleString()} ر.س</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{w.bankName}</td>
                  <td className="p-4 text-xs font-mono dark:text-gray-300" dir="ltr">{w.accountNumber}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{w.createdAt ? new Date(w.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
                  <td className="p-4"><span className={`${statusColor[w.status] || "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full text-xs font-medium`}>{statusLabel[w.status] || w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

<<<<<<< HEAD
// =================== الإعدادات والأمان (موحّد) ===================
export function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Password change
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // Notification channels
  const [channels, setChannels] = useState<Record<string, boolean>>({ email: true, whatsapp: true, sms: false });
  const [channelSaving, setChannelSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/freelancer/profile").then(r => r.json()).then(d => setProfile(d.profile)).finally(() => setLoading(false));
    fetch("/api/freelancer/notification-preferences").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.preferences) {
        setChannels({ email: !!d.preferences.email, whatsapp: !!d.preferences.whatsapp, sms: !!d.preferences.sms });
      }
    }).catch(() => {});
  }, []);

  async function changePassword() {
    setPwdMsg(null);
    if (newPwd.length < 8) return setPwdMsg({ type: "error", text: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
    if (newPwd !== confirmPwd) return setPwdMsg({ type: "error", text: "كلمتا المرور غير متطابقتين" });
    setPwdLoading(true);
    const r = await fetch("/api/auth/change-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
    });
    setPwdLoading(false);
    if (r.ok) { setPwdMsg({ type: "success", text: "تم تحديث كلمة المرور بنجاح" }); setOldPwd(""); setNewPwd(""); setConfirmPwd(""); setShowPwdForm(false); }
    else { const j = await r.json().catch(() => ({})); setPwdMsg({ type: "error", text: j.error || "فشل التحديث" }); }
  }

  const toggleChannel = async (key: string) => {
    const next = !channels[key];
    setChannels(c => ({ ...c, [key]: next }));
    setChannelSaving(key);
    try {
      const r = await fetch("/api/freelancer/notification-preferences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: next }),
      });
      if (!r.ok) setChannels(c => ({ ...c, [key]: !next }));
    } catch { setChannels(c => ({ ...c, [key]: !next })); }
    setChannelSaving(null);
  };

  const deviceInfo = typeof navigator !== "undefined" ? (() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
    const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Linux") ? "Linux" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : "غير معروف";
    const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : ua.includes("Edge") ? "Edge" : "متصفح غير معروف";
    return { isMobile, os, browser, now: new Date().toLocaleString("ar-SA", { dateStyle: "long", timeStyle: "short" }) };
  })() : null;

  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;

  const bankName = profile?.bankName || null;
  const iban = profile?.iban || null;
  const maskedIban = iban ? `${iban.slice(0, 4)}****${iban.slice(-4)}` : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">الإعدادات والأمان</h1>

      {/* Password change */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><Lock size={18}/> تغيير كلمة المرور</h3>
            <Button variant="ghost" className="text-[#34cc30] hover:text-[#2eb829]" onClick={() => setShowPwdForm(!showPwdForm)}>{showPwdForm ? "إلغاء" : "تغيير"}</Button>
          </div>
          {pwdMsg && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${pwdMsg.type === "success" ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"}`}>{pwdMsg.text}</div>
          )}
          {showPwdForm && (
            <div className="space-y-4 max-w-md">
              <div><label className="block text-sm text-muted-foreground mb-1.5">كلمة المرور الحالية</label><Input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)}/></div>
              <div><label className="block text-sm text-muted-foreground mb-1.5">كلمة المرور الجديدة</label><Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}/><p className="text-xs text-muted-foreground mt-1">8 أحرف على الأقل</p></div>
              <div><label className="block text-sm text-muted-foreground mb-1.5">تأكيد كلمة المرور</label><Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}/></div>
              <Button variant="brand" onClick={changePassword} disabled={pwdLoading}>{pwdLoading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Shield size={18}/> التحقق بخطوتين</h3>
          <div className="flex items-center justify-between p-4 border border-border bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg"><Shield size={20} className="text-muted-foreground"/></div>
              <div>
                <div className="font-medium text-foreground">التحقق عبر الواتساب</div>
                <div className="text-sm text-muted-foreground">سيتوفر قريباً لتأمين حسابك بشكل إضافي</div>
              </div>
            </div>
            <Badge className="bg-muted text-muted-foreground border-border">قريباً</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bank Info - read-only */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Wallet size={18}/> المعلومات البنكية</h3>
          {bankName ? (
            <div className="grid md:grid-cols-2 gap-4">
              <ReadField label="اسم البنك" value={bankName}/>
              <ReadField label="رقم الآيبان (مخفي جزئياً)" value={maskedIban}/>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد معلومات بنكية. تواصل مع الدعم لإضافة حسابك البنكي.</p>
          )}
        </CardContent>
      </Card>

      {/* Notification channels */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2"><Bell size={18}/> قنوات الإشعارات</h3>
          <p className="text-xs text-muted-foreground mb-4">اختر القنوات التي تستلم عليها الإشعارات.</p>
          <div className="space-y-3">
            {[
              { k: "email", label: "البريد الإلكتروني", desc: "استلام الإشعارات عبر الإيميل", icon: FileText },
              { k: "whatsapp", label: "واتساب", desc: "استلام الإشعارات عبر واتساب", icon: Phone },
              { k: "sms", label: "رسائل SMS", desc: "استلام الإشعارات عبر SMS", icon: Smartphone },
            ].map(({ k, label, desc, icon: Icon }) => (
              <div key={k} className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg"><Icon size={18} className="text-muted-foreground"/></div>
                  <div>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                </div>
                <button disabled={channelSaving === k} onClick={() => toggleChannel(k)} className={`w-12 h-7 rounded-full transition-colors relative ${channels[k] ? "bg-[#34cc30]" : "bg-muted"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${channels[k] ? "right-1" : "right-6"}`}/>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current session */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Laptop size={18}/> الجلسة الحالية</h3>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                {deviceInfo?.isMobile ? <Smartphone size={18} className="text-green-600"/> : <Laptop size={18} className="text-green-600"/>}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground flex items-center gap-2">
                  {deviceInfo?.isMobile ? "جهاز محمول" : "حاسب"}
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent text-[10px]">نشطة</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{deviceInfo?.browser} · {deviceInfo?.os}</div>
                <div className="text-xs text-muted-foreground">{deviceInfo?.now}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-destructive mb-4">منطقة الخطر</h3>
          <a href="https://wa.me/966511809878?text=مرحبا، أبغى أعطّل/أحذف حسابي" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5 hover:bg-destructive/10">
            <div>
              <div className="font-medium text-destructive">تعطيل أو حذف الحساب</div>
              <div className="text-sm text-destructive/70">تواصل مع الدعم لإيقاف أو حذف حسابك نهائياً</div>
            </div>
            <span className="text-destructive text-sm font-bold">تواصل مع الدعم →</span>
          </a>
        </CardContent>
      </Card>
=======
// =================== إعدادات الحساب ===================
export function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/profile").then(r => r.json()).then(d => setProfile(d.profile)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">إعدادات الحساب</h1>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">المعلومات الأساسية</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الاسم" value={profile?.name} />
            <Field label="البريد الإلكتروني" value={profile?.email} />
            <Field label="رقم الواتساب" value={profile?.phone} />
            <Field label="المدينة" value={profile?.location} />
          </div>
          <p className="text-xs text-gray-500 mt-3">لتعديل الاسم أو المدينة، استخدم صفحة "ملفي الشخصي".</p>
        </div>

        <hr className="border-gray-100 dark:border-[#2a2d36]" />

        <div>
          <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">الحساب البنكي للسحب</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="البنك" value={profile?.bankName} />
            <Field label="رقم الآيبان (IBAN)" value={profile?.iban} />
          </div>
          <p className="text-xs text-gray-500 mt-3">لتحديث بياناتك البنكية، تواصل مع الدعم الفني عبر واتساب.</p>
        </div>

        <hr className="border-gray-100 dark:border-[#2a2d36]" />

        <div>
          <h3 className="text-lg font-bold text-red-600 mb-4">منطقة الخطر</h3>
          <a href="https://wa.me/966511809878?text=مرحبا، أبغى أعطّل/أحذف حسابي" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100">
            <div>
              <div className="font-medium text-red-700">تعطيل أو حذف الحساب</div>
              <div className="text-sm text-red-500">تواصل مع الدعم لإيقاف أو حذف حسابك نهائياً</div>
            </div>
            <span className="text-red-700 text-sm font-bold">تواصل مع الدعم →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// =================== إعدادات الإشعارات ===================
export function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    newOrder: true, messages: true, payments: true, support: true,
    reviews: true, marketing: false, tips: false,
    email: true, whatsapp: true, sms: false,
  });
  const [official, setOfficial] = useState<string[]>(["newOrder", "messages", "payments", "support"]);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/freelancer/notification-preferences")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.preferences) { setSettings(d.preferences); if (d.official) setOfficial(d.official); } })
      .catch(() => {});
  }, []);

  const toggle = async (key: string) => {
    if (official.includes(key)) {
      setError("الإشعارات الرسمية إجبارية ولا يمكن إيقافها");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const prev = settings[key];
    const next = !prev;
    setSettings(s => ({ ...s, [key]: next }));
    setSaving(key);
    try {
      const r = await fetch("/api/freelancer/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: next }),
      });
      if (!r.ok) {
        setSettings(s => ({ ...s, [key]: prev }));
        const d = await r.json().catch(() => ({}));
        setError(d.error || "فشل الحفظ");
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setSettings(s => ({ ...s, [key]: prev }));
    } finally { setSaving(null); }
  };

  const Item = ({ k, label, desc, Icon }: { k: string; label: string; desc: string; Icon: any }) => {
    const isOfficial = official.includes(k);
    return (
      <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-[#2a2d36] rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-[#252830] rounded-lg"><Icon size={18} className="text-gray-600 dark:text-gray-400" /></div>
          <div>
            <div className="font-medium text-[#485869] dark:text-gray-100 flex items-center gap-2">
              {label}
              {isOfficial && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">رسمي</span>}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{desc}</div>
          </div>
        </div>
        <button disabled={isOfficial || saving === k} onClick={() => toggle(k)} className={`w-12 h-7 rounded-full transition-colors relative ${settings[k] ? "bg-[#34cc30]" : "bg-gray-300"} ${isOfficial ? "opacity-60 cursor-not-allowed" : ""}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${settings[k] ? "right-1" : "right-6"}`} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-gray-100">إعدادات الإشعارات</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-gray-100 mb-1">أنواع الإشعارات</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">إشعارات الطلبات والمدفوعات والرسائل والدعم رسمية ولا يمكن إيقافها.</p>
        <div className="space-y-3">
          <Item k="newOrder" label="طلبات جديدة" desc="إشعار عند استلام طلب جديد" Icon={ShoppingBag} />
          <Item k="messages" label="الرسائل" desc="إشعار عند استلام رسالة" Icon={MessageCircle} />
          <Item k="payments" label="المدفوعات" desc="إشعار عند استلام أو سحب أموال" Icon={DollarSign} />
          <Item k="support" label="الدعم الفني" desc="ردود فريق الدعم على تذاكرك" Icon={FileText} />
          <Item k="reviews" label="التقييمات" desc="إشعار عند استلام تقييم" Icon={Star} />
          <Item k="marketing" label="العروض والتسويق" desc="عروض من المنصة" Icon={Zap} />
          <Item k="tips" label="نصائح" desc="نصائح لتطوير عملك" Icon={FileText} />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-gray-100 mb-1">قنوات الإشعارات</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">القنوات التي تستلم عليها الإشعارات.</p>
        <div className="space-y-3">
          <Item k="email" label="البريد الإلكتروني" desc="استلام عبر الإيميل" Icon={FileText} />
          <Item k="whatsapp" label="واتساب" desc="استلام عبر واتساب" Icon={Phone} />
          <Item k="sms" label="رسائل SMS" desc="استلام عبر SMS" Icon={Smartphone} />
        </div>
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

<<<<<<< HEAD
// =================== إعدادات الإشعارات (تحويل إلى الإعدادات الموحدة) ===================
export function NotificationsSettingsPage() {
  return <SettingsPage />;
}

// =================== الخصوصية والأمان (تحويل إلى الإعدادات الموحدة) ===================
export function SecurityPage() {
  return <SettingsPage />;
}

// =================== إعدادات واتساب (محذوفة) ===================
export function WhatsAppSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">إعدادات واتساب</h1>
      <Card className="shadow-sm">
        <CardContent className="p-8 text-center">
          <Phone size={48} className="mx-auto text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground mb-4">لا يمكن تعديل رقم الواتساب من هنا. إذا أردت تحديث رقمك، تواصل مع فريق الدعم.</p>
          <a href="https://wa.me/966511809878?text=مرحبا، أريد تحديث رقم واتسابي المسجل" target="_blank" rel="noreferrer">
            <Button variant="brand"><Phone size={16}/> تواصل مع الدعم</Button>
          </a>
        </CardContent>
      </Card>
=======
// =================== الخصوصية والأمان ===================
export function SecurityPage() {
  const [showForm, setShowForm] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function changePassword() {
    setMsg(null);
    if (newPwd.length < 8) return setMsg({ type: "error", text: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
    if (newPwd !== confirmPwd) return setMsg({ type: "error", text: "كلمتا المرور غير متطابقتين" });
    setLoading(true);
    const r = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
    });
    setLoading(false);
    if (r.ok) {
      setMsg({ type: "success", text: "تم تحديث كلمة المرور بنجاح" });
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      setShowForm(false);
    } else {
      const j = await r.json().catch(() => ({}));
      setMsg({ type: "error", text: j.error || "فشل التحديث" });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الخصوصية والأمان</h1>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white flex items-center gap-2"><Lock size={18} /> تغيير كلمة المرور</h3>
          <button onClick={() => setShowForm(!showForm)} className="text-[#34cc30] text-sm hover:text-[#2eb829]">{showForm ? "إلغاء" : "تغيير"}</button>
        </div>
        {showForm && (
          <div className="space-y-4 max-w-md">
            <div><label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">كلمة المرور الحالية</label><input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" /></div>
            <div><label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">كلمة المرور الجديدة</label><input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" /><p className="text-xs text-gray-400 mt-1">8 أحرف على الأقل</p></div>
            <div><label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">تأكيد كلمة المرور</label><input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" /></div>
            <button onClick={changePassword} disabled={loading} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] disabled:opacity-60">{loading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}</button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4 flex items-center gap-2"><Shield size={18} /> التحقق بخطوتين</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#2a2d36] bg-gray-50 dark:bg-[#252830] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 dark:bg-[#1a1d24] rounded-lg"><Shield size={20} className="text-gray-500" /></div>
            <div>
              <div className="font-medium text-[#485869] dark:text-white">قريباً</div>
              <div className="text-sm text-gray-500">سنوفر التحقق بخطوتين عبر الواتساب قريباً</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">الجلسة الحالية</h3>
        <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-[#2a2d36] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Laptop size={18} className="text-green-600" /></div>
            <div>
              <div className="text-sm font-medium text-[#485869] dark:text-white flex items-center gap-2">
                هذا الجهاز
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">نشطة</span>
              </div>
              <span className="text-xs text-gray-500">{typeof navigator !== "undefined" ? navigator.userAgent.split(")")[0] + ")" : "—"}</span>
            </div>
          </div>
        </div>
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

<<<<<<< HEAD
// =================== التوفر والجدول (يعرض الملف الشخصي) ===================
export function AvailabilityPage() {
  return <ProfilePage />;
=======
// =================== إعدادات واتساب ===================
export function WhatsAppSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/profile").then(r => r.json()).then(d => setProfile(d.profile)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">إعدادات واتساب</h1>

      <div className="bg-gradient-to-br from-[#34cc30] to-[#2eb829] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="font-bold text-lg">رقم الواتساب الرسمي</span>
        </div>
        <p className="text-white/80 text-sm mb-3">هذا هو الرقم المسجل في حسابك ويُستخدم لاستقبال الطلبات والإشعارات</p>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-2xl font-bold" dir="ltr">
          {profile?.phone || "—"}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">تواصل العملاء</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">جميع المحادثات مع العملاء تتم عبر منصة خدوم لضمان حمايتك. ممنوع تبادل أرقام التواصل أو الروابط الخارجية.</p>
        <a href="https://wa.me/966511809878?text=مرحبا، أبغى أحدّث رقم واتسابي المسجل" target="_blank" rel="noreferrer" className="inline-flex bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] items-center gap-2">
          <Phone size={16} /> طلب تحديث الرقم
        </a>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-yellow-800">
          <strong>تنبيه:</strong> أي محاولة لتبادل معلومات الاتصال خارج المنصة قد تؤدي إلى إيقاف الحساب فوراً.
        </div>
      </div>
    </div>
  );
}

// =================== التوفر والجدول ===================
export function AvailabilityPage() {
  const [vacationMode, setVacationMode] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#485869] dark:text-white">التوفر والجدول</h1>

      <div className={`rounded-xl p-6 ${vacationMode ? "bg-yellow-50 border-2 border-yellow-200" : "bg-white dark:bg-[#1a1d24] shadow-sm"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${vacationMode ? "bg-yellow-100" : "bg-gray-100 dark:bg-[#252830]"}`}>
              <Calendar size={20} className={vacationMode ? "text-yellow-600" : "text-gray-500"} />
            </div>
            <div>
              <div className="font-bold text-[#485869] dark:text-white">وضع الإجازة</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{vacationMode ? "مفعّل - ملفك مخفي مؤقتاً" : "عند التفعيل سيتم إخفاء ملفك مؤقتاً عن العملاء"}</div>
            </div>
          </div>
          <button onClick={() => setVacationMode(!vacationMode)} className={`w-12 h-7 rounded-full ${vacationMode ? "bg-yellow-500" : "bg-gray-300"} relative`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${vacationMode ? "right-1" : "right-6"}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-12 text-center">
        <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
        <h3 className="font-bold text-[#485869] dark:text-white mb-2">جدول العمل التفصيلي — قريباً</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          سنوفر قريباً إمكانية تحديد ساعات عملك لكل يوم من الأسبوع وتعطيل استلام الطلبات تلقائياً خارج هذه الأوقات.
        </p>
      </div>
    </div>
  );
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
}

// =================== الدعم الفني ===================
export function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

<<<<<<< HEAD
  const reload = () => { setLoading(true); fetch("/api/freelancer/support").then(r => r.json()).then(d => setTickets(d.tickets || [])).finally(() => setLoading(false)); };
=======
  const reload = () => {
    setLoading(true);
    fetch("/api/freelancer/support").then(r => r.json()).then(d => setTickets(d.tickets || [])).finally(() => setLoading(false));
  };
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  useEffect(() => { reload(); }, []);

  async function submit() {
    if (!subject.trim() || !body.trim()) return;
    setSubmitting(true); setMsg("");
    const r = await fetch("/api/freelancer/support", {
<<<<<<< HEAD
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, priority }),
    });
    setSubmitting(false);
    if (r.ok) { setMsg("تم إرسال التذكرة بنجاح"); setSubject(""); setBody(""); setPriority("normal"); setShowNew(false); reload(); }
    else { const j = await r.json().catch(() => ({})); setMsg(j.error || "فشل الإرسال"); }
  }

  const statusBadge: Record<string, string> = {
    open:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-transparent",
    in_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent",
    resolved:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-transparent",
  };
  const statusLabel: Record<string, string> = { open: "مفتوحة", in_review: "قيد المراجعة", resolved: "محلولة" };
=======
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, priority }),
    });
    setSubmitting(false);
    if (r.ok) {
      setMsg("تم إرسال التذكرة بنجاح");
      setSubject(""); setBody(""); setPriority("normal");
      setShowNew(false);
      reload();
    } else {
      const j = await r.json().catch(() => ({}));
      setMsg(j.error || "فشل الإرسال");
    }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    open: { label: "مفتوحة", color: "bg-blue-100 text-blue-700" },
    in_review: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700" },
    resolved: { label: "محلولة", color: "bg-green-100 text-green-700" },
  };
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-foreground">الدعم الفني</h1>
        <Button variant="brand" onClick={() => setShowNew(!showNew)}>
          {showNew ? <><X size={16}/> إلغاء</> : <><Plus size={16}/> تذكرة جديدة</>}
        </Button>
      </div>
      {msg && <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg p-3 text-sm">{msg}</div>}
      {showNew && (
        <Card className="shadow-sm border-2 border-[#34cc30]/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">فتح تذكرة جديدة</h3>
            <div><label className="block text-sm text-muted-foreground mb-1.5">الموضوع</label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="صف المشكلة باختصار"/></div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">الأولوية</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30">
                <option value="normal">عادي</option><option value="high">عاجل</option>
              </select>
            </div>
            <div><label className="block text-sm text-muted-foreground mb-1.5">تفاصيل المشكلة</label><textarea rows={4} value={body} onChange={e => setBody(e.target.value)} className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 resize-y" placeholder="اشرح مشكلتك بالتفصيل..."/></div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNew(false)}>إلغاء</Button>
              <Button variant="brand" onClick={submit} disabled={submitting}>{submitting ? "جارٍ الإرسال..." : "إرسال التذكرة"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        <a href="https://wa.me/966511809878" target="_blank" rel="noreferrer" className="block">
          <Card className="shadow-sm hover:shadow-md transition-shadow text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-[#34cc30]/10 rounded-xl flex items-center justify-center mx-auto mb-3"><Phone size={24} className="text-[#34cc30]"/></div>
              <h3 className="font-bold text-foreground mb-1">واتساب الدعم</h3>
              <p className="text-sm text-muted-foreground" dir="ltr">+966 51 180 9878</p>
              <p className="text-xs text-muted-foreground mt-1">رد فوري</p>
            </CardContent>
          </Card>
        </a>
        <a href="mailto:help@khadum.app" className="block">
          <Card className="shadow-sm hover:shadow-md transition-shadow text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3"><MessageCircle size={24} className="text-blue-600"/></div>
              <h3 className="font-bold text-foreground mb-1">البريد الإلكتروني</h3>
              <p className="text-sm text-muted-foreground" dir="ltr">help@khadum.app</p>
              <p className="text-xs text-muted-foreground mt-1">خلال 24 ساعة</p>
            </CardContent>
          </Card>
        </a>
        <Card className="shadow-sm text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3"><HelpCircle size={24} className="text-purple-600"/></div>
            <h3 className="font-bold text-foreground mb-1">مركز المساعدة</h3>
            <p className="text-sm text-muted-foreground">أسئلة شائعة وإرشادات</p>
            <p className="text-xs text-muted-foreground mt-1">قريباً</p>
          </CardContent>
        </Card>
      </div>
      {tickets.length > 0 && (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border px-6 py-4">
            <CardTitle className="text-base">تذاكرك السابقة</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right p-4">الموضوع</TableHead>
                <TableHead className="text-right p-4">التاريخ</TableHead>
                <TableHead className="text-right p-4">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="p-4 font-medium text-foreground">{t.subject}</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("ar-SA") : "—"}</TableCell>
                  <TableCell className="p-4"><Badge className={statusBadge[t.status] || "bg-gray-100 text-gray-600 border-transparent"}>{statusLabel[t.status] || t.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== معرض الأعمال (محوّل إلى الطلبات المكتملة) ===================
export function PortfolioPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancer/orders?status=completed").then(r => r.json()).then(d => {
      setOrders((d.orders || []).filter((x: any) => x.status === "completed"));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40 text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">مركز الأعمال المنجزة</h1>
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        أعمالك المنجزة تُبنى تلقائياً من طلباتك المكتملة وتكون دليلاً على خبرتك للعملاء.
      </div>
      {orders.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-3"/>
            <p className="text-muted-foreground">لا توجد أعمال منجزة بعد. أكمل طلباتك الأولى لتظهر هنا.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.slice(0, 12).map(o => (
            <div key={o.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-all bg-background">
              <div className="font-medium text-foreground text-sm mb-1 line-clamp-2">{o.serviceTitle || o.title || "خدمة"}</div>
              <div className="text-xs text-muted-foreground mb-2">للعميل: {o.clientName || "—"}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#34cc30] font-bold">{Number(o.amount || 0).toLocaleString()} ر.س</span>
                {o.rating && <span className="flex items-center gap-1 text-yellow-600"><Star size={12} className="fill-yellow-400"/> {Number(o.rating).toFixed(1)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
=======
        <h1 className="text-2xl font-bold text-[#485869] dark:text-white">الدعم الفني</h1>
        <button onClick={() => setShowNew(!showNew)} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] flex items-center gap-2">
          {showNew ? <><X size={16} /> إلغاء</> : <><Plus size={16} /> تذكرة جديدة</>}
        </button>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">{msg}</div>}

      {showNew && (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 border-2 border-[#34cc30]/20">
          <h3 className="text-lg font-bold text-[#485869] dark:text-white mb-4">فتح تذكرة جديدة</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">الموضوع</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="صف المشكلة باختصار" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">الأولوية</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5">
                <option value="normal">عادي</option>
                <option value="high">عاجل</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">تفاصيل المشكلة</label>
              <textarea rows={4} value={body} onChange={e => setBody(e.target.value)} className="w-full border border-gray-200 dark:border-[#2a2d36] dark:bg-[#252830] dark:text-white rounded-lg px-4 py-2.5" placeholder="اشرح مشكلتك بالتفصيل..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNew(false)} className="border border-gray-200 px-6 py-2 rounded-lg">إلغاء</button>
              <button onClick={submit} disabled={submitting} className="bg-[#34cc30] text-white px-6 py-2 rounded-lg hover:bg-[#2eb829] disabled:opacity-60">{submitting ? "جارٍ الإرسال..." : "إرسال التذكرة"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <a href="https://wa.me/966511809878" target="_blank" rel="noreferrer" className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-[#34cc30]/10 rounded-xl flex items-center justify-center mx-auto mb-3"><Phone size={24} className="text-[#34cc30]" /></div>
          <h3 className="font-bold text-[#485869] dark:text-white mb-1">واتساب الدعم</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">+966 51 180 9878</p>
          <p className="text-xs text-gray-400 mt-1">رد فوري</p>
        </a>
        <a href="mailto:help@khadum.app" className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3"><MessageCircle size={24} className="text-blue-600" /></div>
          <h3 className="font-bold text-[#485869] dark:text-white mb-1">البريد الإلكتروني</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">help@khadum.app</p>
          <p className="text-xs text-gray-400 mt-1">رد خلال 24 ساعة</p>
        </a>
        <a href="/contact" className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3"><HelpCircle size={24} className="text-purple-600" /></div>
          <h3 className="font-bold text-[#485869] dark:text-white mb-1">تواصل معنا</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">صفحة التواصل الكاملة</p>
        </a>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-[#2a2d36]"><h3 className="text-lg font-bold text-[#485869] dark:text-white">تذاكر الدعم</h3></div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">جارٍ التحميل...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">لا توجد تذاكر مفتوحة</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#252830] text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-right p-4">الرقم</th>
                <th className="text-right p-4">الموضوع</th>
                <th className="text-right p-4">الأولوية</th>
                <th className="text-right p-4">التاريخ</th>
                <th className="text-right p-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => {
                const st = statusMap[t.status] || { label: t.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={t.id} className="border-b border-gray-100 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-[#252830]">
                    <td className="p-4 font-medium text-[#485869] dark:text-white">TK-{String(t.id).padStart(4, "0")}</td>
                    <td className="p-4 dark:text-gray-300">{t.subject}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${t.priority === "high" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{t.priority === "high" ? "عاجل" : "عادي"}</span></td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
                    <td className="p-4"><span className={`${st.color} px-3 py-1 rounded-full text-xs font-medium`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </div>
  );
}

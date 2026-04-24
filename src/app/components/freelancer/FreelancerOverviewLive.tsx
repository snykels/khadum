"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  DollarSign, ShoppingBag, Star, TrendingUp, MessageSquare, RefreshCcw,
  ExternalLink, MoreHorizontal, Loader2, Wallet, FileText,
} from "lucide-react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import BannerCarousel from "./BannerCarousel";
import { RippleButton, EditableNote } from "../ui/InteractiveKit";

type Stats = {
  name: string;
  rating: number | string;
  walletBalance: number;
  activeOrders: number;
  totalCompleted: number;
  monthEarnings: number;
  completionRate: number;
  recentOrders?: any[];
  monthlyEarnings?: any[];
  userName?: string;
};

type Order = {
  id: number;
  publicCode: string;
  status: string;
  paymentStatus: string;
  amount: string;
  paidAmount: string;
  description: string | null;
  dueDate: string | null;
  createdAt: string;
  clientName: string;
  clientPhone: string | null;
  serviceTitle: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "بانتظار",
  active: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
  disputed: "نزاع",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  disputed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function nf(v: number | string) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString("ar-SA", { maximumFractionDigits: 2 });
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 0) return new Date(iso).toLocaleDateString("ar-SA");
  if (days === 0) return "اليوم";
  if (days === 1) return "غداً";
  if (days < 7) return `بعد ${days} أيام`;
  return new Date(iso).toLocaleDateString("ar-SA");
}

function dueIn(due?: string | null) {
  if (!due) return "—";
  const diff = new Date(due).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return "متأخر";
  if (days === 0) return "اليوم";
  if (days === 1) return "غداً";
  return `بعد ${days} يوم`;
}

function KpiCard({ icon: Icon, title, value, unit, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-[#2a2d36] shadow-sm hover:shadow-lg hover:shadow-[#0F5132]/5 transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`bg-gradient-to-br ${color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-black/10`}>
          <Icon className="text-white" size={22} />
        </div>
      </div>
      <div className="text-3xl font-bold text-[#1C1917] dark:text-white mb-0.5" style={{ fontFamily: "var(--font-tajawal)" }}>
        {value} <span className="text-base text-gray-400 font-medium">{unit}</span>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
=======
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DollarSign, ShoppingBag, Star, TrendingUp, MessageSquare, GripVertical, RefreshCcw, MoreHorizontal, ExternalLink, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as ContextMenu from "@radix-ui/react-context-menu";
import BannerCarousel from "./BannerCarousel";
import { Tip, RippleButton, EditableNote, StaggerList } from "../ui/InteractiveKit";

type Kpi = { id: string; title: string; value: string; unit: string; change: string; trend: "up" | "down"; icon: any; color: string };
type Order = { id: string; service: string; client: string; amount: string; status: string; deadline: string; statusColor: string };

const initialKpis: Kpi[] = [
  { id: "k1", title: "الأرباح هذا الشهر", value: "12,450", unit: "ر.س", change: "+15.3%", trend: "up", icon: DollarSign, color: "from-[#0F5132] to-[#0a3a24]" },
  { id: "k2", title: "الطلبات النشطة",   value: "8",      unit: "طلب", change: "+2",     trend: "up", icon: ShoppingBag, color: "from-blue-500 to-blue-600" },
  { id: "k3", title: "متوسط التقييم",    value: "4.9",    unit: "★",   change: "+0.1",   trend: "up", icon: Star, color: "from-[#C9A961] to-amber-600" },
  { id: "k4", title: "معدل الإنجاز",     value: "98",     unit: "%",   change: "+3%",    trend: "up", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
];

const initialOrders: Order[] = [
  { id: "#ORD-2451", service: "تصميم هوية بصرية كاملة",     client: "أحمد السالم",  amount: "850 ر.س", status: "قيد التنفيذ",      deadline: "غداً",       statusColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { id: "#ORD-2450", service: "تصميم منشورات سوشيال ميديا", client: "سارة محمد",    amount: "320 ر.س", status: "بانتظار المراجعة", deadline: "اليوم",      statusColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { id: "#ORD-2449", service: "تصميم شعار احترافي",         client: "خالد العتيبي", amount: "450 ر.س", status: "مكتمل",            deadline: "—",          statusColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { id: "#ORD-2448", service: "تصميم بطاقة عمل",            client: "نورة الدوسري", amount: "180 ر.س", status: "قيد التنفيذ",      deadline: "بعد 3 أيام", statusColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
];

function KpiCard({ kpi }: { kpi: Kpi }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: kpi.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1 };
  const Icon = kpi.icon;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ y: -4, scale: 1.015 }}
      animate={{ scale: isDragging ? 1.04 : 1, opacity: isDragging ? 0.85 : 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={`group relative bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-[#2a2d36] ${isDragging ? "shadow-2xl shadow-[#0F5132]/20" : "shadow-sm hover:shadow-lg hover:shadow-[#0F5132]/5"} transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`bg-gradient-to-br ${kpi.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-black/10`}>
          <Icon className="text-white" size={22} />
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.trend === "up" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-50 text-red-700"}`}>{kpi.change}</span>
          <Tip label="اسحب لإعادة الترتيب">
            <button {...attributes} {...listeners} className="p-1 text-gray-300 hover:text-[#0F5132] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" aria-label="drag">
              <GripVertical size={16} />
            </button>
          </Tip>
        </div>
      </div>
      <div className="text-3xl font-bold text-[#1C1917] dark:text-white mb-0.5" style={{ fontFamily: "var(--font-tajawal)" }}>
        {kpi.value} <span className="text-base text-gray-400 font-medium">{kpi.unit}</span>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{kpi.title}</div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </motion.div>
  );
}

<<<<<<< HEAD
function OrderRow({ order }: { order: Order }) {
  return (
    <motion.div
      whileHover={{ x: -2 }}
      className="grid grid-cols-[1fr,1fr,auto,auto] items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-[#2a2d36] hover:bg-[#0F5132]/5 dark:hover:bg-white/[0.03] transition-colors group"
    >
      <div>
        <div className="font-semibold text-sm text-[#1C1917] dark:text-white">
          {order.serviceTitle || order.description || "طلب"}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">#{order.publicCode} • {order.clientName}</div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{dueIn(order.dueDate)}</div>
      <span className={`${STATUS_COLOR[order.status] || ""} px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
        {STATUS_LABEL[order.status] || order.status}
      </span>
      <div className="flex items-center gap-1">
        <span className="font-bold text-[#0F5132] text-sm">{nf(order.amount)} ر.س</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-[#0F5132]">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="z-50 min-w-[180px] bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl shadow-xl p-1.5" sideOffset={4}>
              <DropdownMenu.Item asChild>
                <Link href={`/freelancer/orders?id=${order.id}`} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[#0F5132]/10 hover:text-[#0F5132] cursor-pointer outline-none">
                  <ExternalLink size={14} /> فتح الطلب
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href={`/freelancer/messages`} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[#0F5132]/10 hover:text-[#0F5132] cursor-pointer outline-none">
                  <MessageSquare size={14} /> مراسلة العميل
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </motion.div>
=======
function OrderRow({ order, onAction }: { order: Order; onAction: (a: string, o: Order) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <motion.div
          ref={setNodeRef}
          style={style}
          whileHover={{ x: -2 }}
          className="grid grid-cols-[auto,1fr,1fr,auto,auto] items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-[#2a2d36] hover:bg-[#0F5132]/5 dark:hover:bg-white/[0.03] transition-colors group"
        >
          <Tip label="اسحب لإعادة الترتيب">
            <button {...attributes} {...listeners} className="text-gray-300 hover:text-[#0F5132] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"><GripVertical size={14} /></button>
          </Tip>
          <div>
            <div className="font-semibold text-sm text-[#1C1917] dark:text-white">{order.service}</div>
            <div className="text-xs text-gray-500 mt-0.5">{order.id} • {order.client}</div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{order.deadline}</div>
          <span className={`${order.statusColor} px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>{order.status}</span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#0F5132] text-sm">{order.amount}</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-[#0F5132]"><MoreHorizontal size={16} /></button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="z-50 min-w-[180px] bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl shadow-xl p-1.5" sideOffset={4}>
                  {[
                    { k: "open",     label: "فتح الطلب",       icon: ExternalLink },
                    { k: "message",  label: "مراسلة العميل",   icon: MessageSquare },
                    { k: "bookmark", label: "تثبيت الطلب",     icon: Bookmark },
                  ].map(it => (
                    <DropdownMenu.Item key={it.k} onSelect={() => onAction(it.k, order)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[#0F5132]/10 hover:text-[#0F5132] cursor-pointer outline-none">
                      <it.icon size={14} /> {it.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </motion.div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-[200px] bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-xl shadow-xl p-1.5">
          {[
            { k: "open",     label: "فتح الطلب" },
            { k: "message",  label: "مراسلة العميل" },
            { k: "bookmark", label: "تثبيت الطلب" },
          ].map(it => (
            <ContextMenu.Item key={it.k} onSelect={() => onAction(it.k, order)} className="px-3 py-2 text-sm rounded-lg hover:bg-[#0F5132]/10 hover:text-[#0F5132] cursor-pointer outline-none">{it.label}</ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  );
}

export default function FreelancerOverviewLive() {
<<<<<<< HEAD
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const [s, o] = await Promise.all([
        fetch("/api/freelancer/stats", { cache: "no-store" }).then(r => r.ok ? r.json() : null),
        fetch("/api/freelancer/orders", { cache: "no-store" }).then(r => r.ok ? r.json() : { orders: [] }),
      ]);
      if (s) setStats(s);
      if (o?.orders) setOrders((o.orders as Order[]).slice(0, 5));
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  const kpis = [
    {
      title: "الأرباح هذا الشهر",
      value: nf(stats?.monthEarnings ?? 0),
      unit: "ر.س",
      icon: DollarSign,
      color: "from-[#0F5132] to-[#0a3a24]",
    },
    {
      title: "الطلبات النشطة",
      value: stats?.activeOrders ?? 0,
      unit: "طلب",
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "متوسط التقييم",
      value: nf(stats?.rating ?? 0),
      unit: "★",
      icon: Star,
      color: "from-[#C9A961] to-amber-600",
    },
    {
      title: "معدل الإنجاز",
      value: stats?.completionRate ?? 0,
      unit: "%",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
  ];

=======
  const [kpis, setKpis] = useState<Kpi[]>(initialKpis);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onKpiDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setKpis(items => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)));
    toast.success("تم إعادة ترتيب البطاقات", { description: "ترتيبك الجديد محفوظ" });
  }
  function onOrderDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrders(items => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)));
    toast.success("تم تحديث ترتيب الطلبات");
  }

  function handleOrderAction(action: string, o: Order) {
    if (action === "open")     toast.info(`فتح الطلب ${o.id}`);
    if (action === "message")  toast.success(`فتحت محادثة مع ${o.client}`);
    if (action === "bookmark") toast.success("تم تثبيت الطلب", { description: o.service });
  }

>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-tajawal), Tahoma, sans-serif" }}>
      <BannerCarousel />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#0F5132] via-[#0F5132] to-[#0a3a24] rounded-2xl p-8 text-white shadow-xl shadow-[#0F5132]/20"
      >
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-[#C9A961]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-12 w-72 h-72 bg-[#25D366]/20 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
<<<<<<< HEAD
            <h1 className="text-3xl font-bold mb-1">مرحباً، {stats?.name || stats?.userName || "—"}! 👋</h1>
            <p className="text-white/80">إليك ملخص نشاطك اليوم</p>
          </div>
          <RippleButton
            onClick={async () => { await load(); toast.success("تم تحديث البيانات"); }}
            className="bg-white text-[#0F5132] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} /> تحديث
=======
            <h1 className="text-3xl font-bold mb-1">مرحباً، محمد! 👋</h1>
            <p className="text-white/80">إليك ملخص نشاطك اليوم — اسحب البطاقات لترتيبها، اضغط بزر يمين الفأرة على أي طلب لخيارات سريعة</p>
          </div>
          <RippleButton onClick={() => toast.success("تم تحديث البيانات")} className="bg-white text-[#0F5132] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg">
            <RefreshCcw size={16} /> تحديث
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          </RippleButton>
        </div>
      </motion.div>

<<<<<<< HEAD
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-[#2a2d36] shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 dark:border-[#2a2d36] flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1C1917] dark:text-white">الطلبات الأخيرة</h3>
            <Link href="/freelancer/orders" className="text-sm text-[#0F5132] hover:text-[#25D366] font-semibold">
              عرض الكل ←
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد طلبات بعد</p>
            </div>
          ) : (
            orders.map(o => <OrderRow key={o.id} order={o} />)
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-[#2a2d36] shadow-sm p-5"
        >
          <h3 className="text-lg font-bold text-[#1C1917] dark:text-white mb-3">ملاحظاتي</h3>
          <p className="text-xs text-gray-500 mb-2">اضغط واكتب مباشرة، يحفظ تلقائياً في جهازك</p>
          <EditableNote
            initialText={(typeof window !== "undefined" && localStorage.getItem("freelancer_notes")) || ""}
=======
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onKpiDragEnd}>
          <SortableContext items={kpis.map(k => k.id)} strategy={horizontalListSortingStrategy}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              <AnimatePresence>
                {kpis.map(k => <KpiCard key={k.id} kpi={k} />)}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-[#2a2d36] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[#2a2d36] flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1C1917] dark:text-white">الطلبات الأخيرة</h3>
            <Link href="/freelancer/orders" className="text-sm text-[#0F5132] hover:text-[#25D366] font-semibold">عرض الكل ←</Link>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onOrderDragEnd}>
            <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
              {orders.map(o => <OrderRow key={o.id} order={o} onAction={handleOrderAction} />)}
            </SortableContext>
          </DndContext>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-[#2a2d36] shadow-sm p-5">
          <h3 className="text-lg font-bold text-[#1C1917] dark:text-white mb-3">ملاحظات اليوم</h3>
          <p className="text-xs text-gray-500 mb-2">اضغط واكتب مباشرة، يحفظ تلقائياً</p>
          <EditableNote
            initialText="• الاتصال بأحمد بخصوص التعديلات النهائية\n• تحديث ملف الأعمال على المنصة"
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
            placeholder="اكتب ما تريد تذكّره..."
            onSave={async (t) => {
              try { localStorage.setItem("freelancer_notes", t); } catch {}
            }}
          />
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-[#2a2d36]">
            <h4 className="text-sm font-bold text-[#1C1917] dark:text-white mb-3">إجراءات سريعة</h4>
<<<<<<< HEAD
            <div className="space-y-2">
              <Link href="/freelancer/services" className="block">
                <div className="w-full bg-gradient-to-l from-[#0F5132] to-[#0a3a24] text-white text-sm font-bold py-3 rounded-xl shadow-md text-center">
                  إدارة الخدمات
                </div>
              </Link>
              <Link href="/freelancer/wallet" className="block">
                <div className="w-full bg-gradient-to-l from-[#C9A961] to-amber-700 text-white text-sm font-bold py-3 rounded-xl shadow-md text-center">
                  سحب من المحفظة
                </div>
              </Link>
              <Link href="/freelancer/messages" className="block">
                <div className="w-full bg-gradient-to-l from-[#25D366] to-emerald-700 text-white text-sm font-bold py-3 rounded-xl shadow-md text-center">
                  المحادثات
                </div>
              </Link>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-[#2a2d36]">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Wallet size={16} className="text-[#0F5132]" />
                <span>رصيد المحفظة</span>
              </div>
              <span className="font-bold text-[#0F5132]">{nf(stats?.walletBalance ?? 0)} ر.س</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <ShoppingBag size={16} className="text-blue-500" />
                <span>إجمالي الطلبات المكتملة</span>
              </div>
              <span className="font-bold text-blue-600">{stats?.totalCompleted ?? 0}</span>
            </div>
=======
            <StaggerList>
              {[
                { label: "إنشاء خدمة جديدة", color: "from-[#0F5132] to-[#0a3a24]" },
                { label: "سحب من المحفظة",  color: "from-[#C9A961] to-amber-700" },
                { label: "دعوة عميل",        color: "from-[#25D366] to-emerald-700" },
              ].map((q) => (
                <RippleButton key={q.label} onClick={() => toast.success(q.label, { description: "تمت العملية" })} className={`w-full bg-gradient-to-l ${q.color} text-white text-sm font-bold py-3 rounded-xl shadow-md mb-2`}>
                  {q.label}
                </RippleButton>
              ))}
            </StaggerList>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          </div>
        </motion.div>
      </div>
    </div>
  );
}

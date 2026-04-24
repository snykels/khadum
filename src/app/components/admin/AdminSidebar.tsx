'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import {
  LayoutDashboard, MessageSquare, Users, ShoppingCart,
  DollarSign, FileText, Megaphone, Bot, Settings,
  PanelRightClose, PanelRightOpen, Home, Sparkles
} from "lucide-react";

type NavItem = {
  icon: any;
  label: string;
  href: string;
  exact?: boolean;
  badgeKey?: string;
};

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "الرئيسية",           href: "/admin",            exact: true },
  { icon: MessageSquare,   label: "صندوق الوارد",       href: "/admin/inbox",      badgeKey: "inbox" },
  { icon: Users,           label: "المستخدمون",          href: "/admin/users",      badgeKey: "users" },
  { icon: ShoppingCart,    label: "الطلبات والخدمات",   href: "/admin/orders" },
  { icon: DollarSign,      label: "المالية",             href: "/admin/finance" },
  { icon: FileText,        label: "المحتوى والصفحات",   href: "/admin/content" },
  { icon: Megaphone,       label: "التسويق",             href: "/admin/marketing" },
  { icon: Bot,             label: "الأتمتة",             href: "/admin/automation" },
  { icon: Settings,        label: "الإعدادات",           href: "/admin/settings" },
=======
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Users, UserCheck, ShieldCheck, Briefcase, ShoppingBag,
  AlertCircle, Wallet, Receipt, Percent, TrendingUp, FileText,
  Megaphone, Bell, Settings, CreditCard, Mail, MessageSquare, Tag, Shield,
  Search, Activity, Home, BarChart3, ArrowLeftRight, HelpCircle,
  PanelRightClose, PanelRightOpen, UserPlus, ShieldAlert, Zap, Building2,
  ChevronDown, Sparkles, Layers, DollarSign, Megaphone as Bullhorn, Cog,
  Eye, ShoppingCart, Compass, Rss, ThumbsDown, Scale, MonitorCheck
} from "lucide-react";

type LeafItem = { icon: any; label: string; href: string; badge?: number | string };
type Group = { id: string; title: string; icon: any; items: LeafItem[] };

const overviewItems: LeafItem[] = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/admin" },
  { icon: BarChart3,       label: "التحليلات",    href: "/admin/analytics" },
];

const groups: Group[] = [
  {
    id: "operations", title: "العمليات اليومية", icon: Compass,
    items: [
      { icon: MessageSquare, label: "المحادثات",         href: "/admin/conversations" },
      { icon: ShieldAlert,   label: "محاولات التسريب",   href: "/admin/leak-attempts" },
      { icon: AlertCircle,   label: "تصعيدات الواتساب",  href: "/admin/escalations" },
      { icon: Zap,           label: "تدخلات الإدارة",     href: "/admin/interventions" },
      { icon: FileText,      label: "الردود السريعة",     href: "/admin/quick-replies" },
      { icon: Activity,      label: "صيانة البيانات",     href: "/admin/data-cleanup" },
      { icon: HelpCircle,    label: "مركز الدعم",         href: "/admin/support" },
      { icon: ThumbsDown,    label: "أسباب رفض العروض",   href: "/admin/rejection-stats" },
      { icon: Scale,         label: "النزاعات",            href: "/admin/disputes" },
    ],
  },
  {
    id: "community", title: "المجتمع والمستخدمون", icon: Users,
    items: [
      { icon: UserPlus,    label: "الطلبات والدعوات",  href: "/admin/applications" },
      { icon: Users,       label: "إدارة المستقلين",   href: "/admin/freelancers" },
      { icon: UserCheck,   label: "إدارة العملاء",     href: "/admin/clients" },
      { icon: ShieldCheck, label: "المشرفون والأدوار", href: "/admin/staff" },
      { icon: AlertCircle, label: "الموقوفون",         href: "/admin/suspended" },
    ],
  },
  {
    id: "commerce", title: "المتجر والطلبات", icon: ShoppingCart,
    items: [
      { icon: Briefcase,  label: "الخدمات المنشورة",  href: "/admin/services" },
      { icon: Tag,        label: "بانتظار الموافقة",   href: "/admin/pending-services" },
      { icon: Layers,     label: "التصنيفات والكلمات", href: "/admin/categories" },
      { icon: ShoppingBag, label: "الطلبات",            href: "/admin/orders" },
    ],
  },
  {
    id: "finance", title: "المالية والمدفوعات", icon: DollarSign,
    items: [
      { icon: Wallet,         label: "المحافظ والسحوبات", href: "/admin/wallets" },
      { icon: Receipt,        label: "المعاملات",          href: "/admin/transactions" },
      { icon: Building2,      label: "التحويلات البنكية",  href: "/admin/payouts" },
      { icon: FileText,       label: "الفواتير",           href: "/admin/invoices" },
      { icon: ArrowLeftRight, label: "روابط الدفع",        href: "/admin/payment-links" },
      { icon: MonitorCheck,   label: "جلسات الدفع",        href: "/admin/payment-sessions" },
      { icon: Percent,        label: "العروض والكوبونات",  href: "/admin/coupons" },
      { icon: TrendingUp,     label: "تقارير الإيرادات",  href: "/admin/revenue" },
    ],
  },
  {
    id: "content", title: "المحتوى والتسويق", icon: Bullhorn,
    items: [
      { icon: FileText,  label: "الصفحات",        href: "/admin/pages" },
      { icon: Rss,       label: "المدونة",        href: "/admin/blog" },
      { icon: Megaphone, label: "البانرات",       href: "/admin/banners" },
      { icon: Bell,      label: "إشعارات جماعية", href: "/admin/mass-notifications" },
      { icon: Mail,      label: "مركز البريد",    href: "/admin/email-center" },
    ],
  },
  {
    id: "system", title: "إعدادات النظام", icon: Cog,
    items: [
      { icon: Settings,   label: "إعدادات عامة",  href: "/admin/general-settings" },
      { icon: Percent,    label: "العمولات",      href: "/admin/fees" },
      { icon: CreditCard, label: "بوابات الدفع",  href: "/admin/payment-gateways" },
      { icon: Tag,        label: "الباقات",        href: "/admin/subscriptions" },
      { icon: Shield,     label: "الأمان",         href: "/admin/security" },
      { icon: Search,     label: "SEO و sitemap",  href: "/admin/seo" },
      { icon: Activity,   label: "سجل الأنشطة",   href: "/admin/audit-log" },
    ],
  },
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

<<<<<<< HEAD
export default function AdminSidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: Props) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});
=======
const STORAGE_KEY = "khadom_admin_open_groups_v2";

export default function AdminSidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: Props) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [dynBadges, setDynBadges] = useState<Record<string, number>>({});
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/admin/sidebar-counts", { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (!alive) return;
<<<<<<< HEAD
        setBadges({
          users: (Number(d.applicationsPending) || 0) + (Number(d.freelancersPendingActivation) || 0),
=======
        setDynBadges({
          "/admin/applications": Number(d.applicationsPending) || 0,
          "/admin/freelancers": Number(d.freelancersPendingActivation) || 0,
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        });
      } catch {}
    }
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

<<<<<<< HEAD
  const effectiveCollapsed = isMobile ? !mobileOpen : collapsed;
  const handleNav = () => { if (isMobile && onMobileClose) onMobileClose(); };

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + "/") || pathname.startsWith(item.href + "?"));

  return (
    <>
      {isMobile && mobileOpen && (
        <div onClick={onMobileClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      )}
      <aside
        style={{ width: isMobile ? (mobileOpen ? "16rem" : "3.5rem") : (collapsed ? "72px" : "16rem") }}
=======
  const activeGroupId = useMemo(() => {
    return groups.find((g) => g.items.some((i) => pathname === i.href))?.id ?? null;
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const merged = { ...parsed };
      if (activeGroupId) merged[activeGroupId] = true;
      setOpenGroups(merged);
    } catch {
      if (activeGroupId) setOpenGroups({ [activeGroupId]: true });
    }
  }, [activeGroupId]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const effectiveCollapsed = isMobile ? !mobileOpen : collapsed;
  const handleNav = () => { if (isMobile && onMobileClose) onMobileClose(); };

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}
      <aside
        style={{ width: isMobile ? (mobileOpen ? "17rem" : "3.5rem") : (collapsed ? "76px" : "17rem") }}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        className={`shrink-0 ${isMobile && mobileOpen ? "fixed" : "sticky"} top-0 right-0 z-50 h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 flex flex-col text-white
          bg-gradient-to-b from-[#1a1d26] via-[#20242f] to-[#161922]
          border-l border-white/[0.06]
          shadow-[0_0_30px_rgba(0,0,0,0.25)]`}
      >
<<<<<<< HEAD
        {/* Logo */}
=======
        {/* Logo / Header */}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        <div className={`p-4 border-b border-white/[0.06] flex items-center ${effectiveCollapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[#34cc30]/30 blur-md rounded-lg" />
              <svg width="30" height="30" viewBox="0 0 3000 3000" className="relative">
                <path fill="#34cc30" d="M2383.2,241.38H616.8c-146.62,146.62-228.8,228.85-375.42,375.47v1766.35s59.51,59.51,59.51,59.51l354.53-204.46,42.84-24.7v-.05l441.69-254.72,1.22,2.13,932.73-537.95s-598.17-100.73-982.84,124.01c-26.63,18.19-30.03,17.28-39.69-14.28-32.93-106.72-40.86-165.02-60.22-248.16-5.69-39.54,10.21-51.59,42.38-70.14,64.34-37.1,201.71-76.33,330.85-105.1,450.89-100.07,699.1,82.53,1044.74,3.2,19.67-5.59,42.08-1.42,45.54,19.46,7.57,52.75,7.83,186.92,4.98,251.41,1.32,22.11-16.41,40.91-45.48,54.83l-92.25,53.16c-128.63,74.2-138.34,96.97-178.54,185.85-26.78,52.6-3.05,78.93-125.83,158.31-25.77,14.84-130.81,75.42-130.81,75.42l-581.04,335.12-94.32,54.43-347.36,200.29-42.89,24.75-277.38,159.99,73.08,73.08h1768.26c145.88-145.88,227.67-227.67,373.56-373.56V616.85c-146.62-146.62-228.8-228.85-375.42-375.47ZM1331.7,691l-118.62,205.52c-10.06,17.23-31.81,24.09-49.04,14.03l-205.57-118.62c-17.23-10.06-24.09-31.81-14.03-49.04l118.62-205.57c10.06-17.23,31.81-24.04,49.09-13.98l205.52,118.57c17.23,10.06,24.09,31.87,14.03,49.09Z" />
              </svg>
            </div>
            {!effectiveCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold tracking-tight">خدوم</span>
                <span className="flex items-center gap-1 text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
                  <span className="w-1 h-1 rounded-full bg-[#34cc30] animate-pulse" />
<<<<<<< HEAD
                  لوحة التحكم
=======
                  Admin Console
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                </span>
              </div>
            )}
          </Link>
          {!effectiveCollapsed && (
<<<<<<< HEAD
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition" title="طي القائمة">
=======
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
              title="طي القائمة"
            >
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
              <PanelRightClose size={17} />
            </button>
          )}
        </div>

        {effectiveCollapsed && (
          <div className="flex justify-center py-3 border-b border-white/[0.04]">
<<<<<<< HEAD
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition" title="فتح القائمة">
=======
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
              title="فتح القائمة"
            >
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
              <PanelRightOpen size={17} />
            </button>
          </div>
        )}

        {/* Nav */}
<<<<<<< HEAD
        <nav className={`flex-1 ${effectiveCollapsed ? "px-2 py-4" : "px-3 py-4"} space-y-1`}>
          {!effectiveCollapsed && (
            <p className="text-[9px] font-bold text-white/25 uppercase mb-3 px-2 tracking-[0.18em] flex items-center gap-1.5">
              <Sparkles size={9} className="text-[#34cc30]" />
              الأقسام الرئيسية
            </p>
          )}
          {navItems.map((item) => {
            const active = isActive(item);
            const badge = item.badgeKey ? (badges[item.badgeKey] || 0) : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNav}
                title={effectiveCollapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-xl transition-all ${
                  effectiveCollapsed ? "justify-center p-3" : "px-3 py-2.5"
                } ${
                  active
                    ? "bg-gradient-to-l from-[#34cc30]/20 to-[#34cc30]/5 text-white shadow-[0_0_0_1px_rgba(52,204,48,0.2)]"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full bg-[#34cc30]" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                  active
                    ? "bg-[#34cc30]/15 text-[#34cc30]"
                    : "bg-white/[0.04] text-white/55 group-hover:bg-white/10 group-hover:text-white"
                }`}>
                  <item.icon size={16} />
                </div>
                {!effectiveCollapsed && (
                  <>
                    <span className="flex-1 text-[13.5px] font-medium tracking-tight">{item.label}</span>
                    {badge > 0 && (
                      <span className="bg-[#34cc30] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-bold">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </>
                )}
                {effectiveCollapsed && badge > 0 && (
                  <span className="absolute top-1 left-1 w-2 h-2 bg-[#34cc30] rounded-full" />
                )}
              </Link>
=======
        <nav className={`flex-1 ${effectiveCollapsed ? "px-2 py-3" : "px-2.5 py-3"} space-y-1`}>
          {/* Quick: Overview */}
          {!effectiveCollapsed && (
            <h3 className="text-[9px] font-bold text-white/30 uppercase mb-1.5 px-2.5 tracking-[0.18em] flex items-center gap-1.5">
              <Sparkles size={10} className="text-[#34cc30]" />
              نظرة عامة
            </h3>
          )}
          <div className="space-y-0.5 mb-3">
            {overviewItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNav}
                  title={effectiveCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-2.5 rounded-xl transition-all ${
                    effectiveCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-gradient-to-l from-[#34cc30]/20 to-[#34cc30]/5 text-white shadow-[0_0_0_1px_rgba(52,204,48,0.25)]"
                      : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full bg-[#34cc30]" />
                  )}
                  <item.icon size={18} className={`shrink-0 ${isActive ? "text-[#34cc30]" : ""}`} />
                  {!effectiveCollapsed && <span className="flex-1 text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Collapsible Groups */}
          {groups.map((group) => {
            const isOpen = !!openGroups[group.id];
            const hasActiveChild = group.items.some((i) => pathname === i.href);

            if (effectiveCollapsed) {
              return (
                <div key={group.id} className="border-t border-white/[0.05] pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
                  <div className="flex justify-center mb-1.5">
                    <div
                      title={group.title}
                      className={`p-2 rounded-lg ${hasActiveChild ? "bg-[#34cc30]/15 text-[#34cc30]" : "text-white/30"}`}
                    >
                      <group.icon size={14} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleNav}
                          title={item.label}
                          className={`relative flex items-center justify-center p-2.5 rounded-lg transition ${
                            isActive
                              ? "bg-[#34cc30] text-white shadow-md shadow-[#34cc30]/30"
                              : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <item.icon size={17} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={group.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition group ${
                    hasActiveChild
                      ? "text-white"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                    hasActiveChild
                      ? "bg-[#34cc30]/15 text-[#34cc30]"
                      : "bg-white/[0.04] text-white/55 group-hover:bg-white/10"
                  }`}>
                    <group.icon size={15} />
                  </div>
                  <span className="flex-1 text-right text-[13px] font-semibold tracking-tight">{group.title}</span>
                  <span className="text-[10px] text-white/30 font-mono">{group.items.length}</span>
                  <ChevronDown
                    size={14}
                    className={`text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className="overflow-hidden transition-all duration-200 ease-out"
                  style={{
                    maxHeight: isOpen ? `${group.items.length * 42 + 8}px` : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="pt-1 pb-1 pr-3 space-y-0.5 relative">
                    <div className="absolute right-[18px] top-1 bottom-1 w-px bg-white/[0.06]" />
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleNav}
                          className={`group relative flex items-center gap-2.5 pr-4 pl-3 py-2 rounded-lg transition-all text-[13px] ${
                            isActive
                              ? "bg-gradient-to-l from-[#34cc30]/15 to-transparent text-white font-semibold"
                              : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute right-[15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#34cc30] shadow-[0_0_6px_rgba(52,204,48,0.6)]" />
                          )}
                          <item.icon size={14} className={`shrink-0 ${isActive ? "text-[#34cc30]" : "text-white/45"}`} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {(() => {
                            const dyn = dynBadges[item.href];
                            const badge = (typeof dyn === "number" && dyn > 0) ? dyn : item.badge;
                            if (!badge) return null;
                            return (
                              <span className="bg-[#34cc30] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                                {badge}
                              </span>
                            );
                          })()}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
            );
          })}
        </nav>

        {/* Footer */}
<<<<<<< HEAD
        <div className="p-3 border-t border-white/[0.06]">
=======
        <div className="p-3 border-t border-white/[0.06] bg-black/20">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          <Link
            href="/"
            onClick={handleNav}
            title={effectiveCollapsed ? "العودة للموقع" : undefined}
<<<<<<< HEAD
            className="flex items-center gap-2 text-white/40 hover:text-white text-[12px] py-2 px-2 rounded-lg hover:bg-white/[0.04] transition justify-center"
=======
            className={`flex items-center gap-2 text-white/45 hover:text-white text-[12px] py-2 px-2 rounded-lg hover:bg-white/[0.04] transition justify-center`}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          >
            <Home size={14} />
            {!effectiveCollapsed && <span className="font-medium">العودة للموقع</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}

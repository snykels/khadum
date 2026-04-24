'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
<<<<<<< HEAD
  LayoutDashboard, User, ShoppingBag, MessageCircle, Briefcase,
  Award, Star, Wallet, FileText, TrendingUp, Settings,
  Shield, HelpCircle, CheckCircle, Home,
  PanelRightClose, PanelRightOpen
=======
  LayoutDashboard, User, ShoppingBag, MessageCircle, Briefcase, FolderOpen,
  Award, Star, Wallet, FileText, TrendingUp, Download, Settings, Bell,
  Shield, Phone, Calendar, HelpCircle, CheckCircle, Home,
  PanelRightClose, PanelRightOpen, AlertTriangle
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
} from "lucide-react";

const menuSections = [
  {
    title: "الرئيسية",
    items: [
      { icon: LayoutDashboard, label: "لوحة التحكم", href: "/freelancer", badgeKey: null },
<<<<<<< HEAD
=======
      { icon: AlertTriangle, label: "التنبيهات", href: "/freelancer/alerts", badgeKey: "alerts" as const },
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      { icon: User, label: "ملفي الشخصي", href: "/freelancer/profile", badgeKey: null },
      { icon: ShoppingBag, label: "طلباتي", href: "/freelancer/orders", badgeKey: null },
      { icon: MessageCircle, label: "الرسائل", href: "/freelancer/messages", badgeKey: "messages" as const },
    ]
  },
  {
    title: "الخدمات",
    items: [
      { icon: Briefcase, label: "خدماتي", href: "/freelancer/services", badgeKey: null },
<<<<<<< HEAD
      { icon: Award, label: "الشهادات", href: "/freelancer/skills", badgeKey: null },
=======
      { icon: FolderOpen, label: "معرض أعمالي", href: "/freelancer/portfolio", badgeKey: null },
      { icon: Award, label: "مهاراتي وشهاداتي", href: "/freelancer/skills", badgeKey: null },
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      { icon: Star, label: "تقييماتي", href: "/freelancer/reviews", badgeKey: null },
    ]
  },
  {
    title: "المالية",
    items: [
      { icon: Wallet, label: "محفظتي", href: "/freelancer/wallet", badgeKey: null },
      { icon: FileText, label: "الفواتير", href: "/freelancer/invoices", badgeKey: null },
      { icon: TrendingUp, label: "تقرير الأرباح", href: "/freelancer/earnings", badgeKey: null },
<<<<<<< HEAD
=======
      { icon: Download, label: "طلبات السحب", href: "/freelancer/withdrawals", badgeKey: null },
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    ]
  },
  {
    title: "الإعدادات",
    items: [
<<<<<<< HEAD
      { icon: Settings, label: "الإعدادات والأمان", href: "/freelancer/settings", badgeKey: null },
=======
      { icon: Settings, label: "إعدادات الحساب", href: "/freelancer/settings", badgeKey: null },
      { icon: Bell, label: "الإشعارات", href: "/freelancer/notifications", badgeKey: null },
      { icon: Shield, label: "الخصوصية والأمان", href: "/freelancer/security", badgeKey: null },
      { icon: Phone, label: "إعدادات واتساب", href: "/freelancer/whatsapp", badgeKey: null },
      { icon: Calendar, label: "التوفر والجدول", href: "/freelancer/availability", badgeKey: null },
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      { icon: HelpCircle, label: "الدعم الفني", href: "/freelancer/support", badgeKey: null },
    ]
  }
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MeData { name?: string; avatar?: string; rating?: number; completedProjects?: number; mainCategory?: string }

export default function FreelancerSidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: Props) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
<<<<<<< HEAD
  const [badges, setBadges] = useState<{ messages: number }>({ messages: 0 });
=======
  const [badges, setBadges] = useState<{ alerts: number; messages: number }>({ alerts: 0, messages: 0 });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const [me, setMe] = useState<MeData>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchBadges = () => {
      fetch("/api/freelancer/badges").then(r => r.ok ? r.json() : null).then(d => {
<<<<<<< HEAD
        if (active && d) setBadges({ messages: d.messages || 0 });
=======
        if (active && d) setBadges({ alerts: d.alerts || 0, messages: d.messages || 0 });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
      }).catch(() => {});
    };
    fetchBadges();
    const t = setInterval(fetchBadges, 60000);
    fetch("/api/freelancer/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (active && d?.profile) setMe({
        name: d.profile.name,
        avatar: d.profile.avatar,
        rating: Number(d.profile.rating || 0),
        completedProjects: Number(d.profile.completedProjects || 0),
        mainCategory: d.profile.mainCategory,
      });
    }).catch(() => {});
    return () => { active = false; clearInterval(t); };
  }, []);

  const effectiveCollapsed = isMobile ? !mobileOpen : collapsed;
  const handleNav = () => { if (isMobile && onMobileClose) onMobileClose(); };

  const getBadge = (key: string | null): string | null => {
    if (!key) return null;
<<<<<<< HEAD
    const v = key === "messages" ? badges.messages : 0;
=======
    const v = key === "alerts" ? badges.alerts : key === "messages" ? badges.messages : 0;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    if (!v) return null;
    return v > 99 ? "99+" : String(v);
  };

  const initial = (me.name || "م").charAt(0);

  return (
    <>
      {isMobile && mobileOpen && <div onClick={onMobileClose} className="fixed inset-0 bg-black/50 z-40" />}
      <aside
        style={{ width: isMobile ? (mobileOpen ? "16rem" : "3.5rem") : (collapsed ? "72px" : "16rem") }}
        className={`shrink-0 ${isMobile && mobileOpen ? "fixed" : "sticky"} top-0 right-0 z-50 bg-white dark:bg-[#1a1d24] border-l border-gray-200 dark:border-[#2a2d36] h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 flex flex-col`}
      >
      <div className={`p-4 border-b border-gray-200 dark:border-[#2a2d36] flex items-center ${effectiveCollapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg width="28" height="28" viewBox="0 0 3000 3000" className="shrink-0">
            <path fill="#34cc30" d="M2383.2,241.38H616.8c-146.62,146.62-228.8,228.85-375.42,375.47v1766.35s59.51,59.51,59.51,59.51l354.53-204.46,42.84-24.7v-.05l441.69-254.72,1.22,2.13,932.73-537.95s-598.17-100.73-982.84,124.01c-26.63,18.19-30.03,17.28-39.69-14.28-32.93-106.72-40.86-165.02-60.22-248.16-5.69-39.54,10.21-51.59,42.38-70.14,64.34-37.1,201.71-76.33,330.85-105.1,450.89-100.07,699.1,82.53,1044.74,3.2,19.67-5.59,42.08-1.42,45.54,19.46,7.57,52.75,7.83,186.92,4.98,251.41,1.32,22.11-16.41,40.91-45.48,54.83l-92.25,53.16c-128.63,74.2-138.34,96.97-178.54,185.85-26.78,52.6-3.05,78.93-125.83,158.31-25.77,14.84-130.81,75.42-130.81,75.42l-581.04,335.12-94.32,54.43-347.36,200.29-42.89,24.75-277.38,159.99,73.08,73.08h1768.26c145.88-145.88,227.67-227.67,373.56-373.56V616.85c-146.62-146.62-228.8-228.85-375.42-375.47ZM1331.7,691l-118.62,205.52c-10.06,17.23-31.81,24.09-49.04,14.03l-205.57-118.62c-17.23-10.06-24.09-31.81-14.03-49.04l118.62-205.57c10.06-17.23,31.81-24.04,49.09-13.98l205.52,118.57c17.23,10.06,24.09,31.87,14.03,49.09Z"/>
          </svg>
          {!effectiveCollapsed && <span className="text-lg font-bold text-[#485869] dark:text-white">خدوم</span>}
        </Link>
        <button onClick={onToggle} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors ${effectiveCollapsed ? "hidden" : ""}`}>
          <PanelRightClose size={18} />
        </button>
      </div>

      {!effectiveCollapsed && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-gradient-to-br from-[#34cc30]/10 to-[#34cc30]/5 dark:from-[#34cc30]/15 dark:to-[#34cc30]/5 rounded-xl p-3.5">
            <div className="flex items-center gap-2.5 mb-2">
              {me.avatar ? (
                <img src={me.avatar} alt={me.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold shrink-0">{initial}</div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-[#485869] dark:text-white flex items-center gap-1 text-sm truncate">
                  {me.name || "—"}
                  <CheckCircle className="w-3.5 h-3.5 text-[#34cc30] shrink-0" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{me.mainCategory || "مستقل"}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-[#34cc30] text-[#34cc30]" />
                <span className="font-medium text-[#485869] dark:text-white">{(me.rating ?? 0).toFixed(1)}</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">{me.completedProjects ?? 0} طلب</span>
            </div>
          </div>
        </div>
      )}

      {effectiveCollapsed && (
        <div className="flex justify-center py-3">
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
            <PanelRightOpen size={18} />
          </button>
        </div>
      )}

      <nav className={`flex-1 ${effectiveCollapsed ? "px-2 py-2" : "px-3 py-2"}`}>
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-4">
            {!effectiveCollapsed && (
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1.5 px-2.5 tracking-wider">
                {section.title}
              </h3>
            )}
            {effectiveCollapsed && idx > 0 && <div className="border-t border-gray-100 dark:border-[#2a2d36] mb-2 mx-1" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const badge = getBadge(item.badgeKey);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNav}
                    title={effectiveCollapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 rounded-lg transition-all relative ${effectiveCollapsed ? "md:justify-center md:p-2.5 md:mx-auto px-2.5 py-2" : "px-2.5 py-2"} ${
                      isActive
                        ? "bg-[#34cc30] text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#485869] dark:hover:text-white"
                    }`}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {!effectiveCollapsed && <span className="flex-1 text-sm truncate">{item.label}</span>}
                    {!effectiveCollapsed && badge && !isActive && (
                      <span className="bg-[#34cc30] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge}
                      </span>
                    )}
                    {effectiveCollapsed && badge && !isActive && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-[#34cc30] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`p-3 border-t border-gray-200 dark:border-[#2a2d36]`}>
        <Link
          href="/"
          onClick={handleNav}
          title={effectiveCollapsed ? "الصفحة الرئيسية" : undefined}
          className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#34cc30] text-sm py-1.5 transition-colors justify-center`}
        >
          <Home size={16} />
          {!effectiveCollapsed && <span>الصفحة الرئيسية</span>}
        </Link>
      </div>
    </aside>
    </>
  );
}

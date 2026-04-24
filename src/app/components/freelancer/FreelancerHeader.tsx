'use client';

<<<<<<< HEAD
import {
  Bell, Search, ChevronDown, LogOut, User, MessageCircle, ShoppingBag,
  DollarSign, Star, Sun, Moon, Monitor, Languages, Menu, AlertTriangle, CheckCircle, Clock, Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
=======
import { Bell, Search, Settings, ChevronDown, LogOut, User, MessageCircle, ShoppingBag, DollarSign, Star, Sun, Moon, Monitor, Languages, Menu } from "lucide-react";
import Link from "next/link";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";

<<<<<<< HEAD
type Notif = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

type Me = { id: number; name: string; email: string; avatarUrl?: string | null };

const TYPE_ICON: Record<string, any> = {
  order: ShoppingBag,
  message: MessageCircle,
  payment: DollarSign,
  review: Star,
  warning: AlertTriangle,
  success: CheckCircle,
  reminder: Clock,
  system: Shield,
};

const TYPE_BG: Record<string, string> = {
  order:    "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  message:  "bg-green-100 dark:bg-green-900/30 text-green-600",
  payment:  "bg-[#34cc30]/10 text-[#34cc30]",
  review:   "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
  warning:  "bg-red-100 dark:bg-red-900/30 text-red-600",
  success:  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  reminder: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  system:   "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  if (d === 1) return "أمس";
  return `قبل ${d} يوم`;
}

export default function FreelancerHeader({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const router = useRouter();
=======
const notifications = [
  { id: 1, icon: ShoppingBag, message: "طلب جديد من أحمد السالم", time: "قبل 5 دقائق", type: "order", read: false },
  { id: 2, icon: MessageCircle, message: "رسالة جديدة من سارة محمد", time: "قبل 15 دقيقة", type: "message", read: false },
  { id: 3, icon: DollarSign, message: "تم إيداع 320 ر.س في محفظتك", time: "قبل ساعة", type: "payment", read: false },
  { id: 4, icon: Star, message: "تقييم جديد: 5 نجوم من خالد", time: "قبل ساعتين", type: "review", read: true },
  { id: 5, icon: ShoppingBag, message: "طلب #ORD-2449 تم تسليمه بنجاح", time: "قبل 3 ساعات", type: "order", read: true },
];

export default function FreelancerHeader({ onMobileMenu }: { onMobileMenu?: () => void }) {
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const { theme, setTheme, resolved } = useTheme();
  const { lang, setLang } = useLang();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
<<<<<<< HEAD
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => d?.user && setMe(d.user)).catch(() => {});
    const loadNotif = () => {
      fetch("/api/freelancer/notifications?limit=10").then(r => r.ok ? r.json() : []).then(setNotifications).catch(() => {});
    };
    loadNotif();
    const t = setInterval(loadNotif, 30000);
    return () => clearInterval(t);
  }, []);
=======
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
<<<<<<< HEAD
=======
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowThemeMenu(false);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

<<<<<<< HEAD
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetch("/api/freelancer/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    if (!q) return;
    router.push(`/freelancer/orders?q=${encodeURIComponent(q)}`);
  };

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const themeOptions = [
    { key: "light" as const, label: "فاتح", icon: Sun },
    { key: "dark" as const, label: "داكن", icon: Moon },
    { key: "system" as const, label: "النظام", icon: Monitor },
  ];

<<<<<<< HEAD
  const userInitial = (me?.name || "م")[0];

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  return (
    <header className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 dark:border-[#2a2d36] px-3 sm:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onMobileMenu} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg shrink-0" aria-label="فتح القائمة">
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        {/* Search */}
<<<<<<< HEAD
        <form onSubmit={onSearch} className="flex-1 max-w-lg">
=======
        <div className="flex-1 max-w-lg">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
<<<<<<< HEAD
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="ابحث في الطلبات..."
              className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-[#485869] dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] text-sm transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
=======
              placeholder="ابحث في لوحة التحكم..."
              className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-[#485869] dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] text-sm transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => { setShowThemeMenu(!showThemeMenu); setShowNotifications(false); setShowUserMenu(false); }}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              {resolved === "dark" ? <Moon size={19} className="text-gray-500 dark:text-gray-400" /> : <Sun size={19} className="text-gray-500" />}
            </button>
            {showThemeMenu && (
              <div className="absolute left-0 top-full mt-2 w-40 bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden z-50">
                {themeOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setTheme(opt.key); setShowThemeMenu(false); }}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors ${theme === opt.key ? "bg-[#34cc30]/10 text-[#34cc30]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                  >
                    <opt.icon size={16} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); setShowThemeMenu(false); }}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
              className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell size={19} className="text-gray-500 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#34cc30] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
<<<<<<< HEAD
                  {unreadCount > 9 ? "9+" : unreadCount}
=======
                  {unreadCount}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 dark:border-[#2a2d36] flex items-center justify-between">
                  <h3 className="font-bold text-[#485869] dark:text-white">الإشعارات</h3>
<<<<<<< HEAD
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-[#34cc30] hover:text-[#2eb829]">
                      تعليم الكل كمقروء
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">لا توجد إشعارات</div>
                  ) : notifications.map(n => {
                    const Icon = TYPE_ICON[n.type] || Bell;
                    const bg = TYPE_BG[n.type] || "bg-gray-100 text-gray-600";
                    const Body = (
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${bg}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#485869] dark:text-gray-200 truncate">{n.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && <div className="w-2 h-2 bg-[#34cc30] rounded-full mt-2 shrink-0" />}
                      </div>
                    );
                    const cls = `p-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-50 dark:border-[#2a2d36] ${!n.isRead ? "bg-[#34cc30]/5" : ""}`;
                    return n.link ? (
                      <Link key={n.id} href={n.link} onClick={() => setShowNotifications(false)} className={`block ${cls}`}>
                        {Body}
                      </Link>
                    ) : (
                      <div key={n.id} className={cls}>{Body}</div>
                    );
                  })}
                </div>
                <Link href="/freelancer/alerts" onClick={() => setShowNotifications(false)} className="block p-3 text-center text-sm text-[#34cc30] hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-100 dark:border-[#2a2d36]">
=======
                  <button className="text-xs text-[#34cc30]">تعليم الكل كمقروء</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-50 dark:border-[#2a2d36] ${!notif.read ? "bg-[#34cc30]/5" : ""}`}>
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          notif.type === "order" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                          notif.type === "message" ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
                          notif.type === "payment" ? "bg-[#34cc30]/10 text-[#34cc30]" :
                          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                        }`}>
                          <notif.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#485869] dark:text-gray-200">{notif.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{notif.time}</p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-[#34cc30] rounded-full mt-2 shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/freelancer/notifications" onClick={() => setShowNotifications(false)} className="block p-3 text-center text-sm text-[#34cc30] hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-100 dark:border-[#2a2d36]">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                  عرض كل الإشعارات
                </Link>
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* User Menu — consolidates theme, language, links, logout */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center gap-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg px-2.5 py-1.5 transition-colors mr-1"
            >
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold text-sm">
                  {userInitial}
                </div>
              )}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-[#485869] dark:text-white truncate max-w-[120px]">{me?.name || "—"}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">مستقل</div>
=======
          {/* Settings */}
          <Link href="/freelancer/settings" className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
            <Settings size={19} className="text-gray-500 dark:text-gray-400" />
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowThemeMenu(false); }}
              className="flex items-center gap-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg px-2.5 py-1.5 transition-colors mr-1"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34cc30] to-[#2eb829] flex items-center justify-center text-white font-bold text-sm">م</div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-[#485869] dark:text-white">محمد الغامدي</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">مستقل محترف</div>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-[#1a1d24] rounded-xl shadow-2xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden z-50">
                <div className="p-4 bg-gradient-to-l from-[#34cc30]/10 to-transparent border-b border-gray-100 dark:border-[#2a2d36]">
<<<<<<< HEAD
                  <div className="font-bold text-[#485869] dark:text-white truncate">{me?.name || "—"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{me?.email || ""}</div>
                </div>

=======
                  <div className="font-bold text-[#485869] dark:text-white">محمد الغامدي</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">mohammed@email.com</div>
                </div>

                {/* Language at top */}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36]">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 px-1 uppercase">
                    <Languages size={12} /> اللغة / Language
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
<<<<<<< HEAD
                    <button onClick={() => setLang("ar")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${lang === "ar" ? "bg-[#34cc30] text-white shadow-sm" : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"}`}>العربية</button>
                    <button onClick={() => setLang("en")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${lang === "en" ? "bg-[#34cc30] text-white shadow-sm" : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"}`}>English</button>
                  </div>
                </div>

=======
                    <button
                      onClick={() => setLang("ar")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${lang === "ar" ? "bg-[#34cc30] text-white shadow-sm" : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"}`}
                    >
                      العربية
                    </button>
                    <button
                      onClick={() => setLang("en")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${lang === "en" ? "bg-[#34cc30] text-white shadow-sm" : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"}`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Theme */}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36]">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 px-1 uppercase">
                    {resolved === "dark" ? <Moon size={12} /> : <Sun size={12} />} المظهر
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {themeOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setTheme(opt.key)}
                        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${theme === opt.key ? "bg-[#34cc30] text-white shadow-sm" : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"}`}
                      >
                        <opt.icon size={14} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-1">
                  <Link href="/freelancer/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                    <User size={16} /> ملفي الشخصي
                  </Link>
                  <Link href="/freelancer/wallet" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                    <DollarSign size={16} /> محفظتي
                  </Link>
                  <Link href="/freelancer/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
<<<<<<< HEAD
                    <Shield size={16} /> الإعدادات والأمان
                  </Link>
                </div>
                <div className="border-t border-gray-100 dark:border-[#2a2d36] py-1">
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
                      router.push("/");
                      router.refresh();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={16} /> تسجيل الخروج
                  </button>
=======
                    <Settings size={16} /> الإعدادات
                  </Link>
                </div>
                <div className="border-t border-gray-100 dark:border-[#2a2d36] py-1">
                  <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={16} /> تسجيل الخروج
                  </Link>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

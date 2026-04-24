'use client';

import { Bell, Search, Settings, ChevronDown, LogOut, User, MessageCircle, ShoppingBag, DollarSign, Star, Sun, Moon, Monitor, Languages, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";

const notifications = [
  { id: 1, icon: ShoppingBag, message: "طلب جديد من أحمد السالم", time: "قبل 5 دقائق", type: "order", read: false },
  { id: 2, icon: MessageCircle, message: "رسالة جديدة من سارة محمد", time: "قبل 15 دقيقة", type: "message", read: false },
  { id: 3, icon: DollarSign, message: "تم إيداع 320 ر.س في محفظتك", time: "قبل ساعة", type: "payment", read: false },
  { id: 4, icon: Star, message: "تقييم جديد: 5 نجوم من خالد", time: "قبل ساعتين", type: "review", read: true },
  { id: 5, icon: ShoppingBag, message: "طلب #ORD-2449 تم تسليمه بنجاح", time: "قبل 3 ساعات", type: "order", read: true },
];

export default function FreelancerHeader({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const { theme, setTheme, resolved } = useTheme();
  const { lang, setLang } = useLang();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowThemeMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const themeOptions = [
    { key: "light" as const, label: "فاتح", icon: Sun },
    { key: "dark" as const, label: "داكن", icon: Moon },
    { key: "system" as const, label: "النظام", icon: Monitor },
  ];

  return (
    <header className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 dark:border-[#2a2d36] px-3 sm:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onMobileMenu} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg shrink-0" aria-label="فتح القائمة">
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
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
              className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell size={19} className="text-gray-500 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#34cc30] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 dark:border-[#2a2d36] flex items-center justify-between">
                  <h3 className="font-bold text-[#485869] dark:text-white">الإشعارات</h3>
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
                  عرض كل الإشعارات
                </Link>
              </div>
            )}
          </div>

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
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-[#1a1d24] rounded-xl shadow-2xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden z-50">
                <div className="p-4 bg-gradient-to-l from-[#34cc30]/10 to-transparent border-b border-gray-100 dark:border-[#2a2d36]">
                  <div className="font-bold text-[#485869] dark:text-white">محمد الغامدي</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">mohammed@email.com</div>
                </div>

                {/* Language at top */}
                <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36]">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 px-1 uppercase">
                    <Languages size={12} /> اللغة / Language
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
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
                    <Settings size={16} /> الإعدادات
                  </Link>
                </div>
                <div className="border-t border-gray-100 dark:border-[#2a2d36] py-1">
                  <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={16} /> تسجيل الخروج
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

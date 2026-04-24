'use client';

import { Bell, Search, Shield, Sun, Moon, Monitor, ChevronDown, LogOut, User, Settings, Languages, Globe, Menu, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";

interface AdminNotif { id: number; type: string; title: string; message: string; isRead: boolean; link: string | null; priority: string; createdAt: string }

export default function AdminHeader({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const { theme, setTheme, resolved } = useTheme();
  const { lang, setLang } = useLang();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const [unread, setUnread] = useState(0);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  async function loadNotifs() {
    try {
      const r = await fetch("/api/admin/notifications");
      if (!r.ok) return;
      const d = await r.json();
      setNotifs(d.notifications || []); setUnread(d.unread || 0);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadNotifs();
    const t = setInterval(loadNotifs, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  async function openNotifDropdown() {
    setShowNotif(s => !s);
    if (!showNotif && unread > 0) {
      await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark-read" }) });
      setUnread(0);
      setNotifs(ns => ns.map(n => ({ ...n, isRead: true })));
    }
  }

  async function deleteAll() {
    const ids = notifs.map(n => n.id);
    if (!ids.length) return;
    await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", ids }) });
    setNotifs([]); setUnread(0);
  }

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "الآن";
    if (m < 60) return `قبل ${m} د`;
    const h = Math.floor(m / 60);
    if (h < 24) return `قبل ${h} س`;
    return `قبل ${Math.floor(h / 24)} يوم`;
  }

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
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ابحث..."
              className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] text-[#485869] dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* System Status */}
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg ml-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 dark:text-green-400 font-medium">النظام يعمل</span>
          </div>

          <div className="relative" ref={notifRef}>
            <button onClick={openNotifDropdown} className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
              <Bell size={19} className="text-gray-500 dark:text-gray-400" />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 99 ? "99+" : unread}</span>
              )}
            </button>
            {showNotif && (
              <div className="absolute left-0 top-full mt-2 w-[380px] max-w-[92vw] bg-white dark:bg-[#1a1d24] rounded-xl shadow-2xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2d36] flex items-center justify-between">
                  <div className="font-bold text-[#485869] dark:text-white text-sm flex items-center gap-2"><Bell size={14} /> الإشعارات</div>
                  {notifs.length > 0 && (
                    <button onClick={deleteAll} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> حذف الكل</button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm"><Bell size={28} className="mx-auto mb-2 opacity-40" />لا توجد إشعارات</div>
                  ) : notifs.map(n => {
                    const Wrap: any = n.link ? "a" : "div";
                    return (
                      <Wrap key={n.id} href={n.link || undefined} className={`block px-4 py-3 border-b border-gray-50 dark:border-[#2a2d36] hover:bg-gray-50 dark:hover:bg-white/5 ${!n.isRead ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}>
                        <div className="flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.priority === "high" ? "bg-red-500" : n.priority === "low" ? "bg-gray-300" : "bg-[#34cc30]"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#485869] dark:text-white">{n.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</div>
                          </div>
                        </div>
                      </Wrap>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg px-2.5 py-1.5 transition-colors mr-1"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-[#485869] dark:text-white">يوسف الغامدي</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">المالك / مدير عام</div>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-[#1a1d24] rounded-xl shadow-2xl border border-gray-100 dark:border-[#2a2d36] overflow-hidden z-50">
                <div className="p-4 bg-gradient-to-l from-[#34cc30]/10 to-transparent border-b border-gray-100 dark:border-[#2a2d36]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#485869] to-[#3a4655] flex items-center justify-center">
                      <Shield size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#485869] dark:text-white">يوسف الغامدي</div>
                      <div className="text-[11px] text-[#34cc30] font-medium">المالك · صلاحيات كاملة</div>
                    </div>
                  </div>
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
                  <Link href="/admin/general-settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                    <Settings size={16} /> الإعدادات العامة
                  </Link>
                  <Link href="/" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                    <Globe size={16} /> عرض الموقع
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

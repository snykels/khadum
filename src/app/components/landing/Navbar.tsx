'use client';

import Link from "next/link";
import { Menu, LogOut, LayoutDashboard, Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@/app/context/ThemeContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useUser();
  const { theme, setTheme, resolved } = useTheme();
  const [site, setSite] = useState<{ siteName: string; siteLogoUrl: string } | null>(null);

  useEffect(() => { fetch("/api/public/site").then(r => r.json()).then(setSite).catch(() => {}); }, []);

  const dashboardHref = user?.role === "admin" ? "/admin" : user?.role === "freelancer" ? "/freelancer" : "/";
  const cycleTheme = () => setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  const ThemeIcon = theme === "system" ? Monitor : resolved === "dark" ? Moon : Sun;
  const themeLabel = theme === "system" ? "النظام" : theme === "dark" ? "ليلي" : "نهاري";

  return (
    <nav className="sticky top-0 bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            {site?.siteLogoUrl ? (
              <img src={site.siteLogoUrl} alt={site.siteName} className="h-10 w-10 object-contain rounded" />
            ) : (
              <svg width="40" height="40" viewBox="0 0 3000 3000" className="text-[#34cc30]">
                <path fill="#34cc30" d="M2383.2,241.38H616.8c-146.62,146.62-228.8,228.85-375.42,375.47v1766.35s59.51,59.51,59.51,59.51l354.53-204.46,42.84-24.7v-.05l441.69-254.72,1.22,2.13,932.73-537.95s-598.17-100.73-982.84,124.01c-26.63,18.19-30.03,17.28-39.69-14.28-32.93-106.72-40.86-165.02-60.22-248.16-5.69-39.54,10.21-51.59,42.38-70.14,64.34-37.1,201.71-76.33,330.85-105.1,450.89-100.07,699.1,82.53,1044.74,3.2,19.67-5.59,42.08-1.42,45.54,19.46,7.57,52.75,7.83,186.92,4.98,251.41,1.32,22.11-16.41,40.91-45.48,54.83l-92.25,53.16c-128.63,74.2-138.34,96.97-178.54,185.85-26.78,52.6-3.05,78.93-125.83,158.31-25.77,14.84-130.81,75.42-130.81,75.42l-581.04,335.12-94.32,54.43-347.36,200.29-42.89,24.75-277.38,159.99,73.08,73.08h1768.26c145.88-145.88,227.67-227.67,373.56-373.56V616.85c-146.62-146.62-228.8-228.85-375.42-375.47ZM1331.7,691l-118.62,205.52c-10.06,17.23-31.81,24.09-49.04,14.03l-205.57-118.62c-17.23-10.06-24.09-31.81-14.03-49.04l118.62-205.57c10.06-17.23,31.81-24.04,49.09-13.98l205.52,118.57c17.23,10.06,24.09,31.87,14.03,49.09Z"/>
              </svg>
            )}
            <span className="text-2xl font-bold text-[#485869] dark:text-white">{site?.siteName || "خدوم"}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
<<<<<<< HEAD
            <a href="#services" className="text-[#485869] dark:text-gray-300 hover:text-[#34cc30] transition-colors">استعرض الخدمات</a>
            <a href="#how-it-works" className="text-[#485869] dark:text-gray-300 hover:text-[#34cc30] transition-colors">كيف تعمل المنصة؟</a>
            <a href="/apply" className="text-[#485869] dark:text-gray-300 hover:text-[#34cc30] transition-colors">انضم كمستقل</a>
            <a
              href="https://wa.me/966511809878?text=مرحبا، أبغى أطلب خدمة"
              target="_blank"
              rel="noreferrer"
              className="bg-[#34cc30] text-white px-5 py-2 rounded-lg hover:bg-[#2eb829] transition-all text-sm font-medium"
            >
              اطلب خدمة الآن
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={cycleTheme} title={`الوضع: ${themeLabel}`} className="p-2 rounded-lg text-[#485869] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
=======
            <a href="#services" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] transition-colors">استعرض الخدمات</a>
            <a href="#how-it-works" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] transition-colors">كيف تعمل المنصة؟</a>
            <a href="#pricing" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] transition-colors">أسعار الباقات</a>
            <a href="#blog" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] transition-colors">المدونة</a>
            <a href="#about" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] transition-colors">من نحن</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={cycleTheme} title={`الوضع: ${themeLabel}`} className="p-2 rounded-lg text-[#485869] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
              <ThemeIcon size={18} />
            </button>
            {loading ? (
              <div className="w-32 h-9 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            ) : user ? (
              <>
<<<<<<< HEAD
                <span className="text-[#485869] dark:text-gray-300 text-sm">مرحباً، <span className="font-semibold">{user.name}</span></span>
                {user.role !== "client" && (
                  <Link href={dashboardHref} className="flex items-center gap-2 text-[#485869] dark:text-gray-300 hover:text-[#34cc30] transition-colors px-3 py-2"><LayoutDashboard size={18} />لوحتي</Link>
=======
                <span className="text-[#485869] dark:text-gray-200 text-sm">مرحباً، <span className="font-semibold">{user.name}</span></span>
                {user.role !== "client" && (
                  <Link href={dashboardHref} className="flex items-center gap-2 text-[#485869] dark:text-gray-200 hover:text-[#34cc30] transition-colors px-3 py-2"><LayoutDashboard size={18} />لوحتي</Link>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                )}
                <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors px-3 py-2"><LogOut size={18} />خروج</button>
              </>
            ) : null}
          </div>

          <div className="md:hidden flex items-center gap-2">
<<<<<<< HEAD
            <button onClick={cycleTheme} className="p-2 text-[#485869] dark:text-gray-300"><ThemeIcon size={20} /></button>
            <button className="text-[#485869] dark:text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={24} /></button>
=======
            <button onClick={cycleTheme} className="p-2 text-[#485869] dark:text-gray-200"><ThemeIcon size={20} /></button>
            <button className="text-[#485869] dark:text-gray-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={24} /></button>
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            <div className="flex flex-col gap-4">
<<<<<<< HEAD
              <a href="#services" className="text-[#485869] dark:text-gray-300 hover:text-[#34cc30] py-2">استعرض الخدمات</a>
              <a href="#how-it-works" className="text-[#485869] dark:text-gray-300 hover:text-[#34cc30] py-2">كيف تعمل المنصة؟</a>
              <a href="/apply" className="text-[#485869] dark:text-gray-300 hover:text-[#34cc30] py-2">انضم كمستقل</a>
              <a
                href="https://wa.me/966511809878?text=مرحبا، أبغى أطلب خدمة"
                target="_blank"
                rel="noreferrer"
                className="bg-[#34cc30] text-white px-4 py-2 rounded-lg text-center font-medium"
              >
                اطلب خدمة الآن
              </a>
              {user && (
                <div className="flex flex-col gap-3 pt-4 border-t dark:border-gray-700">
                  <span className="text-[#485869] dark:text-gray-300 text-sm py-2">مرحباً، <span className="font-semibold">{user.name}</span></span>
                  {user.role !== "client" && (<Link href={dashboardHref} className="text-[#485869] dark:text-gray-300 border border-[#485869] dark:border-gray-700 px-4 py-2 rounded-lg text-center">لوحتي</Link>)}
=======
              <a href="#services" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] py-2">استعرض الخدمات</a>
              <a href="#how-it-works" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] py-2">كيف تعمل المنصة؟</a>
              <a href="#pricing" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] py-2">أسعار الباقات</a>
              <a href="#blog" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] py-2">المدونة</a>
              <a href="#about" className="text-[#485869] dark:text-gray-200 hover:text-[#34cc30] py-2">من نحن</a>
              {user && (
                <div className="flex flex-col gap-3 pt-4 border-t dark:border-gray-700">
                  <span className="text-[#485869] dark:text-gray-200 text-sm py-2">مرحباً، <span className="font-semibold">{user.name}</span></span>
                  {user.role !== "client" && (<Link href={dashboardHref} className="text-[#485869] dark:text-gray-200 border border-[#485869] dark:border-gray-700 px-4 py-2 rounded-lg text-center">لوحتي</Link>)}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                  <button onClick={logout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg">تسجيل الخروج</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

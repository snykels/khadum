"use client";

<<<<<<< HEAD
import { useState, useEffect, Suspense } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, User } from "lucide-react";

const SAVED_USER_KEY = "khadom_saved_user";

type SavedUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

function Avatar({ name, avatarUrl, size = 48 }: { name: string; avatarUrl?: string | null; size?: number }) {
  const initials = name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover border-2 border-[#34cc30]/30"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#34cc30] to-[#28a025] text-white flex items-center justify-center font-bold border-2 border-[#34cc30]/30"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials || <User size={size * 0.45} />}
    </div>
  );
}

<<<<<<< HEAD
function LoginPageInner() {
=======
export default function LoginPage() {
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  const router = useRouter();
  const searchParams = useSearchParams();
  const securityLogout = searchParams.get("reason") === "security";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(securityLogout ? "انتهت جلستك لأسباب أمنية. يرجى إعادة تسجيل الدخول." : null);
  const [loading, setLoading] = useState(false);
  const [savedUser, setSavedUser] = useState<SavedUser | null>(null);
  const [usingSaved, setUsingSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_USER_KEY);
      if (raw) {
        const u: SavedUser = JSON.parse(raw);
        if (u?.email && u?.name) {
          setSavedUser(u);
          setUsingSaved(true);
          setEmail(u.email);
        }
      }
    } catch {}
  }, []);

  function switchAccount() {
    setSavedUser(null);
    setUsingSaved(false);
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        return;
      }
      const role = data.user?.role;
      const from = searchParams.get("from") || "";

      if (role !== "admin" && role !== "supervisor" && role !== "freelancer" && role !== "client") {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        setError("حدث خطأ في تحديد صلاحيات الحساب");
<<<<<<< HEAD
        router.push("/");
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
        return;
      }

      if (rememberMe && data.user) {
        try {
          const toSave: SavedUser = {
            name: data.user.name,
            email: data.user.email,
            avatarUrl: data.user.avatarUrl ?? null,
          };
          localStorage.setItem(SAVED_USER_KEY, JSON.stringify(toSave));
        } catch {}
      } else if (!rememberMe) {
        try { localStorage.removeItem(SAVED_USER_KEY); } catch {}
      }

      if (role === "admin" || role === "supervisor") router.push(from || "/admin");
      else if (role === "freelancer") router.push(from || "/freelancer");
      else router.push("/");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1117] px-4" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-[#1e2330] rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <svg width="36" height="36" viewBox="0 0 3000 3000">
              <path fill="#34cc30" d="M2383.2,241.38H616.8c-146.62,146.62-228.8,228.85-375.42,375.47v1766.35s59.51,59.51,59.51,59.51l354.53-204.46,42.84-24.7v-.05l441.69-254.72,1.22,2.13,932.73-537.95s-598.17-100.73-982.84,124.01c-26.63,18.19-30.03,17.28-39.69-14.28-32.93-106.72-40.86-165.02-60.22-248.16-5.69-39.54,10.21-51.59,42.38-70.14,64.34-37.1,201.71-76.33,330.85-105.1,450.89-100.07,699.1,82.53,1044.74,3.2,19.67-5.59,42.08-1.42,45.54,19.46,7.57,52.75,7.83,186.92,4.98,251.41,1.32,22.11-16.41,40.91-45.48,54.83l-92.25,53.16c-128.63,74.2-138.34,96.97-178.54,185.85-26.78,52.6-3.05,78.93-125.83,158.31-25.77,14.84-130.81,75.42-130.81,75.42l-581.04,335.12-94.32,54.43-347.36,200.29-42.89,24.75-277.38,159.99,73.08,73.08h1768.26c145.88-145.88,227.67-227.67,373.56-373.56V616.85c-146.62-146.62-228.8-228.85-375.42-375.47ZM1331.7,691l-118.62,205.52c-10.06,17.23-31.81,24.09-49.04,14.03l-205.57-118.62c-17.23-10.06-24.09-31.81-14.03-49.04l118.62-205.57c10.06-17.23,31.81-24.04,49.09-13.98l205.52,118.57c17.23,10.06,24.09,31.87,14.03,49.09Z"/>
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-[#485869] dark:text-white">دخول المستقلين</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">أهلاً بك مجدداً في خدوم</p>
        </div>

        {securityLogout && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            انتهت جلستك لأسباب أمنية. يرجى إعادة تسجيل الدخول.
          </div>
        )}

        {!securityLogout && error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {usingSaved && savedUser && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-[#34cc30]/30 bg-[#f0fdf4] dark:bg-[#34cc30]/10 flex items-center gap-4">
            <Avatar name={savedUser.name} avatarUrl={savedUser.avatarUrl} size={52} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#485869] dark:text-white truncate">{savedUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{savedUser.email}</div>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-[#34cc30]">
                <ShieldCheck className="w-3 h-3" />
                حساب محفوظ — تسجيل دخول آمن
              </div>
            </div>
            <button
              type="button"
              onClick={switchAccount}
              className="text-xs text-gray-400 hover:text-gray-600 transition shrink-0"
            >
              تغيير
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!usingSaved && (
            <div>
              <label className="block text-sm font-medium text-[#485869] dark:text-gray-200 mb-1">البريد الإلكتروني</label>
              <input
                type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#252b3b] dark:text-white rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none text-right"
                placeholder="you@example.com" autoComplete="email"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-[#485869] dark:text-gray-200">كلمة المرور</label>
              <Link href="/forgot-password" className="text-xs text-[#34cc30] hover:underline">نسيت كلمة المرور؟</Link>
            </div>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-[#252b3b] dark:text-white rounded-lg focus:ring-2 focus:ring-[#34cc30] focus:border-transparent outline-none"
              placeholder="••••••••" autoComplete="current-password"
              autoFocus={usingSaved}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#34cc30] rounded cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              تذكرني
            </label>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#34cc30] text-white py-2.5 rounded-lg hover:bg-[#2eb829] transition-colors disabled:opacity-60 font-medium mt-2">
            {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
          ليس لديك حساب؟{" "}
          <Link href="/apply" className="text-[#34cc30] hover:underline font-medium">سجّل كمستقل</Link>
        </p>
        <p className="text-center mt-2 text-sm">
          <Link href="/" className="text-gray-400 hover:text-gray-600">← العودة للرئيسية</Link>
        </p>
      </div>
    </div>
  );
}
<<<<<<< HEAD

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1117]" />}>
      <LoginPageInner />
    </Suspense>
  );
}
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function ConsolePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "بيانات الدخول غير صحيحة");
        return;
      }
      const role = data.user?.role;
      if (role !== "admin" && role !== "supervisor" && role !== "owner") {
        setError("هذه البوابة مخصصة لطاقم العمل فقط");
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0d12] text-white relative overflow-hidden flex items-center justify-center px-4" dir="rtl">
      {/* background grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#34cc30]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-md w-full">
        {/* Top label */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
            <span className="w-2 h-2 bg-[#34cc30] rounded-full animate-pulse" />
            secure connection
          </div>
          <div className="text-xs text-gray-600 font-mono">v1.0.0</div>
        </div>

        {/* Card */}
        <div className="bg-[#12161d] border border-[#1f2530] rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-xl bg-[#34cc30]/10 border border-[#34cc30]/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#34cc30]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">بوابة الإدارة الفنية</h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">khadum.staff console</p>
            </div>
          </div>

          <div className="border-t border-[#1f2530] my-6" />

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 text-red-300 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider font-mono">
                Staff ID
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0d12] border border-[#1f2530] rounded-lg focus:border-[#34cc30] focus:ring-1 focus:ring-[#34cc30]/30 outline-none text-white placeholder-gray-600 font-mono text-sm"
                placeholder="staff@khadum.app"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider font-mono">
                Access Key
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 bg-[#0a0d12] border border-[#1f2530] rounded-lg focus:border-[#34cc30] focus:ring-1 focus:ring-[#34cc30]/30 outline-none text-white placeholder-gray-600 font-mono text-sm"
                  placeholder="••••••••••••"
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#34cc30] text-black font-bold py-3 rounded-lg hover:bg-[#2eb829] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-wider"
            >
              <Lock size={14} />
              {loading ? "Authenticating..." : "Authenticate"}
            </button>
          </form>

          <div className="border-t border-[#1f2530] mt-6 pt-4">
            <p className="text-[11px] text-gray-600 text-center font-mono leading-relaxed">
              Unauthorized access is monitored and prosecuted under Saudi Cyber Crime Law.
              <br />
              All actions are logged and audited.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-600 hover:text-gray-400 font-mono">
            ← khadum.app
          </a>
        </div>
      </div>
    </div>
  );
}

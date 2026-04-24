'use client';
import { useEffect, useState, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

export function useFetch<T>(url: string, key: keyof T | string = "data") {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try { const r = await fetch(url); const j = await r.json(); setData((j as any)[key as string] ?? j); }
    catch { setData(null); } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [url]);
  return { data, loading, reload: load, setData };
}

export function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${ok ? "bg-[#34cc30]" : "bg-red-500"}`}>{msg}</div>;
}

export function useToast() {
  const [t, setT] = useState<{ msg: string; ok: boolean } | null>(null);
  function show(msg: string, ok = true) { setT({ msg, ok }); setTimeout(() => setT(null), 3500); }
  return { toast: t, show, node: t ? <Toast msg={t.msg} ok={t.ok} /> : null };
}

export function Loading() {
  return <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-12 text-center text-gray-400"><RefreshCw size={32} className="mx-auto mb-3 animate-spin" /><p>جاري التحميل...</p></div>;
}

export function Empty({ icon: Icon, msg }: { icon: any; msg: string }) {
  return <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm p-12 text-center text-gray-400"><Icon size={40} className="mx-auto mb-3 opacity-40" /><p>{msg}</p></div>;
}

export async function patchJson(url: string, body: any) {
  const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}
export async function postJson(url: string, body: any) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}
export async function delJson(url: string) {
  const r = await fetch(url, { method: "DELETE" });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}

export function fmt(n: number | string | null | undefined) {
  if (n == null) return "0";
  const x = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(x)) return "0";
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
export function dateAr(d: any) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-CA"); }
export function timeAgo(d: any) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const days = Math.floor(h / 24);
  if (days < 7) return `قبل ${days} يوم`;
  return new Date(d).toLocaleDateString("en-CA");
}

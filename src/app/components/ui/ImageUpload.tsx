'use client';
import { useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxMb?: number;
  className?: string;
  preview?: boolean;
}

export default function ImageUpload({ value, onChange, label = "رفع صورة", accept = "image/*", maxMb = 5, className = "", preview = true }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setErr(null);
    if (file.size > maxMb * 1024 * 1024) { setErr(`الحجم أكبر من ${maxMb} ميجابايت`); return; }
    setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (r.ok && d.url) onChange(d.url); else setErr(d.error || "فشل الرفع");
    } catch { setErr("فشل الرفع"); } finally { setBusy(false); }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      {preview && value ? (
        <div className="relative group inline-block">
          <img src={value} alt="" className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200 dark:border-[#2a2d36]" />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
          <button type="button" onClick={() => ref.current?.click()} className="absolute bottom-1 left-1 bg-white text-[#485869] text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100">استبدال</button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="flex flex-col items-center justify-center gap-2 w-full max-w-xs h-32 border-2 border-dashed border-gray-300 dark:border-[#2a2d36] rounded-lg text-gray-400 hover:border-[#34cc30] hover:text-[#34cc30] transition-colors">
          {busy ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          <span className="text-xs">{busy ? "جاري الرفع..." : label}</span>
        </button>
      )}
      {err && <div className="text-xs text-red-500">{err}</div>}
    </div>
  );
}

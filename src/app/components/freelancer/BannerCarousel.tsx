'use client';
import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Banner { id: number; title: string; imageUrl: string; link: string | null }

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch("/api/freelancer/banners").then(r => r.ok ? r.json() : { banners: [] }).then(d => setBanners(d.banners || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;
  const b = banners[idx];
  const Wrap: any = b.link ? "a" : "div";

  return (
    <div className="relative bg-gradient-to-l from-[#34cc30]/10 to-white dark:from-[#34cc30]/5 dark:to-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2a2d36] mb-6">
      <Wrap href={b.link || undefined} target={b.link ? "_blank" : undefined} className="block">
        <div className="flex items-center gap-4 p-5 min-h-[120px]">
          {b.imageUrl && (
            <img src={b.imageUrl} alt={b.title} className="w-32 h-24 object-cover rounded-lg shadow-sm shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg text-[#485869] dark:text-white">{b.title}</div>
          </div>
        </div>
      </Wrap>
      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 rounded-full p-1.5 shadow"><ChevronRight size={16} /></button>
          <button onClick={() => setIdx(i => (i + 1) % banners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 rounded-full p-1.5 shadow"><ChevronLeft size={16} /></button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === i ? "bg-[#34cc30] w-4" : "bg-gray-300 dark:bg-gray-600"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  let posts: any[] = [];
  try {
    const r: any = await db.execute(sql`SELECT id, title, content, author, created_at AS "createdAt" FROM blog_posts WHERE status='published' ORDER BY id DESC LIMIT 50`);
    posts = Array.isArray(r) ? r : [];
  } catch {}

  return (
    <main style={{ direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif", background: "#F5F3F0", minHeight: "100vh" }}>
      <section style={{ padding: "64px 24px", textAlign: "center", background: "linear-gradient(135deg,#F5F3F0,#fff)" }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: "#0F5132", margin: 0 }}>مدونة خدوم</h1>
        <p style={{ fontSize: 18, color: "#57534E", marginTop: 12 }}>نصائح وأفكار لرواد الأعمال والمستقلين</p>
      </section>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        {posts.length === 0 ? <p style={{ textAlign: "center", color: "#57534E" }}>لا توجد مقالات بعد.</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {posts.map(p => {
              const excerpt = String(p.content || "").replace(/<[^>]+>/g, "").slice(0, 160);
              return (
                <Link key={p.id} href={`/blog/${p.id}`} style={{ background: "#fff", borderRadius: 20, padding: 24, textDecoration: "none", color: "#1C1917", border: "1px solid #E7E5E4" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{p.title}</h3>
                  <p style={{ fontSize: 14, color: "#57534E", lineHeight: 1.6, margin: "0 0 12px" }}>{excerpt}{excerpt.length >= 160 ? "…" : ""}</p>
                  <div style={{ fontSize: 12, color: "#A8A29E" }}>{p.author} • {p.createdAt ? new Date(p.createdAt).toLocaleDateString("ar-SA") : ""}</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export const metadata = { title: "المدونة | خدوم" };

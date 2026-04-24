import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { renderWebBlocks, type WebBlock } from "@/lib/blocks/webKhadom";

export const dynamic = "force-dynamic";

async function getPost(id: string) {
  try {
    const r: any = await db.execute(sql`SELECT id, title, content, author, status, created_at AS "createdAt" FROM blog_posts WHERE id=${Number(id)} LIMIT 1`);
    return Array.isArray(r) && r[0] ? r[0] : null;
  } catch { return null; }
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post || post.status !== "published") notFound();

  try { await db.execute(sql`UPDATE blog_posts SET views = COALESCE(views,0) + 1 WHERE id=${post.id}`); } catch {}

  let blocks: WebBlock[] = [];
  let legacyHtml: string | null = null;
  try {
    const j = JSON.parse(post.content || "");
    if (Array.isArray(j)) blocks = j;
    else if (j && Array.isArray(j.blocks)) blocks = j.blocks;
    else legacyHtml = post.content || "";
  } catch {
    legacyHtml = post.content || "";
  }

  return (
    <main style={{ direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif", background: "#fff" }}>
      <article>
        <header style={{ padding: "64px 24px 32px", textAlign: "center", background: "linear-gradient(135deg,#F5F3F0,#fff)" }}>
          <Link href="/blog" style={{ color: "#0F5132", textDecoration: "none", fontSize: 14 }}>← العودة للمدونة</Link>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: "#1C1917", margin: "16px 0 12px", maxWidth: 800, marginInline: "auto" }}>{post.title}</h1>
          <div style={{ fontSize: 14, color: "#57534E" }}>{post.author} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString("ar-SA") : ""}</div>
        </header>
        {blocks.length > 0
          ? renderWebBlocks(blocks)
          : <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 64px", fontSize: 17, lineHeight: 1.9, color: "#292524", whiteSpace: legacyHtml?.includes("<") ? "normal" : "pre-wrap" }} dangerouslySetInnerHTML={legacyHtml?.includes("<") ? { __html: legacyHtml } : undefined}>{!legacyHtml?.includes("<") ? legacyHtml : null}</div>
        }
      </article>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  return { title: post?.title ? `${post.title} | مدونة خدوم` : "خدوم" };
}

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
import { renderWebBlocks, renderEditorJsBlocks, extractFaqJsonLd, type WebBlock, type EditorJsData } from "@/lib/blocks/webKhadom";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import type { Metadata } from "next";
=======
import { renderWebBlocks, type WebBlock } from "@/lib/blocks/webKhadom";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

export const dynamic = "force-dynamic";

async function getPost(id: string) {
  try {
<<<<<<< HEAD
    const r: any = await db.execute(sql`
      SELECT id, title, content, author, status,
             excerpt, cover_image AS "coverImage",
             meta_title AS "metaTitle", meta_description AS "metaDescription",
             meta_keywords AS "metaKeywords", og_image AS "ogImage",
             created_at AS "createdAt"
      FROM blog_posts WHERE id=${Number(id)} LIMIT 1
    `);
=======
    const r: any = await db.execute(sql`SELECT id, title, content, author, status, created_at AS "createdAt" FROM blog_posts WHERE id=${Number(id)} LIMIT 1`);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    return Array.isArray(r) && r[0] ? r[0] : null;
  } catch { return null; }
}

<<<<<<< HEAD
function detectContent(raw: string): { type: "editorjs"; data: EditorJsData } | { type: "webblocks"; blocks: WebBlock[] } | { type: "html"; html: string } | { type: "text"; text: string } {
  if (!raw) return { type: "text", text: "" };
  try {
    const j = JSON.parse(raw);
    if (j && Array.isArray(j.blocks)) {
      if (j.blocks.length === 0) {
        return { type: "editorjs", data: j as EditorJsData };
      }
      const first = j.blocks[0];
      if (first && typeof first.type === "string" && !first.type.startsWith("w_")) {
        return { type: "editorjs", data: j as EditorJsData };
      }
      return { type: "webblocks", blocks: j.blocks as WebBlock[] };
    }
    if (Array.isArray(j)) {
      return { type: "webblocks", blocks: j as WebBlock[] };
    }
  } catch {}
  if (/<[a-z][\s\S]*>/i.test(raw)) return { type: "html", html: raw };
  return { type: "text", text: raw };
}

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post || post.status !== "published") notFound();

  try { await db.execute(sql`UPDATE blog_posts SET views = COALESCE(views,0) + 1 WHERE id=${post.id}`); } catch {}

<<<<<<< HEAD
  const raw = post.content || "";
  const detected = detectContent(raw);

  let faqJsonLd: Array<{ question: string; answer: string }> = [];
  if (detected.type === "editorjs") {
    faqJsonLd = extractFaqJsonLd(detected.data);
=======
  let blocks: WebBlock[] = [];
  let legacyHtml: string | null = null;
  try {
    const j = JSON.parse(post.content || "");
    if (Array.isArray(j)) blocks = j;
    else if (j && Array.isArray(j.blocks)) blocks = j.blocks;
    else legacyHtml = post.content || "";
  } catch {
    legacyHtml = post.content || "";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  }

  return (
    <main style={{ direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif", background: "#fff" }}>
<<<<<<< HEAD
      {faqJsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqJsonLd.map(({ question, answer }) => ({
                "@type": "Question",
                name: question,
                acceptedAnswer: { "@type": "Answer", text: answer },
              })),
            }),
          }}
        />
      )}

      <article>
        <header
          style={{
            padding: "56px 24px 24px",
            textAlign: "center",
            background: "linear-gradient(135deg,#F5F3F0,#fff)",
          }}
        >
          <Link href="/blog" style={{ color: "#0F5132", textDecoration: "none", fontSize: 14 }}>
            ← العودة للمدونة
          </Link>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: "#1C1917", margin: "16px auto 12px", maxWidth: 820, lineHeight: 1.3 }}>
            {post.title}
          </h1>
          {post.excerpt && (
            <p style={{ fontSize: 18, color: "#57534E", maxWidth: 700, margin: "0 auto 16px", lineHeight: 1.7 }}>
              {post.excerpt}
            </p>
          )}
          <div style={{ fontSize: 14, color: "#78716C" }}>
            {post.author} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString("ar-SA") : ""}
          </div>
        </header>

        {post.coverImage && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
            <img
              src={post.coverImage}
              alt={post.title}
              style={{ width: "100%", borderRadius: 12, maxHeight: 480, objectFit: "cover" }}
            />
          </div>
        )}

        {detected.type === "editorjs" ? (
          renderEditorJsBlocks(detected.data)
        ) : detected.type === "webblocks" ? (
          renderWebBlocks(detected.blocks)
        ) : detected.type === "html" ? (
          <div
            className="rich-content"
            style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px 80px", fontSize: 17, lineHeight: 1.9, color: "#292524" }}
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(detected.html) }}
          />
        ) : (
          <div
            style={{
              maxWidth: 820,
              margin: "0 auto",
              padding: "32px 24px 80px",
              fontSize: 17,
              lineHeight: 1.9,
              color: "#292524",
              whiteSpace: "pre-wrap",
            }}
          >
            {detected.text}
          </div>
        )}
      </article>
      <style>{`
        .rich-content h1 { font-size: 32px; font-weight: 700; margin: 32px 0 16px; color: #0F5132; }
        .rich-content h2 { font-size: 26px; font-weight: 700; margin: 28px 0 14px; color: #0F5132; }
        .rich-content h3 { font-size: 22px; font-weight: 700; margin: 24px 0 12px; }
        .rich-content p { margin: 0 0 16px; }
        .rich-content ul, .rich-content ol { padding-inline-start: 28px; margin: 0 0 16px; }
        .rich-content li { margin-bottom: 6px; }
        .rich-content a { color: #34cc30; text-decoration: underline; }
        .rich-content blockquote { border-inline-start: 4px solid #34cc30; padding: 12px 18px; margin: 16px 0; background: #f7fdf7; color: #44403C; font-style: italic; border-radius: 6px; }
        .rich-content code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: ui-monospace, monospace; }
        .rich-content pre { background: #1c1917; color: #fafaf9; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
        .rich-content pre code { background: transparent; padding: 0; color: inherit; }
        .rich-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
        .rich-content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        .rich-content th, .rich-content td { border: 1px solid #e7e5e4; padding: 10px 12px; text-align: right; }
        .rich-content th { background: #f5f5f4; font-weight: 700; }
        .rich-content hr { border: none; border-top: 1px solid #e7e5e4; margin: 32px 0; }
      `}</style>
=======
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
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </main>
  );
}

<<<<<<< HEAD
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "خدوم" };

  const title = post.metaTitle || post.title || "خدوم";
  const description = post.metaDescription || post.excerpt || undefined;
  const ogImage = post.ogImage || post.coverImage || undefined;

  return {
    title: `${title} | مدونة خدوم`,
    description,
    keywords: post.metaKeywords || undefined,
    openGraph: {
      title,
      description,
      type: "article",
      authors: post.author ? [post.author] : undefined,
      publishedTime: post.createdAt || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
=======
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  return { title: post?.title ? `${post.title} | مدونة خدوم` : "خدوم" };
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
}

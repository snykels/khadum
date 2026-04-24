import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";
<<<<<<< HEAD
import { renderWebBlocks, renderEditorJsBlocks, extractFaqJsonLd, type WebBlock, type EditorJsData } from "@/lib/blocks/webKhadom";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import type { Metadata } from "next";
=======
import { renderWebBlocks, type WebBlock } from "@/lib/blocks/webKhadom";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

export const dynamic = "force-dynamic";

async function getPage(slug: string) {
  try {
<<<<<<< HEAD
    const r: any = await db.execute(sql`
      SELECT title, content, status, excerpt, cover_image AS "coverImage",
             meta_title AS "metaTitle", meta_description AS "metaDescription",
             meta_keywords AS "metaKeywords", og_image AS "ogImage"
      FROM pages WHERE slug=${slug} LIMIT 1
    `);
=======
    const r: any = await db.execute(sql`SELECT title, content, status FROM pages WHERE slug=${slug} LIMIT 1`);
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
export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || page.status !== "published") notFound();

<<<<<<< HEAD
  const raw = page.content || "";
  const detected = detectContent(raw);

  let faqJsonLd: Array<{ question: string; answer: string }> = [];
  if (detected.type === "editorjs") {
    faqJsonLd = extractFaqJsonLd(detected.data);
=======
  let blocks: WebBlock[] = [];
  let legacyHtml: string | null = null;
  try {
    const j = JSON.parse(page.content || "[]");
    if (Array.isArray(j)) blocks = j;
    else if (j && Array.isArray(j.blocks)) blocks = j.blocks;
  } catch {
    legacyHtml = page.content || "";
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  }

  return (
    <main>
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

      {detected.type === "editorjs" ? (
        <>
          <div style={{ background: "#f8f7f5", borderBottom: "1px solid #e7e5e4", padding: "40px 24px 32px", textAlign: "center", direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif" }}>
            {page.coverImage && (
              <img src={page.coverImage} alt={page.title} style={{ width: "100%", maxWidth: 820, borderRadius: 12, marginBottom: 24, maxHeight: 360, objectFit: "cover" }} />
            )}
            <h1 style={{ fontSize: 38, fontWeight: 800, color: "#0F5132", marginBottom: 12, lineHeight: 1.3 }}>{page.title}</h1>
            {page.excerpt && <p style={{ fontSize: 18, color: "#57534E", lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{page.excerpt}</p>}
          </div>
          {renderEditorJsBlocks(detected.data)}
        </>
      ) : detected.type === "webblocks" ? (
        renderWebBlocks(detected.blocks)
      ) : (
        <article
          style={{
            maxWidth: 820,
            margin: "0 auto",
            padding: "48px 24px 80px",
            direction: "rtl",
            fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif",
          }}
        >
          {page.coverImage && (
            <img
              src={page.coverImage}
              alt={page.title}
              style={{ width: "100%", borderRadius: 12, marginBottom: 32, maxHeight: 400, objectFit: "cover" }}
            />
          )}
          <h1 style={{ fontSize: 38, fontWeight: 800, color: "#0F5132", marginBottom: 24, lineHeight: 1.3 }}>
            {page.title}
          </h1>
          {page.excerpt && (
            <p style={{ fontSize: 18, color: "#57534E", marginBottom: 28, lineHeight: 1.7, fontWeight: 500 }}>
              {page.excerpt}
            </p>
          )}
          {detected.type === "html" ? (
            <div
              className="rich-content"
              style={{ fontSize: 17, lineHeight: 1.9, color: "#292524" }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(detected.html) }}
            />
          ) : (
            <div style={{ fontSize: 17, lineHeight: 1.9, color: "#292524", whiteSpace: "pre-wrap" }}>
              {detected.text}
            </div>
          )}
        </article>
      )}
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
      {blocks.length > 0
        ? renderWebBlocks(blocks)
        : (
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif" }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: "#0F5132", marginBottom: 24 }}>{page.title}</h1>
            <div style={{ fontSize: 16, lineHeight: 1.8, color: "#292524", whiteSpace: "pre-wrap" }}>{legacyHtml}</div>
          </div>
        )}
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    </main>
  );
}

<<<<<<< HEAD
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "خدوم" };

  const title = page.metaTitle || page.title || "خدوم";
  const description = page.metaDescription || page.excerpt || undefined;
  const ogImage = page.ogImage || page.coverImage || undefined;

  return {
    title,
    description,
    keywords: page.metaKeywords || undefined,
    openGraph: {
      title,
      description,
      type: "article",
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
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  return { title: page?.title || "خدوم" };
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
}

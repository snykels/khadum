import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { renderWebBlocks, type WebBlock } from "@/lib/blocks/webKhadom";

export const dynamic = "force-dynamic";

async function getPage(slug: string) {
  try {
    const r: any = await db.execute(sql`SELECT title, content, status FROM pages WHERE slug=${slug} LIMIT 1`);
    return Array.isArray(r) && r[0] ? r[0] : null;
  } catch { return null; }
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || page.status !== "published") notFound();

  let blocks: WebBlock[] = [];
  let legacyHtml: string | null = null;
  try {
    const j = JSON.parse(page.content || "[]");
    if (Array.isArray(j)) blocks = j;
    else if (j && Array.isArray(j.blocks)) blocks = j.blocks;
  } catch {
    legacyHtml = page.content || "";
  }

  return (
    <main>
      {blocks.length > 0
        ? renderWebBlocks(blocks)
        : (
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif" }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: "#0F5132", marginBottom: 24 }}>{page.title}</h1>
            <div style={{ fontSize: 16, lineHeight: 1.8, color: "#292524", whiteSpace: "pre-wrap" }}>{legacyHtml}</div>
          </div>
        )}
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  return { title: page?.title || "خدوم" };
}

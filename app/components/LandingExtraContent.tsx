import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { renderEditorJsBlocks, isEditorJsContent, extractFaqJsonLd, type EditorJsData } from "@/lib/blocks/webKhadom";

async function loadLandingContent(): Promise<string> {
  try {
    const rows = (await db.execute(
      sql`SELECT value FROM settings WHERE ns='landing_content' AND key='blocks_json' LIMIT 1`
    )) as Array<{ value: string }>;
    return rows[0]?.value || "";
  } catch {
    return "";
  }
}

export default async function LandingExtraContent() {
  const raw = await loadLandingContent();
  if (!raw || !isEditorJsContent(raw)) return null;

  let data: EditorJsData;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!data?.blocks?.length) return null;

  const faqs = extractFaqJsonLd(data);
  const jsonLd = faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <section style={{ background: "#fff", padding: "40px 0" }} dir="rtl">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {renderEditorJsBlocks(data)}
    </section>
  );
}

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  let urls: { loc: string; lastmod?: string; priority?: number }[] = [
    { loc: `${origin}/`, priority: 1.0 },
    { loc: `${origin}/services`, priority: 0.9 },
    { loc: `${origin}/blog`, priority: 0.8 },
    { loc: `${origin}/about`, priority: 0.5 },
    { loc: `${origin}/contact`, priority: 0.5 },
  ];

  try {
    const blog: any = await db.execute(sql`SELECT slug, updated_at FROM blog_posts WHERE status = 'published' ORDER BY updated_at DESC LIMIT 500`);
    for (const p of blog) urls.push({ loc: `${origin}/blog/${p.slug}`, lastmod: p.updated_at?.toISOString?.()?.slice(0, 10), priority: 0.7 });
  } catch { /* table may not exist yet */ }

  try {
    const pages: any = await db.execute(sql`SELECT slug, updated_at FROM pages WHERE status = 'published' ORDER BY updated_at DESC LIMIT 200`);
    for (const p of pages) urls.push({ loc: `${origin}/${p.slug}`, lastmod: p.updated_at?.toISOString?.()?.slice(0, 10), priority: 0.6 });
  } catch { /* table may not exist yet */ }

  try {
    const services: any = await db.execute(sql`SELECT id, updated_at FROM services WHERE status = 'active' ORDER BY updated_at DESC LIMIT 1000`);
    for (const s of services) urls.push({ loc: `${origin}/services/${s.id}`, lastmod: s.updated_at?.toISOString?.()?.slice(0, 10), priority: 0.7 });
  } catch { /* */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}${u.priority != null ? `<priority>${u.priority}</priority>` : ""}</url>`).join("\n")}
</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
}

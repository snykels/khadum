import React from "react";
import { KhadomTokens as T } from "./tokens";

export type WebBlock =
  | { id: string; type: "w_navbar"; logo?: string; siteName?: string; links?: { label: string; href: string }[]; cta?: { label: string; href: string } }
  | { id: string; type: "w_hero"; title: string; subtitle?: string; primaryCta?: { label: string; href: string }; secondaryCta?: { label: string; href: string }; image?: string; eyebrow?: string }
  | { id: string; type: "w_features"; title?: string; items: { icon?: string; title: string; description: string }[] }
  | { id: string; type: "w_steps"; title?: string; steps: { number?: number; title: string; description: string }[] }
  | { id: string; type: "w_categories"; title?: string; categories: { name: string; icon?: string; href?: string; count?: number }[] }
  | { id: string; type: "w_services_grid"; title?: string; services: { title: string; image?: string; price?: string; rating?: number; href?: string; freelancerName?: string }[] }
  | { id: string; type: "w_testimonials"; title?: string; items: { quote: string; author: string; role?: string; avatar?: string; stars?: number }[] }
  | { id: string; type: "w_stats"; items: { value: string; label: string; icon?: string }[] }
  | { id: string; type: "w_pricing"; title?: string; tiers: { name: string; price: string; period?: string; features: string[]; cta?: string; href?: string; featured?: boolean }[] }
  | { id: string; type: "w_faq"; title?: string; items: { question: string; answer: string }[] }
  | { id: string; type: "w_cta_banner"; title: string; subtitle?: string; primaryCta: { label: string; href: string }; secondaryCta?: { label: string; href: string } }
  | { id: string; type: "w_blog_grid"; title?: string; posts: { title: string; excerpt?: string; image?: string; date?: string; author?: string; href?: string }[] }
  | { id: string; type: "w_contact"; title?: string; description?: string; whatsapp?: string; email?: string; phone?: string; address?: string }
  | { id: string; type: "w_footer"; siteName?: string; description?: string; columns?: { title: string; links: { label: string; href: string }[] }[]; social?: { label: string; href: string }[]; legal?: string }
  | { id: string; type: "w_rich_text"; html: string };

const Section: React.FC<{ children: React.ReactNode; bg?: string; pad?: number }> = ({ children, bg = "#fff", pad = 64 }) => (
  <section style={{ background: bg, padding: `${pad}px 0` }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>{children}</div>
  </section>
);

const SectionTitle: React.FC<{ title?: string; eyebrow?: string }> = ({ title, eyebrow }) => title ? (
  <div style={{ textAlign: "center", marginBottom: 48 }}>
    {eyebrow && <div style={{ color: T.colors.luxuryGold, fontSize: 14, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{eyebrow}</div>}
    <h2 style={{ fontSize: 32, fontWeight: 700, color: T.colors.grayScale[900], margin: 0 }}>{title}</h2>
  </div>
) : null;

const Btn: React.FC<{ href: string; variant?: "primary" | "secondary" | "wa"; children: React.ReactNode }> = ({ href, variant = "primary", children }) => {
  const styles: React.CSSProperties = variant === "primary"
    ? { background: T.colors.royalGreen, color: "#fff", border: `2px solid ${T.colors.royalGreen}` }
    : variant === "wa"
    ? { background: T.colors.waGreen, color: "#fff", border: `2px solid ${T.colors.waGreen}` }
    : { background: "transparent", color: T.colors.royalGreen, border: `2px solid ${T.colors.royalGreen}` };
  return <a href={href} style={{ ...styles, padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 600, fontSize: 16, display: "inline-block" }}>{children}</a>;
};

function Navbar(b: Extract<WebBlock, { type: "w_navbar" }>) {
  return (
    <header style={{ background: "#fff", borderBottom: `1px solid ${T.colors.grayScale[200]}`, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <a href="/" style={{ color: T.colors.royalGreen, fontWeight: 700, fontSize: 22, textDecoration: "none" }}>{b.logo ? <img src={b.logo} alt={b.siteName || "خدوم"} style={{ height: 36 }} /> : (b.siteName || "خدوم")}</a>
        <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {(b.links || []).map((l, i) => <a key={i} href={l.href} style={{ color: T.colors.grayScale[600], textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{l.label}</a>)}
          {b.cta && <Btn href={b.cta.href}>{b.cta.label}</Btn>}
        </nav>
      </div>
    </header>
  );
}

function Hero(b: Extract<WebBlock, { type: "w_hero" }>) {
  return (
    <section style={{ background: `linear-gradient(135deg, ${T.colors.warmGray}, #fff)`, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: b.image ? "1fr 1fr" : "1fr", gap: 48, alignItems: "center" }}>
        <div style={{ textAlign: b.image ? "right" : "center" }}>
          {b.eyebrow && <div style={{ color: T.colors.luxuryGold, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{b.eyebrow}</div>}
          <h1 style={{ fontSize: 56, fontWeight: 700, color: T.colors.grayScale[900], margin: "0 0 16px", lineHeight: 1.2 }}>{b.title}</h1>
          {b.subtitle && <p style={{ fontSize: 20, color: T.colors.grayScale[600], margin: "0 0 32px", lineHeight: 1.6 }}>{b.subtitle}</p>}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: b.image ? "flex-start" : "center" }}>
            {b.primaryCta && <Btn href={b.primaryCta.href}>{b.primaryCta.label}</Btn>}
            {b.secondaryCta && <Btn href={b.secondaryCta.href} variant="secondary">{b.secondaryCta.label}</Btn>}
          </div>
        </div>
        {b.image && <img src={b.image} alt="" loading="eager" style={{ width: "100%", borderRadius: 20, boxShadow: T.shadow.lg }} />}
      </div>
    </section>
  );
}

function Features(b: Extract<WebBlock, { type: "w_features" }>) {
  return (
    <Section>
      <SectionTitle title={b.title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        {(b.items || []).map((it, i) => (
          <div key={i} style={{ background: "#fff", padding: 32, borderRadius: 20, border: `1px solid ${T.colors.grayScale[200]}`, boxShadow: T.shadow.sm }}>
            {it.icon && <div style={{ width: 56, height: 56, borderRadius: 16, background: T.colors.warmGray, color: T.colors.royalGreen, fontSize: 28, lineHeight: "56px", textAlign: "center", marginBottom: 16 }}>{it.icon}</div>}
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.colors.grayScale[900], margin: "0 0 8px" }}>{it.title}</h3>
            <p style={{ fontSize: 15, color: T.colors.grayScale[600], lineHeight: 1.6, margin: 0 }}>{it.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Steps(b: Extract<WebBlock, { type: "w_steps" }>) {
  return (
    <Section bg={T.colors.warmGray}>
      <SectionTitle title={b.title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        {(b.steps || []).map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.colors.royalGreen, color: "#fff", fontSize: 28, fontWeight: 700, lineHeight: "64px", margin: "0 auto 16px" }}>{s.number ?? i + 1}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T.colors.grayScale[900], margin: "0 0 8px" }}>{s.title}</h3>
            <p style={{ fontSize: 14, color: T.colors.grayScale[600], lineHeight: 1.6, margin: 0 }}>{s.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Categories(b: Extract<WebBlock, { type: "w_categories" }>) {
  return (
    <Section>
      <SectionTitle title={b.title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {(b.categories || []).map((c, i) => (
          <a key={i} href={c.href || "#"} style={{ background: "#fff", padding: 24, borderRadius: 16, border: `1px solid ${T.colors.grayScale[200]}`, textAlign: "center", textDecoration: "none", color: T.colors.grayScale[900] }}>
            {c.icon && <div style={{ fontSize: 40, marginBottom: 12 }}>{c.icon}</div>}
            <div style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div>
            {c.count !== undefined && <div style={{ fontSize: 12, color: T.colors.grayScale[600], marginTop: 4 }}>{c.count} خدمة</div>}
          </a>
        ))}
      </div>
    </Section>
  );
}

function ServicesGrid(b: Extract<WebBlock, { type: "w_services_grid" }>) {
  return (
    <Section bg={T.colors.warmGray}>
      <SectionTitle title={b.title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        {(b.services || []).map((s, i) => (
          <a key={i} href={s.href || "#"} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: T.shadow.sm, textDecoration: "none", color: T.colors.grayScale[900] }}>
            {s.image && <img src={s.image} alt={s.title} loading="lazy" style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", display: "block" }} />}
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{s.title}</h3>
              {s.freelancerName && <div style={{ fontSize: 13, color: T.colors.grayScale[600], marginBottom: 8 }}>{s.freelancerName}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {s.price && <span style={{ color: T.colors.royalGreen, fontWeight: 700 }}>{s.price}</span>}
                {s.rating !== undefined && <span style={{ color: T.colors.luxuryGold, fontSize: 14 }}>★ {s.rating}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}

function Testimonials(b: Extract<WebBlock, { type: "w_testimonials" }>) {
  return (
    <Section>
      <SectionTitle title={b.title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {(b.items || []).map((it, i) => (
          <div key={i} style={{ background: T.colors.warmGray, padding: 32, borderRadius: 20 }}>
            {it.stars !== undefined && <div style={{ color: T.colors.luxuryGold, marginBottom: 12, letterSpacing: 2 }}>{"★".repeat(it.stars)}</div>}
            <p style={{ fontSize: 16, fontStyle: "italic", color: T.colors.grayScale[800], lineHeight: 1.6, margin: "0 0 16px" }}>"{it.quote}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {it.avatar && <img src={it.avatar} alt={it.author} style={{ width: 48, height: 48, borderRadius: "50%" }} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.colors.grayScale[900] }}>{it.author}</div>
                {it.role && <div style={{ fontSize: 12, color: T.colors.grayScale[600] }}>{it.role}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Stats(b: Extract<WebBlock, { type: "w_stats" }>) {
  return (
    <Section bg={T.colors.royalGreen} pad={48}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: 32, textAlign: "center" }}>
        {(b.items || []).map((it, i) => (
          <div key={i}>
            {it.icon && <div style={{ fontSize: 32, marginBottom: 8 }}>{it.icon}</div>}
            <div style={{ fontSize: 40, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{it.value}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{it.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Pricing(b: Extract<WebBlock, { type: "w_pricing" }>) {
  return (
    <Section>
      <SectionTitle title={b.title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        {(b.tiers || []).map((t, i) => (
          <div key={i} style={{ background: t.featured ? T.colors.royalGreen : "#fff", color: t.featured ? "#fff" : T.colors.grayScale[900], padding: 32, borderRadius: 20, border: `2px solid ${t.featured ? T.colors.royalGreen : T.colors.grayScale[200]}`, boxShadow: t.featured ? T.shadow.lg : T.shadow.sm }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{t.name}</h3>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 40, fontWeight: 700 }}>{t.price}</span>
              {t.period && <span style={{ fontSize: 14, opacity: 0.7 }}>{t.period}</span>}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
              {t.features.map((f, j) => <li key={j} style={{ padding: "8px 0", fontSize: 15 }}>✓ {f}</li>)}
            </ul>
            {t.cta && <Btn href={t.href || "#"} variant={t.featured ? "wa" : "primary"}>{t.cta}</Btn>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Faq(b: Extract<WebBlock, { type: "w_faq" }>) {
  return (
    <Section>
      <SectionTitle title={b.title} />
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {(b.items || []).map((it, i) => (
          <details key={i} style={{ background: "#fff", border: `1px solid ${T.colors.grayScale[200]}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
            <summary style={{ fontWeight: 600, fontSize: 16, color: T.colors.grayScale[900], cursor: "pointer" }}>{it.question}</summary>
            <p style={{ marginTop: 12, color: T.colors.grayScale[600], lineHeight: 1.7 }}>{it.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function CtaBanner(b: Extract<WebBlock, { type: "w_cta_banner" }>) {
  return (
    <Section bg={T.colors.royalGreen}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px" }}>{b.title}</h2>
        {b.subtitle && <p style={{ fontSize: 18, opacity: 0.9, margin: "0 0 24px" }}>{b.subtitle}</p>}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={b.primaryCta.href} style={{ background: "#fff", color: T.colors.royalGreen, padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 16 }}>{b.primaryCta.label}</a>
          {b.secondaryCta && <a href={b.secondaryCta.href} style={{ background: "transparent", color: "#fff", padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 600, fontSize: 16, border: "2px solid rgba(255,255,255,0.6)" }}>{b.secondaryCta.label}</a>}
        </div>
      </div>
    </Section>
  );
}

function BlogGrid(b: Extract<WebBlock, { type: "w_blog_grid" }>) {
  return (
    <Section>
      <SectionTitle title={b.title} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {(b.posts || []).map((p, i) => (
          <a key={i} href={p.href || "#"} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: `1px solid ${T.colors.grayScale[200]}`, textDecoration: "none", color: T.colors.grayScale[900], boxShadow: T.shadow.sm }}>
            {p.image && <img src={p.image} alt={p.title} loading="lazy" style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }} />}
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{p.title}</h3>
              {p.excerpt && <p style={{ fontSize: 14, color: T.colors.grayScale[600], lineHeight: 1.6, margin: "0 0 12px" }}>{p.excerpt}</p>}
              <div style={{ fontSize: 12, color: T.colors.grayScale[400] }}>{[p.author, p.date].filter(Boolean).join(" • ")}</div>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}

function Contact(b: Extract<WebBlock, { type: "w_contact" }>) {
  return (
    <Section bg={T.colors.warmGray}>
      <SectionTitle title={b.title} />
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        {b.description && <p style={{ fontSize: 16, color: T.colors.grayScale[600], marginBottom: 32, lineHeight: 1.7 }}>{b.description}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {b.whatsapp && <Btn href={`https://wa.me/${b.whatsapp.replace(/\D/g,"")}`} variant="wa">واتساب: {b.whatsapp}</Btn>}
          {b.email && <a href={`mailto:${b.email}`} style={{ color: T.colors.royalGreen, fontWeight: 600 }}>{b.email}</a>}
          {b.phone && <a href={`tel:${b.phone}`} style={{ color: T.colors.grayScale[800] }}>{b.phone}</a>}
          {b.address && <p style={{ color: T.colors.grayScale[600], margin: 0 }}>{b.address}</p>}
        </div>
      </div>
    </Section>
  );
}

function Footer(b: Extract<WebBlock, { type: "w_footer" }>) {
  return (
    <footer style={{ background: T.colors.grayScale[900], color: "#fff", padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(auto-fit, minmax(160px, 1fr))", gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.colors.waGreen, marginBottom: 12 }}>{b.siteName || "خدوم"}</div>
            {b.description && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{b.description}</p>}
          </div>
          {(b.columns || []).map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#fff" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map((l, j) => <li key={j} style={{ marginBottom: 8 }}><a href={l.href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>{l.label}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          <span>{b.legal || `© ${new Date().getFullYear()} ${b.siteName || "خدوم"}. جميع الحقوق محفوظة.`}</span>
          <div style={{ display: "flex", gap: 12 }}>
            {(b.social || []).map((s, i) => <a key={i} href={s.href} style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

<<<<<<< HEAD
// ==================== EditorJS Block Renderers ====================

export interface EjsBlockData {
  [key: string]: unknown;
}

export interface EditorJsData {
  time?: number;
  blocks: Array<{ id?: string; type: string; data: EjsBlockData }>;
  version?: string;
}

interface EjsHeaderData extends EjsBlockData { text?: string; level?: number }
interface EjsParagraphData extends EjsBlockData { text?: string }
interface EjsListData extends EjsBlockData { style?: string; items?: string[] }
interface EjsChecklistItem { text: string; checked: boolean }
interface EjsChecklistData extends EjsBlockData { items?: EjsChecklistItem[] }
interface EjsImageData extends EjsBlockData {
  file?: { url?: string };
  url?: string;
  caption?: string;
  withBorder?: boolean;
  stretched?: boolean;
}
interface EjsInlineCodeData extends EjsBlockData { code?: string }
interface EjsFaqData extends EjsBlockData { question?: string; answer?: string; open?: boolean }
interface EjsColumnsData extends EjsBlockData { cols?: Array<{ blocks?: EjsBlock[] }> }

function EjsHeader({ data, key: k }: { data: EjsHeaderData; key: string | number }) {
  const level = data.level || 2;
  const sizes: Record<number, string> = { 1: "36px", 2: "28px", 3: "22px", 4: "18px" };
  return (
    <h2
      key={k}
      style={{
        fontSize: sizes[level] || "28px",
        fontWeight: 700,
        color: "#1C1917",
        margin: "28px 0 12px",
        lineHeight: 1.3,
        direction: "rtl",
        textAlign: "right",
      }}
      dangerouslySetInnerHTML={{ __html: data.text || "" }}
    />
  );
}

function EjsParagraph({ data, key: k }: { data: EjsParagraphData; key: string | number }) {
  return (
    <p
      key={k}
      style={{ fontSize: 17, lineHeight: 1.85, color: "#292524", margin: "0 0 16px", direction: "rtl", textAlign: "right" }}
      dangerouslySetInnerHTML={{ __html: data.text || "" }}
    />
  );
}

function EjsList({ data, key: k }: { data: EjsListData; key: string | number }) {
  const ordered = data.style === "ordered";
  const items: string[] = data.items || [];
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      key={k}
      style={{
        paddingRight: "28px",
        paddingLeft: 0,
        margin: "0 0 16px",
        color: "#292524",
        fontSize: 16,
        lineHeight: 1.8,
        direction: "rtl",
        listStyle: ordered ? "decimal" : "disc",
        textAlign: "right",
      }}
    >
      {items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </Tag>
  );
}

function EjsChecklist({ data, key: k }: { data: EjsChecklistData; key: string | number }) {
  const items: EjsChecklistItem[] = data.items || [];
  return (
    <div key={k} style={{ margin: "0 0 16px", direction: "rtl" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, flexDirection: "row-reverse" }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              border: "2px solid",
              borderColor: item.checked ? "#34cc30" : "#d4d4d4",
              background: item.checked ? "#34cc30" : "transparent",
              flexShrink: 0,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.checked && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span
            style={{ fontSize: 16, color: item.checked ? "#78716C" : "#292524", textDecoration: item.checked ? "line-through" : "none", lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: item.text }}
          />
        </div>
      ))}
    </div>
  );
}

function EjsImage({ data, key: k }: { data: EjsImageData; key: string | number }) {
  const url = data.file?.url || data.url || "";
  if (!url) return null;
  return (
    <figure key={k} style={{ margin: "20px 0", textAlign: "center" }}>
      <img
        src={url}
        alt={data.caption || ""}
        style={{
          maxWidth: "100%",
          borderRadius: 10,
          border: data.withBorder ? "1px solid #e7e5e4" : "none",
          width: data.stretched ? "100%" : "auto",
        }}
      />
      {data.caption && (
        <figcaption style={{ marginTop: 8, fontSize: 14, color: "#78716C", direction: "rtl" }}>
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}

function EjsInlineCode({ data, key: k }: { data: EjsInlineCodeData; key: string | number }) {
  return (
    <pre
      key={k}
      style={{ background: "#1c1917", color: "#fafaf9", padding: "16px 20px", borderRadius: 8, overflowX: "auto", margin: "16px 0", fontSize: 14, direction: "ltr", textAlign: "left" }}
    >
      <code>{data.code || ""}</code>
    </pre>
  );
}

function EjsFaq({ data, key: k }: { data: EjsFaqData; key: string | number }) {
  const isOpen = data?.open !== false;
  return (
    <details
      key={k}
      open={isOpen}
      style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: 20, marginBottom: 12, direction: "rtl" }}
    >
      <summary style={{ fontWeight: 700, fontSize: 16, color: "#1C1917", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {data.question || ""}
        <span style={{ marginRight: 8, color: "#0F5132", fontSize: 18, transition: "transform 0.2s" }}>▾</span>
      </summary>
      <p style={{ marginTop: 12, color: "#57534E", lineHeight: 1.7, marginBottom: 0, fontSize: 15 }}>{data.answer || ""}</p>
    </details>
  );
}

type EjsBlock = { id?: string; type: string; data: EjsBlockData };

function EjsColumns({ data, key: k }: { data: EjsColumnsData; key: string | number }) {
  const cols: Array<{ blocks?: EjsBlock[] }> = Array.isArray(data?.cols) ? data.cols : [];
  if (!cols.length) return null;
  return (
    <div
      key={k}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`,
        gap: 24,
        margin: "20px 0",
        direction: "rtl",
      }}
    >
      {cols.map((col, ci) => (
        <div key={ci} style={{ minWidth: 0 }}>
          {(col?.blocks || []).map((b, bi) => renderEditorJsBlock(b, `${ci}:${b.id || bi}`))}
        </div>
      ))}
    </div>
  );
}

function renderEditorJsBlock(block: EjsBlock, key: string | number): React.ReactNode {
  const data = block.data;
  switch (block.type) {
    case "header":     return <EjsHeader     data={data as EjsHeaderData}    key={key} />;
    case "paragraph":  return <EjsParagraph  data={data as EjsParagraphData} key={key} />;
    case "list":       return <EjsList       data={data as EjsListData}      key={key} />;
    case "checklist":  return <EjsChecklist  data={data as EjsChecklistData} key={key} />;
    case "image":      return <EjsImage      data={data as EjsImageData}     key={key} />;
    case "inlineCode": return <EjsInlineCode data={data as EjsInlineCodeData} key={key} />;
    case "faq":        return <EjsFaq        data={data as EjsFaqData}       key={key} />;
    case "columns":    return <EjsColumns    data={data as EjsColumnsData}   key={key} />;
    default:           return null;
  }
}

export function renderEditorJsBlocks(data: EditorJsData): React.ReactNode {
  if (!data?.blocks?.length) return null;
  return (
    <article
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "40px 24px 80px",
        direction: "rtl",
        fontFamily: "'IBM Plex Sans Arabic', Tahoma, sans-serif",
        color: "#292524",
      }}
    >
      {data.blocks.map((block, i) => renderEditorJsBlock(block, block.id || i))}
    </article>
  );
}

export function extractFaqJsonLd(data: EditorJsData): Array<{ question: string; answer: string }> {
  if (!data?.blocks) return [];
  const result: Array<{ question: string; answer: string }> = [];
  collectFaqsFromBlocks(data.blocks, result);
  return result;
}

function collectFaqsFromBlocks(
  blocks: Array<{ type: string; data: EjsBlockData }> | undefined,
  out: Array<{ question: string; answer: string }>,
) {
  if (!Array.isArray(blocks)) return;
  for (const b of blocks) {
    if (b.type === "faq") {
      const d = b.data as EjsFaqData;
      if (d.question) out.push({ question: d.question, answer: d.answer || "" });
      continue;
    }
    if (b.type === "columns") {
      const d = b.data as EjsColumnsData;
      const cols = Array.isArray(d?.cols) ? d.cols : [];
      for (const col of cols) {
        collectFaqsFromBlocks(col?.blocks, out);
      }
    }
  }
}

export function isEditorJsContent(raw: string): boolean {
  if (!raw) return false;
  try {
    const j = JSON.parse(raw);
    if (j && Array.isArray(j.blocks)) {
      if (j.blocks.length === 0) return true;
      const first = j.blocks[0];
      return Boolean(first && typeof first.type === "string" && !first.type.startsWith("w_"));
    }
  } catch {}
  return false;
}

// ==================== WebBlock Renderers ====================

=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export function renderWebBlock(b: WebBlock, key: string | number): React.ReactNode {
  switch (b.type) {
    case "w_navbar":        return <Navbar key={key} {...(b as any)} />;
    case "w_hero":          return <Hero key={key} {...(b as any)} />;
    case "w_features":      return <Features key={key} {...(b as any)} />;
    case "w_steps":         return <Steps key={key} {...(b as any)} />;
    case "w_categories":    return <Categories key={key} {...(b as any)} />;
    case "w_services_grid": return <ServicesGrid key={key} {...(b as any)} />;
    case "w_testimonials":  return <Testimonials key={key} {...(b as any)} />;
    case "w_stats":         return <Stats key={key} {...(b as any)} />;
    case "w_pricing":       return <Pricing key={key} {...(b as any)} />;
    case "w_faq":           return <Faq key={key} {...(b as any)} />;
    case "w_cta_banner":    return <CtaBanner key={key} {...(b as any)} />;
    case "w_blog_grid":     return <BlogGrid key={key} {...(b as any)} />;
    case "w_contact":       return <Contact key={key} {...(b as any)} />;
    case "w_footer":        return <Footer key={key} {...(b as any)} />;
    case "w_rich_text":     return <Section key={key}><div dangerouslySetInnerHTML={{ __html: (b as any).html }} style={{ fontSize: 16, lineHeight: 1.8, color: T.colors.grayScale[800] }} /></Section>;
    default: return null;
  }
}

export function renderWebBlocks(blocks: WebBlock[]): React.ReactNode {
  return <div style={{ fontFamily: T.font.primary, direction: "rtl", color: T.colors.grayScale[800] }}>
    {(blocks || []).map((b, i) => renderWebBlock(b, b.id || i))}
  </div>;
}

export const WEB_BLOCK_PRESETS: { type: WebBlock["type"]; label: string; preset: Omit<WebBlock, "id"> }[] = [
  { type: "w_navbar",        label: "W-01 شريط التنقل",     preset: { type: "w_navbar", siteName: "خدوم", links: [{ label: "الخدمات", href: "/services" }, { label: "كيف يعمل", href: "/how" }, { label: "المدونة", href: "/blog" }], cta: { label: "ابدأ الآن", href: "/register" } } as any },
  { type: "w_hero",          label: "W-02 البطل",            preset: { type: "w_hero", eyebrow: "أسرع سوق خدمات في السعودية", title: "اطلب أي خدمة، استلمها بسرعة", subtitle: "خدوم يربطك بأفضل المستقلين السعوديين عبر واتساب", primaryCta: { label: "تصفح الخدمات", href: "/services" }, secondaryCta: { label: "كن مستقلاً", href: "/apply" } } as any },
  { type: "w_features",      label: "W-03 المميزات",         preset: { type: "w_features", title: "لماذا خدوم؟", items: [{ icon: "⚡", title: "سرعة التنفيذ", description: "تواصل مباشر عبر واتساب" }, { icon: "🔒", title: "حماية الدفع", description: "حساب ضمان معتمد" }, { icon: "⭐", title: "ضمان الجودة", description: "استرداد كامل عند عدم الرضا" }] } as any },
  { type: "w_steps",         label: "W-04 خطوات الاستخدام",  preset: { type: "w_steps", title: "كيف يعمل خدوم؟", steps: [{ title: "اختر خدمتك", description: "تصفح آلاف الخدمات من مستقلين موثوقين" }, { title: "تواصل مع المستقل", description: "ناقش متطلباتك مباشرة على واتساب" }, { title: "ادفع بأمان", description: "المبلغ محفوظ في حساب الضمان" }, { title: "استلم وقيّم", description: "أفرج عن المبلغ بعد رضاك التام" }] } as any },
  { type: "w_categories",    label: "W-05 الفئات",           preset: { type: "w_categories", title: "تصفح الفئات", categories: [{ name: "تصميم", icon: "🎨", count: 120, href: "/services?cat=design" }, { name: "برمجة", icon: "💻", count: 95, href: "/services?cat=dev" }, { name: "تسويق", icon: "📢", count: 80, href: "/services?cat=marketing" }, { name: "كتابة", icon: "✍️", count: 60, href: "/services?cat=writing" }] } as any },
  { type: "w_services_grid", label: "W-06 شبكة خدمات",       preset: { type: "w_services_grid", title: "خدمات مميزة", services: [{ title: "تصميم شعار احترافي", price: "200 ر.س", rating: 4.9, freelancerName: "سارة أحمد", href: "/services/1" }, { title: "تطوير موقع متجر", price: "1500 ر.س", rating: 4.8, freelancerName: "محمد العتيبي", href: "/services/2" }, { title: "حملة تسويق رقمي", price: "800 ر.س", rating: 5.0, freelancerName: "نورة الحربي", href: "/services/3" }] } as any },
  { type: "w_testimonials",  label: "W-07 آراء العملاء",     preset: { type: "w_testimonials", title: "ماذا يقول عملاؤنا؟", items: [{ quote: "تجربة رائعة، تسليم سريع وجودة عالية", author: "أحمد السالم", role: "صاحب متجر", stars: 5 }, { quote: "أفضل منصة استخدمتها للحصول على خدمات احترافية", author: "فاطمة العلي", role: "مديرة تسويق", stars: 5 }] } as any },
  { type: "w_stats",         label: "W-08 إحصائيات",         preset: { type: "w_stats", items: [{ value: "+10K", label: "مستقل نشط", icon: "👥" }, { value: "+50K", label: "خدمة مكتملة", icon: "✅" }, { value: "4.9", label: "متوسط التقييم", icon: "⭐" }, { value: "+15M", label: "ر.س مدفوعات", icon: "💰" }] } as any },
  { type: "w_pricing",       label: "W-09 الباقات",          preset: { type: "w_pricing", title: "اختر الباقة المناسبة", tiers: [{ name: "مجاني", price: "0", period: " ر.س/شهر", features: ["3 خدمات نشطة", "عمولة 15%", "دعم بريد"], cta: "ابدأ مجاناً", href: "/register" }, { name: "احترافي", price: "99", period: " ر.س/شهر", features: ["خدمات غير محدودة", "عمولة 10%", "دعم أولوية", "شارة موثّق"], cta: "اشترك الآن", href: "/upgrade", featured: true }, { name: "مؤسسات", price: "299", period: " ر.س/شهر", features: ["كل ما سبق", "عمولة 5%", "حساب مخصص", "API"], cta: "تواصل معنا", href: "/contact" }] } as any },
  { type: "w_faq",           label: "W-10 الأسئلة الشائعة",  preset: { type: "w_faq", title: "أسئلة شائعة", items: [{ question: "كيف أبدأ في خدوم؟", answer: "سجّل حساباً مجانياً، تصفّح الخدمات، وابدأ بطلب أي خدمة في دقائق." }, { question: "هل الدفع آمن؟", answer: "نعم، نستخدم نظام حساب ضمان معتمد. المبلغ يبقى محفوظاً حتى تأكيدك للاستلام." }, { question: "ماذا لو لم أرضَ بالخدمة؟", answer: "يمكنك طلب استرداد كامل خلال فترة المراجعة." }] } as any },
  { type: "w_cta_banner",    label: "W-11 لافتة CTA",        preset: { type: "w_cta_banner", title: "جاهز للبدء؟", subtitle: "انضم لآلاف المستقلين والعملاء على خدوم", primaryCta: { label: "إنشاء حساب", href: "/register" }, secondaryCta: { label: "تصفّح الخدمات", href: "/services" } } as any },
  { type: "w_blog_grid",     label: "W-12 شبكة المدونة",     preset: { type: "w_blog_grid", title: "أحدث المقالات", posts: [{ title: "كيف تختار مستقلاً مناسباً؟", excerpt: "نصائح ذهبية لاختيار الشخص المناسب لمشروعك", date: "2026/04/15", author: "فريق خدوم", href: "/blog/1" }, { title: "أفضل 10 خدمات لرواد الأعمال", excerpt: "قائمة مختارة بأهم الخدمات التي تحتاجها", date: "2026/04/10", author: "فريق خدوم", href: "/blog/2" }] } as any },
  { type: "w_contact",       label: "W-13 تواصل معنا",       preset: { type: "w_contact", title: "نحن هنا لمساعدتك", description: "اختر الطريقة الأسرع للتواصل معنا", whatsapp: "+966500000000", email: "support@khadom.app", phone: "+966112345678", address: "الرياض، المملكة العربية السعودية" } as any },
  { type: "w_footer",        label: "W-14 التذييل",          preset: { type: "w_footer", siteName: "خدوم", description: "أسرع سوق خدمات مصغّرة في السعودية", columns: [{ title: "المنصة", links: [{ label: "الخدمات", href: "/services" }, { label: "المستقلون", href: "/freelancers" }, { label: "كيف يعمل", href: "/how" }] }, { title: "الشركة", links: [{ label: "من نحن", href: "/p/about" }, { label: "اتصل بنا", href: "/p/contact" }, { label: "المدونة", href: "/blog" }] }, { title: "قانوني", links: [{ label: "الشروط", href: "/p/terms" }, { label: "الخصوصية", href: "/p/privacy" }] }], social: [{ label: "X", href: "https://x.com" }, { label: "IG", href: "https://instagram.com" }] } as any },
  { type: "w_rich_text",     label: "W-15 نص حر",            preset: { type: "w_rich_text", html: "<h2>عنوان</h2><p>اكتب المحتوى هنا. يدعم HTML.</p>" } as any },
];

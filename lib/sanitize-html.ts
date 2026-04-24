import sanitizeHtml from "sanitize-html";

const TIPTAP_ALLOWED_TAGS = [
  "p", "br", "hr", "blockquote", "pre", "code",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "mark", "small", "sub", "sup",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "div", "span",
];

const TIPTAP_ALLOWED_ATTR: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  "*": ["style", "class", "dir", "align", "colspan", "rowspan"],
};

const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    "color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/, /^rgba\(/, /^[a-z\-]+$/i],
    "background-color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/, /^rgba\(/, /^[a-z\-]+$/i],
    "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
    "font-weight": [/^bold$/, /^[1-9]00$/],
    "font-style": [/^italic$/, /^normal$/],
    "text-decoration": [/^underline$/, /^line-through$/, /^none$/],
  },
};

export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: TIPTAP_ALLOWED_TAGS,
    allowedAttributes: TIPTAP_ALLOWED_ATTR,
    allowedStyles: ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer nofollow",
          target: attribs.target === "_blank" ? "_blank" : "_self",
        },
      }),
    },
  });
}

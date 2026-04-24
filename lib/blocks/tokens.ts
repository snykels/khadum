export const KhadomTokens = {
  colors: {
    royalGreen:   "#0F5132",
    waGreen:      "#25D366",
    luxuryGold:   "#C9A961",
    white:        "#FFFFFF",
    warmGray:     "#F5F3F0",
    success:      "#0F5132",
    warning:      "#D97706",
    error:        "#B91C1C",
    info:         "#1E40AF",
    grayScale: {
      50:  "#FAFAF9",
      100: "#F5F5F4",
      200: "#E7E5E4",
      400: "#A8A29E",
      600: "#57534E",
      800: "#292524",
      900: "#1C1917",
    },
    legalNoticeBg:     "#FEF3C7",
    legalNoticeText:   "#78350F",
    legalNoticeBorder: "#FCD34D",
  },
  font: {
    primary:   "'IBM Plex Sans Arabic', 'Tajawal', Tahoma, Arial, sans-serif",
    numerals:  "'Tajawal', Tahoma, Arial, sans-serif",
    sizes: {
      display: 56, h1: 40, h2: 32, h3: 24, h4: 20,
      bodyLg:  18, body: 16, bodySm: 14, caption: 12,
    },
    weights: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xl2: 48, xl3: 64, xl4: 96, xl5: 128 },
  radius: { sm: 8, md: 12, lg: 20, full: 9999 },
  shadow: {
    xs:   "0 1px 2px rgba(0,0,0,0.04)",
    sm:   "0 2px 6px rgba(0,0,0,0.06)",
    md:   "0 6px 16px rgba(0,0,0,0.08)",
    lg:   "0 12px 32px rgba(0,0,0,0.12)",
    glow: "0 0 0 4px rgba(15,81,50,0.18)",
  },
  email: { width: 600, padding: 24 },
} as const;

export type KhadomTokensT = typeof KhadomTokens;

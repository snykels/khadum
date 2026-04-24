import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { LangProvider } from "@/app/context/LangContext";
import { Readex_Pro, Tajawal } from "next/font/google";
import { Toaster } from "sonner";

const somar = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-somar",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "خدوم - منصة الخدمات عبر واتساب",
  description: "اطلب أي خدمة عبر واتساب فقط! أرسل رسالة وابدأ الحين",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${somar.variable} ${tajawal.variable}`}>
      <body className={somar.className}>
        <ThemeProvider><LangProvider>{children}</LangProvider></ThemeProvider>
        <Toaster position="top-center" richColors closeButton dir="rtl" toastOptions={{ style: { fontFamily: "var(--font-tajawal), Tahoma, sans-serif" } }} />
      </body>
    </html>
  );
}

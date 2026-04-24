'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Categories from "../components/landing/Categories";
import FeaturedServices from "../components/landing/FeaturedServices";
import HowItWorks from "../components/landing/HowItWorks";
import TrustSection from "../components/landing/TrustSection";
import TopFreelancers from "../components/landing/TopFreelancers";
import Testimonials from "../components/landing/Testimonials";
import AppDownload from "../components/landing/AppDownload";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";

type Lang = "ar" | "en";
type Theme = "light" | "dark";

const texts = {
  ar: { alert: "🎉 خدوم — اطلب أي خدمة عبر واتساب فقط! أرسل رسالة وابدأ الحين" },
  en: { alert: "🎉 Khadom — request any service on WhatsApp only! Send a message and start now" },
};

function FreelancerJoinCTA() {
  return (
    <section className="py-20 bg-[#485869]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
          <span className="text-[#34cc30] text-lg">✦</span>
          <span className="text-white/80 text-sm">للمستقلين السعوديين</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          حوّل مهارتك إلى دخل مستمر
        </h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
          انضم لآلاف المستقلين السعوديين الذين يكسبون على خدوم. 
          التسجيل مجاني، والبوت يتولى كل شيء عبر واتساب.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/apply"
            className="bg-[#34cc30] text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-[#2bb028] transition inline-block"
          >
            قدّم كمستقل — مجاناً ←
          </Link>
          <a
            href="https://wa.me/966511809878?text=مرحبا، أبغى أتسجل كمستقل في خدوم"
            target="_blank"
            rel="noreferrer"
            className="bg-white/10 border border-white/20 text-white px-10 py-4 rounded-xl text-lg hover:bg-white/20 transition inline-block"
          >
            تواصل معنا عبر واتساب
          </a>
        </div>
        <p className="text-white/40 text-xs mt-6">خدوم — للمستقلين السعوديين فقط</p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedLang = localStorage.getItem("khadom-lang");
    const storedTheme = localStorage.getItem("khadom-landing-theme");
    if (storedLang === "ar" || storedLang === "en") setLang(storedLang);
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("khadom-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("khadom-landing-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0f1115] text-white" : "bg-white text-[#485869]"}`}>
      <div className="bg-[#34cc30] text-white text-center py-3 px-4">
        <p className="text-sm md:text-base">{texts[lang].alert}</p>
      </div>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedServices />
      <HowItWorks />
      <TrustSection />
      <TopFreelancers />
      <Testimonials />
      <AppDownload />
      <FAQ />
      <FreelancerJoinCTA />
      <Footer />
    </div>
  );
}

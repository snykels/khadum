'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "ar" | "en";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType>({ lang: "ar", setLang: () => {}, toggleLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = localStorage.getItem("khadom-lang") as Lang | null;
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("khadom-lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang: () => setLang(lang === "ar" ? "en" : "ar") }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

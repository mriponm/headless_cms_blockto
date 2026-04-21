"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { LANGUAGES, type LangCode } from "@/lib/i18n/languages";

type I18nCtx = { lang: LangCode; setLang: (c: LangCode) => void };
const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {} });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as LangCode | null;
    if (stored && LANGUAGES.find((l) => l.code === stored)) {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLang = (code: LangCode) => {
    setLangState(code);
    localStorage.setItem("lang", code);
    document.documentElement.lang = code;
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

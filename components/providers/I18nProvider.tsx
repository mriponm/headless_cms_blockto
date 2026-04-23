"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { LANGUAGES, type LangCode } from "@/lib/i18n/languages";
import { translations, RTL_LANGS, type TKey } from "@/lib/i18n/translations";

type I18nCtx = {
  lang: LangCode;
  setLang: (c: LangCode) => void;
  t: (key: TKey) => string;
  isRTL: boolean;
};

const Ctx = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key] ?? key,
  isRTL: false,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as LangCode | null;
    if (stored && LANGUAGES.find((l) => l.code === stored)) {
      applyLang(stored);
      setLangState(stored);
    }
  }, []);

  function applyLang(code: LangCode) {
    document.documentElement.lang = code;
    document.documentElement.dir = RTL_LANGS.has(code) ? "rtl" : "ltr";
  }

  const setLang = (code: LangCode) => {
    setLangState(code);
    localStorage.setItem("lang", code);
    applyLang(code);
  };

  const translate = useCallback(
    (key: TKey) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang],
  );

  return (
    <Ctx.Provider value={{ lang, setLang, t: translate, isRTL: RTL_LANGS.has(lang) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);

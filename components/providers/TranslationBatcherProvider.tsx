"use client";
import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, useMemo,
} from "react";
import { useI18n } from "@/components/providers/I18nProvider";

interface StoreCtx {
  lang: string;
  getTranslation: (text: string) => string;
  register: (text: string) => void;
}

const Ctx = createContext<StoreCtx>({
  lang: "en",
  getTranslation: (t) => t,
  register: () => {},
});

export const useTranslationBatcher = () => useContext(Ctx);

// -- session cache ------------------------------------------------
function sKey(text: string, lang: string) {
  return `tx3:${lang}:${text.slice(0, 80)}`;
}
function fromSession(text: string, lang: string): string | null {
  try { return sessionStorage.getItem(sKey(text, lang)); } catch { return null; }
}
function toSession(text: string, lang: string, val: string) {
  try { sessionStorage.setItem(sKey(text, lang), val); } catch {}
}

export function TranslationBatcherProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  const [store, setStore] = useState<Map<string, string>>(new Map());

  const registered = useRef<Set<string>>(new Set());
  const langRef    = useRef(lang);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef   = useRef<AbortController | null>(null);

  langRef.current = lang;

  // Core translate function — translates everything in `registered` for a given lang
  const runTranslation = useCallback((targetLang: string) => {
    if (targetLang === "en") {
      setStore(new Map());
      return;
    }

    const texts = Array.from(registered.current).filter((t) => t.trim().length >= 3);
    if (!texts.length) return;

    // Serve cached entries immediately
    const fromCache = new Map<string, string>();
    const toFetch: string[] = [];
    texts.forEach((t) => {
      const hit = fromSession(t, targetLang);
      if (hit) fromCache.set(t, hit);
      else toFetch.push(t);
    });
    if (fromCache.size) setStore(new Map(fromCache));
    if (!toFetch.length) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: toFetch, targetLang }),
      signal: ac.signal,
    })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: { translations: string[] }) => {
        if (langRef.current !== targetLang) return; // lang changed while in-flight
        setStore((prev) => {
          const next = new Map(prev);
          toFetch.forEach((text, i) => {
            const value = data.translations[i] ?? text;
            next.set(text, value);
            toSession(text, targetLang, value);
          });
          return next;
        });
      })
      .catch((e) => { if ((e as Error)?.name !== "AbortError") console.error("[translate]", e); });
  }, []); // stable — uses refs, setStore is stable

  // Register a text. If lang is already non-English, schedule a translation run.
  const register = useCallback((text: string) => {
    if (!text || text.trim().length < 3) return;
    if (registered.current.has(text)) return; // already registered
    registered.current.add(text);

    // If lang is already non-English and this text isn't translated yet, schedule batch
    if (langRef.current !== "en" && !fromSession(text, langRef.current)) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => runTranslation(langRef.current), 80);
    }
  }, [runTranslation]);

  // When lang changes, translate all currently registered texts
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    runTranslation(lang);
  }, [lang, runTranslation]);

  const getTranslation = useCallback(
    (text: string) => store.get(text) ?? text,
    [store],
  );

  const value = useMemo(
    () => ({ lang, getTranslation, register }),
    [lang, getTranslation, register],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, Languages, RotateCcw, Loader2, RefreshCw } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

interface Props {
  title: string;
  excerpt: string;
  content: string;
  takeaways: string[];
  /** Rendered between excerpt and key takeaways */
  metaSlot?: React.ReactNode;
}

interface CacheEntry {
  title: string;
  excerpt: string;
  paragraphs: string[];
  takeaways: string[];
  lang: string;
}

function readCache(cacheKey: string): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(cacheKey);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeCache(cacheKey: string, data: CacheEntry) {
  try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
}

function extractParagraphs(html: string): string[] {
  if (typeof window === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  doc.body.querySelectorAll("p, h2, h3, h4, li, blockquote").forEach((el) => {
    const text = el.textContent?.trim();
    if (text) out.push(text);
  });
  return out.length ? out : [doc.body.textContent?.trim() ?? ""];
}

function rebuildHtml(paragraphs: string[], originalHtml: string): string {
  if (typeof window === "undefined") return originalHtml;
  const doc = new DOMParser().parseFromString(originalHtml, "text/html");
  const nodes = Array.from(doc.body.querySelectorAll("p, h2, h3, h4, li, blockquote"));
  nodes.forEach((el, i) => { if (paragraphs[i] !== undefined) el.textContent = paragraphs[i]; });
  return doc.body.innerHTML;
}

export default function ArticleTranslatedBody({ title, excerpt, content, takeaways, metaSlot }: Props) {
  const { lang, t, isRTL } = useI18n();
  const [translated, setTranslated] = useState<CacheEntry | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // stable cache key: slug + lang
  const slug = useRef(
    typeof window !== "undefined" ? window.location.pathname.split("/").pop() ?? "" : ""
  ).current;
  const cacheKey = `tx:${slug}:${lang}`;

  const doTranslate = useCallback(async () => {
    if (lang === "en") return;
    setError(false);
    setLoading(true);
    try {
      const paragraphs = extractParagraphs(content);
      const texts = [title, excerpt, ...takeaways, ...paragraphs];
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLang: lang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { translations: string[] } = await res.json();
      const txTitle     = data.translations[0] ?? title;
      const txExcerpt   = data.translations[1] ?? excerpt;
      const txTakeaways = data.translations.slice(2, 2 + takeaways.length);
      const txParas     = data.translations.slice(2 + takeaways.length);
      const entry: CacheEntry = { title: txTitle, excerpt: txExcerpt, paragraphs: txParas, takeaways: txTakeaways, lang };
      writeCache(cacheKey, entry);
      setTranslated(entry);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lang, cacheKey, title, excerpt, content, takeaways]);

  // Auto-translate when lang changes away from English
  useEffect(() => {
    if (lang === "en") {
      setTranslated(null);
      setShowOriginal(false);
      setError(false);
      return;
    }
    // Check cache first
    const cached = readCache(cacheKey);
    if (cached && cached.lang === lang) {
      setTranslated(cached);
      return;
    }
    // Auto-trigger
    setTranslated(null);
    doTranslate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const isTranslated    = lang !== "en" && translated !== null && !showOriginal;
  const displayTitle    = isTranslated ? translated!.title    : title;
  const displayExcerpt  = isTranslated ? translated!.excerpt  : excerpt;
  const displayContent  = isTranslated ? rebuildHtml(translated!.paragraphs, content) : content;
  const displayTakeaways = isTranslated ? translated!.takeaways : takeaways;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Translation status bar ── */}
      {lang !== "en" && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-[10px] text-[11px] font-semibold font-[family-name:var(--font-display)]"
          style={{ background: "rgba(255,106,0,0.06)", border: "0.5px solid rgba(255,106,0,0.18)" }}>
          {loading ? (
            <>
              <Loader2 size={12} className="text-[var(--color-brand)] animate-spin flex-shrink-0" />
              <span className="text-[var(--color-brand)]">{t("article.translating")}</span>
            </>
          ) : error ? (
            <>
              <Languages size={12} className="text-[#888] flex-shrink-0" />
              <span className="text-[#888] flex-1">Translation failed</span>
              <button
                onClick={doTranslate}
                className="flex items-center gap-1 text-[10px] text-[var(--color-brand)] hover:opacity-80 transition-opacity cursor-pointer">
                <RefreshCw size={10} /> Retry
              </button>
            </>
          ) : translated ? (
            <>
              <Languages size={12} className="text-[var(--color-brand)] flex-shrink-0" />
              <span className="text-[var(--color-brand)] flex-1">{t("article.translated")}</span>
              <button
                onClick={() => setShowOriginal((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-[#888] hover:text-[var(--color-brand)] transition-colors cursor-pointer">
                <RotateCcw size={10} />
                {showOriginal ? t("article.translated") : t("article.viewOriginal")}
              </button>
            </>
          ) : (
            <>
              <Loader2 size={12} className="text-[var(--color-brand)] animate-spin flex-shrink-0" />
              <span className="text-[var(--color-brand)]">{t("article.translating")}</span>
            </>
          )}
        </div>
      )}

      {/* ── Title ── */}
      <h1 className="text-[26px] md:text-[32px] font-black tracking-[-1.2px] leading-[1.1] mb-3 art-heading font-[family-name:var(--font-display)]">
        {displayTitle}
      </h1>

      {/* ── Lead / excerpt ── */}
      <p className="text-[14px] md:text-[15px] art-lead-text leading-[1.55] font-medium font-[family-name:var(--font-display)]">
        {displayExcerpt}
      </p>

      {/* ── Meta bar slot (author, date, save) ── */}
      {metaSlot}

      {/* ── Key takeaways ── */}
      {displayTakeaways.length > 0 && (
        <div className="art-takeaways rounded-[16px] p-[18px_20px] mb-6 mt-4 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.35)] to-transparent pointer-events-none" />
          <span className="absolute top-[-30%] right-[-15%] w-[50%] h-[80%] pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,106,0,0.1),transparent 70%)", filter: "blur(25px)" }} />
          <div className="flex items-center gap-2 mb-3.5 relative z-10">
            <Zap size={14} className="text-[var(--color-brand)]" style={{ filter: "drop-shadow(0 0 4px rgba(255,106,0,0.4))" }} />
            <span className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[var(--color-brand)] font-[family-name:var(--font-display)]">
              {t("article.keyTakeaways")}
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            {displayTakeaways.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 py-[7px] text-[13px] leading-[1.5] font-medium art-body-text font-[family-name:var(--font-display)]">
                <span className="w-[18px] h-[18px] rounded-[6px] flex items-center justify-center flex-shrink-0 mt-[1px]"
                  style={{ background: "linear-gradient(135deg,#00d47b,#00a862)", boxShadow: "0 0 8px rgba(0,212,123,0.2)" }}>
                  <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7l3 3 6-6"/>
                  </svg>
                </span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Article body ── */}
      <div
        className={`mb-4 prose-wp art-body transition-opacity duration-300 ${loading ? "opacity-40 pointer-events-none" : ""}`}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    </div>
  );
}

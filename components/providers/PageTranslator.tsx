"use client";
import { useEffect, useRef } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

// -- Skip rules ----------------------------------------------------
const SKIP_TAGS = new Set([
  "SCRIPT","STYLE","CODE","PRE","INPUT","TEXTAREA",
  "SELECT","OPTION","KBD","TIME","NOSCRIPT","CANVAS","VIDEO","AUDIO",
]);
const SKIP_CLS  = ["font-data","font-jetbrains","font-mono","no-translate","coin-name","coin-symbol","coin-data"];
// Skip: pure numbers / symbols / prices / time strings
const NUM_RE    = /^[\d\s$€£¥%+\-.,:/|·•()[\]#@!?'"*^`<>=~_​]+$/;
// Skip: coin tickers, names, and price/market data strings
const COIN_SYMS = new Set([
  "BTC","ETH","SOL","BNB","XRP","DOGE","ADA","AVAX","LINK","DOT","MATIC","LTC","ATOM","UNI","SHIB",
  "TRX","NEAR","ICP","FIL","ARB","OP","APT","SUI","INJ","FTM","ALGO","VET","HBAR","EGLD","SAND",
  "MANA","AXS","THETA","XLM","EOS","AAVE","MKR","COMP","CRV","SNX","1INCH","GRT","ENS","IMX",
  "Bitcoin","Ethereum","Solana","BNB","XRP","Dogecoin","Cardano","Avalanche","Chainlink","Polkadot",
  "Polygon","Litecoin","Cosmos","Uniswap","Shiba Inu","Tron","NEAR Protocol","Internet Computer",
  "Filecoin","Arbitrum","Optimism","Aptos","Sui","Injective","Fantom","Algorand","VeChain",
  "Hedera","MultiversX",
]);
const COIN_PRICE_RE = /^[\d.,]+[KkMmBbTt]?$|^\$[\d.,]+|^[+-]?\d+\.?\d*%$/;

// -- Google lang-code overrides ------------------------------------
const LANG_MAP: Record<string,string> = { zh:"zh-CN", pt:"pt-BR" };

// -- localStorage cache -------------------------------------------
const CACHE_VER = "ptx:v3";
function cacheKey(lang: string)  { return `${CACHE_VER}:${lang}`; }
function loadCache(lang: string): Map<string,string> {
  try {
    const raw = localStorage.getItem(cacheKey(lang));
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw) as Record<string,string>));
  } catch { return new Map(); }
}
function saveCache(lang: string, map: Map<string,string>) {
  try {
    const entries = [...map.entries()].slice(-4000); // cap at 4000 strings
    localStorage.setItem(cacheKey(lang), JSON.stringify(Object.fromEntries(entries)));
  } catch {}
}

// -- DOM collection -----------------------------------------------
interface Entry { node: Text; original: string }

function collect(): Entry[] {
  const out: Entry[] = [];
  document.body.querySelectorAll<Element>("*").forEach(el => {
    if (SKIP_TAGS.has(el.tagName)) return;
    if (el.hasAttribute("data-no-translate")) return;
    const cls = typeof el.className === "string" ? el.className : "";
    if (SKIP_CLS.some(s => cls.includes(s))) return;

    el.childNodes.forEach(child => {
      if (child.nodeType !== Node.TEXT_NODE) return;
      const node = child as Text;
      const text = (node.nodeValue ?? "").trim();
      if (text.length < 2 || NUM_RE.test(text)) return;
      if (COIN_SYMS.has(text) || COIN_PRICE_RE.test(text)) return;
      out.push({ node, original: text });
    });
  });
  return out;
}

// -- Direct browser → Google Translate (no server hop) ------------
// Calls /translate_a/single for each text in parallel batches
async function gTranslate(texts: string[], tl: string): Promise<string[]> {
  const mapped = LANG_MAP[tl] ?? tl;
  const BATCH  = 20; // parallel per round

  const out: string[] = new Array(texts.length).fill("");
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map(async (text, j): Promise<[number, string]> => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${mapped}&dt=t&q=${encodeURIComponent(text)}`;
          const res  = await fetch(url);
          if (!res.ok) return [i + j, text];
          const data = await res.json() as [[string, ...unknown[]][], ...unknown[]];
          const translated = (data[0] as [string, ...unknown[]][])
            .map(item => item[0])
            .join("");
          return [i + j, translated || text];
        } catch { return [i + j, text]; }
      }),
    );
    results.forEach(([idx, val]) => { out[idx] = val; });
  }
  return out;
}

// -- Component -----------------------------------------------------
export default function PageTranslator() {
  const { lang }  = useI18n();
  const langRef   = useRef("en");
  const origMap   = useRef(new Map<Text, string>()); // node → eng original
  const store     = useRef(new Map<string, string>()); // eng → translated
  const applying  = useRef(false);

  langRef.current = lang;

  // Apply store to DOM.
  // Replaces whatever language is currently showing with the target translation.
  // Uses origMap (English original) to look up the translation.
  // Replaces the CURRENT trimmed content (any language) — no English round-trip needed.
  function applyAll() {
    applying.current = true;
    collect().forEach(({ node }) => {
      const eng = origMap.current.get(node);
      if (!eng) return;
      const tx  = store.current.get(eng);
      if (!tx || tx === eng) return;
      const cur     = node.nodeValue ?? "";
      const trimmed = cur.trim();
      if (!trimmed || trimmed === tx) return;
      // Replace whatever is currently showing (any language) with target
      node.nodeValue = cur.replace(trimmed, tx);
    });
    setTimeout(() => { applying.current = false; }, 0);
  }

  // Restore to English (only used when switching back to "en")
  function restoreAll() {
    applying.current = true;
    origMap.current.forEach((eng, node) => {
      if (!node.parentNode) return;
      const cur     = node.nodeValue ?? "";
      const trimmed = cur.trim();
      if (trimmed && trimmed !== eng) node.nodeValue = cur.replace(trimmed, eng);
    });
    origMap.current.clear();
    store.current.clear();
    setTimeout(() => { applying.current = false; }, 0);
  }

  async function translatePage(targetLang: string) {
    if (targetLang === "en") { restoreAll(); return; }

    // Clear previous language's translations from store (keep origMap intact).
    // origMap still holds English originals for every tracked node — no DOM restore needed.
    store.current.clear();

    // Collect all current nodes; register any new ones.
    // Existing nodes already have correct English originals in origMap.
    // New nodes (React re-renders) produce English text → register as-is.
    const entries = collect();
    entries.forEach(({ node, original }) => {
      if (!origMap.current.has(node)) origMap.current.set(node, original);
    });

    // ① Load localStorage cache — apply immediately (zero-delay for cached langs)
    const cached = loadCache(targetLang);
    cached.forEach((v, k) => store.current.set(k, v));
    if (store.current.size) applyAll();

    // ② Fetch only what's not cached — keyed by ENGLISH original from origMap
    const toFetch = [...new Set(
      entries
        .map(({ node, original }) => origMap.current.get(node) ?? original)
        .filter(t => !store.current.has(t))
    )].filter(Boolean);

    if (!toFetch.length) return;

    try {
      const translations = await gTranslate(toFetch, targetLang);
      if (langRef.current !== targetLang) return;

      toFetch.forEach((t, i) => store.current.set(t, translations[i] ?? t));
      saveCache(targetLang, store.current);

      // Re-collect — React may have rendered new nodes during the async fetch
      collect().forEach(({ node, original }) => {
        if (!origMap.current.has(node)) origMap.current.set(node, original);
      });
      applyAll();
    } catch (e) {
      console.error("[PageTranslator]", e);
    }
  }

  // -- Lang-change effect -----------------------------------------
  useEffect(() => {
    translatePage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // -- MutationObserver: re-translate new/reverted nodes ---------
  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout>;

    const observer = new MutationObserver(() => {
      if (applying.current || langRef.current === "en" || !store.current.size) return;
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const entries = collect();
        entries.forEach(({ node, original }) => {
          if (!origMap.current.has(node)) origMap.current.set(node, original);
        });

        // Any new texts not yet in store?
        const newTexts = [...new Set(
          entries
            .filter(({ node, original }) => !store.current.has(origMap.current.get(node) ?? original))
            .map(({ original }) => original)
        )].filter(Boolean);

        if (newTexts.length) {
          const txs = await gTranslate(newTexts, langRef.current).catch(() => newTexts);
          newTexts.forEach((t, i) => store.current.set(t, txs[i] ?? t));
          saveCache(langRef.current, store.current);
        }
        applyAll();
      }, 80);
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => { observer.disconnect(); clearTimeout(debounce); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

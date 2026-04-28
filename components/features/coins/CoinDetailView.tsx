"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Star, Bell, Globe, ExternalLink, Copy,
  TrendingUp, TrendingDown, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { formatPrice, formatPercent, formatDollarCompact } from "@/lib/utils/formatters";
import type { WPPost } from "@/lib/wordpress/types";
import CoinChart, { type HoverData } from "./CoinChart";
import AlertModal from "@/components/features/alerts/AlertModal";
import { TF_TO_INTERVAL, BINANCE_SYMBOLS } from "@/lib/binanceSymbols";
import { usePriceStore } from "@/lib/store/priceStore";

// -- Types ---------------------------------------------------------------------

interface CoinDetail {
  id: string; symbol: string; name: string; market_cap_rank: number;
  categories: string[];
  description: { en: string };
  links: { homepage: string[]; blockchain_site: string[]; repos_url: { github: string[] }; twitter_screen_name: string; subreddit_url: string; };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: { usd: number }; market_cap: { usd: number }; total_volume: { usd: number };
    high_24h: { usd: number }; low_24h: { usd: number };
    price_change_24h: number; price_change_percentage_24h: number;
    price_change_percentage_1h_in_currency: { usd: number };
    price_change_percentage_7d_in_currency: { usd: number };
    price_change_percentage_30d_in_currency: { usd: number };
    price_change_percentage_1y_in_currency: { usd: number };
    ath: { usd: number }; ath_date: { usd: string }; ath_change_percentage: { usd: number };
    atl: { usd: number }; atl_date: { usd: string }; atl_change_percentage: { usd: number };
    circulating_supply: number; total_supply: number | null; max_supply: number | null;
    fully_diluted_valuation: { usd: number } | null;
    market_cap_change_percentage_24h: number;
    sparkline_7d: { price: number[] };
  };
}

// -- Helpers -------------------------------------------------------------------

function pct(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "—";
  return formatPercent(n);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

// Mini sparkline matching the HTML price-spark dimensions
function SparkMini({ prices, w = 90, h = 40 }: { prices: number[]; w?: number; h?: number }) {
  if (!prices?.length) return null;
  const sample = prices.filter((_, i) => i % Math.ceil(prices.length / 60) === 0);
  const min = Math.min(...sample), max = Math.max(...sample);
  const range = max - min || 1;
  const pts = sample.map((v, i) => {
    const x = (i / (sample.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const up = sample[sample.length - 1] >= sample[0];
  const color = up ? "#00d47b" : "#ff3b4f";
  const [lx, ly] = pts.split(" ").pop()!.split(",").map(Number);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="flex-shrink-0 opacity-90">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${pts} ${w},${h} 0,${h}`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.8" fill={color} />
      <circle cx={lx} cy={ly} r="5.5" fill={color} opacity="0.25" />
    </svg>
  );
}

const TFS = ["4H", "1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
type TfLabel = typeof TFS[number];

// Glass card reused throughout
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`profile-card rounded-[18px] relative overflow-hidden ${className}`}>
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.12)] to-transparent pointer-events-none z-10" />
      {children}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <p className="text-[11px] font-extrabold uppercase tracking-[2px] font-[family-name:var(--font-display)]"
        style={{ color: "var(--color-text)" }}>{title}</p>
      {action && <div className="text-[10px] font-bold font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>{action}</div>}
    </div>
  );
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold uppercase tracking-[2px] mb-3 font-[family-name:var(--font-display)]"
      style={{ color: "var(--color-muted)" }}>{children}</p>
  );
}

// -- Main component ------------------------------------------------------------

export default function CoinDetailView({ coin, news }: { coin: CoinDetail; news: WPPost[] }) {
  const { resolved } = useTheme();
  const isLight = resolved === "light";
  const { openModal } = useAuthModal();

  const [showChart, setShowChart]       = useState(true);
  const [chartType, setChartType]       = useState<"candles" | "line">("candles");
  const [tfLabel, setTfLabel]           = useState<TfLabel>("1D");
  const [indicators, setIndicators]     = useState<string[]>(["EMA"]);
  const [chartHover, setChartHover]     = useState<HoverData | null>(null);
  const [inWatchlist, setInWatchlist]   = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [alertOpen, setAlertOpen]       = useState(false);
  const [copied, setCopied]             = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [chartHeight, setChartHeight]   = useState(280);

  // Live price — try explicit map first, then symbol-based fallback (covers any Binance-listed coin)
  const binSym = BINANCE_SYMBOLS[coin.id] ?? `${coin.symbol.toUpperCase()}USDT`;
  const livePrice  = usePriceStore((s) => s.prices[binSym] ?? null);
  const priceFlash = usePriceStore((s) => s.flash[binSym] ?? null);

  useEffect(() => {
    const upd = () => setChartHeight(window.innerWidth >= 1024 ? 400 : 280);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // Live price comes from global Binance combined WS via priceStore — no per-coin socket needed

  const md       = coin.market_data;
  const price    = livePrice ?? md?.current_price?.usd ?? 0;
  const change   = md?.price_change_percentage_24h ?? 0;
  const change1h = md?.price_change_percentage_1h_in_currency?.usd ?? 0;
  const change7d = md?.price_change_percentage_7d_in_currency?.usd ?? 0;
  const isUp     = change >= 0;
  const sym      = coin.symbol.toUpperCase();
  const description = stripHtml(coin.description?.en ?? "");

  const homepage = coin.links?.homepage?.[0] || "";
  const github   = coin.links?.repos_url?.github?.[0] || "";
  const twitter  = coin.links?.twitter_screen_name ? `https://twitter.com/${coin.links.twitter_screen_name}` : "";
  const explorer = coin.links?.blockchain_site?.find(s => s) || "";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null)
      .then(me => { if (!me) return; setIsLoggedIn(true); return fetch("/api/watchlist"); })
      .then(r => r && r.ok ? r.json() : null)
      .then(wl => { if (Array.isArray(wl)) setInWatchlist(wl.some((i: any) => i.coin_symbol === sym)); })
      .catch(() => {});
  }, [sym]);

  async function toggleWatchlist() {
    if (!isLoggedIn) { openModal("signin"); return; }
    setWatchLoading(true);
    try {
      if (inWatchlist) {
        await fetch(`/api/watchlist?symbol=${sym}`, { method: "DELETE" });
        setInWatchlist(false);
      } else {
        await fetch("/api/watchlist", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coin_symbol: sym, coin_name: coin.name }),
        });
        setInWatchlist(true);
      }
    } finally { setWatchLoading(false); }
  }

  const handleHover = useCallback((d: HoverData | null) => setChartHover(d), []);

  function copyExplorer() {
    if (explorer) navigator.clipboard.writeText(explorer).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const perfItems = [
    { label: "1H",  val: change1h },
    { label: "24H", val: change },
    { label: "7D",  val: change7d },
    { label: "30D", val: md.price_change_percentage_30d_in_currency?.usd ?? 0 },
    { label: "1Y",  val: md.price_change_percentage_1y_in_currency?.usd ?? 0 },
  ];

  const marketRows = [
    { label: "Market Cap",         val: md?.market_cap?.usd ? formatDollarCompact(md.market_cap.usd) : "—", sub: `${pct(md?.market_cap_change_percentage_24h)} 24h` },
    { label: "24h Volume",         val: md?.total_volume?.usd ? formatDollarCompact(md.total_volume.usd) : "—", sub: "" },
    { label: "FDV",                val: md?.fully_diluted_valuation?.usd ? formatDollarCompact(md.fully_diluted_valuation.usd) : "∞", sub: "" },
    { label: "Circulating Supply", val: md?.circulating_supply ? `${(md.circulating_supply / 1e6).toFixed(2)}M ${sym}` : "—", sub: md?.max_supply ? `${((md.circulating_supply / md.max_supply) * 100).toFixed(1)}% of max` : "" },
    { label: "Max Supply",         val: md?.max_supply ? `${(md.max_supply / 1e6).toFixed(2)}M ${sym}` : "∞", sub: "" },
    { label: "Today's High",       val: md?.high_24h?.usd ? formatPrice(md.high_24h.usd) : "—", sub: "" },
    { label: "Today's Low",        val: md?.low_24h?.usd  ? formatPrice(md.low_24h.usd)  : "—", sub: "" },
  ];

  const socialLinks = [
    homepage && { label: "Website",  href: homepage, icon: <Globe size={11} /> },
    github   && { label: "GitHub",   href: github,   icon: <ExternalLink size={11} /> },
    twitter  && { label: "Twitter",  href: twitter,  icon: <ExternalLink size={11} /> },
    explorer && { label: "Explorer", href: explorer, icon: <ExternalLink size={11} /> },
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode }[];

  // -- Render -------------------------------------------------------------------

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 sm:px-5 md:px-8 lg:px-10 pt-3 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/prices"
          className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors hover:text-[var(--color-brand)] font-[family-name:var(--font-display)]"
          style={{ color: "var(--color-muted)" }}>
          <ArrowLeft size={13} /> Prices
        </Link>
        <span className="text-[11px]" style={{ color: "var(--color-border-md)" }}>/</span>
        <span className="text-[11px] sm:text-[12px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
          {coin.name}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════
          HERO CARD — full width, matches HTML hero section
      ══════════════════════════════════════════════════ */}
      <Card className="mb-4 sm:mb-5">
        <div className="p-4 sm:p-5 md:p-6">

          {/* Identity row — same on all breakpoints */}
          <div className="flex items-center gap-3 sm:gap-4 mb-5">
            <div className="relative flex-shrink-0">
              {coin.image?.large ? (
                <Image src={coin.image.large} alt={coin.name} width={48} height={48}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
                  style={{ border: "0.5px solid rgba(255,106,0,0.3)", boxShadow: "0 0 28px rgba(255,106,0,0.28), inset 0 1px 0 rgba(255,255,255,0.2)" }}
                  unoptimized />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl font-extrabold text-black"
                  style={{ background: "var(--gradient-brand)" }}>
                  {sym.slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                <h1 className="text-[17px] sm:text-[20px] md:text-[22px] font-extrabold tracking-[-0.4px] font-[family-name:var(--font-display)]"
                  style={{ color: "var(--color-text)" }}>{coin.name}</h1>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-[5px] font-[family-name:var(--font-data)]"
                  style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)"}`, color: "var(--color-muted)" }}>{sym}</span>
                {coin.market_cap_rank && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-[5px] font-[family-name:var(--font-data)]"
                    style={{ background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.25)", color: "var(--color-brand)" }}>
                    #{coin.market_cap_rank}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {(coin.categories ?? []).slice(0, 4).filter(Boolean).map(cat => (
                  <span key={cat} className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] font-[family-name:var(--font-data)]"
                    style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.03)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}`, color: "var(--color-muted)" }}>
                    {cat.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Price + buttons: stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            {/* Price block */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-[#00d47b] shadow-[0_0_6px_#00d47b] animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[1.4px] font-[family-name:var(--font-data)]"
                  style={{ color: "#666" }}>Live Price</span>
              </div>
              <div className="text-[26px] sm:text-[30px] md:text-[34px] font-black tracking-[-1.5px] leading-none font-[family-name:var(--font-data)] transition-colors duration-300"
                style={{
                  color: priceFlash === "up"   ? "#00d47b"
                       : priceFlash === "down" ? "#ff3b4f"
                       : "var(--color-text)",
                }}>
                {formatPrice(price)}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-extrabold font-[family-name:var(--font-data)] ${isUp ? "bg-[rgba(0,212,123,0.12)] text-[#00d47b] border border-[rgba(0,212,123,0.28)]" : "bg-[rgba(255,59,79,0.12)] text-[#ff3b4f] border border-[rgba(255,59,79,0.28)]"}`}>
                  {isUp ? "▲" : "▼"} {pct(change)}
                </span>
                <span className="text-[11px] font-bold font-[family-name:var(--font-data)]" style={{ color: "#666" }}>
                  {isUp ? "+" : "–"}{formatPrice(Math.abs(md.price_change_24h))} (24h)
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap md:flex-shrink-0">
              <Link href="/buy"
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-extrabold text-black relative overflow-hidden transition-all hover:brightness-110 hover:-translate-y-0.5 font-[family-name:var(--font-display)]"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 3px 10px rgba(255,106,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-[10px] pointer-events-none" />
                <svg viewBox="0 0 12 12" className="w-[11px] h-[11px] fill-none stroke-current flex-shrink-0" strokeWidth="2.6" strokeLinecap="round"><path d="M6 2v8M2 6h8"/></svg>
                Buy {sym}
              </Link>
              <button onClick={toggleWatchlist} disabled={watchLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-extrabold border transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 font-[family-name:var(--font-display)] ${inWatchlist ? "bg-[rgba(255,106,0,0.08)] border-[rgba(255,106,0,0.25)] text-[#ff6a00]" : ""}`}
              style={!inWatchlist ? { color: "var(--color-muted)", borderColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)" } : undefined}>
                {watchLoading
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Star size={11} strokeWidth={2.2} className={inWatchlist ? "fill-current" : ""} />}
                {inWatchlist ? "Watching" : "Watchlist"}
              </button>
              <button
                onClick={() => setAlertOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-extrabold border transition-all hover:bg-[rgba(255,106,0,0.08)] hover:border-[rgba(255,106,0,0.25)] hover:text-[#ff6a00] cursor-pointer font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-muted)", borderColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)" }}>
                <Bell size={11} strokeWidth={2.2} /> Alert
              </button>
            </div>

          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════
          BODY — single col mobile, 2-col desktop
      ══════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 lg:gap-5 items-start">

        {/* -- LEFT COLUMN -- */}
        <div className="flex flex-col gap-4 sm:gap-5 min-w-0">

          {/* Chart panel */}
          {showChart && <Card>
            <div className="p-3 sm:p-4 pb-3">

              {/* Chart header */}
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex p-[3px] rounded-[10px] gap-0.5"
                  style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.4)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}` }}>
                  {(["candles", "line"] as const).map(t => (
                    <button key={t}
                      onClick={() => setChartType(t)}
                      className="flex items-center gap-1 px-2.5 py-[7px] rounded-[7px] text-[10px] font-bold cursor-pointer transition-all font-[family-name:var(--font-data)]"
                      style={chartType === t
                        ? { background: "linear-gradient(135deg,rgba(255,106,0,0.18),rgba(255,106,0,0.08))", color: "var(--color-brand)" }
                        : { color: "#888" }}>
                      {t === "candles" ? (
                        <svg viewBox="0 0 14 14" className="w-[11px] h-[11px]" fill="currentColor">
                          <rect x="3" y="4" width="2.5" height="8" rx="0.5"/>
                          <rect x="8.5" y="3" width="2.5" height="6" rx="0.5"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 14 14" className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M2 10l3-4 3 2 4-6"/>
                        </svg>
                      )}
                      {t === "candles" ? "Candles" : "Line"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {["EMA", "RSI", "VOL"].map(ind => (
                    <button key={ind}
                      onClick={() => setIndicators(p => p.includes(ind) ? p.filter(i => i !== ind) : [...p, ind])}
                      className="px-2 py-[7px] rounded-[7px] text-[9px] font-bold cursor-pointer transition-all font-[family-name:var(--font-data)]"
                      style={indicators.includes(ind)
                        ? { background: "rgba(74,158,255,0.12)", color: "#4a9eff", border: "0.5px solid rgba(74,158,255,0.3)" }
                        : { background: isLight ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.3)", color: "var(--color-muted)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}` }}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* OHLC info bar */}
              <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-[9px] mb-2.5 font-[family-name:var(--font-data)]"
                style={{ background: isLight ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.3)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)"}`, fontSize: "10px", fontWeight: 700 }}>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {chartType === "candles" ? (
                    <>
                      <span><span style={{ color: "var(--color-muted)" }}>O </span><span style={{ color: "var(--color-text)" }}>{chartHover?.open ?? "—"}</span></span>
                      <span><span style={{ color: "var(--color-muted)" }}>H </span><span style={{ color: "#00d47b" }}>{chartHover?.high ?? "—"}</span></span>
                      <span><span style={{ color: "var(--color-muted)" }}>L </span><span style={{ color: "#ff3b4f" }}>{chartHover?.low ?? "—"}</span></span>
                      <span><span style={{ color: "var(--color-muted)" }}>C </span><span style={{ color: chartHover?.isUp ? "#00d47b" : "#ff3b4f" }}>{chartHover?.close ?? "—"}</span></span>
                    </>
                  ) : (
                    <span style={{ color: "var(--color-text)" }}>{chartHover?.value ?? formatPrice(price)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {indicators.includes("EMA") && <span style={{ color: "#4a9eff", fontSize: 10, fontWeight: 700 }}>EMA 20</span>}
                  {indicators.includes("RSI") && <span style={{ color: "#b16aff", fontSize: 10, fontWeight: 700 }}>RSI 14</span>}
                </div>
              </div>

              {/* Chart */}
              <CoinChart
                coinId={coin.id}
                symbol={coin.symbol}
                type={chartType}
                interval={TF_TO_INTERVAL[tfLabel].interval}
                limit={TF_TO_INTERVAL[tfLabel].limit}
                isLight={isLight}
                height={chartHeight}
                onHoverChange={handleHover}
                onNoChart={() => setShowChart(false)}
                indicators={indicators}
              />

              {/* Timeframe bar */}
              <div className="flex p-[3px] rounded-[10px] gap-px mt-3"
                style={{ background: isLight ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.4)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}` }}>
                {TFS.map(tf => (
                  <button key={tf} onClick={() => setTfLabel(tf)}
                    className="flex-1 py-2 rounded-[7px] text-[10px] font-bold cursor-pointer text-center transition-all font-[family-name:var(--font-data)]"
                    style={tfLabel === tf
                      ? { background: "linear-gradient(135deg,rgba(255,106,0,0.18),rgba(255,106,0,0.08))", color: "var(--color-brand)" }
                      : { color: "#666" }}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </Card>}

          {/* Performance */}
          <div>
            <SectionHeader title="Performance" action="VS USD" />
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {perfItems.map(item => (
                <div key={item.label} className="profile-card py-3 px-1 rounded-[10px] text-center relative overflow-hidden">
                  <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <p className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.4px] mb-1.5 font-[family-name:var(--font-data)]" style={{ color: "#666" }}>
                    {item.label}
                  </p>
                  <p className={`text-[10px] sm:text-[12px] font-extrabold font-[family-name:var(--font-data)] ${item.val >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>
                    {pct(item.val)}
                  </p>
                </div>
              ))}
            </div>

            {/* ATH / ATL */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { label: "ALL-TIME HIGH", icon: <TrendingUp size={10} />, val: md?.ath?.usd ?? 0, delta: md?.ath_change_percentage?.usd ?? 0, date: md?.ath_date?.usd ?? "" },
                { label: "ALL-TIME LOW",  icon: <TrendingDown size={10} />, val: md?.atl?.usd ?? 0, delta: md?.atl_change_percentage?.usd ?? 0, date: md?.atl_date?.usd ?? "" },
              ].map(item => (
                <div key={item.label} className="profile-card p-3 rounded-[12px] relative overflow-hidden">
                  <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <div className="flex items-center gap-1 mb-1.5" style={{ color: "#666" }}>
                    {item.icon}
                    <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.4px] font-[family-name:var(--font-data)]">{item.label}</span>
                  </div>
                  <p className="text-[14px] sm:text-[15px] font-extrabold font-[family-name:var(--font-data)] mb-1" style={{ color: "var(--color-text)" }}>
                    {formatPrice(item.val)}
                  </p>
                  <p className={`text-[10px] font-bold font-[family-name:var(--font-data)] ${item.delta >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>
                    {item.delta >= 0 ? "▲" : "▼"} {pct(item.delta)}
                  </p>
                  <p className="text-[9px] mt-0.5 font-[family-name:var(--font-data)]" style={{ color: "#555" }}>
                    {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Data — mobile only (visible below lg) */}
          <div className="lg:hidden">
            <SectionHeader title="Market Data" action="LIVE" />
            <Card>
              {marketRows.map((row, i) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3.5"
                  style={{ borderBottom: i < marketRows.length - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span className="text-[12px] font-medium font-[family-name:var(--font-display)]" style={{ color: "#888" }}>{row.label}</span>
                  <div className="text-right">
                    <p className="text-[12px] sm:text-[13px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>{row.val}</p>
                    {row.sub && <p className="text-[10px] font-semibold mt-0.5 font-[family-name:var(--font-data)]"
                      style={{ color: row.sub.startsWith("+") ? "#00d47b" : row.sub.startsWith("-") ? "#ff3b4f" : "#555" }}>{row.sub}</p>}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* About */}
          {description && (
            <div>
              <SectionHeader title={`About ${coin.name}`} />
              <Card>
                <div className="px-4 py-4">
                  <p className={`text-[12px] sm:text-[13px] leading-[1.7] font-[family-name:var(--font-display)] ${!descExpanded ? "line-clamp-5" : ""}`}
                    style={{ color: "#888" }}>
                    {description}
                  </p>
                  {description.length > 300 && (
                    <button onClick={() => setDescExpanded(v => !v)}
                      className="flex items-center gap-1 mt-2.5 text-[11px] font-bold cursor-pointer font-[family-name:var(--font-display)]"
                      style={{ color: "var(--color-brand)" }}>
                      {descExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                    </button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Contract & Info — mobile only */}
          <div className="lg:hidden">
            <SectionHeader title="Contract & Info" action="OFFICIAL" />
            <Card>
              <div className="px-4 py-2">
                {explorer && (
                  <div className="flex items-center justify-between py-3" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-[11px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "#888" }}>Explorer</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>
                        {(() => { try { return new URL(explorer).hostname.replace("www.", ""); } catch { return explorer; } })()}
                      </span>
                      <button onClick={copyExplorer} className="w-6 h-6 rounded-[6px] flex items-center justify-center cursor-pointer transition-all"
                        style={copied ? { background: "rgba(0,212,123,0.15)", border: "0.5px solid rgba(0,212,123,0.3)" } : { background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }}>
                        <Copy size={10} style={{ color: copied ? "#00d47b" : "#888" }} />
                      </button>
                    </div>
                  </div>
                )}
                {socialLinks.length > 0 && (
                  <div className="flex gap-1.5 py-3 flex-wrap">
                    {socialLinks.map(link => (
                      <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 px-2 rounded-[9px] text-[10px] font-bold transition-all hover:text-[#ff6a00] font-[family-name:var(--font-display)]"
                        style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}`, color: "var(--color-muted)" }}>
                        {link.icon} {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* News */}
          {news.length > 0 && (
            <div>
              <SectionHeader title="Latest News" action={<Link href={`/category/${coin.id}`}>SEE ALL →</Link>} />
              <div className="flex flex-col gap-2">
                {news.map(post => (
                  <Link key={post.id} href={`/post/${post.slug}`} style={{ textDecoration: "none" }}>
                    <Card className="flex gap-3 p-3 cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.04)]">
                      {post.featuredImage?.node?.sourceUrl && (
                        <div className="w-16 h-16 rounded-[10px] flex-shrink-0 overflow-hidden bg-[rgba(255,255,255,0.03)]">
                          <img src={post.featuredImage.node.sourceUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <p className="text-[12px] font-bold leading-[1.38] line-clamp-2 font-[family-name:var(--font-display)]"
                          style={{ color: "var(--color-text)" }}
                          dangerouslySetInnerHTML={{ __html: post.title }} />
                        <p className="text-[9px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "#555" }}>
                          <span style={{ color: "#aaa" }}>{post.author?.node?.name}</span>
                          {" · "}{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* -- RIGHT SIDEBAR — desktop only -- */}
        <div className="hidden lg:flex flex-col gap-4 sticky top-[76px]">

          {/* Market Data */}
          <div>
            <SectionHeader title="Market Data" action="LIVE" />
            <Card>
              {marketRows.map((row, i) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: i < marketRows.length - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span className="text-[12px] font-medium font-[family-name:var(--font-display)]" style={{ color: "#888" }}>{row.label}</span>
                  <div className="text-right">
                    <p className="text-[12px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>{row.val}</p>
                    {row.sub && <p className="text-[10px] font-semibold mt-0.5 font-[family-name:var(--font-data)]"
                      style={{ color: row.sub.startsWith("+") ? "#00d47b" : row.sub.startsWith("-") ? "#ff3b4f" : "#555" }}>{row.sub}</p>}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Links & Info */}
          <div>
            <SectionHeader title="Links & Info" action="OFFICIAL" />
            <Card>
              <div className="px-4 py-2">
                {explorer && (
                  <div className="flex items-center justify-between py-3" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-[11px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "#888" }}>Explorer</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>
                        {(() => { try { return new URL(explorer).hostname.replace("www.", ""); } catch { return explorer; } })()}
                      </span>
                      <button onClick={copyExplorer} className="w-6 h-6 rounded-[6px] flex items-center justify-center cursor-pointer transition-all"
                        style={copied ? { background: "rgba(0,212,123,0.15)", border: "0.5px solid rgba(0,212,123,0.3)" } : { background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }}>
                        <Copy size={10} style={{ color: copied ? "#00d47b" : "#888" }} />
                      </button>
                    </div>
                  </div>
                )}
                {socialLinks.length > 0 && (
                  <div className="flex gap-1.5 py-3 flex-wrap">
                    {socialLinks.map(link => (
                      <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 px-2 rounded-[9px] text-[10px] font-bold transition-all hover:text-[#ff6a00] hover:border-[rgba(255,106,0,0.2)] font-[family-name:var(--font-display)]"
                        style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}`, color: "var(--color-muted)" }}>
                        {link.icon} {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Historical Data */}
          <div>
            <SectionHeader title="Historical Data" />
            <div className="flex flex-col gap-2">
              <div className="rounded-[14px] p-4 relative overflow-hidden"
                style={{ background: "rgba(0,212,123,0.04)", border: "0.5px solid rgba(0,212,123,0.18)" }}>
                <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,123,0.2)] to-transparent" />
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp size={10} className="text-[#00d47b]" />
                  <span className="text-[8px] font-extrabold uppercase tracking-[1px] text-[#00d47b] font-[family-name:var(--font-data)]">All-Time High</span>
                </div>
                <p className="text-[18px] font-extrabold font-[family-name:var(--font-data)] leading-none mb-1.5" style={{ color: "var(--color-text)" }}>
                  {md?.ath?.usd ? formatPrice(md.ath.usd) : "—"}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold font-[family-name:var(--font-data)] text-[#ff3b4f]">{pct(md?.ath_change_percentage?.usd)} from ATH</p>
                  <p className="text-[9px] font-[family-name:var(--font-data)]" style={{ color: "#555" }}>
                    {md?.ath_date?.usd ? new Date(md.ath_date.usd).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-[14px] p-4 relative overflow-hidden"
                style={{ background: "rgba(255,59,79,0.04)", border: "0.5px solid rgba(255,59,79,0.18)" }}>
                <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,59,79,0.2)] to-transparent" />
                <div className="flex items-center gap-1 mb-2">
                  <TrendingDown size={10} className="text-[#ff3b4f]" />
                  <span className="text-[8px] font-extrabold uppercase tracking-[1px] text-[#ff3b4f] font-[family-name:var(--font-data)]">All-Time Low</span>
                </div>
                <p className="text-[18px] font-extrabold font-[family-name:var(--font-data)] leading-none mb-1.5" style={{ color: "var(--color-text)" }}>
                  {md?.atl?.usd ? formatPrice(md.atl.usd) : "—"}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold font-[family-name:var(--font-data)] text-[#00d47b]">{pct(md?.atl_change_percentage?.usd)} from ATL</p>
                  <p className="text-[9px] font-[family-name:var(--font-data)]" style={{ color: "#555" }}>
                    {md?.atl_date?.usd ? new Date(md.atl_date.usd).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              {md.max_supply && (
                <Card>
                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold font-[family-name:var(--font-data)]" style={{ color: "#888" }}>Circulating Supply</span>
                      <span className="text-[11px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: "var(--color-brand)" }}>
                        {((md.circulating_supply / md.max_supply) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-[3px] rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.min((md.circulating_supply / md.max_supply) * 100, 100)}%`, background: "linear-gradient(90deg,#ff6a00,#ffaa44)" }} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-[family-name:var(--font-data)]" style={{ color: "#666" }}>
                        {(md.circulating_supply / 1e6).toFixed(2)}M {sym}
                      </span>
                      <span className="text-[10px] font-[family-name:var(--font-data)]" style={{ color: "#666" }}>
                        Max {(md.max_supply / 1e6).toFixed(2)}M
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>

      {alertOpen && (
        <AlertModal
          coinId={coin.id}
          coinSymbol={sym}
          coinName={coin.name}
          currentPrice={price}
          isLoggedIn={isLoggedIn}
          isLight={isLight}
          onClose={() => setAlertOpen(false)}
        />
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
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
import CoinChart from "./CoinChart";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  categories: string[];
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    repos_url: { github: string[] };
    twitter_screen_name: string;
    subreddit_url: string;
  };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_1h_in_currency: { usd: number };
    price_change_percentage_7d_in_currency: { usd: number };
    price_change_percentage_30d_in_currency: { usd: number };
    price_change_percentage_1y_in_currency: { usd: number };
    ath: { usd: number };
    ath_date: { usd: string };
    ath_change_percentage: { usd: number };
    atl: { usd: number };
    atl_date: { usd: string };
    atl_change_percentage: { usd: number };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    fully_diluted_valuation: { usd: number } | null;
    market_cap_change_percentage_24h: number;
    sparkline_7d: { price: number[] };
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "—";
  return formatPercent(n);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .trim();
}

function SparklineMini({
  prices, w = 80, h = 36,
}: { prices: number[]; w?: number; h?: number }) {
  if (!prices?.length) return null;
  const sample = prices.filter((_, i) => i % Math.ceil(prices.length / 80) === 0);
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  const range = max - min || 1;
  const pts = sample.map((v, i) => {
    const x = (i / (sample.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const up = sample[sample.length - 1] >= sample[0];
  const color = up ? "#00d47b" : "#ff3b4f";
  const lastPt = pts.split(" ").pop()!;
  const [lx, ly] = lastPt.split(",").map(Number);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spkGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${pts} ${w},${h} 0,${h}`} fill="url(#spkGrad2)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}

const TFS = [
  { label: "1D",  days: "1"   },
  { label: "1W",  days: "7"   },
  { label: "1M",  days: "30"  },
  { label: "3M",  days: "90"  },
  { label: "1Y",  days: "365" },
  { label: "ALL", days: "max" },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`profile-card rounded-[20px] overflow-hidden relative ${className}`}>
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.18)] to-transparent pointer-events-none z-10" />
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold uppercase tracking-[2px] mb-4 font-[family-name:var(--font-display)]"
      style={{ color: "var(--color-muted)" }}>
      {children}
    </p>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CoinDetailView({ coin, news }: { coin: CoinDetail; news: WPPost[] }) {
  const { resolved } = useTheme();
  const isLight = resolved === "light";
  const { openModal } = useAuthModal();

  const [chartHeight, setChartHeight] = useState(280);
  useEffect(() => {
    const update = () => setChartHeight(window.innerWidth >= 1024 ? 420 : 280);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [chartType, setChartType]       = useState<"candles" | "line">("candles");
  const [timeframe, setTimeframe]       = useState("1");
  const [indicators, setIndicators]     = useState<string[]>(["EMA"]);
  const [inWatchlist, setInWatchlist]   = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [copied, setCopied]             = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const md       = coin.market_data;
  const price    = md.current_price.usd;
  const change   = md.price_change_percentage_24h;
  const change1h = md.price_change_percentage_1h_in_currency?.usd ?? 0;
  const change7d = md.price_change_percentage_7d_in_currency?.usd ?? 0;
  const isUp     = change >= 0;
  const sym      = coin.symbol.toUpperCase();
  const description = stripHtml(coin.description?.en ?? "");

  const homepage = coin.links?.homepage?.[0] || "";
  const github   = coin.links?.repos_url?.github?.[0] || "";
  const twitter  = coin.links?.twitter_screen_name
    ? `https://twitter.com/${coin.links.twitter_screen_name}` : "";
  const explorer = coin.links?.blockchain_site?.find(s => s) || "";

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(me => { if (!me) return; setIsLoggedIn(true); return fetch("/api/watchlist"); })
      .then(r => (r && r.ok ? r.json() : null))
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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coin_symbol: sym, coin_name: coin.name }),
        });
        setInWatchlist(true);
      }
    } finally { setWatchLoading(false); }
  }

  function copyExplorer() {
    if (explorer) navigator.clipboard.writeText(explorer).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  // ── Data arrays ──────────────────────────────────────────────────────────────

  const perfItems = [
    { label: "1H",  val: change1h },
    { label: "24H", val: change },
    { label: "7D",  val: change7d },
    { label: "30D", val: md.price_change_percentage_30d_in_currency?.usd ?? 0 },
    { label: "1Y",  val: md.price_change_percentage_1y_in_currency?.usd ?? 0 },
  ];

  const marketRows = [
    { label: "Market Cap",          val: formatDollarCompact(md.market_cap.usd),   sub: `${pct(md.market_cap_change_percentage_24h)} 24h` },
    { label: "24h Volume",          val: formatDollarCompact(md.total_volume.usd), sub: "" },
    { label: "FDV",                 val: md.fully_diluted_valuation?.usd ? formatDollarCompact(md.fully_diluted_valuation.usd) : "∞", sub: "" },
    { label: "Today's High",        val: formatPrice(md.high_24h.usd),             sub: "" },
    { label: "Today's Low",         val: formatPrice(md.low_24h.usd),              sub: "" },
    { label: "Circulating Supply",  val: `${(md.circulating_supply / 1e6).toFixed(2)}M ${sym}`, sub: md.max_supply ? `${((md.circulating_supply / md.max_supply) * 100).toFixed(1)}% of max` : "" },
    { label: "Max Supply",          val: md.max_supply ? `${(md.max_supply / 1e6).toFixed(2)}M ${sym}` : "∞", sub: "" },
  ];

  // Quick stats shown in hero right panel (desktop only)
  const quickStats = [
    { label: "Market Cap",  val: formatDollarCompact(md.market_cap.usd), sub: pct(md.market_cap_change_percentage_24h), subUp: md.market_cap_change_percentage_24h >= 0 },
    { label: "24h Volume",  val: formatDollarCompact(md.total_volume.usd), sub: "", subUp: true },
    { label: "7D Change",   val: pct(change7d),   sub: "", subUp: change7d >= 0, valColor: change7d >= 0 ? "#00d47b" : "#ff3b4f" },
    { label: "Rank",        val: coin.market_cap_rank ? `#${coin.market_cap_rank}` : "—", sub: "By Market Cap", subUp: true },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-8 lg:px-10 pt-3 pb-24">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <Link href="/prices"
          className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:text-[var(--color-brand)] font-[family-name:var(--font-display)]"
          style={{ color: "var(--color-muted)" }}>
          <ArrowLeft size={14} /> Prices
        </Link>
        <span className="text-[12px]" style={{ color: "var(--color-border-md)" }}>/</span>
        <span className="text-[12px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
          {coin.name}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════
          HERO — full width, 2-col inside on desktop
      ═══════════════════════════════════════════════ */}
      <Card className="mb-5">
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-[120px] pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,106,0,0.1) 0%, rgba(255,80,0,0.04) 50%, transparent 100%)", borderRadius: "20px 20px 0 0" }} />

        <div className="relative p-5 md:p-7">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

            {/* ── LEFT: identity + price + actions ── */}
            <div className="flex-1 min-w-0">

              {/* Identity row */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative flex-shrink-0">
                  {coin.image?.large ? (
                    <Image
                      src={coin.image.large} alt={coin.name}
                      width={64} height={64}
                      className="rounded-full w-14 h-14 md:w-16 md:h-16"
                      style={{ border: "2.5px solid rgba(255,106,0,0.35)", boxShadow: "0 0 24px rgba(255,106,0,0.2), 0 4px 12px rgba(0,0,0,0.4)" }}
                      unoptimized
                    />
                  ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl font-extrabold text-black"
                      style={{ background: "var(--gradient-brand)", boxShadow: "0 0 24px rgba(255,106,0,0.25)" }}>
                      {sym.slice(0, 2)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00d47b] border-2 border-black shadow-[0_0_6px_#00d47b]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h1 className="text-[24px] md:text-[30px] font-black tracking-[-0.6px] font-[family-name:var(--font-display)]"
                      style={{ color: "var(--color-text)" }}>
                      {coin.name}
                    </h1>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-[7px] font-[family-name:var(--font-data)]"
                      style={{ background: "var(--color-surface-md)", border: "0.5px solid var(--color-border-md)", color: "var(--color-muted)" }}>
                      {sym}
                    </span>
                    {coin.market_cap_rank && (
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-[7px] font-[family-name:var(--font-data)]"
                        style={{ background: "rgba(255,106,0,0.12)", border: "0.5px solid rgba(255,106,0,0.3)", color: "var(--color-brand)" }}>
                        #{coin.market_cap_rank}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(coin.categories ?? []).slice(0, 4).filter(Boolean).map(cat => (
                      <span key={cat} className="text-[9px] font-bold px-2 py-0.5 rounded-[5px] font-[family-name:var(--font-data)] uppercase"
                        style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", color: "var(--color-muted)" }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mobile sparkline */}
                <div className="lg:hidden flex-shrink-0 self-center opacity-80">
                  <SparklineMini prices={md.sparkline_7d?.price ?? []} w={80} h={36} />
                </div>
              </div>

              {/* Price block */}
              <div className="mb-7">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d47b] shadow-[0_0_8px_#00d47b] animate-pulse inline-block" />
                  <span className="text-[9px] font-extrabold uppercase tracking-[2px] font-[family-name:var(--font-data)]"
                    style={{ color: "var(--color-muted)" }}>Live Price</span>
                </div>
                <div className="flex items-end gap-3 flex-wrap mb-3">
                  <span className="text-[38px] md:text-[50px] font-black tracking-[-2.5px] leading-none font-[family-name:var(--font-data)]"
                    style={{ color: "var(--color-text)" }}>
                    {formatPrice(price)}
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[13px] font-extrabold font-[family-name:var(--font-data)] ${isUp ? "text-[#00d47b] bg-[rgba(0,212,123,0.1)] border border-[rgba(0,212,123,0.25)]" : "text-[#ff3b4f] bg-[rgba(255,59,79,0.1)] border border-[rgba(255,59,79,0.25)]"}`}>
                      {isUp ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                      {pct(change)}
                    </span>
                    <span className="text-[12px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                      {isUp ? "+" : ""}{formatPrice(Math.abs(md.price_change_24h))} (24h)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  {[
                    { label: "H",  val: formatPrice(md.high_24h.usd), color: "#00d47b" },
                    { label: "L",  val: formatPrice(md.low_24h.usd),  color: "#ff3b4f" },
                    { label: "1H", val: pct(change1h), color: change1h >= 0 ? "#00d47b" : "#ff3b4f" },
                  ].map(s => (
                    <span key={s.label} className="text-[12px] font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                      {s.label}: <span className="font-bold" style={{ color: s.color }}>{s.val}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 flex-wrap">
                <Link href="/buy"
                  className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-[13px] text-[13px] font-extrabold text-black transition-all hover:brightness-110 hover:-translate-y-0.5 font-[family-name:var(--font-display)] relative overflow-hidden"
                  style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 16px rgba(255,106,0,0.35),inset 0 1px 0 rgba(255,255,255,0.25)" }}>
                  <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-[13px] pointer-events-none" />
                  Buy {sym}
                </Link>
                <button onClick={toggleWatchlist} disabled={watchLoading}
                  className={`flex items-center justify-center gap-1.5 px-5 py-3 rounded-[13px] text-[13px] font-extrabold border transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 font-[family-name:var(--font-display)] ${inWatchlist ? "border-[rgba(255,106,0,0.35)] bg-[rgba(255,106,0,0.08)]" : "border-[var(--color-border-md)] bg-[var(--color-surface)]"}`}
                  style={{ color: inWatchlist ? "var(--color-brand)" : "var(--color-text)" }}>
                  {watchLoading
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Star size={13} strokeWidth={2.5} className={inWatchlist ? "fill-current" : ""} />}
                  {inWatchlist ? "Watching" : "Add to Watchlist"}
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-[13px] text-[13px] font-extrabold border transition-all hover:border-[rgba(255,106,0,0.3)] hover:-translate-y-0.5 cursor-pointer font-[family-name:var(--font-display)]"
                  style={{ color: "var(--color-text)", borderColor: "var(--color-border-md)", background: "var(--color-surface)" }}>
                  <Bell size={13} strokeWidth={2.5} /> Alert
                </button>
              </div>
            </div>

            {/* ── RIGHT: stats card matching Market Data style (desktop only) ── */}
            <div className="hidden lg:block w-[290px] flex-shrink-0">
              <div className="rounded-[18px] overflow-hidden h-full"
                style={{ background: "rgba(255,255,255,0.025)", border: "0.5px solid var(--color-border)" }}>

                {/* Sparkline header */}
                <div className="px-4 pt-4 pb-3 relative"
                  style={{ borderBottom: "0.5px solid var(--color-border)" }}>
                  <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.2)] to-transparent" />
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-[1.5px] font-[family-name:var(--font-data)]"
                      style={{ color: "var(--color-muted)" }}>7D Chart</span>
                    <span className={`text-[11px] font-extrabold font-[family-name:var(--font-data)] ${change7d >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>
                      {pct(change7d)}
                    </span>
                  </div>
                  <SparklineMini prices={md.sparkline_7d?.price ?? []} w={258} h={64} />
                </div>

                {/* Stats rows — same style as Market Data sidebar */}
                {quickStats.map((row, i) => (
                  <div key={row.label}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: i < quickStats.length - 1 ? "0.5px solid var(--color-border)" : "none" }}>
                    <span className="text-[12px] font-medium font-[family-name:var(--font-display)]"
                      style={{ color: "var(--color-muted)" }}>
                      {row.label}
                    </span>
                    <div className="text-right">
                      <p className="text-[13px] font-extrabold font-[family-name:var(--font-data)]"
                        style={{ color: row.valColor ?? "var(--color-text)" }}>
                        {row.val}
                      </p>
                      {row.sub && (
                        <p className="text-[10px] font-semibold mt-0.5 font-[family-name:var(--font-data)]"
                          style={{ color: row.subUp ? "#00d47b" : "#ff3b4f" }}>
                          {row.sub}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════
          BODY — 2-column grid on desktop
      ═══════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">

        {/* ── LEFT COLUMN ─────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Chart panel */}
          <Card>
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex p-1 rounded-[10px] gap-0.5"
                  style={{ background: "rgba(0,0,0,0.3)", border: "0.5px solid var(--color-border)" }}>
                  {(["candles", "line"] as const).map(t => (
                    <button key={t} onClick={() => setChartType(t)}
                      className="px-3.5 py-1.5 rounded-[7px] text-[10px] font-bold cursor-pointer transition-all font-[family-name:var(--font-data)]"
                      style={chartType === t
                        ? { background: "rgba(255,106,0,0.15)", color: "var(--color-brand)" }
                        : { color: "var(--color-muted)" }}>
                      {t === "candles" ? "Candles" : "Line"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {["EMA", "RSI", "VOL"].map(ind => (
                    <button key={ind}
                      onClick={() => setIndicators(p => p.includes(ind) ? p.filter(i => i !== ind) : [...p, ind])}
                      className="px-2.5 py-1.5 rounded-[7px] text-[9px] font-bold cursor-pointer transition-all font-[family-name:var(--font-data)]"
                      style={indicators.includes(ind)
                        ? { background: "rgba(74,158,255,0.1)", color: "#4a9eff", border: "0.5px solid rgba(74,158,255,0.25)" }
                        : { background: "rgba(0,0,0,0.25)", color: "var(--color-muted)", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <CoinChart
                coinId={coin.id}
                type={chartType}
                days={timeframe}
                isLight={isLight}
                height={chartHeight}
              />

              <div className="flex p-1 rounded-[10px] gap-0.5 mt-3"
                style={{ background: "rgba(0,0,0,0.3)", border: "0.5px solid var(--color-border)" }}>
                {TFS.map(tf => (
                  <button key={tf.days} onClick={() => setTimeframe(tf.days)}
                    className="flex-1 py-2 rounded-[7px] text-[10px] font-bold cursor-pointer text-center transition-all font-[family-name:var(--font-data)]"
                    style={timeframe === tf.days
                      ? { background: "rgba(255,106,0,0.15)", color: "var(--color-brand)" }
                      : { color: "var(--color-muted)" }}>
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Performance + ATH/ATL */}
          <Card>
            <div className="p-4 pb-5">
              <SectionLabel>Performance</SectionLabel>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {perfItems.map(item => (
                  <div key={item.label} className="rounded-[12px] py-3.5 px-2 text-center relative overflow-hidden"
                    style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)" }}>
                    <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.5px] mb-2 font-[family-name:var(--font-data)]"
                      style={{ color: "var(--color-muted)" }}>
                      {item.label}
                    </p>
                    <p className={`text-[13px] font-extrabold font-[family-name:var(--font-data)] ${item.val >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>
                      {pct(item.val)}
                    </p>
                  </div>
                ))}
              </div>

              {/* ATH / ATL */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "All-Time High", icon: <TrendingUp size={11} />, val: md.ath.usd, delta: md.ath_change_percentage.usd, date: md.ath_date.usd },
                  { label: "All-Time Low",  icon: <TrendingDown size={11} />, val: md.atl.usd, delta: md.atl_change_percentage.usd, date: md.atl_date.usd },
                ].map(item => (
                  <div key={item.label} className="rounded-[14px] p-4 relative overflow-hidden"
                    style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)" }}>
                    <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.5px] mb-2 font-[family-name:var(--font-data)]"
                      style={{ color: "var(--color-muted)" }}>
                      {item.icon} {item.label}
                    </p>
                    <p className="text-[18px] font-extrabold font-[family-name:var(--font-data)] mb-1"
                      style={{ color: "var(--color-text)" }}>
                      {formatPrice(item.val)}
                    </p>
                    <p className={`text-[11px] font-bold font-[family-name:var(--font-data)] ${item.delta >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>
                      {pct(item.delta)} from {item.label === "All-Time High" ? "ATH" : "ATL"}
                    </p>
                    <p className="text-[9px] mt-0.5 font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                      {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* News */}
          {news.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[2px] font-[family-name:var(--font-display)]"
                  style={{ color: "var(--color-text)" }}>Latest news</p>
                <Link href={`/category/${coin.id}`}
                  className="text-[10px] font-bold hover:text-[var(--color-brand)] transition-colors font-[family-name:var(--font-data)]"
                  style={{ color: "var(--color-muted)" }}>SEE ALL →</Link>
              </div>
              <div className="flex flex-col gap-2">
                {news.map(post => (
                  <Link key={post.id} href={`/post/${post.slug}`}
                    className="flex gap-3 p-3 rounded-[14px] transition-all hover:border-[rgba(255,106,0,0.2)] profile-card"
                    style={{ textDecoration: "none" }}>
                    {post.featuredImage?.node?.sourceUrl && (
                      <div className="w-[72px] h-[72px] rounded-[10px] flex-shrink-0 overflow-hidden"
                        style={{ background: "var(--color-surface)" }}>
                        <img src={post.featuredImage.node.sourceUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold leading-[1.38] mb-1.5 line-clamp-2 font-[family-name:var(--font-display)]"
                        style={{ color: "var(--color-text)" }}
                        dangerouslySetInnerHTML={{ __html: post.title }} />
                      <p className="text-[10px] font-semibold font-[family-name:var(--font-data)]"
                        style={{ color: "var(--color-muted)" }}>
                        {post.author?.node?.name} · {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ───────────────────────── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-[76px]">

          {/* Market data */}
          <Card>
            <div className="p-4">
              <SectionLabel>Market Data</SectionLabel>
              <div className="rounded-[14px] overflow-hidden"
                style={{ border: "0.5px solid var(--color-border)" }}>
                {marketRows.map((row, i) => (
                  <div key={row.label}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: i < marketRows.length - 1 ? "0.5px solid var(--color-border)" : "none" }}>
                    <span className="text-[12px] font-medium font-[family-name:var(--font-display)]"
                      style={{ color: "var(--color-muted)" }}>
                      {row.label}
                    </span>
                    <div className="text-right">
                      <p className="text-[12px] font-extrabold font-[family-name:var(--font-data)]"
                        style={{ color: "var(--color-text)" }}>
                        {row.val}
                      </p>
                      {row.sub && (
                        <p className="text-[10px] font-semibold mt-0.5 font-[family-name:var(--font-data)]"
                          style={{ color: row.sub.startsWith("+") ? "#00d47b" : row.sub.startsWith("-") ? "#ff3b4f" : "var(--color-muted)" }}>
                          {row.sub}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* About */}
          {description && (
            <Card>
              <div className="p-4">
                <SectionLabel>About {coin.name}</SectionLabel>
                <p className={`text-[12px] leading-[1.7] font-[family-name:var(--font-display)] ${!descExpanded ? "line-clamp-5" : ""}`}
                  style={{ color: "var(--color-muted)" }}>
                  {description}
                </p>
                {description.length > 260 && (
                  <button onClick={() => setDescExpanded(v => !v)}
                    className="flex items-center gap-1 mt-2.5 text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity font-[family-name:var(--font-display)]"
                    style={{ color: "var(--color-brand)" }}>
                    {descExpanded
                      ? <><ChevronUp size={12} /> Show less</>
                      : <><ChevronDown size={12} /> Read more</>}
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Links & Info */}
          <Card>
            <div className="p-4">
              <SectionLabel>Links & Info</SectionLabel>

              {explorer && (
                <div className="flex items-center justify-between py-2.5 mb-3 border-b"
                  style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-[12px] font-medium font-[family-name:var(--font-display)]"
                    style={{ color: "var(--color-muted)" }}>Explorer</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold font-[family-name:var(--font-data)]"
                      style={{ color: "var(--color-text)" }}>
                      {(() => { try { return new URL(explorer).hostname.replace("www.", ""); } catch { return explorer; } })()}
                    </span>
                    <button onClick={copyExplorer}
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center transition-all cursor-pointer"
                      style={copied
                        ? { background: "rgba(0,212,123,0.15)", border: "0.5px solid rgba(0,212,123,0.3)" }
                        : { background: "var(--color-surface)", border: "0.5px solid var(--color-border-md)" }}>
                      <Copy size={10} style={{ color: copied ? "#00d47b" : "var(--color-muted)" }} />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {([
                  homepage && { label: "Website",  href: homepage, icon: <Globe size={11} /> },
                  github   && { label: "GitHub",   href: github,   icon: <ExternalLink size={11} /> },
                  twitter  && { label: "Twitter",  href: twitter,  icon: <ExternalLink size={11} /> },
                  explorer && { label: "Explorer", href: explorer, icon: <ExternalLink size={11} /> },
                ] as any[]).filter(Boolean).map((link: any) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] text-[11px] font-bold transition-all hover:border-[rgba(255,106,0,0.3)] hover:text-[var(--color-brand)] font-[family-name:var(--font-display)]"
                    style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", color: "var(--color-muted)" }}>
                    {link.icon} {link.label}
                  </a>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

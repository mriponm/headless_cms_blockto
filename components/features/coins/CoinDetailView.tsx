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
import { formatPrice, formatPercent, formatDollarCompact, percentClass } from "@/lib/utils/formatters";
import type { WPPost } from "@/lib/wordpress/types";
import CoinChart from "./CoinChart";

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "—";
  return formatPercent(n);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

function SparklineMini({ prices }: { prices: number[] }) {
  if (!prices?.length) return null;
  const sample = prices.filter((_, i) => i % Math.ceil(prices.length / 60) === 0);
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  const range = max - min || 1;
  const w = 80; const h = 36;
  const pts = sample.map((v, i) => {
    const x = (i / (sample.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = sample[sample.length - 1];
  const first = sample[0];
  const up = last >= first;
  const color = up ? "#00d47b" : "#ff3b4f";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${pts} ${w},${h} 0,${h}`} fill="url(#spkGrad)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={parseFloat(pts.split(" ").pop()!.split(",")[0])} cy={parseFloat(pts.split(" ").pop()!.split(",")[1])} r="2.5" fill={color} />
    </svg>
  );
}

// ── Timeframe config ─────────────────────────────────────────────────────────

const TFS = [
  { label: "1D",  days: "1"   },
  { label: "1W",  days: "7"   },
  { label: "1M",  days: "30"  },
  { label: "3M",  days: "90"  },
  { label: "1Y",  days: "365" },
  { label: "ALL", days: "max" },
];

// ── Card wrapper ──────────────────────────────────────────────────────────────

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
    <p className="text-[10px] font-extrabold uppercase tracking-[2px] mb-4 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
      {children}
    </p>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CoinDetailView({ coin, news }: { coin: CoinDetail; news: WPPost[] }) {
  const { resolved } = useTheme();
  const isLight = resolved === "light";
  const { openModal } = useAuthModal();

  const [chartType, setChartType] = useState<"candles" | "line">("candles");
  const [timeframe, setTimeframe]  = useState("1");
  const [indicators, setIndicators] = useState<string[]>(["EMA"]);
  const [inWatchlist, setInWatchlist]   = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [copied, setCopied]             = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const md = coin.market_data;
  const price  = md.current_price.usd;
  const change = md.price_change_percentage_24h;
  const change1h = md.price_change_percentage_1h_in_currency?.usd ?? 0;
  const isUp = change >= 0;

  const sym = coin.symbol.toUpperCase();
  const description = stripHtml(coin.description?.en ?? "");

  // Check auth + watchlist status
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(me => {
        if (!me) return;
        setIsLoggedIn(true);
        return fetch("/api/watchlist");
      })
      .then(r => (r && r.ok ? r.json() : null))
      .then(wl => {
        if (!Array.isArray(wl)) return;
        setInWatchlist(wl.some((item: any) => item.coin_symbol === sym));
      })
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
    } finally {
      setWatchLoading(false);
    }
  }

  function toggleIndicator(ind: string) {
    setIndicators(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  }

  function copyExplorer() {
    const url = coin.links?.blockchain_site?.find(s => s) ?? "";
    if (url) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const homepage = coin.links?.homepage?.[0] || "";
  const github   = coin.links?.repos_url?.github?.[0] || "";
  const twitter  = coin.links?.twitter_screen_name ? `https://twitter.com/${coin.links.twitter_screen_name}` : "";
  const explorer = coin.links?.blockchain_site?.find(s => s) || "";

  // Market data rows
  const marketRows = [
    { label: "Market Cap",         val: formatDollarCompact(md.market_cap.usd),          sub: `${formatPercent(md.market_cap_change_percentage_24h)} 24h` },
    { label: "24h Volume",         val: formatDollarCompact(md.total_volume.usd),         sub: "" },
    { label: "FDV",                val: md.fully_diluted_valuation?.usd ? formatDollarCompact(md.fully_diluted_valuation.usd) : "∞", sub: "" },
    { label: "Today's High",       val: formatPrice(md.high_24h.usd),                    sub: "" },
    { label: "Today's Low",        val: formatPrice(md.low_24h.usd),                     sub: "" },
    { label: "Circulating Supply", val: `${(md.circulating_supply / 1e6).toFixed(2)}M ${sym}`, sub: md.max_supply ? `${((md.circulating_supply / md.max_supply) * 100).toFixed(1)}% of max` : "" },
    { label: "Max Supply",         val: md.max_supply ? `${(md.max_supply / 1e6).toFixed(2)}M ${sym}` : "∞", sub: "" },
  ];

  // Performance items
  const perfItems = [
    { label: "1H",  val: change1h },
    { label: "24H", val: change },
    { label: "7D",  val: md.price_change_percentage_7d_in_currency?.usd ?? 0 },
    { label: "30D", val: md.price_change_percentage_30d_in_currency?.usd ?? 0 },
    { label: "1Y",  val: md.price_change_percentage_1y_in_currency?.usd ?? 0 },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative z-[2] max-w-[860px] mx-auto px-3 md:px-6 pt-3 pb-24">

      {/* Back nav */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <Link href="/prices"
          className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:text-[var(--color-brand)] font-[family-name:var(--font-display)]"
          style={{ color: "var(--color-muted)" }}>
          <ArrowLeft size={14} /> Prices
        </Link>
        <span style={{ color: "var(--color-border-md)" }}>/</span>
        <span className="text-[12px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
          {coin.name}
        </span>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="p-5 md:p-6">

          {/* Identity row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              {coin.image?.large ? (
                <Image
                  src={coin.image.large}
                  alt={coin.name}
                  width={52}
                  height={52}
                  className="rounded-full flex-shrink-0"
                  style={{ border: "2px solid rgba(255,106,0,0.25)" }}
                  unoptimized
                />
              ) : (
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-lg font-extrabold text-black flex-shrink-0"
                  style={{ background: "var(--gradient-brand)" }}>
                  {sym.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[20px] md:text-[24px] font-black tracking-[-0.4px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
                    {coin.name}
                  </h1>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] font-[family-name:var(--font-data)]"
                    style={{ background: "var(--color-surface-md)", border: "0.5px solid var(--color-border-md)", color: "var(--color-muted)" }}>
                    {sym}
                  </span>
                  {coin.market_cap_rank && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] font-[family-name:var(--font-data)]"
                      style={{ background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.25)", color: "var(--color-brand)" }}>
                      #{coin.market_cap_rank}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {(coin.categories ?? []).slice(0, 3).filter(Boolean).map(cat => (
                    <span key={cat} className="text-[9px] font-bold px-2 py-0.5 rounded-[5px] font-[family-name:var(--font-data)]"
                      style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", color: "var(--color-muted)" }}>
                      {cat.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <SparklineMini prices={md.sparkline_7d?.price ?? []} />
          </div>

          {/* Price block */}
          <div className="mb-5">
            <p className="text-[9px] font-bold uppercase tracking-[1.4px] mb-1.5 flex items-center gap-1.5 font-[family-name:var(--font-data)]"
              style={{ color: "var(--color-muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d47b] shadow-[0_0_6px_#00d47b] animate-pulse inline-block" />
              LIVE PRICE
            </p>
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-[30px] md:text-[42px] font-black tracking-[-1.5px] leading-none font-[family-name:var(--font-data)]"
                style={{ color: "var(--color-text)" }}>
                {formatPrice(price)}
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[12px] font-extrabold font-[family-name:var(--font-data)] ${isUp ? "text-[#00d47b] bg-[rgba(0,212,123,0.1)] border border-[rgba(0,212,123,0.25)]" : "text-[#ff3b4f] bg-[rgba(255,59,79,0.1)] border border-[rgba(255,59,79,0.25)]"}`}>
                  {isUp ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
                  {pct(change)}
                </span>
                <span className="text-[11px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                  {isUp ? "+" : ""}{formatPrice(Math.abs(md.price_change_24h))} 24h
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[11px] font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                H: <span className="font-bold text-[#00d47b]">{formatPrice(md.high_24h.usd)}</span>
              </span>
              <span className="text-[11px] font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                L: <span className="font-bold text-[#ff3b4f]">{formatPrice(md.low_24h.usd)}</span>
              </span>
              <span className="text-[11px] font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                1H: <span className={`font-bold ${change1h >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>{pct(change1h)}</span>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/buy"
              className="flex items-center justify-center gap-1.5 py-3 rounded-[13px] text-[12px] font-extrabold text-black transition-all hover:brightness-110 hover:-translate-y-0.5 font-[family-name:var(--font-display)] relative overflow-hidden"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.3),inset 0 1px 0 rgba(255,255,255,0.25)" }}>
              <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-[13px] pointer-events-none" />
              Buy {sym}
            </Link>
            <button onClick={toggleWatchlist} disabled={watchLoading}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-[13px] text-[12px] font-extrabold border transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 font-[family-name:var(--font-display)] ${inWatchlist ? "text-[var(--color-brand)] border-[rgba(255,106,0,0.35)] bg-[rgba(255,106,0,0.08)]" : "border-[var(--color-border-md)] bg-[var(--color-surface)]"}`}
              style={{ color: inWatchlist ? "var(--color-brand)" : "var(--color-text)" }}>
              {watchLoading
                ? <Loader2 size={12} className="animate-spin" />
                : <Star size={12} strokeWidth={2.5} className={inWatchlist ? "fill-current" : ""} />}
              {inWatchlist ? "Watching" : "Watchlist"}
            </button>
            <button
              className="flex items-center justify-center gap-1.5 py-3 rounded-[13px] text-[12px] font-extrabold border transition-all hover:border-[rgba(255,106,0,0.3)] hover:-translate-y-0.5 cursor-pointer font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-text)", borderColor: "var(--color-border-md)", background: "var(--color-surface)" }}>
              <Bell size={12} strokeWidth={2.5} />
              Alert
            </button>
          </div>
        </div>
      </Card>

      {/* ── Chart panel ───────────────────────────────────────────────────���─ */}
      <Card className="mb-4">
        <div className="p-4 pb-3">

          {/* Header row */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            {/* Chart type toggle */}
            <div className="flex p-1 rounded-[10px] gap-0.5" style={{ background: "rgba(0,0,0,0.3)", border: "0.5px solid var(--color-border)" }}>
              {(["candles", "line"] as const).map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  className={`px-3 py-1.5 rounded-[7px] text-[10px] font-bold cursor-pointer transition-all duration-150 font-[family-name:var(--font-data)] ${chartType === t ? "text-[var(--color-brand)]" : ""}`}
                  style={chartType === t ? { background: "rgba(255,106,0,0.15)", color: "var(--color-brand)" } : { color: "var(--color-muted)" }}>
                  {t === "candles" ? "Candles" : "Line"}
                </button>
              ))}
            </div>

            {/* Indicator toggles */}
            <div className="flex items-center gap-1.5">
              {["EMA", "RSI", "VOL"].map(ind => (
                <button key={ind} onClick={() => toggleIndicator(ind)}
                  className="px-2.5 py-1.5 rounded-[7px] text-[9px] font-bold cursor-pointer transition-all duration-150 font-[family-name:var(--font-data)]"
                  style={indicators.includes(ind)
                    ? { background: "rgba(74,158,255,0.1)", color: "#4a9eff", border: "0.5px solid rgba(74,158,255,0.25)" }
                    : { background: "rgba(0,0,0,0.25)", color: "var(--color-muted)", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <CoinChart coinId={coin.id} type={chartType} days={timeframe} isLight={isLight} />

          {/* Timeframe bar */}
          <div className="flex p-1 rounded-[10px] gap-0.5 mt-3" style={{ background: "rgba(0,0,0,0.3)", border: "0.5px solid var(--color-border)" }}>
            {TFS.map(tf => (
              <button key={tf.days} onClick={() => setTimeframe(tf.days)}
                className="flex-1 py-2 rounded-[7px] text-[10px] font-bold cursor-pointer text-center transition-all duration-200 font-[family-name:var(--font-data)]"
                style={timeframe === tf.days
                  ? { background: "rgba(255,106,0,0.15)", color: "var(--color-brand)" }
                  : { color: "var(--color-muted)" }}>
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Performance ───────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="p-4 pb-5">
          <SectionLabel>Performance</SectionLabel>
          <div className="grid grid-cols-5 gap-2">
            {perfItems.map(item => (
              <div key={item.label} className="rounded-[12px] py-3 px-2 text-center relative overflow-hidden"
                style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)" }}>
                <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <p className="text-[9px] font-extrabold uppercase tracking-[0.5px] mb-2 font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                  {item.label}
                </p>
                <p className={`text-[12px] font-extrabold font-[family-name:var(--font-data)] ${item.val >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>
                  {pct(item.val)}
                </p>
              </div>
            ))}
          </div>

          {/* ATH / ATL */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "All-Time High", icon: <TrendingUp size={11} />, val: md.ath.usd, delta: md.ath_change_percentage.usd, date: md.ath_date.usd },
              { label: "All-Time Low",  icon: <TrendingDown size={11} />, val: md.atl.usd, delta: md.atl_change_percentage.usd, date: md.atl_date.usd },
            ].map(item => (
              <div key={item.label} className="rounded-[14px] p-4 relative overflow-hidden"
                style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)" }}>
                <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.5px] mb-2 font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                  {item.icon} {item.label}
                </p>
                <p className="text-[16px] font-extrabold font-[family-name:var(--font-data)] mb-1" style={{ color: "var(--color-text)" }}>
                  {formatPrice(item.val)}
                </p>
                <p className={`text-[10px] font-bold font-[family-name:var(--font-data)] ${item.delta >= 0 ? "text-[#00d47b]" : "text-[#ff3b4f]"}`}>
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

      {/* ── Market Data ───────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="p-4">
          <SectionLabel>Market Data</SectionLabel>
          <div className="rounded-[14px] overflow-hidden" style={{ border: "0.5px solid var(--color-border)" }}>
            {marketRows.map((row, i) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: i < marketRows.length - 1 ? "0.5px solid var(--color-border)" : "none" }}>
                <span className="text-[12px] font-medium font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
                  {row.label}
                </span>
                <div className="text-right">
                  <p className="text-[13px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>
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

      {/* ── About ─────────────────────────────────────────────────────────── */}
      {description && (
        <Card className="mb-4">
          <div className="p-4">
            <SectionLabel>About {coin.name}</SectionLabel>
            <p className={`text-[13px] leading-[1.7] font-[family-name:var(--font-display)] transition-all ${!descExpanded ? "line-clamp-4" : ""}`}
              style={{ color: "var(--color-muted)" }}>
              {description}
            </p>
            {description.length > 300 && (
              <button onClick={() => setDescExpanded(v => !v)}
                className="flex items-center gap-1 mt-3 text-[11px] font-bold cursor-pointer hover:text-[var(--color-brand)] transition-colors font-[family-name:var(--font-display)]"
                style={{ color: "var(--color-brand)" }}>
                {descExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
              </button>
            )}
          </div>
        </Card>
      )}

      {/* ── Links & Info ──────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="p-4">
          <SectionLabel>Links & Info</SectionLabel>

          {/* Explorer row */}
          {explorer && (
            <div className="flex items-center justify-between py-3 border-b font-[family-name:var(--font-display)]"
              style={{ borderColor: "var(--color-border)" }}>
              <span className="text-[12px] font-medium" style={{ color: "var(--color-muted)" }}>Explorer</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>
                  {new URL(explorer).hostname.replace("www.", "")}
                </span>
                <button onClick={copyExplorer}
                  className="w-6 h-6 rounded-[6px] flex items-center justify-center transition-all"
                  style={copied
                    ? { background: "rgba(0,212,123,0.15)", border: "0.5px solid rgba(0,212,123,0.3)" }
                    : { background: "var(--color-surface)", border: "0.5px solid var(--color-border-md)" }}>
                  <Copy size={10} style={{ color: copied ? "#00d47b" : "var(--color-muted)" }} />
                </button>
              </div>
            </div>
          )}

          {/* Social links */}
          <div className="flex gap-2 flex-wrap mt-3">
            {[
              homepage  && { label: "Website",   href: homepage, icon: <Globe size={11} /> },
              github    && { label: "GitHub",    href: github,   icon: <ExternalLink size={11} /> },
              twitter   && { label: "Twitter",   href: twitter,  icon: <ExternalLink size={11} /> },
              explorer  && { label: "Explorer",  href: explorer, icon: <ExternalLink size={11} /> },
            ].filter(Boolean).map((link: any) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] text-[11px] font-bold transition-all hover:border-[rgba(255,106,0,0.3)] hover:text-[var(--color-brand)] font-[family-name:var(--font-display)]"
                style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", color: "var(--color-muted)" }}>
                {link.icon} {link.label}
              </a>
            ))}
          </div>
        </div>
      </Card>

      {/* ── News ──────────────────────────────────────────────────────────── */}
      {news.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[2px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
              Latest news
            </p>
            <Link href={`/category/${coin.id}`} className="text-[10px] font-bold hover:text-[var(--color-brand)] transition-colors font-[family-name:var(--font-data)]"
              style={{ color: "var(--color-muted)" }}>
              SEE ALL →
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {news.map(post => (
              <Link key={post.id} href={`/post/${post.slug}`}
                className="flex gap-3 p-3 rounded-[14px] transition-all hover:border-[rgba(255,106,0,0.2)] profile-card"
                style={{ textDecoration: "none" }}>
                {post.featuredImage?.node?.sourceUrl && (
                  <div className="w-16 h-16 rounded-[10px] flex-shrink-0 overflow-hidden"
                    style={{ background: "var(--color-surface)" }}>
                    <img src={post.featuredImage.node.sourceUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold leading-[1.38] mb-1.5 line-clamp-2 font-[family-name:var(--font-display)]"
                    style={{ color: "var(--color-text)" }}
                    dangerouslySetInnerHTML={{ __html: post.title }} />
                  <p className="text-[9px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                    {post.author?.node?.name} · {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

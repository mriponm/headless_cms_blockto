"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter, Star, Bitcoin, Calendar, ChevronDown, Clock, ExternalLink } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

/* ─── Types ──────────────────────────────────────────────────── */
type Impact = "high" | "med" | "low";

interface HistoryRow { date: string; actual: string; forecast: string | null; }

interface MacroEvent {
  kind: "macro";
  id: string;
  time: string;
  country: string;
  countryCode: "us" | "jp" | "au" | "cn" | "gb" | "eu" | "ca" | "de";
  title: string;
  impact: Impact;
  important: boolean;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  description?: string;
  affected?: string[];
  history?: HistoryRow[];
}

interface CryptoEvent {
  kind: "crypto";
  id: string;
  time: string;
  platform: string;
  platformBg: string;
  platformColor: string;
  platformSymbol: string;
  badge: string;
  title: string;
  fields: { label: string; value: string; color?: string }[];
  description?: string;
  links?: { label: string; url: string }[];
  history?: HistoryRow[];
}

type AnyEvent = MacroEvent | CryptoEvent;

interface DayData {
  date: number;
  month: number; // 0-indexed
  year: number;
  day: string;
  fullLabel: string;
  hasEvents: boolean;
  events: AnyEvent[];
}

/* ─── Mock data — replace events[] with API fetch ────────────── */
// TODO: fetch from /api/events?date=YYYY-MM-DD (reads EVENTS_API_KEY server-side)
const DAYS: DayData[] = [
  { date: 19, month: 3, year: 2026, day: "Sat", fullLabel: "Saturday 19 April",  hasEvents: false, events: [] },
  { date: 20, month: 3, year: 2026, day: "Sun", fullLabel: "Sunday 20 April",    hasEvents: false, events: [] },
  {
    date: 21, month: 3, year: 2026, day: "Mon", fullLabel: "Monday 21 April", hasEvents: true,
    events: [
      {
        kind: "crypto", id: "c1", time: "09:00",
        platform: "Binance", platformBg: "linear-gradient(135deg,#f0b90b,#d4a017)", platformColor: "#000", platformSymbol: "B",
        badge: "Listing", title: "New token listing: Hyperliquid (HYPE) — spot trading goes live",
        fields: [{ label: "Token", value: "HYPE", color: "#ff6a00" }, { label: "Pair", value: "HYPE/USDT" }, { label: "Market", value: "Spot" }],
        description: "Hyperliquid (HYPE) begins spot trading on Binance. HYPE is the native token of the Hyperliquid DEX — a high-performance Layer 1 optimized for on-chain derivatives trading with sub-second finality.",
        links: [{ label: "Announcement", url: "#" }, { label: "Token info", url: "#" }],
      },
      {
        kind: "macro", id: "m1", time: "01:50", country: "Japan", countryCode: "jp",
        title: "Foreign bonds buying", impact: "low", important: false,
        actual: "¥696.2B", forecast: null, previous: "¥2480.9B",
        description: "Weekly measure of net purchases of foreign bonds by Japanese investors. Sharp decline from prior week reflects risk-off sentiment and potential JPY repatriation flows.",
        affected: ["JPY", "JGB", "USD/JPY"],
        history: [
          { date: "Apr 07", actual: "¥2480.9B", forecast: null },
          { date: "Mar 31", actual: "¥1340.2B", forecast: null },
          { date: "Mar 24", actual: "¥890.5B",  forecast: null },
          { date: "Mar 17", actual: "¥2100.0B", forecast: null },
        ],
      },
      {
        kind: "macro", id: "m2", time: "03:30", country: "Australia", countryCode: "au",
        title: "Employment change (March)", impact: "high", important: true,
        actual: "17.9K", forecast: "19.1K", previous: "49.7K",
        description: "Net change in employment in Australia for March. Came in below forecast at 17.9K vs expected 19.1K. The miss signals softening labour conditions but is not alarming given prior month's strong revision.",
        affected: ["AUD/USD", "ASX 200", "RBA rate path"],
        history: [
          { date: "Feb", actual: "49.7K",  forecast: "42.0K" },
          { date: "Jan", actual: "-10.9K", forecast: "20.0K" },
          { date: "Dec", actual: "56.3K",  forecast: "15.0K" },
          { date: "Nov", actual: "35.6K",  forecast: "25.0K" },
        ],
      },
      {
        kind: "macro", id: "m3", time: "03:30", country: "Australia", countryCode: "au",
        title: "Unemployment rate (March)", impact: "high", important: true,
        actual: "4.3%", forecast: "4.3%", previous: "4.3%",
        description: "Australia unemployment rate held steady at 4.3% in March, matching both the forecast and prior month. RBA closely monitors this for rate cut timing decisions.",
        affected: ["AUD/USD", "RBA rate path"],
        history: [
          { date: "Feb", actual: "4.3%", forecast: "4.1%" },
          { date: "Jan", actual: "4.1%", forecast: "4.0%" },
          { date: "Dec", actual: "4.0%", forecast: "3.9%" },
          { date: "Nov", actual: "3.9%", forecast: "3.9%" },
        ],
      },
      {
        kind: "macro", id: "m4", time: "03:30", country: "China", countryCode: "cn",
        title: "House prices YoY (March)", impact: "low", important: false,
        actual: "-3.4%", forecast: null, previous: "-3.2%",
        description: "China new home prices fell 3.4% YoY in March, deteriorating slightly from -3.2% prior. Property sector remains under pressure despite government stimulus measures.",
        affected: ["CNY", "Hong Kong property", "Iron ore"],
        history: [
          { date: "Feb", actual: "-3.2%", forecast: null },
          { date: "Jan", actual: "-4.0%", forecast: null },
          { date: "Dec", actual: "-5.3%", forecast: null },
          { date: "Nov", actual: "-5.7%", forecast: null },
        ],
      },
      {
        kind: "crypto", id: "c2", time: "14:00",
        platform: "Ethereum", platformBg: "linear-gradient(135deg,#627eea,#3c5ad6)", platformColor: "#fff", platformSymbol: "Ξ",
        badge: "Upgrade", title: "Pectra upgrade — mainnet activation on epoch 364032",
        fields: [{ label: "Network", value: "Mainnet" }, { label: "Type", value: "Hard fork", color: "#ff6a00" }, { label: "Impact", value: "High", color: "#ff3b4f" }],
        description: "Ethereum Pectra hard fork activates on mainnet at epoch 364032. Pectra combines the Prague execution layer upgrade and Electra consensus layer upgrade. Key improvements include EIP-7702 (account abstraction), EIP-7251 (increased validator max balance), and EIP-7549.",
        links: [{ label: "EIP-7702 spec", url: "#" }, { label: "Ethereum blog", url: "#" }, { label: "Watch epoch", url: "#" }],
      },
      {
        kind: "macro", id: "m5", time: "14:30", country: "United States", countryCode: "us",
        title: "Retail sales MoM (March)", impact: "high", important: true,
        actual: null, forecast: "0.4%", previous: "0.2%",
        description: "Monthly change in total value of retail sales. A key leading indicator of consumer spending and GDP. Consensus at +0.4% MoM would signal resilient demand despite high interest rates.",
        affected: ["USD", "S&P 500", "BTC", "Gold"],
        history: [
          { date: "Feb", actual: "0.2%",  forecast: "0.6%"  },
          { date: "Jan", actual: "-0.9%", forecast: "0.2%"  },
          { date: "Dec", actual: "0.4%",  forecast: "0.6%"  },
          { date: "Nov", actual: "0.7%",  forecast: "0.5%"  },
        ],
      },
      {
        kind: "macro", id: "m6", time: "16:00", country: "United States", countryCode: "us",
        title: "Fed Chair Powell speech", impact: "high", important: true,
        actual: null, forecast: null, previous: null,
        description: "Fed Chair Jerome Powell speaks at the Chicago Economic Club. Market participants will closely parse language around rate cut timing, inflation trajectory, and tariff impact on monetary policy.",
        affected: ["USD", "US Treasuries", "BTC", "Gold", "S&P 500"],
        history: [],
      },
    ],
  },
  {
    date: 22, month: 3, year: 2026, day: "Tue", fullLabel: "Tuesday 22 April", hasEvents: true,
    events: [
      { kind: "macro", id: "t1", time: "08:00", country: "Germany",       countryCode: "de", title: "PPI MoM (March)", impact: "med", important: false, actual: null, forecast: "0.2%", previous: "0.7%", description: "German Producer Price Index month-on-month change.", affected: ["EUR/USD", "Bund"], history: [] },
      { kind: "macro", id: "t2", time: "10:00", country: "Euro Zone",     countryCode: "eu", title: "Consumer confidence (April)", impact: "med", important: false, actual: null, forecast: "-14.5", previous: "-14.5", description: "Eurozone consumer confidence flash estimate.", affected: ["EUR", "Euro equities"], history: [] },
      {
        kind: "crypto", id: "t3", time: "12:00",
        platform: "Bitcoin", platformBg: "linear-gradient(135deg,#f7931a,#e07b10)", platformColor: "#000", platformSymbol: "₿",
        badge: "Event", title: "BTC Lightning Network capacity milestone — 10,000 BTC threshold",
        fields: [{ label: "Network", value: "Mainnet" }, { label: "Capacity", value: "~10K BTC", color: "#ff6a00" }, { label: "Channels", value: "~75K" }],
        description: "Bitcoin Lightning Network approaches 10,000 BTC in total channel capacity, a symbolic milestone demonstrating growing Layer 2 adoption for micropayments and instant settlements.",
        links: [{ label: "1ML explorer", url: "#" }, { label: "BOLT specs", url: "#" }],
      },
      { kind: "macro", id: "t4", time: "14:30", country: "Canada", countryCode: "ca", title: "Core retail sales MoM (Feb)", impact: "high", important: true, actual: null, forecast: "0.5%", previous: "-0.4%", description: "Canada core retail sales excluding autos.", affected: ["CAD/USD", "TSX"], history: [{ date: "Jan", actual: "-0.4%", forecast: "0.3%" }, { date: "Dec", actual: "0.8%", forecast: "0.4%" }] },
      { kind: "macro", id: "t5", time: "15:00", country: "United States", countryCode: "us", title: "Existing home sales (March)", impact: "med", important: false, actual: null, forecast: "4.15M", previous: "4.26M", description: "Annualized rate of existing home sales.", affected: ["USD", "Homebuilder stocks"], history: [] },
    ],
  },
  {
    date: 23, month: 3, year: 2026, day: "Wed", fullLabel: "Wednesday 23 April", hasEvents: true,
    events: [
      { kind: "macro", id: "w1", time: "07:15", country: "Euro Zone", countryCode: "eu", title: "ECB President Lagarde speech", impact: "high", important: true, actual: null, forecast: null, previous: null, description: "ECB President Christine Lagarde speaks at European Parliament. Expected to address recent tariff-driven inflation uncertainty and Q2 rate outlook.", affected: ["EUR", "Bund", "Euro stocks"], history: [] },
      {
        kind: "crypto", id: "w2", time: "09:00",
        platform: "Coinbase", platformBg: "linear-gradient(135deg,#0052ff,#003dbf)", platformColor: "#fff", platformSymbol: "C",
        badge: "Listing", title: "Solana (SOL) perpetual futures listing on Coinbase Advanced",
        fields: [{ label: "Token", value: "SOL", color: "#9945ff" }, { label: "Pair", value: "SOL-PERP" }, { label: "Market", value: "Futures" }],
        description: "Coinbase Advanced adds SOL perpetual futures, expanding derivatives access for US institutional traders. SOL-PERP will support up to 10x leverage with USDC margin.",
        links: [{ label: "Coinbase announcement", url: "#" }],
      },
      { kind: "macro", id: "w3", time: "14:30", country: "United States", countryCode: "us", title: "Durable goods orders MoM (March)", impact: "high", important: true, actual: null, forecast: "0.3%", previous: "-1.0%", description: "Change in new orders for durable manufactured goods.", affected: ["USD", "Manufacturing stocks", "BTC"], history: [{ date: "Feb", actual: "-1.0%", forecast: "1.2%" }, { date: "Jan", actual: "3.2%", forecast: "2.0%" }] },
    ],
  },
  {
    date: 24, month: 3, year: 2026, day: "Thu", fullLabel: "Thursday 24 April", hasEvents: true,
    events: [
      { kind: "macro", id: "h1", time: "03:30", country: "Australia", countryCode: "au", title: "CPI QoQ (Q1)", impact: "high", important: true, actual: null, forecast: "0.8%", previous: "0.6%", description: "Australia quarterly CPI — pivotal for RBA rate cut timing.", affected: ["AUD/USD", "ASX 200", "RBA"], history: [{ date: "Q4 2025", actual: "0.6%", forecast: "0.7%" }, { date: "Q3 2025", actual: "0.2%", forecast: "0.3%" }] },
      { kind: "macro", id: "h2", time: "09:00", country: "Germany", countryCode: "de", title: "Business climate (April)", impact: "high", important: true, actual: null, forecast: "86.0", previous: "86.7", description: "Ifo Business Climate Index — leading indicator of German economic health.", affected: ["EUR/USD", "DAX"], history: [{ date: "Mar", actual: "86.7", forecast: "86.5" }, { date: "Feb", actual: "85.2", forecast: "86.0" }] },
      {
        kind: "crypto", id: "h3", time: "10:00",
        platform: "OKX", platformBg: "linear-gradient(135deg,#333,#111)", platformColor: "#fff", platformSymbol: "O",
        badge: "Launch", title: "OKX Web3 wallet V3 launch — multi-chain aggregator goes live",
        fields: [{ label: "Version", value: "V3.0", color: "#ff6a00" }, { label: "Chains", value: "150+" }, { label: "Type", value: "Wallet" }],
        description: "OKX Web3 Wallet V3 launches with support for 150+ chains, cross-chain swap aggregation, and integrated DeFi yield optimization. Version 3 introduces a new unified account model.",
        links: [{ label: "OKX Web3 docs", url: "#" }, { label: "Download", url: "#" }],
      },
      { kind: "macro", id: "h4", time: "14:30", country: "United States", countryCode: "us", title: "Initial jobless claims", impact: "med", important: false, actual: null, forecast: "218K", previous: "215K", description: "Weekly new unemployment insurance claims.", affected: ["USD", "Fed policy"], history: [{ date: "Apr 14", actual: "215K", forecast: "220K" }, { date: "Apr 07", actual: "223K", forecast: "218K" }] },
    ],
  },
  {
    date: 25, month: 3, year: 2026, day: "Fri", fullLabel: "Friday 25 April", hasEvents: true,
    events: [
      { kind: "macro", id: "f1", time: "08:00", country: "United Kingdom", countryCode: "gb", title: "Retail sales MoM (March)", impact: "high", important: true, actual: null, forecast: "-0.4%", previous: "1.0%", description: "UK monthly retail sales. Forecast points to contraction after prior month's strong bounce.", affected: ["GBP/USD", "FTSE 100"], history: [{ date: "Feb", actual: "1.0%", forecast: "0.3%" }, { date: "Jan", actual: "-0.6%", forecast: "-0.3%" }] },
      { kind: "macro", id: "f2", time: "14:30", country: "United States", countryCode: "us", title: "Core PCE price index MoM (March)", impact: "high", important: true, actual: null, forecast: "0.3%", previous: "0.4%", description: "Fed's preferred inflation gauge. A softer print would strengthen the case for June rate cut.", affected: ["USD", "US Treasuries", "BTC", "Gold", "S&P 500"], history: [{ date: "Feb", actual: "0.4%", forecast: "0.3%" }, { date: "Jan", actual: "0.3%", forecast: "0.3%" }] },
      { kind: "macro", id: "f3", time: "14:30", country: "United States", countryCode: "us", title: "GDP growth rate QoQ (Q1 advance)", impact: "high", important: true, actual: null, forecast: "0.8%", previous: "2.4%", description: "First estimate of Q1 2026 GDP. Significant deceleration expected due to tariff-related trade disruptions and slowing consumer spending.", affected: ["USD", "S&P 500", "BTC", "Gold"], history: [{ date: "Q4 2025", actual: "2.4%", forecast: "2.1%" }, { date: "Q3 2025", actual: "3.1%", forecast: "2.8%" }] },
      {
        kind: "crypto", id: "f4", time: "16:00",
        platform: "Solana", platformBg: "linear-gradient(135deg,#9945ff,#7b2ef7)", platformColor: "#fff", platformSymbol: "◎",
        badge: "Upgrade", title: "Solana v2.2 — Firedancer testnet results release",
        fields: [{ label: "Client", value: "Firedancer" }, { label: "TPS target", value: "1M+", color: "#9945ff" }, { label: "Stage", value: "Testnet" }],
        description: "Jump Crypto's Firedancer client publishes Q1 testnet benchmark results. Firedancer aims to achieve 1M+ TPS on Solana mainnet — a 100x improvement that would make SOL the fastest L1 by throughput.",
        links: [{ label: "Firedancer GitHub", url: "#" }, { label: "Jump Crypto blog", url: "#" }],
      },
    ],
  },
  { date: 26, month: 3, year: 2026, day: "Sat", fullLabel: "Saturday 26 April", hasEvents: false, events: [] },
];

/* ─── Countdown hook ─────────────────────────────────────────── */
function useCountdown(eventTime: string, eventDate: Date) {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const [h, m] = eventTime.split(":").map(Number);
      const target = new Date(eventDate);
      target.setHours(h, m, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setDisplay(null); return; }
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor((diff % 3600000) / 60000);
      const ss = Math.floor((diff % 60000) / 1000);
      setDisplay(hh > 0 ? `${hh}h ${String(mm).padStart(2, "0")}m` : `${mm}m ${String(ss).padStart(2, "0")}s`);
    };
    compute();
    const t = setInterval(compute, 1000);
    return () => clearInterval(t);
  }, [eventTime, eventDate]);

  return display;
}

/* ─── Event status helper ────────────────────────────────────── */
function getStatus(time: string, dayDate: Date): "upcoming" | "live" | "past" | "other" {
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const evDay = new Date(dayDate); evDay.setHours(0, 0, 0, 0);
  if (evDay.getTime() !== today.getTime()) return "other";
  const [h, m] = time.split(":").map(Number);
  const evTime = new Date(); evTime.setHours(h, m, 0, 0);
  const diffMin = (evTime.getTime() - now.getTime()) / 60000;
  if (diffMin > 1)   return "upcoming";
  if (diffMin >= -15) return "live";
  return "past";
}

/* ─── Impact bars ────────────────────────────────────────────── */
function ImpactBars({ level }: { level: Impact }) {
  const color = level === "high" ? "#ff3b4f" : level === "med" ? "#ff6a00" : "#00d47b";
  const glow  = level === "high" ? "rgba(255,59,79,0.4)" : level === "med" ? "rgba(255,106,0,0.4)" : "rgba(0,212,123,0.35)";
  const active = level === "high" ? 3 : level === "med" ? 2 : 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ width: 3, height: 10, borderRadius: 1, background: n <= active ? color : "#2a2a2a", boxShadow: n <= active ? `0 0 4px ${glow}` : "none" }} />
      ))}
    </div>
  );
}

/* ─── Country flags ──────────────────────────────────────────── */
const FLAG_MAP: Record<string, React.CSSProperties> = {
  us: { background: "linear-gradient(to bottom,#b22234 0%,#b22234 14%,#fff 14%,#fff 28%,#b22234 28%,#b22234 42%,#fff 42%,#fff 57%,#b22234 57%,#b22234 71%,#fff 71%,#fff 85%,#b22234 85%)" },
  jp: { background: "#fff" },
  au: { background: "#012169" },
  cn: { background: "#de2910" },
  gb: { background: "linear-gradient(135deg,#012169 0%,#012169 40%,#c8102e 40%,#c8102e 60%,#012169 60%)" },
  eu: { background: "#003399" },
  ca: { background: "linear-gradient(to right,#ff0000 25%,#fff 25%,#fff 75%,#ff0000 75%)" },
  de: { background: "linear-gradient(to bottom,#000 33%,#d00 33%,#d00 66%,#ffce00 66%)" },
};
function CountryFlag({ code }: { code: string }) {
  return <div style={{ width: 22, height: 15, borderRadius: 3, flexShrink: 0, boxShadow: "0 0 0 0.5px rgba(255,255,255,0.15)", overflow: "hidden", ...FLAG_MAP[code] }} />;
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status, countdown }: { status: "upcoming" | "live" | "past" | "other"; countdown: string | null }) {
  if (status === "live") return (
    <span style={{ fontSize: 8, fontWeight: 800, color: "#00d47b", background: "rgba(0,212,123,0.1)", border: "0.5px solid rgba(0,212,123,0.3)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d47b", boxShadow: "0 0 6px #00d47b", animation: "pls 1.5s infinite" }} />
      Live
    </span>
  );
  if (status === "upcoming") return (
    <span style={{ fontSize: 8, fontWeight: 800, color: "#ff6a00", background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.3)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Clock size={8} style={{ flexShrink: 0 }} />
      {countdown ?? "Upcoming"}
    </span>
  );
  if (status === "past") return (
    <span style={{ fontSize: 8, fontWeight: 700, color: "#555", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
      Released
    </span>
  );
  return null;
}

/* ─── Expanded detail section ────────────────────────────────── */
function ExpandedDetail({ ev, isOpen }: { ev: AnyEvent; isOpen: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.28s ease" }}>
      <div style={{ overflow: "hidden" }}>
        <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "0 0 14px" }} />

        {/* description */}
        {ev.description && (
          <p className="ev-detail-desc" style={{ fontSize: 12, lineHeight: 1.6, fontWeight: 500, marginBottom: 14 }}>
            {ev.description}
          </p>
        )}

        {/* affected assets (macro) */}
        {ev.kind === "macro" && ev.affected && ev.affected.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }} className="ev-cell-label">
              Affected assets
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {ev.affected.map((a) => (
                <span key={a} style={{ fontSize: 10, fontWeight: 700, color: "#ff6a00", background: "rgba(255,106,0,0.08)", border: "0.5px solid rgba(255,106,0,0.2)", padding: "2px 8px", borderRadius: 5, fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* history table */}
        {ev.history && ev.history.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }} className="ev-cell-label">
              Historical data
            </div>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              {/* header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(255,255,255,0.04)", padding: "7px 12px" }}>
                {["Period", "Actual", "Forecast"].map((h) => (
                  <div key={h} style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }} className="ev-cell-label">{h}</div>
                ))}
              </div>
              {ev.history.map((row, i) => (
                <div key={i} className="ev-data-cell" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 12px", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-jetbrains-mono,monospace)" }} className="ev-cell-label">{row.date}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono,monospace)" }} className="ev-cell-val">{row.actual}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-jetbrains-mono,monospace)" }} className="ev-cell-label">{row.forecast ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* links (crypto) */}
        {ev.kind === "crypto" && ev.links && ev.links.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ev.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#ff6a00", background: "rgba(255,106,0,0.08)", border: "0.5px solid rgba(255,106,0,0.2)", padding: "5px 10px", borderRadius: 7, textDecoration: "none", transition: "opacity 0.15s" }}
              >
                <ExternalLink size={10} />
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Macro card ─────────────────────────────────────────────── */
function MacroCard({ ev, dayDate, expanded, onToggle }: { ev: MacroEvent; dayDate: Date; expanded: boolean; onToggle: () => void }) {
  const status   = getStatus(ev.time, dayDate);
  const countdown = useCountdown(ev.time, dayDate);
  const isUpcoming = status === "upcoming";
  const isLive     = status === "live";

  const cardBg = ev.important
    ? "linear-gradient(135deg,rgba(255,59,79,0.06),rgba(255,106,0,0.02))"
    : "rgba(255,255,255,0.03)";
  const cardBorder = ev.important
    ? "0.5px solid rgba(255,106,0,0.15)"
    : isLive
    ? "0.5px solid rgba(0,212,123,0.2)"
    : isUpcoming
    ? "0.5px solid rgba(255,106,0,0.12)"
    : "0.5px solid rgba(255,255,255,0.06)";

  return (
    <div
      className={`ev-card-wrap card-hover ${ev.important ? "ev-card-important-wrap" : ""}`}
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      style={{ padding: "14px 16px", borderRadius: 14, marginBottom: 8, cursor: "pointer", position: "relative", overflow: "hidden", background: cardBg, border: cardBorder, transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxShadow: isLive ? "0 0 0 1px rgba(0,212,123,0.15)" : isUpcoming ? "0 0 12px rgba(255,106,0,0.06)" : "none" }}
    >
      <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)", pointerEvents: "none" }} />
      {ev.important && (
        <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, background: "linear-gradient(180deg,#ff6a00,#ff8a30)", borderRadius: "0 2px 2px 0", boxShadow: "0 0 8px rgba(255,106,0,0.5)" }} />
      )}

      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span className="ev-time" style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.3px", minWidth: 48 }}>{ev.time}</span>
        <CountryFlag code={ev.countryCode} />
        <span className="ev-country" style={{ fontSize: 12, fontWeight: 600 }}>{ev.country}</span>
        {ev.important && (
          <span style={{ fontSize: 8, fontWeight: 800, color: "#ff6a00", background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.2)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
            Important
          </span>
        )}
        <StatusBadge status={status} countdown={countdown} />
        <ImpactBars level={ev.impact} />
        {/* expand chevron */}
        <ChevronDown size={13} style={{ color: "#555", flexShrink: 0, transition: "transform 0.25s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", marginLeft: 2 }} />
      </div>

      {/* title */}
      <div className="ev-title" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px", marginBottom: 12, lineHeight: 1.3 }}>{ev.title}</div>

      {/* data grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.03)", borderRadius: 10, overflow: "hidden" }}>
        {[
          { label: "Actual",   value: ev.actual,   trend: ev.actual && ev.forecast ? (parseFloat(ev.actual) >= parseFloat(ev.forecast) ? "up" : "dn") : null },
          { label: "Forecast", value: ev.forecast, trend: null },
          { label: "Previous", value: ev.previous, trend: null },
        ].map(({ label, value, trend }) => (
          <div key={label} className="ev-data-cell" style={{ padding: "9px 11px" }}>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 3 }} className="ev-cell-label">{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono,monospace)", display: "flex", alignItems: "center", gap: 3, color: trend === "up" ? "#00d47b" : trend === "dn" ? "#ff3b4f" : undefined }} className={!trend ? "ev-cell-val" : ""}>
              {value ?? "—"}
              {trend === "up" && <span style={{ fontSize: 10 }}>▲</span>}
              {trend === "dn" && <span style={{ fontSize: 10 }}>▼</span>}
            </div>
          </div>
        ))}
      </div>

      {/* expanded detail */}
      <ExpandedDetail ev={ev} isOpen={expanded} />
    </div>
  );
}

/* ─── Crypto card ────────────────────────────────────────────── */
function CryptoCard({ ev, dayDate, expanded, onToggle }: { ev: CryptoEvent; dayDate: Date; expanded: boolean; onToggle: () => void }) {
  const status   = getStatus(ev.time, dayDate);
  const countdown = useCountdown(ev.time, dayDate);

  return (
    <div
      className="ev-card-wrap ev-card-crypto-wrap card-hover"
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      style={{ padding: "14px 16px", borderRadius: 14, marginBottom: 8, cursor: "pointer", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(255,106,0,0.08),rgba(0,0,0,0))", border: "0.5px solid rgba(255,106,0,0.2)" }}
    >
      <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,106,0,0.15),transparent)", pointerEvents: "none" }} />

      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span className="ev-time" style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.3px", minWidth: 48 }}>{ev.time}</span>
        <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, background: ev.platformBg, color: ev.platformColor, boxShadow: "0 0 8px rgba(255,106,0,0.3)" }}>
          {ev.platformSymbol}
        </div>
        <span className="ev-country" style={{ fontSize: 12, fontWeight: 600 }}>{ev.platform}</span>
        <span style={{ fontSize: 8, fontWeight: 800, color: "#000", background: "linear-gradient(135deg,#ff6a00,#ff8a30)", padding: "3px 8px", borderRadius: 5, letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)", boxShadow: "0 0 10px rgba(255,106,0,0.2)" }}>
          {ev.badge}
        </span>
        <StatusBadge status={status} countdown={countdown} />
        <ChevronDown size={13} style={{ color: "#ff6a00", opacity: 0.6, flexShrink: 0, marginLeft: "auto", transition: "transform 0.25s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>

      {/* title */}
      <div className="ev-title" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px", marginBottom: 12, lineHeight: 1.3 }}>{ev.title}</div>

      {/* data grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,106,0,0.05)", borderRadius: 10, overflow: "hidden" }}>
        {ev.fields.map(({ label, value, color }) => (
          <div key={label} className="ev-data-cell" style={{ padding: "9px 11px" }}>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 3 }} className="ev-cell-label">{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono,monospace)", color: color ?? undefined }} className={!color ? "ev-cell-val" : ""}>{value}</div>
          </div>
        ))}
      </div>

      {/* expanded detail */}
      <ExpandedDetail ev={ev} isOpen={expanded} />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function EventsClient() {
  const TODAY_IDX = 2;
  const [selectedIdx, setSelectedIdx]   = useState(TODAY_IDX);
  const [activeFilter, setActiveFilter] = useState<"all" | "important" | "crypto">("all");
  const [expandedId, setExpandedId]     = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const day = DAYS[selectedIdx];
  const dayDate = new Date(day.year, day.month, day.date);

  // collapse expanded card when switching day/filter
  const handleDayChange = (i: number) => { setSelectedIdx(i); setExpandedId(null); };
  const handleFilterChange = (f: "all" | "important" | "crypto") => { setActiveFilter(f); setExpandedId(null); };

  const filtered = day.events.filter((ev) => {
    if (activeFilter === "important") return ev.kind === "macro" && (ev as MacroEvent).important;
    if (activeFilter === "crypto")    return ev.kind === "crypto";
    return true;
  });

  const counts = {
    all:       day.events.length,
    important: day.events.filter((e) => e.kind === "macro" && (e as MacroEvent).important).length,
    crypto:    day.events.filter((e) => e.kind === "crypto").length,
  };

  const totalWeek      = DAYS.reduce((s, d) => s + d.events.length, 0);
  const totalHighToday = DAYS[TODAY_IDX].events.filter((e) => e.kind === "macro" && (e as MacroEvent).impact === "high").length;
  const totalCrypto    = DAYS[TODAY_IDX].events.filter((e) => e.kind === "crypto").length;

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-4">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <section className="relative rounded-[20px] overflow-hidden mb-[14px] px-5 py-[24px]"
          style={{ background: "linear-gradient(135deg,rgba(255,106,0,0.12),rgba(255,106,0,0.02) 40%,rgba(0,0,0,0))", border: "0.5px solid rgba(255,106,0,0.15)" }}>
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent" />
          <span className="absolute -top-[40%] -right-[20%] w-[60%] h-[80%] pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,106,0,0.15),transparent 70%)", filter: "blur(30px)" }} />
          <div className="relative z-[1]">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[1.5px] mb-[14px]"
              style={{ color: "#ff6a00", padding: "5px 12px", borderRadius: 20, border: "0.5px solid rgba(255,106,0,0.3)", background: "rgba(255,106,0,0.08)" }}>
              <span className="w-[5px] h-[5px] rounded-full pls-anim" style={{ background: "#ff6a00", boxShadow: "0 0 8px #ff6a00" }} />
              Live calendar
            </div>
            <h1 className="text-[28px] md:text-[34px] font-black tracking-[-1px] leading-[1.1] mb-2.5 font-[family-name:var(--font-league-spartan)] header-brand-text">
              Crypto events calendar
            </h1>
            <p className="text-[13px] buy-ex-desc leading-[1.5] font-medium max-w-[440px]">
              Upcoming crypto events, listings, launches, and macro market dates. Click any event for full details.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* ── Stats ────────────────────────────────────────────── */}
      <FadeIn delay={0.04}>
        <div className="grid grid-cols-4 gap-2 mb-[14px]">
          {[
            { label: "Today",       value: String(DAYS[TODAY_IDX].events.length), sub: "events",    accent: true,  color: null },
            { label: "This week",   value: String(totalWeek),                     sub: "scheduled", accent: false, color: null },
            { label: "High impact", value: String(totalHighToday),                sub: "today",     accent: false, color: "#ff3b4f" },
            { label: "Crypto",      value: String(totalCrypto),                   sub: "listings",  accent: false, color: "#ff6a00" },
          ].map(({ label, value, sub, accent, color }) => (
            <div key={label} className="glass relative overflow-hidden rounded-[14px] py-[12px] px-2 text-center">
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <div className="text-[8px] font-bold uppercase tracking-[0.6px] buy-stat-label mb-1">{label}</div>
              <div className={`text-[18px] font-extrabold tracking-[-0.3px] leading-none font-[family-name:var(--font-data)] ${accent ? "gradient-text-alt" : ""}`} style={color ? { color } : undefined}>{value}</div>
              <div className="text-[8px] buy-stat-sub mt-1 font-semibold">{sub}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Filter chips ─────────────────────────────────────── */}
      <FadeIn delay={0.06}>
        <div className="flex items-center gap-2 mb-[12px]">
          {([
            { key: "all",       label: "All events", Icon: Filter  },
            { key: "important", label: "Important",  Icon: Star    },
            { key: "crypto",    label: "Crypto",     Icon: Bitcoin },
          ] as const).map(({ key, label, Icon }) => {
            const active = activeFilter === key;
            return (
              <button key={key} onClick={() => handleFilterChange(key)}
                className="flex items-center gap-1.5 font-bold cursor-pointer transition-all duration-150 font-[family-name:var(--font-display)]"
                style={{ padding: "9px 14px", borderRadius: 12, fontSize: 12, background: active ? "linear-gradient(135deg,rgba(255,106,0,0.12),rgba(255,106,0,0.04))" : "rgba(255,255,255,0.04)", border: active ? "0.5px solid rgba(255,106,0,0.28)" : "0.5px solid rgba(255,255,255,0.08)", color: active ? "#ff6a00" : "#aaa" }}>
                <Icon size={12} strokeWidth={2} style={{ stroke: active ? "#ff6a00" : "#666" }} />
                {label}
                <span style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono,monospace)", fontWeight: 700, marginLeft: 2, color: active ? "#ff6a00" : "#555", ...(active ? { background: "rgba(255,106,0,0.1)", padding: "1px 5px", borderRadius: 4 } : {}) }}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* ── Date scrubber ────────────────────────────────────── */}
      <FadeIn delay={0.08}>
        <div className="flex gap-[6px] overflow-x-auto pb-1 mb-[16px]" style={{ scrollbarWidth: "none" }}>
          {DAYS.map((d, i) => {
            const active = i === selectedIdx;
            return (
              <button key={d.date} onClick={() => handleDayChange(i)}
                className="flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-150"
                style={{ padding: "10px 14px", borderRadius: 12, minWidth: 58, background: active ? "linear-gradient(135deg,#ff6a00,#ff8a30)" : "rgba(255,255,255,0.03)", border: active ? "0.5px solid transparent" : "0.5px solid rgba(255,255,255,0.06)", boxShadow: active ? "0 0 16px rgba(255,106,0,0.25)" : "none" }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3, color: active ? "rgba(0,0,0,0.7)" : "#666" }}>{d.day}</span>
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-jetbrains-mono,monospace)", lineHeight: 1, color: active ? "#000" : "#ccc" }}>{d.date}</span>
                <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 5, background: active ? "rgba(0,0,0,0.5)" : d.hasEvents ? "#ff6a00" : "transparent", boxShadow: (!active && d.hasEvents) ? "0 0 6px rgba(255,106,0,0.5)" : "none" }} />
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* ── Day header ───────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-1 mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-[2px] gradient-text-alt font-[family-name:var(--font-display)]">{day.fullLabel}</span>
        <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,106,0,0.2),transparent)" }} />
        <span className="text-[9px] font-extrabold tracking-[1px] font-[family-name:var(--font-data)]" style={{ color: "#444" }}>{filtered.length} EVENTS</span>
      </div>

      {/* ── Event list ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <FadeIn delay={0}>
          <div className="glass rounded-[16px] py-12 text-center">
            <Calendar size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-[13px] font-semibold buy-ex-desc">
              {day.hasEvents ? "No events match this filter" : "No events scheduled for this day"}
            </p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.1} key={`${selectedIdx}-${activeFilter}`}>
          <div>
            {filtered.map((ev) =>
              ev.kind === "macro"
                ? <MacroCard  key={ev.id} ev={ev} dayDate={dayDate} expanded={expandedId === ev.id} onToggle={() => toggleExpand(ev.id)} />
                : <CryptoCard key={ev.id} ev={ev} dayDate={dayDate} expanded={expandedId === ev.id} onToggle={() => toggleExpand(ev.id)} />
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}

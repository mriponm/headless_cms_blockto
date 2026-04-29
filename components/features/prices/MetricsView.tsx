"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import RainbowChart from "./RainbowChart";
import { COIN_ICONS } from "./coinIcons";
import { COIN_IDS } from "@/lib/coinIds";
import { usePriceStore } from "@/lib/store/priceStore";
import { formatPrice, formatDollarCompact, formatPercent } from "@/lib/utils/formatters";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// -- Types ----------------------------------------------------
interface GlobalData {
  btc_dominance?: number;
  btc_dominance_24h_percentage_change?: number;
  eth_dominance?: number;
  quote?: {
    USD?: {
      total_market_cap?: number;
      total_volume_24h?: number;
      total_market_cap_yesterday_percentage_change?: number;
    };
  };
}

interface FGResponse {
  current: { value: number; value_classification: string };
  history: Array<{ value: number; value_classification: string; timestamp: string }>;
}

interface MempoolData {
  currentBlock: number;
  blocksRemaining: number;
  halvingDate: string;
  halvingBlock: number;
  progressPct: number;
  hashratePH: number;
  difficultyChange: number;
}

interface FuturesData {
  oiValueUSD:  number;
  oiChange24h: number;
  buyVolUSD:   number;
  sellVolUSD:  number;
  lsRatio:     number;
  longPct:     number;
  shortPct:    number;
  fundingRate: number;
}

interface GasData {
  slow: number;
  standard: number;
  fast: number;
  baseFee: number;
}

interface DefiData {
  totalTvl: number;
  stables: Array<{ name: string; symbol: string; peggedUSD: number }>;
}

interface MarketCoin {
  id: string; symbol: string; name: string; image?: string;
  current_price: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_24h: number;
  price_change_percentage_30d_in_currency?: number;
}

// Enriched gainers/losers — Binance price data + CoinGecko metadata
interface BinanceCoin {
  symbol:    string;
  price:     number;
  change24h: number;
  volume24h: number;
  cgId?:     string;
  name?:     string;
  image?:    string;
}

// -- Helpers --------------------------------------------------
function fgColor(v: number) {
  if (v < 25) return "#8b5cf6";
  if (v < 45) return "#ef4444";
  if (v < 55) return "#f59e0b";
  if (v < 75) return "#22c55e";
  return "#00d47b";
}

function formatCountdown(halvingDate: string, now: number) {
  const ms = new Date(halvingDate).getTime() - now;
  if (ms <= 0) return "Halved!";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return `~${d}d ${h}h`;
}

// -- Coin row — icon + link from pre-enriched route data ------
function CoinRow({ coin, type }: { coin: BinanceCoin; type: "up" | "dn" }) {
  const sym  = coin.symbol.toUpperCase();
  // cgId and image come from the enriched gainers route (CoinGecko top 250)
  const icon = coin.image || (COIN_ICONS as Record<string, string>)[sym];
  const id   = coin.cgId  || COIN_IDS[sym];
  const href = id ? `/coins/${id}` : null;
  const displayName = coin.name || sym;

  const inner = (
    <div className={`mtr-coin-row${href ? " hover:bg-white/[0.02] transition-colors cursor-pointer" : ""}`}>
      <div className="flex items-center gap-2.5">
        <div className="mtr-ico-wrap">
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt={sym} width={28} height={28} className="mtr-ico-img"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                const fb = img.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }} />
          ) : null}
          <span className="mtr-ico" style={{
            background: "rgba(255,106,0,0.1)", color: "#ff6a00",
            display: icon ? "none" : "flex",
          }}>{sym[0]}</span>
        </div>
        <div>
          <div className="mtr-nm" data-no-translate>{displayName}</div>
          <div className="mtr-sy" data-no-translate>{sym}</div>
        </div>
      </div>
      <div className="mtr-pr">{formatPrice(coin.price)}</div>
      <div className={`mtr-chg ${type}`}>{formatPercent(coin.change24h)}</div>
    </div>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

// -- Skeleton -------------------------------------------------
function Skeleton({ h = 20 }: { h?: number }) {
  return <div className="animate-pulse rounded-[6px] bg-white/[0.05]" style={{ height: h }} />;
}

// -- Main Component --------------------------------------------
export default function MetricsView() {
  const prices = usePriceStore((s) => s.prices);
  const changes = usePriceStore((s) => s.changes);
  const [now, setNow] = useState(Date.now());
  const [convAmount, setConvAmount] = useState("1");
  const [convFrom, setConvFrom] = useState("BTC");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: global } = useSWR<GlobalData>("/api/global", fetcher, { refreshInterval: 60_000, keepPreviousData: true });
  const { data: fg }     = useSWR<FGResponse>("/api/fear-greed", fetcher, { refreshInterval: 3_600_000, keepPreviousData: true });
  const { data: mempool }= useSWR<MempoolData>("/api/mempool", fetcher, { refreshInterval: 60_000, keepPreviousData: true });
  const { data: futures }= useSWR<FuturesData>("/api/futures", fetcher, { refreshInterval: 30_000, keepPreviousData: true });
  const { data: gas }    = useSWR<GasData>("/api/gas", fetcher, { refreshInterval: 30_000, keepPreviousData: true });
  const { data: defi }   = useSWR<DefiData>("/api/defillama", fetcher, { refreshInterval: 3_600_000, keepPreviousData: true });
  const { data: markets }= useSWR<MarketCoin[]>("/api/markets", fetcher, { refreshInterval: 60_000, keepPreviousData: true });
  const { data: gainersData } = useSWR<{ gainers: BinanceCoin[]; losers: BinanceCoin[] }>("/api/gainers", fetcher, { refreshInterval: 60_000, keepPreviousData: true });

  // Derived values
  const q = global?.quote?.USD;
  const btcDom = global?.btc_dominance ?? 0;
  const btcDomChange = global?.btc_dominance_24h_percentage_change ?? null;
  const ethDom = global?.eth_dominance ?? 0;
  const btcPrice  = prices["BTCUSDT"] ?? 0;
  const btcChange = changes["BTCUSDT"] ?? 0;

  // Altcoin season — computed instantly from CoinGecko 30d data (zero loading)
  // Methodology: % of top 100 alts that outperformed BTC over 30 days
  const { altcoinSeason, altcoinLabel, altcoinNote } = (() => {
    if (!markets) return { altcoinSeason: null, altcoinLabel: null, altcoinNote: "" };
    const STABLES = new Set(["USDT","USDC","BUSD","DAI","TUSD","FDUSD","USDE","USDP","FRAX"]);
    const btc = markets.find((c) => c.symbol.toUpperCase() === "BTC");
    const btc30d = btc?.price_change_percentage_30d_in_currency ?? 0;
    const alts = markets.filter(
      (c) => c.symbol.toUpperCase() !== "BTC" && !STABLES.has(c.symbol.toUpperCase())
    ).slice(0, 100);
    const valid = alts.filter((c) => c.price_change_percentage_30d_in_currency != null);
    const out   = valid.filter((c) => (c.price_change_percentage_30d_in_currency ?? 0) > btc30d);
    const idx   = valid.length > 0 ? Math.round((out.length / valid.length) * 100) : 0;
    const label = idx >= 75 ? "Altcoin Season" : idx >= 55 ? "Altcoin Month" : idx >= 45 ? "Neutral" : idx >= 25 ? "Bitcoin Month" : "Bitcoin Season";
    return {
      altcoinSeason: idx,
      altcoinLabel:  label,
      altcoinNote:   `${out.length} of ${valid.length} alts outperformed BTC over 30 days`,
    };
  })();

  const otherDom = Math.max(0, 100 - btcDom - ethDom);

  // Converter
  const convBinanceMap: Record<string, string> = {
    BTC: "BTCUSDT", ETH: "ETHUSDT", SOL: "SOLUSDT", BNB: "BNBUSDT", XRP: "XRPUSDT",
  };
  const convPrice = prices[convBinanceMap[convFrom] ?? "BTCUSDT"] ?? btcPrice;
  const convResult = parseFloat(convAmount || "0") * convPrice;

  const fgValue = fg?.current?.value ?? 0;
  const fgLabel = fg?.current?.value_classification ?? "—";
  const fgHistory = fg?.history?.slice(0, 4) ?? [];

  return (
    <div className="mtr-root">

      {/* -- Row 1: Hero BTC + 3 market stats -- */}
      <div className="mtr-4grid">
        <div className="mtr-stat glass" style={{ borderColor: "rgba(255,106,0,0.15)", background: "linear-gradient(135deg,rgba(255,106,0,0.06),transparent)" }}>
          <div className="mtr-stat-label mtr-stat-label-hero">Bitcoin</div>
          <div className="mtr-stat-val mtr-stat-val-hero">
            {btcPrice ? formatPrice(btcPrice) : <Skeleton h={28} />}
          </div>
          <div className={`mtr-stat-sub ${btcChange >= 0 ? "text-positive" : "text-negative"}`}>
            {btcChange >= 0 ? "▲" : "▼"} {formatPercent(btcChange)} today
          </div>
        </div>
        {[
          {
            label: "Market cap",
            value: q?.total_market_cap ? formatDollarCompact(q.total_market_cap) : null,
            sub: q?.total_market_cap_yesterday_percentage_change != null ? formatPercent(q.total_market_cap_yesterday_percentage_change) : null,
            up: (q?.total_market_cap_yesterday_percentage_change ?? 0) >= 0,
          },
          {
            label: "24h volume",
            value: q?.total_volume_24h ? formatDollarCompact(q.total_volume_24h) : null,
            sub: "24h",
            up: true,
          },
          {
            label: "BTC dominance",
            value: btcDom ? `${btcDom.toFixed(1)}%` : null,
            sub: btcDomChange !== null ? `${btcDomChange >= 0 ? "+" : ""}${btcDomChange.toFixed(2)}%` : null,
            up: (btcDomChange ?? 0) >= 0,
          },
        ].map((s) => (
          <div key={s.label} className="mtr-stat glass">
            <div className="mtr-stat-label">{s.label}</div>
            <div className="mtr-stat-val">{s.value ?? <Skeleton h={24} />}</div>
            {s.sub && (
              <div className={`mtr-stat-sub${s.up ? " text-positive" : " text-negative"}`}>
                {s.sub !== "24h" && (s.up ? "▲" : "▼")} {s.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* -- Charts & Indicators -- */}
      <div className="mtr-sec">Charts &amp; indicators</div>
      <div className="mtr-quad-grid">

        {/* Rainbow Chart */}
        <div className="glass-strong mtr-card mtr-card-fill" style={{ padding: 0 }}>
          <RainbowChart />
        </div>

        {/* Fear & Greed — live CMC Pro */}
        <div className="glass-strong mtr-card mtr-card-fill">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Fear &amp; greed <span className="gradient-text-alt">index</span></span>
            <span className="mtr-card-sub">CMC Live</span>
          </div>
          <div className="mtr-card-body mtr-fg-stacked">
            <div className="mtr-gauge-wrap" style={{ margin: "0 auto 14px" }}>
              <svg viewBox="0 0 110 110" width="110" height="110">
                <defs>
                  <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="25%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="75%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#00d47b" />
                  </linearGradient>
                </defs>
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="55" cy="55" r="46" fill="none" stroke="url(#gg)" strokeWidth="8"
                  strokeDasharray="289" strokeDashoffset={289 - (fgValue / 100) * 289}
                  strokeLinecap="round" transform="rotate(-126 55 55)" />
              </svg>
              <div className="mtr-gauge-inner">
                <span className="mtr-gauge-num" style={{ color: fgColor(fgValue) }}>{fgValue || "—"}</span>
                <span className="mtr-gauge-lbl" style={{ color: fgColor(fgValue) }}>{fgLabel}</span>
              </div>
            </div>
            <div>
              {fgHistory.length > 0 ? fgHistory.map((h, i) => (
                <div key={i} className="mtr-fg-row">
                  <span className="mtr-fg-key">
                    {i === 0 ? "Now" : i === 1 ? "Yesterday" : i === 2 ? "Last week" : "Last month"}
                  </span>
                  <span style={{ color: fgColor(h.value), fontSize: 11, fontWeight: 600 }}>
                    {h.value} — {h.value_classification}
                  </span>
                </div>
              )) : [0,1,2,3].map(i => <div key={i} className="mtr-fg-row"><Skeleton h={14} /></div>)}
            </div>
          </div>
        </div>

        {/* BTC Halving — live Mempool.space */}
        <div className="glass-strong mtr-card mtr-card-fill">
          <div className="mtr-card-head">
            <span className="mtr-card-title">BTC halving <span className="gradient-text-alt">countdown</span></span>
          </div>
          <div className="mtr-card-body mtr-hlv-stacked">
            <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 18px" }}>
              <svg viewBox="0 0 74 74" width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                <defs>
                  <linearGradient id="hlvg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6a00" />
                    <stop offset="100%" stopColor="#ffaa44" />
                  </linearGradient>
                </defs>
                <circle cx="37" cy="37" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                <circle cx="37" cy="37" r="30" fill="none" stroke="url(#hlvg)" strokeWidth="5"
                  strokeDasharray="188"
                  strokeDashoffset={188 - (((mempool?.progressPct ?? 0) / 100) * 188)}
                  strokeLinecap="round" />
              </svg>
              <div className="mtr-hlv-pct">{mempool ? `${mempool.progressPct.toFixed(0)}%` : "—"}</div>
            </div>
            <div className="text-center">
              <div className="mtr-hlv-title">Next halving event</div>
              <div className="mtr-hlv-days">
                {mempool ? formatCountdown(mempool.halvingDate, now) : "—"}
              </div>
              <div className="mtr-hlv-sub">
                {mempool ? `Est. ${new Date(mempool.halvingDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}` : "Loading…"}
              </div>
              <div className="mtr-hlv-sub" style={{ marginTop: 6 }}>Block reward: 3.125 → 1.5625 BTC</div>
            </div>
          </div>
        </div>

        {/* Altcoin Season — calculated from CoinGecko Pro */}
        <div className="glass-strong mtr-card mtr-card-fill">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Altcoin season <span className="gradient-text-alt">index</span></span>
            <span className="mtr-card-sub">{altcoinSeason !== null ? `${altcoinSeason} / 100` : "—"}</span>
          </div>
          <div className="mtr-card-body">
            <div className="mtr-alt-score" style={{ color: altcoinSeason !== null && altcoinSeason >= 75 ? "#00d47b" : altcoinSeason !== null && altcoinSeason >= 50 ? "#f59e0b" : "#ff6a00" }}>
              {altcoinSeason !== null ? altcoinSeason : "—"}
            </div>
            <div className="mtr-as-bar">
              <div className="mtr-as-fill" style={{ width: `${altcoinSeason ?? 0}%` }} />
            </div>
            <div className="mtr-as-lbl"><span>BTC season</span><span>Altcoin season</span></div>
            {altcoinNote && (
              <p className="mtr-as-note" style={{ marginTop: 12 }}>
                {altcoinNote}
              </p>
            )}
            <div className="mtr-alt-badge">
              {altcoinLabel ?? "Loading…"}
            </div>
          </div>
        </div>

      </div>

      {/* -- Gainers / Losers — live Binance (exchange-listed only) -- */}
      <div className="mtr-sec">Market movers</div>
      <div className="mtr-duo-grid">
        <div className="glass-strong mtr-card">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Top <span className="gradient-text-alt">gainers</span></span>
            <span className="mtr-card-sub">24h · Binance</span>
          </div>
          <div className="mtr-card-body">
            <div>
              <div className="mtr-col-head"><span>Asset</span><span className="text-right">Price</span><span className="text-right">24h</span></div>
              {gainersData?.gainers
                ? gainersData.gainers.slice(0, 5).map((c) => (
                    <CoinRow key={c.symbol} type="up"
                      coin={{ ...c, price: prices[`${c.symbol}USDT`] ?? c.price }}
                    />
                  ))
                : [0,1,2,3,4].map(i => <div key={i} className="mtr-coin-row"><Skeleton h={36} /></div>)
              }
            </div>
          </div>
        </div>
        <div className="glass-strong mtr-card">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Top <span className="gradient-text-alt">losers</span></span>
            <span className="mtr-card-sub">24h · Binance</span>
          </div>
          <div className="mtr-card-body">
            <div>
              <div className="mtr-col-head"><span>Asset</span><span className="text-right">Price</span><span className="text-right">24h</span></div>
              {gainersData?.losers
                ? gainersData.losers.slice(0, 5).map((c) => (
                    <CoinRow key={c.symbol} type="dn"
                      coin={{ ...c, price: prices[`${c.symbol}USDT`] ?? c.price }}
                    />
                  ))
                : [0,1,2,3,4].map(i => <div key={i} className="mtr-coin-row"><Skeleton h={36} /></div>)
              }
            </div>
          </div>
        </div>
      </div>

      {/* -- Derivatives — live Binance Futures public API -- */}
      <div className="mtr-sec">Derivatives &amp; leverage</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">BTC <span className="gradient-text-alt">derivatives</span></span>
          <span className="mtr-card-sub">24h · Binance</span>
        </div>
        <div className="mtr-card-body">
          {/* Taker buy/sell volumes — long/short pressure */}
          <div className="mtr-liq-row">
            <div className="mtr-liq-c mtr-liq-long">
              <div className="mtr-liq-label" style={{ color: "#00d47b" }}>Buy volume</div>
              <div className="mtr-liq-val" style={{ color: "#00d47b" }}>
                {futures ? formatDollarCompact(futures.buyVolUSD) : <Skeleton h={24} />}
              </div>
            </div>
            <div className="mtr-liq-c mtr-liq-short">
              <div className="mtr-liq-label" style={{ color: "#ff3b4f" }}>Sell volume</div>
              <div className="mtr-liq-val" style={{ color: "#ff3b4f" }}>
                {futures ? formatDollarCompact(futures.sellVolUSD) : <Skeleton h={24} />}
              </div>
            </div>
          </div>
          <div className="mtr-ng-grid">
            {futures ? [
              { k: "Open interest",    v: formatDollarCompact(futures.oiValueUSD) },
              { k: "OI change 24h",    v: `${futures.oiChange24h >= 0 ? "+" : ""}${futures.oiChange24h.toFixed(2)}%`, c: futures.oiChange24h >= 0 ? "#00d47b" : "#ff3b4f" },
              { k: "BTC funding rate", v: `${futures.fundingRate >= 0 ? "+" : ""}${(futures.fundingRate * 100).toFixed(4)}%`, c: futures.fundingRate >= 0 ? "#00d47b" : "#ff3b4f" },
              { k: "Long accounts",    v: `${futures.longPct.toFixed(1)}%`, c: "#00d47b" },
              { k: "Short accounts",   v: `${futures.shortPct.toFixed(1)}%`, c: "#ff3b4f" },
              { k: "L/S ratio",        v: futures.lsRatio.toFixed(4), c: futures.lsRatio >= 1 ? "#00d47b" : "#ff3b4f" },
            ].map((n) => (
              <div key={n.k} className="mtr-ng-cell">
                <div className="mtr-ng-key">{n.k}</div>
                <div className="mtr-ng-val" style={n.c ? { color: n.c } : {}}>{n.v}</div>
              </div>
            )) : [0,1,2,3,4,5].map(i => <div key={i} className="mtr-ng-cell"><Skeleton h={40} /></div>)}
          </div>
        </div>
      </div>

      {/* -- Dominance — live CMC Pro -- */}
      <div className="mtr-sec">Dominance &amp; supply</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Market <span className="gradient-text-alt">dominance</span></span>
        </div>
        <div className="mtr-card-body">
          {btcDom ? (
            <>
              <div className="mtr-dom-bar">
                <div style={{ flex: btcDom, background: "linear-gradient(90deg,#ff6a00,#ff8a30)" }} />
                <div style={{ flex: ethDom, background: "#4a9eff" }} />
                <div style={{ flex: otherDom * 0.3, background: "#b16aff" }} />
                <div style={{ flex: otherDom * 0.15, background: "#00c9a7" }} />
                <div style={{ flex: otherDom * 0.55, background: "#333" }} />
              </div>
              <div className="mtr-dom-legend">
                {[
                  { label: `BTC ${btcDom.toFixed(1)}%`,    c: "#ff6a00" },
                  { label: `ETH ${ethDom.toFixed(1)}%`,    c: "#4a9eff" },
                  { label: "Others",                        c: "#555" },
                ].map((d) => (
                  <span key={d.label} className="mtr-dom-item">
                    <span className="mtr-dom-dot" style={{ background: d.c }} />
                    {d.label}
                  </span>
                ))}
              </div>
            </>
          ) : <Skeleton h={40} />}
        </div>
      </div>

      {/* -- Stablecoin Supply — live DefiLlama -- */}
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Stablecoin <span className="gradient-text-alt">supply</span></span>
          <span className="mtr-card-sub">
            {defi?.stables ? formatDollarCompact(defi.stables.reduce((sum, s) => sum + s.peggedUSD, 0)) + " total" : "Loading…"}
          </span>
        </div>
        <div className="mtr-card-body">
          {defi?.stables ? (() => {
            const total = defi.stables.reduce((s, c) => s + c.peggedUSD, 0);
            const COLORS = ["linear-gradient(90deg,#00d47b,#00c9a7)", "linear-gradient(90deg,#4a9eff,#2563eb)", "#ffc233", "#b16aff", "#ff6a00", "#555"];
            return defi.stables.map((s, i) => (
              <div key={s.symbol} className="mtr-sc-row">
                <span className="mtr-sc-name">{s.symbol}</span>
                <div className="mtr-sc-bar-wrap">
                  <div className="mtr-sc-bar-fill" style={{ width: `${(s.peggedUSD / total) * 100}%`, background: COLORS[i] ?? "#555" }} />
                </div>
                <span className="mtr-sc-val">{formatDollarCompact(s.peggedUSD)}</span>
              </div>
            ));
          })() : <Skeleton h={80} />}
        </div>
      </div>

      {/* -- Gas Tracker — live Etherscan -- */}
      <div className="mtr-sec">Network &amp; gas</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">ETH <span className="gradient-text-alt">gas tracker</span></span>
          <span className="mtr-card-sub">Gwei · Live</span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-gas-grid">
            {gas ? [
              { tier: "Slow",     val: gas.slow,     time: "~5 min",  cls: "slow" },
              { tier: "Standard", val: gas.standard, time: "~2 min",  cls: "std"  },
              { tier: "Fast",     val: gas.fast,     time: "~15 sec", cls: "fast" },
            ].map((g) => (
              <div key={g.tier} className={`mtr-gas-cell mtr-gas-${g.cls}`}>
                <div className="mtr-gas-tier">{g.tier}</div>
                <div className="mtr-gas-val">{typeof g.val === "number" ? g.val.toFixed(2) : g.val}</div>
                <div className="mtr-gas-time">{g.time}</div>
              </div>
            )) : [0,1,2].map(i => <div key={i} className="mtr-gas-cell"><Skeleton h={60} /></div>)}
          </div>
        </div>
      </div>

      {/* -- Network Stats — live Mempool.space -- */}
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Network <span className="gradient-text-alt">stats</span></span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-ng-grid">
            {mempool && defi ? [
              { k: "BTC hash rate",    v: `${mempool.hashratePH.toFixed(0)} EH/s` },
              { k: "Current block",    v: mempool.currentBlock.toLocaleString() },
              { k: "DeFi TVL",         v: formatDollarCompact(defi.totalTvl), brand: true },
              { k: "Difficulty chg",   v: `${mempool.difficultyChange >= 0 ? "+" : ""}${mempool.difficultyChange.toFixed(2)}%` },
              { k: "Blocks to halving",v: mempool.blocksRemaining.toLocaleString() },
              { k: "Halving est.",     v: new Date(mempool.halvingDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
            ].map((n) => (
              <div key={n.k} className="mtr-ng-cell">
                <div className="mtr-ng-key">{n.k}</div>
                <div className="mtr-ng-val" style={n.brand ? { color: "#ff6a00" } : {}}>{n.v}</div>
              </div>
            )) : [0,1,2,3,4,5].map(i => <div key={i} className="mtr-ng-cell"><Skeleton h={40} /></div>)}
          </div>
        </div>
      </div>

      {/* -- Converter — live Binance WS prices -- */}
      <div className="mtr-sec">Tools</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Crypto <span className="gradient-text-alt">converter</span></span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-conv-row" style={{ gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="number"
                value={convAmount}
                onChange={(e) => setConvAmount(e.target.value)}
                className="mtr-conv-input"
                style={{ width: 90, paddingRight: 8 }}
                min="0"
              />
              <select
                value={convFrom}
                onChange={(e) => setConvFrom(e.target.value)}
                className="mtr-conv-input"
                style={{ width: 80, cursor: "pointer" }}
              >
                {Object.keys(convBinanceMap).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <span className="mtr-conv-eq">=</span>
            <div className="mtr-conv-result">
              {convPrice ? `$${convResult.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—"}
            </div>
          </div>
          <p className="mtr-conv-hint">Live price from Binance · updates in real-time</p>
        </div>
      </div>

    </div>
  );
}

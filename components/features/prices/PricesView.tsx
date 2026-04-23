"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { COIN_ICONS } from "./coinIcons";

const ALL_COINS = [
  { r: 1,  n: "Bitcoin",          s: "BTC",  p: 84231,     mc: 1.67e12, vol: 32.1e9,  c: 2.4,   c7: 5.8,   up: true,  u7: true,  sp: "0,14 6,12 12,16 18,10 24,8 30,11 36,6 44,4",   ico: "btc"  },
  { r: 2,  n: "Ethereum",         s: "ETH",  p: 1842,      mc: 221e9,   vol: 14.2e9,  c: 1.9,   c7: 3.2,   up: true,  u7: true,  sp: "0,12 6,10 12,14 18,8 24,9 30,6 36,7 44,4",    ico: "eth"  },
  { r: 3,  n: "Tether",           s: "USDT", p: 1.00,      mc: 121.3e9, vol: 88.4e9,  c: 0.01,  c7: 0.02,  up: true,  u7: true,  sp: "0,10 6,10 12,10 18,10 24,10 30,10 36,10 44,10", ico: "usdt" },
  { r: 4,  n: "BNB",              s: "BNB",  p: 587.40,    mc: 85.1e9,  vol: 2.1e9,   c: 0.6,   c7: 1.4,   up: true,  u7: true,  sp: "0,10 6,9 12,11 18,8 24,10 30,7 36,8 44,6",    ico: "bnb"  },
  { r: 5,  n: "Solana",           s: "SOL",  p: 134.20,    mc: 61.4e9,  vol: 4.8e9,   c: -0.8,  c7: -2.1,  up: false, u7: false, sp: "0,6 6,8 12,5 18,10 24,12 30,9 36,14 44,12",   ico: "sol"  },
  { r: 6,  n: "USD Coin",         s: "USDC", p: 1.00,      mc: 39.2e9,  vol: 12.8e9,  c: 0.01,  c7: 0.01,  up: true,  u7: true,  sp: "0,10 6,10 12,10 18,10 24,10 30,10 36,10 44,10", ico: "usdc" },
  { r: 7,  n: "XRP",              s: "XRP",  p: 1.33,      mc: 76.2e9,  vol: 5.4e9,   c: -4.1,  c7: -6.8,  up: false, u7: false, sp: "0,4 6,6 12,5 18,8 24,12 30,14 36,16 44,15",   ico: "xrp"  },
  { r: 8,  n: "Dogecoin",         s: "DOGE", p: 0.081,     mc: 11.8e9,  vol: 1.2e9,   c: -1.2,  c7: 0.4,   up: false, u7: true,  sp: "0,8 6,10 12,7 18,12 24,11 30,13 36,12 44,14",  ico: "doge" },
  { r: 9,  n: "Tron",             s: "TRX",  p: 0.244,     mc: 21.0e9,  vol: 0.9e9,   c: 1.2,   c7: 2.8,   up: true,  u7: true,  sp: "0,12 6,11 12,13 18,10 24,9 30,11 36,8 44,7",   ico: "trx"  },
  { r: 10, n: "Cardano",          s: "ADA",  p: 0.42,      mc: 14.8e9,  vol: 0.9e9,   c: 3.1,   c7: 7.4,   up: true,  u7: true,  sp: "0,16 6,14 12,12 18,10 24,8 30,9 36,6 44,4",    ico: "ada"  },
  { r: 11, n: "Avalanche",        s: "AVAX", p: 28.40,     mc: 11.6e9,  vol: 0.8e9,   c: 4.7,   c7: 8.1,   up: true,  u7: true,  sp: "0,18 6,14 12,12 18,10 24,8 30,7 36,5 44,2",    ico: "avax" },
  { r: 12, n: "Shiba Inu",        s: "SHIB", p: 0.0000124, mc: 7.3e9,   vol: 1.1e9,   c: 5.2,   c7: 12.3,  up: true,  u7: true,  sp: "0,16 6,14 12,10 18,8 24,6 30,8 36,4 44,2",     ico: "shib" },
  { r: 13, n: "Polkadot",         s: "DOT",  p: 5.12,      mc: 7.3e9,   vol: 0.4e9,   c: -0.4,  c7: -1.8,  up: false, u7: false, sp: "0,8 6,10 12,9 18,11 24,10 30,12 36,11 44,12",  ico: "dot"  },
  { r: 14, n: "Chainlink",        s: "LINK", p: 14.80,     mc: 9.1e9,   vol: 0.6e9,   c: 2.8,   c7: 4.2,   up: true,  u7: true,  sp: "0,14 6,12 12,10 18,11 24,8 30,6 36,5 44,4",    ico: "link" },
  { r: 15, n: "Litecoin",         s: "LTC",  p: 84.60,     mc: 6.3e9,   vol: 0.5e9,   c: 1.4,   c7: 3.6,   up: true,  u7: true,  sp: "0,12 6,11 12,13 18,10 24,9 30,8 36,7 44,6",    ico: "ltc"  },
  { r: 16, n: "NEAR Protocol",    s: "NEAR", p: 4.82,      mc: 5.8e9,   vol: 0.4e9,   c: 3.4,   c7: 6.2,   up: true,  u7: true,  sp: "0,15 6,13 12,11 18,9 24,7 30,8 36,5 44,3",     ico: "near" },
  { r: 17, n: "Uniswap",          s: "UNI",  p: 6.78,      mc: 4.1e9,   vol: 0.3e9,   c: -2.1,  c7: -4.5,  up: false, u7: false, sp: "0,6 6,8 12,7 18,10 24,12 30,11 36,14 44,13",   ico: "uni"  },
  { r: 18, n: "Polygon",          s: "MATIC",p: 0.62,      mc: 5.8e9,   vol: 0.5e9,   c: -1.4,  c7: -3.2,  up: false, u7: false, sp: "0,8 6,9 12,11 18,13 24,12 30,14 36,13 44,14",  ico: "matic"},
  { r: 19, n: "Cosmos",           s: "ATOM", p: 7.24,      mc: 2.8e9,   vol: 0.2e9,   c: -0.9,  c7: -3.1,  up: false, u7: false, sp: "0,8 6,9 12,7 18,10 24,12 30,10 36,13 44,12",   ico: "atom" },
  { r: 20, n: "Ethereum Classic", s: "ETC",  p: 26.40,     mc: 3.8e9,   vol: 0.3e9,   c: 1.8,   c7: 4.1,   up: true,  u7: true,  sp: "0,13 6,11 12,14 18,10 24,8 30,10 36,7 44,5",   ico: "etc"  },
  { r: 21, n: "Stellar",          s: "XLM",  p: 0.108,     mc: 3.2e9,   vol: 0.2e9,   c: 1.7,   c7: 2.9,   up: true,  u7: true,  sp: "0,14 6,12 12,14 18,10 24,8 30,10 36,6 44,5",   ico: "xlm"  },
  { r: 22, n: "Monero",           s: "XMR",  p: 218.50,    mc: 4.0e9,   vol: 0.2e9,   c: 0.8,   c7: 2.1,   up: true,  u7: true,  sp: "0,11 6,10 12,12 18,9 24,8 30,10 36,7 44,6",    ico: "xmr"  },
  { r: 23, n: "Hedera",           s: "HBAR", p: 0.214,     mc: 8.5e9,   vol: 0.7e9,   c: 5.6,   c7: 11.2,  up: true,  u7: true,  sp: "0,17 6,14 12,12 18,9 24,7 30,8 36,5 44,2",     ico: "hbar" },
  { r: 24, n: "Optimism",         s: "OP",   p: 1.54,      mc: 1.6e9,   vol: 0.2e9,   c: -3.9,  c7: -5.8,  up: false, u7: false, sp: "0,5 6,7 12,6 18,9 24,11 30,13 36,15 44,16",    ico: "op"   },
  { r: 25, n: "Filecoin",         s: "FIL",  p: 4.12,      mc: 2.4e9,   vol: 0.2e9,   c: -4.5,  c7: -7.2,  up: false, u7: false, sp: "0,4 6,6 12,8 18,10 24,12 30,14 36,15 44,16",   ico: "fil"  },
  { r: 26, n: "Arbitrum",         s: "ARB",  p: 0.58,      mc: 2.3e9,   vol: 0.3e9,   c: -2.4,  c7: -4.8,  up: false, u7: false, sp: "0,6 6,8 12,10 18,12 24,11 30,13 36,14 44,15",  ico: "arb"  },
  { r: 27, n: "Aptos",            s: "APT",  p: 8.24,      mc: 4.2e9,   vol: 0.4e9,   c: -7.2,  c7: -9.1,  up: false, u7: false, sp: "0,3 6,5 12,7 18,10 24,13 30,15 36,16 44,17",   ico: "apt"  },
  { r: 28, n: "VeChain",          s: "VET",  p: 0.038,     mc: 2.8e9,   vol: 0.2e9,   c: 2.1,   c7: 4.6,   up: true,  u7: true,  sp: "0,14 6,12 12,10 18,8 24,9 30,7 36,5 44,4",     ico: "vet"  },
  { r: 29, n: "Injective",        s: "INJ",  p: 24.18,     mc: 2.3e9,   vol: 0.5e9,   c: 9.7,   c7: 14.2,  up: true,  u7: true,  sp: "0,18 6,15 12,12 18,9 24,6 30,7 36,4 44,2",     ico: "inj"  },
  { r: 30, n: "Render",           s: "RNDR", p: 7.42,      mc: 3.1e9,   vol: 0.4e9,   c: 12.1,  c7: 18.4,  up: true,  u7: true,  sp: "0,19 6,16 12,13 18,10 24,7 30,8 36,4 44,1",    ico: "rndr" },
];

const HERO_STATS = [
  { label: "Market cap",    val: (e: boolean) => fmt(2.87e12, e), sub: "+1.8%",  up: true  },
  { label: "24h volume",    val: (e: boolean) => fmt(94.2e9,  e), sub: "-3.1%",  up: false },
  { label: "BTC dominance", val: (_: boolean) => "52.4%",         sub: "+0.3%",  up: true  },
  { label: "ETH price",     val: (e: boolean) => fmt(1842,    e), sub: "+1.9%",  up: true  },
  { label: "Coins tracked", val: (_: boolean) => "12,847",        sub: "live",   neutral: true },
];

const RATE = 0.92;
const PER_PAGE = 25;

function fmt(v: number, eur: boolean) {
  const sym = eur ? "€" : "$";
  const val = eur ? v * RATE : v;
  if (val >= 1e12) return sym + (val / 1e12).toFixed(2) + "T";
  if (val >= 1e9)  return sym + (val / 1e9).toFixed(1) + "B";
  if (val >= 1e6)  return sym + (val / 1e6).toFixed(1) + "M";
  if (val >= 1000) return sym + val.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (val >= 1)    return sym + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (val >= 0.01) return sym + val.toFixed(3);
  return sym + val.toFixed(7);
}

function CoinIcon({ sym }: { sym: string }) {
  const url = COIN_ICONS[sym];
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={sym}
      width={28}
      height={28}
      className="pr-coin-ico"
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = "none";
        const fb = img.nextElementSibling as HTMLElement | null;
        if (fb) fb.style.display = "flex";
      }}
    />
  );
}

export default function PricesView() {
  const [query, setQuery]       = useState("");
  const [eur, setEur]           = useState(false);
  const [page, setPage]         = useState(1);
  const [watched, setWatched]   = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/watchlist")
      .then(r => r.ok ? r.json() : [])
      .then((list: { coin_symbol: string }[]) => {
        if (Array.isArray(list)) setWatched(new Set(list.map(c => c.coin_symbol)));
      })
      .catch(() => {});
  }, []);

  async function toggleWatch(sym: string, name: string) {
    if (toggling) return;
    setToggling(sym);
    try {
      if (watched.has(sym)) {
        const res = await fetch(`/api/watchlist?symbol=${sym}`, { method: "DELETE" });
        if (res.ok) setWatched(prev => { const s = new Set(prev); s.delete(sym); return s; });
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coin_symbol: sym, coin_name: name }),
        });
        if (res.ok) setWatched(prev => new Set(prev).add(sym));
      }
    } catch { /* noop */ }
    setToggling(null);
  }

  const filtered = ALL_COINS.filter(
    (c) =>
      c.n.toLowerCase().includes(query.toLowerCase()) ||
      c.s.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function changePage(p: number) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  }

  // Reset to page 1 on search
  function handleSearch(v: string) {
    setQuery(v);
    setPage(1);
  }

  // Build page number list
  function pageNums() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, null, totalPages];
    if (page >= totalPages - 2) return [1, null, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, null, page - 1, page, page + 1, null, totalPages];
  }

  return (
    <div className="pr-root">

      {/* ── 5 hero stats ──────────────────────────────── */}
      <div className="pr-5grid">
        {HERO_STATS.map((s) => (
          <div key={s.label} className="glass pr-hero-cell">
            <div className="pr-hero-label">{s.label}</div>
            <div className="pr-hero-val">{s.val(eur)}</div>
            <div className={`pr-hero-sub${s.up ? " text-positive" : s.neutral ? " pr-hero-neutral" : " text-negative"}`}>
              {!s.neutral && (s.up ? "▲" : "▼")} {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="pr-toolbar">
        <div className="pr-search-wrap">
          <svg className="pr-search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="pr-search"
            placeholder="Search coins…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <span className="pr-search-hint">/</span>
        </div>
        <div className="pr-cur-toggle">
          <button className={`pr-cur-btn${!eur ? " pr-cur-active" : ""}`} onClick={() => setEur(false)}>🇺🇸 USD</button>
          <button className={`pr-cur-btn${eur  ? " pr-cur-active" : ""}`} onClick={() => setEur(true)}>🇪🇺 EUR</button>
        </div>
      </div>

      {/* ── Main 2-col layout ─────────────────────────── */}
      <div className="pr-main-grid">

        {/* LEFT: Coin table */}
        <div className="glass-strong pr-card">
          <div className="pr-card-head">
            <span className="pr-card-title">All <span className="gradient-text-alt">cryptocurrencies</span></span>
            <span className="pr-card-sub">{filtered.length} coins</span>
          </div>
          <div className="pr-card-body">

            {/* Desktop head */}
            <div className="pr-table-head-full">
              <span>#</span><span>Name</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h</span>
              <span className="text-right">7d</span>
              <span className="text-right">Market Cap</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Chart</span>
              <span></span>
            </div>
            {/* Mobile head */}
            <div className="pr-table-head-mobile">
              <span>#</span><span>Name</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h</span>
              <span></span>
            </div>

            {paged.length === 0 && <div className="pr-no-results">No coins found</div>}

            {paged.map((c) => (
              <div key={c.s} className="pr-coin-row-full">
                <span className="pr-rank">{c.r}</span>

                <div className="pr-coin-info">
                  <div className="pr-coin-ico-wrap">
                    <CoinIcon sym={c.s} />
                    {/* Fallback letter avatar */}
                    <span className="pr-coin-fallback" style={{ display: "none" }}>
                      {c.s[0]}
                    </span>
                  </div>
                  <div>
                    <div className="pr-coin-name" data-no-translate>{c.n}</div>
                    <div className="pr-coin-sym" data-no-translate>{c.s}</div>
                  </div>
                </div>

                <div className="pr-coin-price">{fmt(c.p, eur)}</div>

                <div className={`pr-chg${c.up ? " pr-chg-up" : " pr-chg-dn"}`}>
                  {c.c > 0 ? "+" : ""}{c.c}%
                </div>

                <div className={`pr-chg-7d${c.u7 ? " text-positive" : " text-negative"}`}>
                  {c.c7 > 0 ? "+" : ""}{c.c7}%
                </div>

                <div className="pr-coin-mc">{fmt(c.mc, eur)}</div>
                <div className="pr-coin-vol">{fmt(c.vol, eur)}</div>

                <svg className="pr-spark" viewBox="0 0 44 20">
                  <polyline
                    points={c.sp}
                    fill="none"
                    stroke={c.u7 ? "#00d47b" : "#ff3b4f"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                <button
                  onClick={() => toggleWatch(c.s, c.n)}
                  disabled={toggling === c.s}
                  title={watched.has(c.s) ? "Remove from watchlist" : "Add to watchlist"}
                  className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-40"
                  style={watched.has(c.s)
                    ? { color: "#ff6a00", background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.25)" }
                    : { color: "#555", background: "transparent", border: "0.5px solid transparent" }}>
                  <Star size={13} fill={watched.has(c.s) ? "#ff6a00" : "none"} />
                </button>
              </div>
            ))}

            {/* ── Pagination ─────────────────────── */}
            {totalPages > 1 && (
              <div className="pr-pagination">
                <button
                  className="pr-pg-btn pr-pg-arrow"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                >
                  ←
                </button>

                {pageNums().map((p, i) =>
                  p === null ? (
                    <span key={`ellipsis-${i}`} className="pr-pg-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`pr-pg-btn${page === p ? " pr-pg-active" : ""}`}
                      onClick={() => changePage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="pr-pg-btn pr-pg-arrow"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                >
                  →
                </button>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="pr-sidebar">

          {/* BTC hero */}
          <div className="glass-strong pr-card pr-btc-hero">
            <div className="pr-card-body">
              <div className="pr-btc-logo-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={COIN_ICONS["BTC"]} alt="BTC" width={40} height={40} className="pr-btc-logo" />
                <div>
                  <div className="pr-btc-name" data-no-translate>Bitcoin</div>
                  <div className="pr-btc-sym" data-no-translate>BTC</div>
                </div>
                <div className="pr-chg pr-chg-up pr-btc-badge">+2.4%</div>
              </div>
              <div className="pr-btc-price">{fmt(84231, eur)}</div>
              <div className="pr-btc-sub text-positive">▲ +{fmt(1972, eur)} today</div>
              <div className="pr-btc-spark-wrap">
                <svg viewBox="0 0 180 48" preserveAspectRatio="none" style={{ width: "100%", height: 48 }}>
                  <defs>
                    <linearGradient id="btcgrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline points="0,38 20,32 40,36 60,28 80,22 100,30 120,18 140,12 160,8 180,4"
                    fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="0,38 20,32 40,36 60,28 80,22 100,30 120,18 140,12 160,8 180,4 180,48 0,48"
                    fill="url(#btcgrad)" />
                </svg>
              </div>
            </div>
          </div>

          {/* BTC Detail */}
          <div className="glass-strong pr-card">
            <div className="pr-card-head">
              <span className="pr-card-title">BTC / <span className="gradient-text-alt">{eur ? "EUR" : "USD"}</span></span>
              <span className="pr-card-sub">Detail</span>
            </div>
            <div className="pr-card-body">
              <div className="pr-detail-grid">
                {[
                  { k: "Market cap",  v: fmt(1.67e12, eur) },
                  { k: "24h volume",  v: fmt(32.1e9, eur)  },
                  { k: "Circulating", v: "19.84M"           },
                  { k: "Max supply",  v: "21M"              },
                  { k: "ATH",         v: fmt(109114, eur), pos: true },
                  { k: "ATL",         v: fmt(67.81, eur),  neg: true },
                  { k: "FDV",         v: fmt(1.77e12, eur) },
                  { k: "Vol / Mcap",  v: "1.92%"           },
                ].map((d) => (
                  <div key={d.k} className="pr-det-cell">
                    <div className="pr-det-key">{d.k}</div>
                    <div className={`pr-det-val${d.pos ? " text-positive" : d.neg ? " text-negative" : ""}`}>{d.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="glass-strong pr-card">
            <div className="pr-card-head">
              <span className="pr-card-title">BTC <span className="gradient-text-alt">returns</span></span>
            </div>
            <div className="pr-card-body">
              {[
                { k: "1 hour",   v: "+0.3%",  pos: true  },
                { k: "24 hours", v: "+2.4%",  pos: true  },
                { k: "7 days",   v: "+5.8%",  pos: true  },
                { k: "30 days",  v: "-8.2%",  pos: false },
                { k: "90 days",  v: "-14.1%", pos: false },
                { k: "1 year",   v: "+31.6%", pos: true  },
              ].map((d) => (
                <div key={d.k} className="pr-perf-row">
                  <span className="pr-perf-key">{d.k}</span>
                  <div className="pr-perf-bar-wrap">
                    <div className="pr-perf-bar-fill" style={{
                      width: `${Math.min(Math.abs(parseFloat(d.v)) * 3, 100)}%`,
                      background: d.pos ? "#00d47b" : "#ff3b4f",
                      marginLeft: d.pos ? "50%" : `${50 - Math.min(Math.abs(parseFloat(d.v)) * 3, 50)}%`,
                    }} />
                    <div className="pr-perf-center" />
                  </div>
                  <span className={`pr-perf-val${d.pos ? " text-positive" : " text-negative"}`}>{d.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exchanges */}
          <div className="glass-strong pr-card">
            <div className="pr-card-head">
              <span className="pr-card-title">Top <span className="gradient-text-alt">trading pairs</span></span>
              <span className="pr-card-sub">BTC vol</span>
            </div>
            <div className="pr-card-body">
              {[
                { ex: "Binance",  pair: "BTC/USDT", vol: fmt(8.4e9, eur), pct: 100 },
                { ex: "Coinbase", pair: "BTC/USD",  vol: fmt(3.2e9, eur), pct: 38  },
                { ex: "Bybit",    pair: "BTC/USDT", vol: fmt(2.8e9, eur), pct: 33  },
                { ex: "OKX",      pair: "BTC/USDT", vol: fmt(2.1e9, eur), pct: 25  },
                { ex: "Kraken",   pair: "BTC/EUR",  vol: fmt(1.4e9, eur), pct: 17  },
              ].map((p) => (
                <div key={p.ex} className="pr-exch-row">
                  <div className="pr-exch-left">
                    <span className="pr-pair-name">{p.ex}</span>
                    <span className="pr-pair-sym">{p.pair}</span>
                  </div>
                  <div className="pr-exch-right">
                    <div className="pr-exch-bar-wrap">
                      <div className="pr-exch-bar-fill" style={{ width: `${p.pct}%` }} />
                    </div>
                    <span className="pr-pair-vol">{p.vol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Converter */}
          <div className="glass-strong pr-card">
            <div className="pr-card-head">
              <span className="pr-card-title">Crypto <span className="gradient-text-alt">converter</span></span>
            </div>
            <div className="pr-card-body">
              <div className="mtr-conv-row">
                <div className="mtr-conv-input">1 BTC</div>
                <span className="mtr-conv-eq">=</span>
                <div className="mtr-conv-result">{fmt(84231, eur)}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

"use client";
import { useState } from "react";

const COINS = [
  { r: 1,  n: "Bitcoin",   s: "BTC",  p: 84231,      c: 2.4,  c7: 5.8,  up: true,  u7: true,  sp: "0,14 6,12 12,16 18,10 24,8 30,11 36,6 44,4" },
  { r: 2,  n: "Ethereum",  s: "ETH",  p: 1842,       c: 1.9,  c7: 3.2,  up: true,  u7: true,  sp: "0,12 6,10 12,14 18,8 24,9 30,6 36,7 44,4" },
  { r: 3,  n: "Solana",    s: "SOL",  p: 134.20,     c: -0.8, c7: -2.1, up: false, u7: false, sp: "0,6 6,8 12,5 18,10 24,12 30,9 36,14 44,12" },
  { r: 4,  n: "BNB",       s: "BNB",  p: 587.40,     c: 0.6,  c7: 1.4,  up: true,  u7: true,  sp: "0,10 6,9 12,11 18,8 24,10 30,7 36,8 44,6" },
  { r: 5,  n: "XRP",       s: "XRP",  p: 1.33,       c: -4.1, c7: -6.8, up: false, u7: false, sp: "0,4 6,6 12,5 18,8 24,12 30,14 36,16 44,15" },
  { r: 6,  n: "Dogecoin",  s: "DOGE", p: 0.081,      c: -1.2, c7: 0.4,  up: false, u7: true,  sp: "0,8 6,10 12,7 18,12 24,11 30,13 36,12 44,14" },
  { r: 7,  n: "Cardano",   s: "ADA",  p: 0.42,       c: 3.1,  c7: 7.4,  up: true,  u7: true,  sp: "0,16 6,14 12,12 18,10 24,8 30,9 36,6 44,4" },
  { r: 8,  n: "Chainlink", s: "LINK", p: 14.80,      c: 2.8,  c7: 4.2,  up: true,  u7: true,  sp: "0,14 6,12 12,10 18,11 24,8 30,6 36,5 44,4" },
  { r: 9,  n: "Avalanche", s: "AVAX", p: 28.40,      c: 4.7,  c7: 8.1,  up: true,  u7: true,  sp: "0,18 6,14 12,12 18,10 24,8 30,7 36,5 44,2" },
  { r: 10, n: "Polkadot",  s: "DOT",  p: 5.12,       c: -0.4, c7: -1.8, up: false, u7: false, sp: "0,8 6,10 12,9 18,11 24,10 30,12 36,11 44,12" },
  { r: 11, n: "Shiba Inu", s: "SHIB", p: 0.0000124,  c: 5.2,  c7: 12.3, up: true,  u7: true,  sp: "0,16 6,14 12,10 18,8 24,6 30,8 36,4 44,2" },
  { r: 12, n: "Litecoin",  s: "LTC",  p: 84.60,      c: 1.4,  c7: 3.6,  up: true,  u7: true,  sp: "0,12 6,11 12,13 18,10 24,9 30,8 36,7 44,6" },
  { r: 13, n: "Uniswap",   s: "UNI",  p: 6.78,       c: -2.1, c7: -4.5, up: false, u7: false, sp: "0,6 6,8 12,7 18,10 24,12 30,11 36,14 44,13" },
  { r: 14, n: "Stellar",   s: "XLM",  p: 0.108,      c: 1.7,  c7: 2.9,  up: true,  u7: true,  sp: "0,14 6,12 12,14 18,10 24,8 30,10 36,6 44,5" },
  { r: 15, n: "Cosmos",    s: "ATOM", p: 7.24,       c: -0.9, c7: -3.1, up: false, u7: false, sp: "0,8 6,9 12,7 18,10 24,12 30,10 36,13 44,12" },
];

const RATE = 0.92;

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

const ICON_BASE = "https://cdn.jsdelivr.net/gh/nicehash/crypto-icons/svg/color/";

export default function PricesView() {
  const [query, setQuery] = useState("");
  const [eur, setEur] = useState(false);

  const filtered = COINS.filter(
    (c) =>
      c.n.toLowerCase().includes(query.toLowerCase()) ||
      c.s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="pr-root">

      {/* ── Hero stats ───────────────────────── */}
      <div className="pr-hero-grid">
        <div className="glass pr-hero-cell">
          <div className="pr-hero-label">Market cap</div>
          <div className="pr-hero-val">{fmt(2.87e12, eur)}</div>
          <div className="pr-hero-sub text-positive">▲ 1.8%</div>
        </div>
        <div className="glass pr-hero-cell">
          <div className="pr-hero-label">24h volume</div>
          <div className="pr-hero-val">{fmt(94.2e9, eur)}</div>
          <div className="pr-hero-sub text-negative">▼ 3.1%</div>
        </div>
        <div className="glass pr-hero-cell">
          <div className="pr-hero-label">BTC dom.</div>
          <div className="pr-hero-val">52.4%</div>
          <div className="pr-hero-sub text-positive">▲ 0.3%</div>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────── */}
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
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="pr-search-hint">/</span>
        </div>
        <div className="pr-cur-toggle">
          <button
            className={`pr-cur-btn${!eur ? " pr-cur-active" : ""}`}
            onClick={() => setEur(false)}
          >
            🇺🇸 USD
          </button>
          <button
            className={`pr-cur-btn${eur ? " pr-cur-active" : ""}`}
            onClick={() => setEur(true)}
          >
            🇪🇺 EUR
          </button>
        </div>
      </div>

      {/* ── Coin list ────────────────────────── */}
      <div className="glass-strong pr-card">
        <div className="pr-card-head">
          <span className="pr-card-title">All <span className="gradient-text-alt">cryptocurrencies</span></span>
          <span className="pr-card-sub">12,847 coins</span>
        </div>
        <div className="pr-card-body">
          <div className="pr-table-head">
            <span>#</span>
            <span>Name</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h</span>
            <span className="text-right hidden sm:block">7d</span>
          </div>
          {filtered.length === 0 && (
            <div className="pr-no-results">No coins found</div>
          )}
          {filtered.map((c) => (
            <div key={c.s} className="pr-coin-row">
              <span className="pr-rank">{c.r}</span>
              <div className="pr-coin-info">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${ICON_BASE}${c.s.toLowerCase()}.svg`}
                  alt={c.s}
                  width={32}
                  height={32}
                  className="pr-coin-ico"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <div className="pr-coin-name">{c.n}</div>
                  <div className="pr-coin-sym">{c.s}</div>
                </div>
              </div>
              <div className="pr-coin-price">{fmt(c.p, eur)}</div>
              <div className={`pr-chg${c.up ? " pr-chg-up" : " pr-chg-dn"}`}>
                {c.c > 0 ? "+" : ""}{c.c}%
              </div>
              <svg className="pr-spark hidden sm:block" viewBox="0 0 44 20">
                <polyline
                  points={c.sp}
                  fill="none"
                  stroke={c.u7 ? "#00d47b" : "#ff3b4f"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bitcoin detail ───────────────────── */}
      <div className="pr-sec">Bitcoin detail</div>
      <div className="glass-strong pr-card">
        <div className="pr-card-head">
          <span className="pr-card-title">BTC / <span className="gradient-text-alt">{eur ? "EUR" : "USD"}</span></span>
          <span className="pr-card-sub">Bitcoin</span>
        </div>
        <div className="pr-card-body">
          <div className="pr-detail-grid">
            {[
              { k: "Market cap", v: fmt(1.67e12, eur) },
              { k: "24h volume", v: fmt(32.1e9, eur) },
              { k: "Circulating", v: "19.84M" },
              { k: "Max supply", v: "21M" },
              { k: "All-time high", v: fmt(109114, eur), pos: true },
              { k: "All-time low",  v: fmt(67.81, eur), neg: true },
              { k: "FDV", v: fmt(1.77e12, eur) },
              { k: "Vol / Mcap", v: "1.92%" },
            ].map((d) => (
              <div key={d.k} className="pr-det-cell">
                <div className="pr-det-key">{d.k}</div>
                <div className={`pr-det-val${d.pos ? " text-positive" : d.neg ? " text-negative" : ""}`}>{d.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Performance ──────────────────────── */}
      <div className="pr-sec">Performance</div>
      <div className="glass-strong pr-card">
        <div className="pr-card-head">
          <span className="pr-card-title">BTC <span className="gradient-text-alt">returns</span></span>
        </div>
        <div className="pr-card-body">
          <div className="pr-detail-grid">
            {[
              { k: "1 hour",   v: "+0.3%",  pos: true },
              { k: "24 hours", v: "+2.4%",  pos: true },
              { k: "7 days",   v: "+5.8%",  pos: true },
              { k: "30 days",  v: "-8.2%",  neg: true },
              { k: "90 days",  v: "-14.1%", neg: true },
              { k: "1 year",   v: "+31.6%", pos: true },
            ].map((d) => (
              <div key={d.k} className="pr-det-cell">
                <div className="pr-det-key">{d.k}</div>
                <div className={`pr-det-val${d.pos ? " text-positive" : " text-negative"}`}>{d.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Exchanges ────────────────────────── */}
      <div className="pr-sec">Exchanges</div>
      <div className="glass-strong pr-card">
        <div className="pr-card-head">
          <span className="pr-card-title">Top <span className="gradient-text-alt">trading pairs</span></span>
          <span className="pr-card-sub">BTC volume</span>
        </div>
        <div className="pr-card-body">
          {[
            { ex: "Binance",  pair: "BTC/USDT", vol: fmt(8.4e9, eur) },
            { ex: "Coinbase", pair: "BTC/USD",  vol: fmt(3.2e9, eur) },
            { ex: "Bybit",    pair: "BTC/USDT", vol: fmt(2.8e9, eur) },
            { ex: "OKX",      pair: "BTC/USDT", vol: fmt(2.1e9, eur) },
            { ex: "Kraken",   pair: "BTC/EUR",  vol: fmt(1.4e9, eur) },
          ].map((p) => (
            <div key={p.ex} className="pr-pair-row">
              <span className="pr-pair-name">{p.ex}</span>
              <span className="pr-pair-sym">{p.pair}</span>
              <span className="pr-pair-vol">{p.vol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Converter ────────────────────────── */}
      <div className="pr-sec">Converter</div>
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
  );
}

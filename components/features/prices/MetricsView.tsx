"use client";
import RainbowChart from "./RainbowChart";

const SUB_STATS = [
  { label: "Market cap",    value: "$2.87T",  sub: "+1.8%",  up: true  },
  { label: "24h volume",   value: "$94.2B",  sub: "-3.1%",  up: false },
  { label: "BTC dominance",value: "52.4%",   sub: "+0.3%",  up: true  },
  { label: "Coins tracked",value: "12,847",  sub: "live",   neutral: true },
];

const GAINERS = [
  { ico: "P", color: "#ff6a00", bg: "rgba(255,106,0,0.1)",   name: "Pepe",      sym: "PEPE", price: "$0.0000082", chg: "+18.4%" },
  { ico: "R", color: "#b16aff", bg: "rgba(177,106,255,0.1)", name: "Render",    sym: "RNDR", price: "$7.42",      chg: "+12.1%" },
  { ico: "I", color: "#4a9eff", bg: "rgba(74,158,255,0.1)",  name: "Injective", sym: "INJ",  price: "$24.18",     chg: "+9.7%"  },
  { ico: "K", color: "#00d47b", bg: "rgba(0,212,123,0.1)",   name: "Kaspa",     sym: "KAS",  price: "$0.142",     chg: "+8.3%"  },
  { ico: "S", color: "#00c9a7", bg: "rgba(0,201,167,0.1)",   name: "Sui",       sym: "SUI",  price: "$1.08",      chg: "+7.1%"  },
];

const LOSERS = [
  { ico: "A", color: "#ff3b4f", bg: "rgba(255,59,79,0.1)",   name: "Aptos",    sym: "APT",  price: "$8.24",  chg: "-7.2%" },
  { ico: "W", color: "#ffc233", bg: "rgba(255,194,51,0.1)",  name: "Wormhole", sym: "W",    price: "$0.31",  chg: "-6.8%" },
  { ico: "S", color: "#ff3b4f", bg: "rgba(255,59,79,0.1)",   name: "Starknet", sym: "STRK", price: "$0.78",  chg: "-5.9%" },
  { ico: "F", color: "#666",    bg: "rgba(102,102,102,0.1)", name: "Filecoin", sym: "FIL",  price: "$4.12",  chg: "-4.5%" },
  { ico: "O", color: "#ff6eb4", bg: "rgba(255,110,180,0.1)", name: "Optimism", sym: "OP",   price: "$1.54",  chg: "-3.9%" },
];

const STABLES = [
  { name: "USDT",   val: "$121.3B", pct: 68, color: "linear-gradient(90deg,#00d47b,#00c9a7)" },
  { name: "USDC",   val: "$39.2B",  pct: 22, color: "linear-gradient(90deg,#4a9eff,#2563eb)" },
  { name: "DAI",    val: "$7.1B",   pct: 4,  color: "#ffc233" },
  { name: "Others", val: "$10.8B",  pct: 6,  color: "#555" },
];

const NET_STATS = [
  { k: "BTC hash rate",    v: "612 EH/s" },
  { k: "Active addresses", v: "1.02M" },
  { k: "DeFi TVL",         v: "$94.7B", brand: true },
  { k: "NFT volume 24h",   v: "$18.2M" },
  { k: "BTC difficulty",   v: "83.7T" },
  { k: "ETH staked",       v: "31.2M" },
];

function CoinTable({ rows, type }: { rows: typeof GAINERS; type: "up" | "dn" }) {
  return (
    <div>
      <div className="mtr-col-head">
        <span>Asset</span><span className="text-right">Price</span><span className="text-right">24h</span>
      </div>
      {rows.map((r) => (
        <div key={r.sym} className="mtr-coin-row">
          <div className="flex items-center gap-2.5">
            <span className="mtr-ico" style={{ background: r.bg, color: r.color }}>{r.ico}</span>
            <div><div className="mtr-nm">{r.name}</div><div className="mtr-sy">{r.sym}</div></div>
          </div>
          <div className="mtr-pr">{r.price}</div>
          <div className={`mtr-chg ${type}`}>{r.chg}</div>
        </div>
      ))}
    </div>
  );
}

export default function MetricsView() {
  return (
    <div className="mtr-root">

      {/* ── Row 1: Bitcoin hero ─────────────────── */}
      <div className="mtr-stat glass mtr-stat-hero" style={{ marginBottom: 8 }}>
        <div className="mtr-stat-label mtr-stat-label-hero">Bitcoin</div>
        <div className="mtr-stat-val mtr-stat-val-hero">$84,231</div>
        <div className="mtr-stat-sub text-positive">▲ +$1,972 (2.4%) today</div>
      </div>

      {/* ── Row 2: 4 stat cards ─────────────────── */}
      <div className="mtr-4grid">
        {SUB_STATS.map((s) => (
          <div key={s.label} className="mtr-stat glass">
            <div className="mtr-stat-label">{s.label}</div>
            <div className="mtr-stat-val">{s.value}</div>
            <div className={`mtr-stat-sub${s.up ? " text-positive" : s.neutral ? " mtr-stat-neutral" : " text-negative"}`}>
              {!s.neutral && (s.up ? "▲" : "▼")} {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Rainbow chart ───────────────────────── */}
      <div className="mtr-sec">Charts &amp; indicators</div>
      <RainbowChart />

      {/* ── Row 3: Fear / Halving / Altseason ─────── */}
      <div className="mtr-sec" style={{ marginTop: 4 }}>Sentiment &amp; cycle</div>
      <div className="mtr-triple-grid">

        {/* Fear & Greed */}
        <div className="glass-strong mtr-card mtr-card-fill">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Fear &amp; greed <span className="gradient-text-alt">index</span></span>
            <span className="mtr-card-sub">Sentiment</span>
          </div>
          <div className="mtr-card-body mtr-fg-stacked">
            <div className="mtr-gauge-wrap" style={{ margin: "0 auto 14px" }}>
              <svg viewBox="0 0 110 110" width="110" height="110">
                <defs>
                  <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff2020" />
                    <stop offset="35%" stopColor="#ff6a00" />
                    <stop offset="65%" stopColor="#ffc233" />
                    <stop offset="100%" stopColor="#00d47b" />
                  </linearGradient>
                </defs>
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="55" cy="55" r="46" fill="none" stroke="url(#gg)" strokeWidth="8"
                  strokeDasharray="289" strokeDashoffset="100" strokeLinecap="round"
                  transform="rotate(-126 55 55)" />
              </svg>
              <div className="mtr-gauge-inner">
                <span className="mtr-gauge-num">45</span>
                <span className="mtr-gauge-lbl">Fear</span>
              </div>
            </div>
            <div>
              {[
                { k: "Now",        v: "45 — Fear",         c: "#ff6a00" },
                { k: "Yesterday",  v: "42 — Fear",         c: "#ff6a00" },
                { k: "Last week",  v: "28 — Extreme fear", c: "#ff3b4f" },
                { k: "Last month", v: "61 — Greed",        c: "#00d47b" },
              ].map((row) => (
                <div key={row.k} className="mtr-fg-row">
                  <span className="mtr-fg-key">{row.k}</span>
                  <span style={{ color: row.c, fontSize: 11, fontWeight: 600 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BTC Halving */}
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
                  strokeDasharray="188" strokeDashoffset="141" strokeLinecap="round" />
              </svg>
              <div className="mtr-hlv-pct">25%</div>
            </div>
            <div className="text-center">
              <div className="mtr-hlv-title">Next halving event</div>
              <div className="mtr-hlv-days">~696 days</div>
              <div className="mtr-hlv-sub">Estimated March 2028</div>
              <div className="mtr-hlv-sub" style={{ marginTop: 6 }}>Block reward: 3.125 → 1.5625 BTC</div>
            </div>
          </div>
        </div>

        {/* Altcoin Season */}
        <div className="glass-strong mtr-card mtr-card-fill">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Altcoin season <span className="gradient-text-alt">index</span></span>
            <span className="mtr-card-sub">32 / 100</span>
          </div>
          <div className="mtr-card-body">
            {/* Big score */}
            <div className="mtr-alt-score">32</div>
            <div className="mtr-as-bar"><div className="mtr-as-fill" style={{ width: "32%" }} /></div>
            <div className="mtr-as-lbl"><span>BTC season</span><span>Altcoin season</span></div>
            <p className="mtr-as-note" style={{ marginTop: 12 }}>
              32% of top 50 altcoins outperformed BTC over the last 90 days.
            </p>
            <div className="mtr-alt-badge">Bitcoin Season</div>
          </div>
        </div>

      </div>

      {/* ── Row 4: Gainers / Losers ─────────────── */}
      <div className="mtr-sec">Market movers</div>
      <div className="mtr-duo-grid">
        <div className="glass-strong mtr-card">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Top <span className="gradient-text-alt">gainers</span></span>
            <span className="mtr-card-sub">24h</span>
          </div>
          <div className="mtr-card-body"><CoinTable rows={GAINERS} type="up" /></div>
        </div>
        <div className="glass-strong mtr-card">
          <div className="mtr-card-head">
            <span className="mtr-card-title">Top <span className="gradient-text-alt">losers</span></span>
            <span className="mtr-card-sub">24h</span>
          </div>
          <div className="mtr-card-body"><CoinTable rows={LOSERS} type="dn" /></div>
        </div>
      </div>

      {/* ── Liquidations ──────────────────────────── */}
      <div className="mtr-sec">Derivatives &amp; leverage</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Liquidations <span className="gradient-text-alt">24h</span></span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-liq-row">
            <div className="mtr-liq-c mtr-liq-long">
              <div className="mtr-liq-label" style={{ color: "#00d47b" }}>Longs</div>
              <div className="mtr-liq-val" style={{ color: "#00d47b" }}>$124M</div>
            </div>
            <div className="mtr-liq-c mtr-liq-short">
              <div className="mtr-liq-label" style={{ color: "#ff3b4f" }}>Shorts</div>
              <div className="mtr-liq-val" style={{ color: "#ff3b4f" }}>$87M</div>
            </div>
          </div>
          <div className="mtr-ng-grid">
            {[
              { k: "Largest single",  v: "$4.2M",   c: "#ff3b4f" },
              { k: "Total liquidated",v: "$211M" },
              { k: "BTC funding",     v: "+0.012%", c: "#00d47b" },
              { k: "Open interest",   v: "$18.4B" },
            ].map((n) => (
              <div key={n.k} className="mtr-ng-cell">
                <div className="mtr-ng-key">{n.k}</div>
                <div className="mtr-ng-val" style={n.c ? { color: n.c } : {}}>{n.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dominance & Supply ─────────────────────── */}
      <div className="mtr-sec">Dominance &amp; supply</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Market <span className="gradient-text-alt">dominance</span></span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-dom-bar">
            <div style={{ flex: 52.4, background: "linear-gradient(90deg,#ff6a00,#ff8a30)" }} />
            <div style={{ flex: 17.2, background: "#4a9eff" }} />
            <div style={{ flex: 8.1,  background: "#b16aff" }} />
            <div style={{ flex: 3.8,  background: "#00c9a7" }} />
            <div style={{ flex: 18.5, background: "#333" }} />
          </div>
          <div className="mtr-dom-legend">
            {[
              { label: "BTC 52.4%",    c: "#ff6a00" },
              { label: "ETH 17.2%",    c: "#4a9eff" },
              { label: "SOL 8.1%",     c: "#b16aff" },
              { label: "BNB 3.8%",     c: "#00c9a7" },
              { label: "Others 18.5%", c: "#333" },
            ].map((d) => (
              <span key={d.label} className="mtr-dom-item">
                <span className="mtr-dom-dot" style={{ background: d.c }} />
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Stablecoin <span className="gradient-text-alt">supply</span></span>
          <span className="mtr-card-sub">$178.4B total</span>
        </div>
        <div className="mtr-card-body">
          {STABLES.map((s) => (
            <div key={s.name} className="mtr-sc-row">
              <span className="mtr-sc-name">{s.name}</span>
              <div className="mtr-sc-bar-wrap"><div className="mtr-sc-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} /></div>
              <span className="mtr-sc-val">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gas & Network ─────────────────────────── */}
      <div className="mtr-sec">Network &amp; gas</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">ETH <span className="gradient-text-alt">gas tracker</span></span>
          <span className="mtr-card-sub">Gwei</span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-gas-grid">
            {[
              { tier: "Slow",     val: "5",  time: "~5 min",  cls: "slow" },
              { tier: "Standard", val: "8",  time: "~2 min",  cls: "std"  },
              { tier: "Fast",     val: "12", time: "~15 sec", cls: "fast" },
            ].map((g) => (
              <div key={g.tier} className={`mtr-gas-cell mtr-gas-${g.cls}`}>
                <div className="mtr-gas-tier">{g.tier}</div>
                <div className="mtr-gas-val">{g.val}</div>
                <div className="mtr-gas-time">{g.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Network <span className="gradient-text-alt">stats</span></span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-ng-grid">
            {NET_STATS.map((n) => (
              <div key={n.k} className="mtr-ng-cell">
                <div className="mtr-ng-key">{n.k}</div>
                <div className="mtr-ng-val" style={n.brand ? { color: "#ff6a00" } : {}}>{n.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Converter ─────────────────────────────── */}
      <div className="mtr-sec">Tools</div>
      <div className="glass-strong mtr-card">
        <div className="mtr-card-head">
          <span className="mtr-card-title">Crypto <span className="gradient-text-alt">converter</span></span>
        </div>
        <div className="mtr-card-body">
          <div className="mtr-conv-row">
            <div className="mtr-conv-input">1 BTC</div>
            <span className="mtr-conv-eq">=</span>
            <div className="mtr-conv-result">$84,231</div>
          </div>
          <p className="mtr-conv-hint">Tap to convert between any pair</p>
        </div>
      </div>

    </div>
  );
}

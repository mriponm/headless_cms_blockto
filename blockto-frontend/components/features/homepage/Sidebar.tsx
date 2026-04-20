"use client";
import { Star, Flame, Clock } from "lucide-react";
import { useCryptoData } from "@/lib/hooks/useCryptoData";
import { formatPrice, formatPercent, percentClass } from "@/lib/utils/formatters";
import clsx from "clsx";

const TRENDING = [
  { n: "01", title: "Bitcoin reclaims $84K as bulls eye key resistance",     meta: "BTC · 12K reads" },
  { n: "02", title: "Altseason pauses: BTC dominance hits 54%",              meta: "Market · 9.8K reads" },
  { n: "03", title: "Top 5 altcoins with bullish divergence",                meta: "Altcoin · 8.2K reads" },
  { n: "04", title: "Liquidation map: where is smart money positioned?",     meta: "Analysis · 7.1K reads" },
];

const WATCHLIST_STATIC = [
  { name: "Bitcoin",   sym: "BTC", price: "$84,231", change: "+2.4%", up: true,  iconBg: "rgba(255,106,0,0.12)", iconColor: "#ff6a00", sym2: "₿" },
  { name: "Ethereum",  sym: "ETH", price: "$1,842",  change: "+1.9%", up: true,  iconBg: "rgba(74,158,255,0.12)", iconColor: "#4a9eff", sym2: "Ξ" },
  { name: "Solana",    sym: "SOL", price: "$134.20", change: "-0.8%", up: false, iconBg: "rgba(177,106,255,0.12)", iconColor: "#b16aff", sym2: "S" },
  { name: "Chainlink", sym: "LINK",price: "$14.80",  change: "+2.8%", up: true,  iconBg: "rgba(0,212,123,0.12)", iconColor: "#00d47b",  sym2: "L" },
];

function SbTitle({ label, Icon }: { label: string; Icon: React.ComponentType<{ size: number; className?: string }> }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[2px] text-[var(--color-brand)] mb-4 pb-3 relative border-b border-[rgba(255,106,0,0.15)] font-[family-name:var(--font-display)]">
      <span className="w-[22px] h-[22px] rounded-[7px] bg-[rgba(255,106,0,0.1)] border border-[rgba(255,106,0,0.2)] flex items-center justify-center flex-shrink-0">
        <Icon size={12} className="text-[var(--color-brand)]" />
      </span>
      {label}
      <span className="absolute bottom-[-0.5px] left-0 w-7 h-px bg-gradient-to-r from-[var(--color-brand)] to-transparent" />
    </div>
  );
}

export default function Sidebar() {
  const { data } = useCryptoData();

  const watchlist = data
    ? [
        { name: "Bitcoin",   sym: "BTC",  coin: data.coins.find(c => c.id === "bitcoin"),   iconBg: "rgba(255,106,0,0.12)",    iconColor: "#ff6a00", sym2: "₿" },
        { name: "Ethereum",  sym: "ETH",  coin: data.coins.find(c => c.id === "ethereum"),  iconBg: "rgba(74,158,255,0.12)",   iconColor: "#4a9eff", sym2: "Ξ" },
        { name: "Solana",    sym: "SOL",  coin: data.coins.find(c => c.id === "solana"),    iconBg: "rgba(177,106,255,0.12)",  iconColor: "#b16aff", sym2: "S" },
        { name: "Chainlink", sym: "LINK", coin: data.coins.find(c => c.id === "chainlink"), iconBg: "rgba(0,212,123,0.12)",    iconColor: "#00d47b", sym2: "L" },
      ]
    : null;

  return (
    <aside className="flex flex-col gap-[18px] sticky top-24 self-start">
      {/* Watchlist */}
      <div className="glass p-5 rounded-[18px] relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <SbTitle label="Your watchlist" Icon={Star} />
        {(watchlist ?? WATCHLIST_STATIC.map(w => ({ ...w, coin: null }))).map((w, i) => {
          const price  = w.coin ? formatPrice(w.coin.current_price) : (WATCHLIST_STATIC[i]?.price ?? "");
          const change = w.coin ? formatPercent(w.coin.price_change_percentage_24h) : (WATCHLIST_STATIC[i]?.change ?? "");
          const up     = w.coin ? w.coin.price_change_percentage_24h >= 0 : (WATCHLIST_STATIC[i]?.up ?? true);
          return (
            <div key={w.sym} className={clsx("flex items-center gap-2.5 py-2.5 cursor-pointer", i > 0 && "border-t border-[rgba(255,255,255,0.04)]")}>
              <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
                   style={{ background: w.iconBg, color: w.iconColor }}>
                {w.sym2}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold font-[family-name:var(--font-display)]">{w.name}</p>
                <p className="text-[10px] text-[#666] font-[family-name:var(--font-data)] font-medium">{w.sym}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold font-[family-name:var(--font-data)]">{price}</p>
                <p className={clsx("text-[10px] font-bold font-[family-name:var(--font-data)]", up ? "text-positive" : "text-negative")}>{change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending */}
      <div className="glass p-5 rounded-[18px] relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <SbTitle label="Trending now" Icon={Flame} />
        {TRENDING.map((t, i) => (
          <div key={t.n} className={clsx("flex gap-3 py-2.5 cursor-pointer", i > 0 && "border-t border-[rgba(255,255,255,0.04)]")}>
            <span className="text-[20px] font-black font-[family-name:var(--font-data)] gradient-text-alt leading-none min-w-[30px]">{t.n}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-[1.35] mb-1 tracking-[-0.1px] font-[family-name:var(--font-display)]">{t.title}</p>
              <p className="text-[10px] text-[#555] font-semibold font-[family-name:var(--font-display)]">{t.meta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fear & Greed */}
      <div className="glass p-5 rounded-[18px] relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <SbTitle label="Fear & greed" Icon={Clock} />
        <div className="flex items-center gap-4 pt-1 pb-2">
          {/* Gauge */}
          <div className="relative w-[90px] h-[90px] flex-shrink-0">
            <svg viewBox="0 0 90 90" width="90" height="90">
              <defs>
                <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#ff2020" />
                  <stop offset="35%"  stopColor="#ff6a00" />
                  <stop offset="65%"  stopColor="#ffc233" />
                  <stop offset="100%" stopColor="#00d47b" />
                </linearGradient>
              </defs>
              <circle cx="45" cy="45" r="37" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
              <circle cx="45" cy="45" r="37" fill="none" stroke="url(#gg)" strokeWidth="7"
                strokeDasharray="233" strokeDashoffset="82" strokeLinecap="round"
                transform="rotate(-126 45 45)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-black font-[family-name:var(--font-data)] leading-none" style={{ background: "linear-gradient(180deg,#fff,#ff6a00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>45</span>
              <span className="text-[9px] font-bold text-[var(--color-brand)] tracking-[0.5px] uppercase mt-0.5 font-[family-name:var(--font-display)]">Fear</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            {[["Now","Fear","#ff6a00"],["Yesterday","42","#ff6a00"],["Last week","28","#ff3b4f"],["Last month","61","#00d47b"]].map(([k,v,c]) => (
              <div key={k} className="flex justify-between text-[11px] py-1 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <span className="text-[#555] font-medium font-[family-name:var(--font-display)]">{k}</span>
                <span className="font-semibold font-[family-name:var(--font-data)]" style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div
        className="relative p-5 rounded-[18px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(255,106,0,0.1), rgba(255,106,0,0.02))", border: "0.5px solid rgba(255,106,0,0.2)" }}
      >
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent" />
        <span className="absolute top-[-30%] right-[-20%] w-[70%] h-[80%] bg-[radial-gradient(circle,rgba(255,106,0,0.15),transparent_70%)] blur-[30px] pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-[17px] font-extrabold tracking-[-0.3px] mb-1.5 font-[family-name:var(--font-display)]">Get the daily brief</h3>
          <p className="text-[12px] text-[#aaa] font-medium leading-[1.5] mb-3.5 font-[family-name:var(--font-display)]">
            Market moves, breaking news & signals delivered every morning.
          </p>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-black/40 border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[#f5f5f5] placeholder:text-[#555] outline-none mb-2 focus:border-[rgba(255,106,0,0.4)] focus:shadow-[0_0_0_3px_rgba(255,106,0,0.06)] transition-all font-[family-name:var(--font-display)]"
          />
          <button
            className="w-full py-[11px] rounded-[10px] text-[13px] font-extrabold text-black cursor-pointer font-[family-name:var(--font-display)]"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </aside>
  );
}

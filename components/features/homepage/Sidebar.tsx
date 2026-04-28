"use client";
import { Star, Flame, Clock, Plus, X, Check, Search } from "lucide-react";
import TranslatedText from "@/components/ui/TranslatedText";
import Link from "next/link";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { usePriceStore } from "@/lib/store/priceStore";
import { formatPrice, formatPercent } from "@/lib/utils/formatters";
import { COIN_ICONS } from "@/components/features/prices/coinIcons";
import { COIN_IDS } from "@/lib/coinIds";
import { primaryCategory } from "@/lib/wordpress/queries";
import type { WPPost } from "@/lib/wordpress/types";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import clsx from "clsx";

const MAX_WATCHLIST = 10;
const DEFAULT_SYMS  = ["BTC", "ETH", "SOL", "LINK"];

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface MarketCoin {
  id: string; symbol: string; name: string;
  current_price: number; price_change_percentage_24h: number;
}

interface FGResponse {
  current?: { value?: number; value_classification?: string };
  history?: Array<{ value: number; value_classification: string }>;
}

/* --- Coin icon (real image, falls back to initials) ----------- */
function CoinIcon({ sym, size = 30 }: { sym: string; size?: number }) {
  const src = (COIN_ICONS as Record<string, string>)[sym.toUpperCase()];
  if (src) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={sym} width={size} height={size}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
  );
  return (
    <div className="rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
      style={{ width: size, height: size, background: "rgba(255,106,0,0.12)", color: "#ff6a00" }}>
      {sym.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* --- Add-coin modal ------------------------------------------- */
function WatchlistAddModal({ coins, current, onSave, onClose }: {
  coins: MarketCoin[];
  current: string[];
  onSave: (syms: string[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(current));
  const [query, setQuery] = useState("");

  const filtered = coins.filter(c => {
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
  });

  function toggle(sym: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(sym)) next.delete(sym);
      else if (next.size < MAX_WATCHLIST) next.add(sym);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" onClick={onClose} />
      <div className="relative w-full max-w-[360px] rounded-[20px] overflow-hidden"
        style={{ background: "rgba(14,14,14,0.97)", border: "0.5px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <p className="text-[15px] font-extrabold tracking-[-0.3px] font-[family-name:var(--font-display)]">Add to watchlist</p>
            <p className="text-[11px] text-[#666] font-medium mt-0.5">{selected.size}/{MAX_WATCHLIST} coins selected</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[9px] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5">
            <X size={14} className="text-[#888]" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/[0.07]">
            <Search size={13} className="text-[#555] flex-shrink-0" />
            <input type="text" placeholder="Search coins…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-[#ddd] placeholder-[#555] outline-none font-[family-name:var(--font-display)]"
              autoFocus />
          </div>
        </div>

        <div className="px-4 pb-2 max-h-[300px] overflow-y-auto">
          {filtered.map((c, i) => {
            const sym  = c.symbol.toUpperCase();
            const on   = selected.has(sym);
            const atMax = !on && selected.size >= MAX_WATCHLIST;
            return (
              <button key={c.id} onClick={() => toggle(sym)} disabled={atMax}
                className={clsx(
                  "w-full flex items-center gap-3 py-2.5 px-2 rounded-[10px] transition-all duration-150 text-left",
                  i > 0 && "border-t border-white/[0.04]",
                  on && "bg-[rgba(255,106,0,0.05)]",
                  atMax ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                )}>
                <CoinIcon sym={sym} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold font-[family-name:var(--font-display)]" data-no-translate>{c.name}</p>
                  <p className="text-[10px] text-[#555] font-[family-name:var(--font-data)] font-medium" data-no-translate>{sym}</p>
                </div>
                <div className="text-right mr-2">
                  <p className="text-[12px] font-semibold font-[family-name:var(--font-data)]">{formatPrice(c.current_price)}</p>
                  <p className={clsx("text-[10px] font-bold font-[family-name:var(--font-data)]", c.price_change_percentage_24h >= 0 ? "text-positive" : "text-negative")}>
                    {formatPercent(c.price_change_percentage_24h)}
                  </p>
                </div>
                <div className={clsx("w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0 transition-all duration-150",
                  on ? "bg-[var(--color-brand)]" : "border border-white/10 bg-white/[0.03]")}>
                  {on && <Check size={11} strokeWidth={3} className="text-black" />}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-[12px] text-[#555] py-6 font-[family-name:var(--font-display)]">No coins match</p>
          )}
        </div>

        <div className="px-4 pb-4 pt-2">
          <button onClick={() => { onSave(Array.from(selected)); onClose(); }}
            className="w-full py-3 rounded-[12px] text-[13px] font-extrabold text-black cursor-pointer transition-all duration-150 hover:-translate-y-0.5 font-[family-name:var(--font-display)]"
            style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 6px 20px rgba(255,106,0,0.25)" }}>
            Save watchlist
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Section title -------------------------------------------- */
function SbTitle({ label, Icon, action }: {
  label: string;
  Icon: React.ComponentType<{ size: number; className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[2px] text-[var(--color-brand)] mb-4 pb-3 relative border-b border-[rgba(255,106,0,0.15)] font-[family-name:var(--font-display)]">
      <span className="w-[22px] h-[22px] rounded-[7px] bg-[rgba(255,106,0,0.1)] border border-[rgba(255,106,0,0.2)] flex items-center justify-center flex-shrink-0">
        <Icon size={12} className="text-[var(--color-brand)]" />
      </span>
      {label}
      {action && <span className="ml-auto">{action}</span>}
      <span className="absolute bottom-[-0.5px] left-0 w-7 h-px bg-gradient-to-r from-[var(--color-brand)] to-transparent" />
    </div>
  );
}

/* --- Sidebar -------------------------------------------------- */
export default function Sidebar({ trendingPosts }: { trendingPosts: WPPost[] }) {
  const { openModal } = useAuthModal();
  const prices  = usePriceStore((s) => s.prices);
  const changes = usePriceStore((s) => s.changes);

  const { data: markets } = useSWR<MarketCoin[]>("/api/markets", fetcher, {
    refreshInterval: 60_000, keepPreviousData: true,
  });
  const { data: fg } = useSWR<FGResponse>("/api/fear-greed", fetcher, {
    refreshInterval: 3_600_000, keepPreviousData: true,
  });

  const [addOpen, setAddOpen]             = useState(false);
  const [watchlistSyms, setWatchlistSyms] = useState<string[]>(DEFAULT_SYMS);
  const [isAuthed, setIsAuthed]           = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(me => {
        if (!me) return;
        setIsAuthed(true);
        return fetch("/api/watchlist").then(r => r.ok ? r.json() : []);
      })
      .then(wl => {
        if (!Array.isArray(wl) || wl.length === 0) return;
        setWatchlistSyms(wl.map((c: { coin_symbol: string }) => c.coin_symbol.toUpperCase()));
      })
      .catch(() => {});
  }, []);

  async function handleAddClick() {
    if (isAuthed) setAddOpen(true);
    else openModal("signin", () => setAddOpen(true));
  }

  async function handleSave(newSyms: string[]) {
    const prevSet = new Set(watchlistSyms);
    const newSet  = new Set(newSyms);
    setWatchlistSyms(newSyms);
    if (!isAuthed) return;
    const toAdd    = newSyms.filter(s => !prevSet.has(s));
    const toRemove = watchlistSyms.filter(s => !newSet.has(s));
    await Promise.all([
      ...toAdd.map(sym => {
        const coin = markets?.find(c => c.symbol.toUpperCase() === sym);
        return fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coin_symbol: sym, coin_name: coin?.name ?? sym }),
        });
      }),
      ...toRemove.map(sym =>
        fetch(`/api/watchlist?symbol=${encodeURIComponent(sym)}`, { method: "DELETE" })
      ),
    ]);
  }

  const fgValue = fg?.current?.value;
  const fgLabel = fg?.current?.value_classification ?? "Fear";
  const fgHistory = fg?.history?.slice(0, 4) ?? [];

  return (
    <aside className="flex flex-col gap-[18px]">

      {addOpen && markets && (
        <WatchlistAddModal
          coins={markets}
          current={watchlistSyms}
          onSave={handleSave}
          onClose={() => setAddOpen(false)}
        />
      )}

      {/* Watchlist */}
      <div className="glass p-5 rounded-[18px] relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <SbTitle label="Your watchlist" Icon={Star} action={
          <button onClick={handleAddClick} title="Add coins"
            className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-[rgba(255,106,0,0.15)] border border-[rgba(255,106,0,0.25)] bg-[rgba(255,106,0,0.08)]">
            <Plus size={11} className="text-[var(--color-brand)]" />
          </button>
        } />

        {watchlistSyms.map((sym, i) => {
          const binSym   = `${sym}USDT`;
          const livePrice  = prices[binSym];
          const liveChange = changes[binSym];
          const meta     = markets?.find(c => c.symbol.toUpperCase() === sym);
          const price    = livePrice ? formatPrice(livePrice) : meta ? formatPrice(meta.current_price) : "—";
          const change   = liveChange ?? meta?.price_change_percentage_24h ?? 0;
          const up       = change >= 0;
          const name     = meta?.name ?? sym;
          const coinId   = COIN_IDS[sym];
          const href     = coinId ? `/coins/${coinId}` : `/prices`;

          return (
            <Link key={sym} href={href}
              className={clsx("flex items-center gap-2.5 py-2.5 rounded-[10px] px-1 -mx-1 hover:bg-white/[0.03] transition-colors group", i > 0 && "border-t border-[rgba(255,255,255,0.04)]")}>
              <CoinIcon sym={sym} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold font-[family-name:var(--font-display)] group-hover:text-[var(--color-brand)] transition-colors" data-no-translate>{name}</p>
                <p className="text-[10px] text-[#666] font-[family-name:var(--font-data)] font-medium" data-no-translate>{sym}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold font-[family-name:var(--font-data)]">{price}</p>
                <p className={clsx("text-[10px] font-bold font-[family-name:var(--font-data)]", up ? "text-positive" : "text-negative")}>
                  {liveChange !== undefined ? formatPercent(liveChange) : meta ? formatPercent(meta.price_change_percentage_24h) : "—"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Trending */}
      <div className="glass p-5 rounded-[18px] relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <SbTitle label="Trending now" Icon={Flame} />
        {trendingPosts.map((post, i) => {
          const cat = primaryCategory(post);
          return (
            <Link key={post.id} href={`/news/${post.slug}`}
              className={clsx("flex gap-3 py-2.5 cursor-pointer", i > 0 && "border-t border-[rgba(255,255,255,0.04)]")}>
              <span className="text-[20px] font-black font-[family-name:var(--font-data)] gradient-text-alt leading-none min-w-[30px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-[1.35] mb-1 tracking-[-0.1px] font-[family-name:var(--font-display)] line-clamp-2"><TranslatedText text={post.title} /></p>
                <p className="text-[10px] text-[#555] font-semibold font-[family-name:var(--font-display)]">{cat.name}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Fear & Greed — live CMC Pro */}
      <div className="glass p-5 rounded-[18px] relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <SbTitle label="Fear & greed" Icon={Clock} />
        <div className="flex items-center gap-4 pt-1 pb-2">
          <div className="relative w-[90px] h-[90px] flex-shrink-0">
            <svg viewBox="0 0 90 90" width="90" height="90">
              <defs>
                <linearGradient id="fg-sb" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#8b5cf6" />
                  <stop offset="25%"  stopColor="#ff2020" />
                  <stop offset="65%"  stopColor="#ffc233" />
                  <stop offset="100%" stopColor="#00d47b" />
                </linearGradient>
              </defs>
              <circle cx="45" cy="45" r="37" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
              <circle cx="45" cy="45" r="37" fill="none" stroke="url(#fg-sb)" strokeWidth="7"
                strokeDasharray="233"
                strokeDashoffset={fgValue !== undefined ? 233 - (fgValue / 100) * 233 : 140}
                strokeLinecap="round" transform="rotate(-126 45 45)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-black font-[family-name:var(--font-data)] leading-none"
                style={{ background: "linear-gradient(180deg,#fff,#ff6a00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {fgValue ?? "—"}
              </span>
              <span className="text-[9px] font-bold text-[var(--color-brand)] tracking-[0.5px] uppercase mt-0.5 font-[family-name:var(--font-display)]">
                {fgLabel}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            {fgHistory.length > 0
              ? fgHistory.map((h, idx) => {
                  const label = idx === 0 ? "Now" : idx === 1 ? "Yesterday" : idx === 2 ? "Last week" : "Last month";
                  const color = h.value < 25 ? "#8b5cf6" : h.value < 45 ? "#ff3b4f" : h.value < 55 ? "#ffc233" : "#00d47b";
                  return (
                    <div key={label} className="flex justify-between text-[11px] py-1 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <span className="text-[#555] font-medium font-[family-name:var(--font-display)]">{label}</span>
                      <span className="font-semibold font-[family-name:var(--font-data)]" style={{ color }}>{h.value}</span>
                    </div>
                  );
                })
              : [["Now", fgValue ?? "—"], ["Yesterday", "—"], ["Last week", "—"], ["Last month", "—"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px] py-1 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <span className="text-[#555] font-medium font-[family-name:var(--font-display)]">{k}</span>
                    <span className="font-semibold font-[family-name:var(--font-data)]" style={{ color: "#ff6a00" }}>{v}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="relative p-5 rounded-[18px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(255,106,0,0.1), rgba(255,106,0,0.02))", border: "0.5px solid rgba(255,106,0,0.2)" }}>
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent" />
        <span className="absolute top-[-30%] right-[-20%] w-[70%] h-[80%] bg-[radial-gradient(circle,rgba(255,106,0,0.15),transparent_70%)] blur-[30px] pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-[17px] font-extrabold tracking-[-0.3px] mb-1.5 font-[family-name:var(--font-display)]">Get the daily brief</h3>
          <p className="text-[12px] text-[#aaa] font-medium leading-[1.5] mb-3.5 font-[family-name:var(--font-display)]">
            Market moves, breaking news & signals delivered every morning.
          </p>
          <input type="email" placeholder="you@example.com"
            className="w-full bg-black/40 border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[#f5f5f5] placeholder:text-[#555] outline-none mb-2 focus:border-[rgba(255,106,0,0.4)] transition-all font-[family-name:var(--font-display)]" />
          <button className="w-full py-[11px] rounded-[10px] text-[13px] font-extrabold text-black cursor-pointer font-[family-name:var(--font-display)]"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            Subscribe
          </button>
        </div>
      </div>
    </aside>
  );
}

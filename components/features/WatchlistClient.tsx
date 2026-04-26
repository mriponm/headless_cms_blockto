"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, StarOff, Loader2, ArrowLeft, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, ChevronRight } from "lucide-react";
import { COIN_ICONS } from "@/components/features/prices/coinIcons";
import { COIN_IDS } from "@/lib/coinIds";
import { usePriceStore } from "@/lib/store/priceStore";
import { formatPrice } from "@/lib/utils/formatters";

interface WatchCoin {
  id: string;
  coin_symbol: string;
  coin_name: string;
  price?: string;
  change?: number;
}

function CoinLogo({ sym }: { sym: string }) {
  const key = sym.toUpperCase();
  const src = (COIN_ICONS as Record<string, string>)[key];
  if (src) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={key} width={40} height={40}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
  );
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-extrabold text-black flex-shrink-0"
      style={{ background: "var(--gradient-brand)" }}>
      {key.slice(0, 2)}
    </div>
  );
}

// Maps coin symbol → Binance WS symbol (uppercase)
const SYMBOL_TO_BINANCE: Record<string, string> = {
  BTC: "BTCUSDT", ETH: "ETHUSDT", SOL: "SOLUSDT", BNB: "BNBUSDT",
  XRP: "XRPUSDT", DOGE: "DOGEUSDT", ADA: "ADAUSDT", AVAX: "AVAXUSDT",
  LINK: "LINKUSDT", DOT: "DOTUSDT", LTC: "LTCUSDT", UNI: "UNIUSDT",
  MATIC: "MATICUSDT", ATOM: "ATOMUSDT", NEAR: "NEARUSDT", TRX: "TRXUSDT",
  SHIB: "SHIBUSDT", INJ: "INJUSDT", RENDER: "RENDERUSDT", SUI: "SUIUSDT",
  OP: "OPUSDT", ARB: "ARBUSDT", APT: "APTUSDT", FIL: "FILUSDT",
};

export default function WatchlistClient() {
  const [watchlist, setWatchlist] = useState<WatchCoin[]>([]);
  const [loading, setLoading]     = useState(true);
  const [newSym, setNewSym]       = useState("");
  const [adding, setAdding]       = useState(false);
  const [error, setError]         = useState("");
  const prices = usePriceStore((s) => s.prices);
  const changes = usePriceStore((s) => s.changes);

  useEffect(() => {
    fetch("/api/watchlist")
      .then(r => r.ok ? r.json() : [])
      .then(data => setWatchlist(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function addCoin() {
    const sym = newSym.toUpperCase().trim();
    if (!sym) return;
    if (watchlist.find(c => c.coin_symbol === sym)) {
      setError(`${sym} already in watchlist`);
      setTimeout(() => setError(""), 2000);
      setNewSym("");
      return;
    }
    setAdding(true); setError("");
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coin_symbol: sym, coin_name: sym }),
    });
    if (res.ok) {
      const data = await res.json();
      setWatchlist(prev => [data, ...prev]);
    } else {
      setError("Failed to add coin");
      setTimeout(() => setError(""), 2000);
    }
    setNewSym(""); setAdding(false);
  }

  async function removeCoin(sym: string) {
    setWatchlist(prev => prev.filter(c => c.coin_symbol !== sym));
    await fetch(`/api/watchlist?symbol=${encodeURIComponent(sym)}`, { method: "DELETE" });
  }

  const getLivePrice  = (sym: string) => { const s = sym.toUpperCase(); return prices[SYMBOL_TO_BINANCE[s]  ?? `${s}USDT`]; };
  const getLiveChange = (sym: string) => { const s = sym.toUpperCase(); return changes[SYMBOL_TO_BINANCE[s] ?? `${s}USDT`]; };

  const gainers = watchlist.filter(c => (getLiveChange(c.coin_symbol) ?? c.change ?? 0) > 0).length;
  const losers  = watchlist.filter(c => (getLiveChange(c.coin_symbol) ?? c.change ?? 0) < 0).length;

  return (
    <div className="relative z-[2] max-w-[860px] mx-auto px-4 md:px-8 pt-5 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile"
          className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,106,0,0.3)] transition-all"
          style={{ background: "rgba(255,255,255,0.03)", color: "var(--color-muted)" }}>
          <ArrowLeft size={14} />
        </Link>
        <div>
          <h1 className="text-[18px] font-extrabold tracking-[-0.5px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
            Watchlist
          </h1>
          <p className="text-[11px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
            {watchlist.length} coin{watchlist.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Link href="/prices" className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-bold border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,106,0,0.3)] transition-all font-[family-name:var(--font-display)]"
          style={{ color: "var(--color-muted)", background: "rgba(255,255,255,0.02)" }}>
          <TrendingUp size={12} /> Live Prices
        </Link>
      </div>

      {/* Stats strip */}
      {watchlist.length > 0 && (
        <div className="profile-card rounded-[16px] p-4 mb-5 grid grid-cols-3 gap-4 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent pointer-events-none" />
          {[
            { label: "Tracked", value: watchlist.length, color: "var(--color-brand)" },
            { label: "Gainers", value: gainers, color: "#22c55e" },
            { label: "Losers", value: losers, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[22px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.8px] mt-0.5 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add coin input */}
      <div className="profile-card rounded-[16px] p-4 mb-5 relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.2)] to-transparent pointer-events-none" />
        <p className="text-[10px] font-bold uppercase tracking-[1px] mb-3 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
          Add Coin
        </p>
        <div className="flex gap-2">
          <input
            value={newSym}
            onChange={e => setNewSym(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCoin()}
            placeholder="Coin symbol, e.g. BTC, ETH, SOL…"
            className="flex-1 px-4 py-2.5 rounded-[10px] text-[13px] font-medium outline-none transition-all font-[family-name:var(--font-display)] uppercase"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", color: "var(--color-text)" }}
          />
          <button onClick={addCoin} disabled={adding || !newSym.trim()}
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-black transition-all hover:brightness-110 disabled:opacity-40 cursor-pointer flex-shrink-0"
            style={{ background: "var(--gradient-brand)" }}>
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
        {error && <p className="text-[11px] text-[#ef4444] mt-2 font-[family-name:var(--font-display)]">{error}</p>}
      </div>

      {/* Coin list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[var(--color-brand)]" />
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--color-muted)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[rgba(255,106,0,0.06)] border border-[rgba(255,106,0,0.12)]">
            <Star size={28} className="text-[rgba(255,106,0,0.4)]" />
          </div>
          <p className="text-[15px] font-bold mb-1 font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
            Watchlist empty
          </p>
          <p className="text-[12px] font-[family-name:var(--font-display)]">Add coins above to start tracking</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {watchlist.map((coin, i) => {
            const livePrice = getLivePrice(coin.coin_symbol);
            const liveChange = getLiveChange(coin.coin_symbol);
            const displayChange = liveChange ?? coin.change ?? 0;
            const positive = displayChange >= 0;
            const coinId = COIN_IDS[coin.coin_symbol.toUpperCase()];
            const detailHref = coinId ? `/coins/${coinId}` : null;
            return (
              <div key={coin.id}
                className="profile-card flex items-center gap-3 px-4 py-3.5 rounded-[16px] hover:border-[rgba(255,106,0,0.2)] transition-all relative overflow-hidden group">
                <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

                {/* Full-row click overlay — sits below interactive buttons */}
                {detailHref && (
                  <Link href={detailHref} className="absolute inset-0 z-0" aria-label={`View ${coin.coin_name}`} />
                )}

                {/* Rank */}
                <span className="relative z-10 text-[11px] font-extrabold w-5 text-center flex-shrink-0 font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10 flex-shrink-0">
                  <CoinLogo sym={coin.coin_symbol} />
                </div>

                <div className="relative z-10 flex-1 min-w-0">
                  <div className="font-bold text-[14px] font-[family-name:var(--font-display)] group-hover:text-[var(--color-brand)] transition-colors" style={{ color: "var(--color-text)" }}>
                    {coin.coin_name !== coin.coin_symbol ? coin.coin_name : coin.coin_symbol.toUpperCase()}
                  </div>
                  <div className="text-[11px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                    {coin.coin_symbol.toUpperCase()}
                  </div>
                </div>

                <div className="relative z-10 text-right flex-shrink-0">
                  {livePrice ? (
                    <>
                      <div className="font-extrabold text-[14px] font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>
                        {formatPrice(livePrice)}
                      </div>
                      <div className={`flex items-center justify-end gap-0.5 text-[11px] font-bold font-[family-name:var(--font-data)] ${positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                        {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {Math.abs(displayChange).toFixed(2)}%
                      </div>
                    </>
                  ) : coin.price ? (
                    <div className="font-extrabold text-[14px] font-[family-name:var(--font-data)]" style={{ color: "var(--color-text)" }}>
                      {coin.price}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-[7px] border border-[rgba(255,106,0,0.2)] text-[var(--color-brand)]">
                      Live
                    </span>
                  )}
                </div>

                <div className="relative z-10 flex items-center gap-1 flex-shrink-0">
                  <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-brand)" }} />
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCoin(coin.coin_symbol); }}
                    className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all hover:bg-[rgba(255,59,79,0.1)] hover:text-[#ff3b4f] cursor-pointer"
                    style={{ color: "var(--color-muted)" }}>
                    <StarOff size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

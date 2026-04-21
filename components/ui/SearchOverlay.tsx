"use client";
import { useEffect, useRef, useState } from "react";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";

const TRENDING = ["Bitcoin ETF", "Ethereum upgrade", "Solana DeFi", "Crypto regulation", "BTC halving"];
const RECENT   = ["BlackRock Bitcoin", "Fear & Greed index", "Altcoin season"];

interface Props {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function SearchOverlay({ open, onClose, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, initialQuery]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4 transition-all duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-[620px] rounded-[20px] overflow-hidden transition-all duration-200 search-overlay-panel ${open ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"}`}
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08)" }}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b search-overlay-border">
          <Search size={18} className="text-[#ff6a00] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, coins, topics…"
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium font-[family-name:var(--font-display)] search-overlay-input"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 rounded-lg transition-colors hover:bg-[rgba(255,106,0,0.1)] search-overlay-x">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-1 rounded font-[family-name:var(--font-data)] search-overlay-kbd">ESC</kbd>
        </div>

        {/* Results / suggestions */}
        <div className="p-4 max-h-[440px] overflow-y-auto">
          {!query && (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#ff6a00] mb-3 px-1">Trending</p>
              <div className="space-y-0.5 mb-5">
                {TRENDING.map((t) => (
                  <button key={t} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer search-overlay-item group">
                    <TrendingUp size={14} className="text-[#ff6a00] flex-shrink-0" />
                    <span className="flex-1 text-[13px] font-medium search-overlay-item-text">{t}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff6a00]" />
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#ff6a00] mb-3 px-1">Recent</p>
              <div className="space-y-0.5">
                {RECENT.map((r) => (
                  <button key={r} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer search-overlay-item group">
                    <Clock size={14} className="flex-shrink-0 search-overlay-item-icon" />
                    <span className="flex-1 text-[13px] font-medium search-overlay-item-text">{r}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff6a00]" />
                  </button>
                ))}
              </div>
            </>
          )}

          {query && (
            <div className="space-y-0.5">
              {[...TRENDING, ...RECENT]
                .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
                .map((r) => (
                  <button key={r} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer search-overlay-item group">
                    <Search size={14} className="flex-shrink-0 search-overlay-item-icon" />
                    <span className="flex-1 text-[13px] font-medium search-overlay-item-text">{r}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff6a00]" />
                  </button>
                ))}
              {[...TRENDING, ...RECENT].filter((s) => s.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                <p className="text-center py-10 text-[13px] search-overlay-empty">No results for &ldquo;{query}&rdquo;</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

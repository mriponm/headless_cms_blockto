"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Clock, ArrowRight, Loader2, Newspaper } from "lucide-react";

const TRENDING = [
  "Bitcoin ETF",
  "Ethereum upgrade",
  "Solana DeFi",
  "Crypto regulation",
  "BTC halving",
];
const RECENT_KEY = "blockto_recent_articles";

interface RecentArticle {
  slug: string;
  title: string;
  category: string;
}

interface SearchArticle {
  title: string;
  slug: string;
  categories: { nodes: { name: string; slug: string }[] };
  featuredImage: { node: { sourceUrl: string } } | null;
}

interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number | null;
}

interface SearchResults {
  articles: SearchArticle[];
  coins: SearchCoin[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function SearchOverlay({ open, onClose, initialQuery = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>({ articles: [], coins: [] });
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<RecentArticle[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setResults({ articles: [], coins: [] });
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
      try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (raw) setRecent(JSON.parse(raw).slice(0, 5));
      } catch {}
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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults({ articles: [], coins: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data: SearchResults = await res.json();
        setResults(data);
      } catch {
        setResults({ articles: [], coins: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const hasResults = results.articles.length > 0 || results.coins.length > 0;

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4 transition-all duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-[620px] rounded-[20px] overflow-hidden transition-all duration-200 search-overlay-panel ${
          open ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"
        }`}
        style={{
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08)",
        }}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b search-overlay-border">
          {loading ? (
            <Loader2 size={18} className="text-[#ff6a00] flex-shrink-0 animate-spin" />
          ) : (
            <Search size={18} className="text-[#ff6a00] flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, coins, topics…"
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium font-[family-name:var(--font-display)] search-overlay-input"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg transition-colors hover:bg-[rgba(255,106,0,0.1)] search-overlay-x"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-1 rounded font-[family-name:var(--font-data)] search-overlay-kbd">
            ESC
          </kbd>
        </div>

        {/* Results / suggestions */}
        <div className="p-4 max-h-[440px] overflow-y-auto">
          {/* Empty state: trending + recent */}
          {!query && (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#ff6a00] mb-3 px-1">
                Trending
              </p>
              <div className="space-y-0.5 mb-5">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer search-overlay-item group"
                  >
                    <TrendingUp size={14} className="text-[#ff6a00] flex-shrink-0" />
                    <span className="flex-1 text-[13px] font-medium search-overlay-item-text">
                      {t}
                    </span>
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff6a00]"
                    />
                  </button>
                ))}
              </div>

              {recent.length > 0 && (
                <>
                  <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#ff6a00] mb-3 px-1">
                    Recent
                  </p>
                  <div className="space-y-0.5">
                    {recent.map((r) => (
                      <button
                        key={r.slug}
                        onClick={() => navigate(`/news/${r.slug}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer search-overlay-item group"
                      >
                        <Clock size={14} className="flex-shrink-0 search-overlay-item-icon" />
                        <span className="flex-1 text-[13px] font-medium search-overlay-item-text line-clamp-1">
                          {r.title}
                        </span>
                        <ArrowRight
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff6a00]"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Loading skeleton */}
          {query && loading && (
            <div className="space-y-1 py-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] animate-pulse"
                >
                  <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1 h-3 rounded bg-white/10" style={{ width: `${60 + i * 10}%` }} />
                </div>
              ))}
            </div>
          )}

          {/* Live results */}
          {query && !loading && hasResults && (
            <>
              {results.articles.length > 0 && (
                <>
                  <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#ff6a00] mb-3 px-1">
                    Articles
                  </p>
                  <div className="space-y-0.5 mb-5">
                    {results.articles.map((a) => (
                      <button
                        key={a.slug}
                        onClick={() => navigate(`/news/${a.slug}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer search-overlay-item group"
                      >
                        <Newspaper size={14} className="flex-shrink-0 text-[#ff6a00]" />
                        <span className="flex-1 text-[13px] font-medium search-overlay-item-text line-clamp-1">
                          {a.title}
                        </span>
                        <ArrowRight
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff6a00]"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {results.coins.length > 0 && (
                <>
                  <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#ff6a00] mb-3 px-1">
                    Coins
                  </p>
                  <div className="space-y-0.5">
                    {results.coins.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/coins/${c.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer search-overlay-item group"
                      >
                        {c.thumb ? (
                          <img
                            src={c.thumb}
                            alt={c.name}
                            className="w-[18px] h-[18px] rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full bg-[#ff6a00]/20 flex-shrink-0" />
                        )}
                        <span className="flex-1 text-[13px] font-medium search-overlay-item-text">
                          {c.name}
                        </span>
                        <span className="text-[11px] search-overlay-item-icon font-[family-name:var(--font-data)] uppercase mr-1">
                          {c.symbol}
                        </span>
                        <ArrowRight
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff6a00]"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* No results */}
          {query && !loading && !hasResults && (
            <p className="text-center py-10 text-[13px] search-overlay-empty">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

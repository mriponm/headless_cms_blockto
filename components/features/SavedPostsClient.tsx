"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Search, Star, StarOff, Loader2, ArrowLeft, Filter } from "lucide-react";

interface SavedArticle {
  id: string;
  article_slug: string;
  article_title: string;
  article_excerpt: string;
  article_category: string;
  article_image: string;
  article_date: string;
  read_percent?: number;
}

const FILTER_TABS = ["All", "Unread", "Read", "Market Analysis", "KOL Insights", "Bitcoin", "Ethereum"];

function ArticleCard({ art, onRemove }: { art: SavedArticle; onRemove: (slug: string) => void }) {
  const pct = art.read_percent ?? 0;
  const isRead = pct === 100;

  return (
    <div className="profile-card flex gap-4 p-4 rounded-[16px] hover:border-[rgba(255,106,0,0.2)] transition-all group relative overflow-hidden">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />
      {/* Thumbnail */}
      <div className="w-[88px] h-[66px] rounded-[10px] flex-shrink-0 overflow-hidden bg-[rgba(255,106,0,0.06)] border border-[rgba(255,106,0,0.1)] flex items-center justify-center">
        {art.article_image
          ? <img src={art.article_image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
          : <Bookmark size={18} className="text-[rgba(255,106,0,0.3)]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold text-[var(--color-brand)] uppercase tracking-[0.8px] font-[family-name:var(--font-data)]">
                {art.article_category}
              </span>
              {isRead && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)]">
                  Read
                </span>
              )}
            </div>
            <Link href={`/news/${art.article_slug}`}
              className="block text-[13px] font-bold leading-snug hover:text-[var(--color-brand)] transition-colors line-clamp-2 font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-text)" }}>
              {art.article_title}
            </Link>
            {art.article_excerpt && (
              <p className="text-[11px] mt-1 line-clamp-1 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
                {art.article_excerpt}
              </p>
            )}
          </div>
          <button onClick={() => onRemove(art.article_slug)}
            className="flex-shrink-0 w-7 h-7 rounded-[7px] flex items-center justify-center transition-all hover:bg-[rgba(255,59,79,0.1)] hover:text-[#ff3b4f] cursor-pointer"
            style={{ color: "var(--color-muted)" }}
            title="Remove">
            <StarOff size={13} />
          </button>
        </div>

        {/* Progress bar */}
        {pct > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-[3px] rounded-full bg-[rgba(255,255,255,0.06)]">
              <div className="h-[3px] rounded-full transition-all"
                style={{ width: `${pct}%`, background: isRead ? "#22c55e" : "var(--gradient-brand)" }} />
            </div>
            <span className="text-[9px] font-bold font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>{pct}%</span>
          </div>
        )}

        <span className="text-[10px] mt-1.5 block font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
          {art.article_date}
        </span>
      </div>
    </div>
  );
}

export default function SavedPostsClient() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetch("/api/saved-articles")
      .then(r => r.ok ? r.json() : [])
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function removeArticle(slug: string) {
    setArticles(prev => prev.filter(a => a.article_slug !== slug));
    await fetch(`/api/saved-articles?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
  }

  const unread   = articles.filter(a => !a.read_percent || a.read_percent === 0);
  const read     = articles.filter(a => a.read_percent === 100);
  const progress = articles.filter(a => (a.read_percent ?? 0) > 0 && (a.read_percent ?? 0) < 100);

  const filtered = (() => {
    let base = articles;
    if (filter === "Unread") base = unread;
    else if (filter === "Read") base = read;
    else if (filter !== "All") base = articles.filter(a => a.article_category === filter);
    if (search.trim()) base = base.filter(a => a.article_title?.toLowerCase().includes(search.toLowerCase()));
    return base;
  })();

  const readPct = articles.length ? Math.round(read.length / articles.length * 100) : 0;

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
            Saved Posts
          </h1>
          <p className="text-[11px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
            {articles.length} article{articles.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Stats strip */}
      {articles.length > 0 && (
        <div className="profile-card rounded-[16px] p-4 mb-5 grid grid-cols-3 gap-4 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent pointer-events-none" />
          {[
            { label: "Total", value: articles.length, color: "var(--color-brand)" },
            { label: "Unread", value: unread.length, color: "#f59e0b" },
            { label: "Done", value: read.length, color: "#22c55e" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[22px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.8px] mt-0.5 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>{s.label}</div>
            </div>
          ))}
          {/* Progress bar below */}
          <div className="col-span-3 mt-1">
            <div className="flex justify-between text-[9px] mb-1 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
              <span>Reading progress</span><span>{readPct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-[rgba(255,255,255,0.06)]">
              <div className="h-[3px] rounded-full transition-all duration-500" style={{ width: `${readPct}%`, background: "var(--gradient-brand)" }} />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search saved articles…"
          className="w-full pl-9 pr-4 py-2.5 rounded-[12px] text-[12px] font-medium outline-none transition-all font-[family-name:var(--font-display)]"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", color: "var(--color-text)" }}
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTER_TABS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border cursor-pointer whitespace-nowrap font-[family-name:var(--font-display)]"
            style={{
              background: filter === f ? "rgba(255,106,0,0.1)" : "rgba(255,255,255,0.02)",
              borderColor: filter === f ? "rgba(255,106,0,0.4)" : "rgba(255,255,255,0.06)",
              color: filter === f ? "var(--color-brand)" : "var(--color-muted)",
            }}>
            <Filter size={8} className="inline mr-1" />
            {f}{f === "Unread" && unread.length > 0 ? ` · ${unread.length}` : ""}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[var(--color-brand)]" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--color-muted)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[rgba(255,106,0,0.06)] border border-[rgba(255,106,0,0.12)]">
            <Bookmark size={28} className="text-[rgba(255,106,0,0.4)]" />
          </div>
          <p className="text-[15px] font-bold mb-1 font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>Nothing saved yet</p>
          <p className="text-[12px] font-[family-name:var(--font-display)]">Bookmark articles from any news page</p>
          <Link href="/" className="inline-block mt-5 px-5 py-2.5 rounded-[10px] text-[12px] font-bold text-black font-[family-name:var(--font-display)]"
            style={{ background: "var(--gradient-brand)" }}>
            Browse News →
          </Link>
        </div>
      ) : filter === "All" && !search.trim() ? (
        <div className="flex flex-col gap-6">
          {progress.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[3px] h-4 rounded-full bg-[var(--color-brand)]" />
                <h2 className="text-[10px] font-extrabold uppercase tracking-[1.5px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
                  In Progress · {progress.length}
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {progress.map(art => <ArticleCard key={art.id} art={art} onRemove={removeArticle} />)}
              </div>
            </section>
          )}
          {unread.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[3px] h-4 rounded-full bg-[#f59e0b]" />
                <h2 className="text-[10px] font-extrabold uppercase tracking-[1.5px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
                  Unread · {unread.length}
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {unread.map(art => <ArticleCard key={art.id} art={art} onRemove={removeArticle} />)}
              </div>
            </section>
          )}
          {read.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[3px] h-4 rounded-full bg-[#22c55e]" />
                <h2 className="text-[10px] font-extrabold uppercase tracking-[1.5px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
                  Already Read · {read.length}
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {read.map(art => <ArticleCard key={art.id} art={art} onRemove={removeArticle} />)}
              </div>
            </section>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--color-muted)" }}>
          <Star size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-[13px] font-semibold font-[family-name:var(--font-display)]">No results</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(art => <ArticleCard key={art.id} art={art} onRemove={removeArticle} />)}
        </div>
      )}
    </div>
  );
}

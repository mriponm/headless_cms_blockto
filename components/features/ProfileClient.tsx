"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Bookmark, Search, Star, StarOff, Camera, Save,
  LogOut, ChevronRight, ArrowUpRight, ArrowDownRight,
  Loader2, Clock, TrendingUp, History,
} from "lucide-react";
import { COIN_ICONS } from "@/components/features/prices/coinIcons";

interface Me { id?: string; name?: string; email?: string; picture?: string | null; }

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

interface WatchCoin {
  id: string;
  coin_symbol: string;
  coin_name: string;
  price?: string;
  change?: number;
}

interface RecentArticle {
  slug: string;
  title: string;
  image: string;
  category: string;
  date: string;
  visitedAt: number;
}

const FILTER_TABS = ["All", "Unread", "Market Analysis", "KOL Insights", "Bitcoin", "Ethereum"];
const RECENT_KEY  = "blockto_recent_articles";

function CoinLogo({ sym }: { sym: string }) {
  const src = (COIN_ICONS as Record<string, string>)[sym];
  if (src) return <img src={src} alt={sym} className="w-8 h-8 rounded-full object-cover" />;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-black"
      style={{ background: "var(--gradient-brand)" }}>
      {sym.slice(0, 2)}
    </div>
  );
}

function ArticleCard({ art, onRemove }: { art: SavedArticle; onRemove: (slug: string) => void; compact?: boolean }) {
  const pct = art.read_percent ?? 0;
  return (
    <div className="profile-card flex gap-4 p-4 rounded-[14px]">
      <div className="w-[90px] h-[68px] rounded-[10px] flex-shrink-0 overflow-hidden bg-[rgba(255,106,0,0.06)] border border-[rgba(255,106,0,0.12)] flex items-center justify-center">
        {art.article_image
          ? <img src={art.article_image} alt="" className="w-full h-full object-cover" />
          : <Bookmark size={20} className="text-[rgba(255,106,0,0.3)]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-[var(--color-brand)] uppercase tracking-wider">{art.article_category}</span>
            <Link href={`/news/${art.article_slug}`}
              className="block mt-0.5 text-[14px] font-bold leading-snug hover:text-[var(--color-brand)] transition-colors line-clamp-2"
              style={{ color: "var(--color-text)" }}>
              {art.article_title}
            </Link>
            <p className="text-[12px] mt-1 line-clamp-2" style={{ color: "var(--color-muted)" }}>{art.article_excerpt}</p>
          </div>
          <button onClick={() => onRemove(art.article_slug)}
            className="flex-shrink-0 w-7 h-7 rounded-[7px] flex items-center justify-center transition-all hover:bg-[rgba(255,59,79,0.1)] hover:text-[#ff3b4f] cursor-pointer"
            style={{ color: "var(--color-muted)" }}>
            <StarOff size={14} />
          </button>
        </div>
        {pct > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-[rgba(255,255,255,0.06)]">
              <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? "#22c55e" : "var(--gradient-brand)" }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: "var(--color-muted)" }}>{pct}%</span>
          </div>
        )}
        <span className="text-[11px] mt-1.5 block" style={{ color: "var(--color-muted)" }}>{art.article_date}</span>
      </div>
    </div>
  );
}

export default function ProfileClient({ initialUser }: { initialUser: Me }) {
  const [user]                = useState<Me>(initialUser);
  const [tab, setTab]         = useState<"saved" | "watchlist" | "settings">("saved");
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [articles, setArticles]       = useState<SavedArticle[]>([]);
  const [watchlist, setWatchlist]     = useState<WatchCoin[]>([]);
  const [recent, setRecent]           = useState<RecentArticle[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [newSym, setNewSym]           = useState("");
  const [addingCoin, setAddingCoin]   = useState(false);
  const [editName, setEditName]       = useState(initialUser.name ?? "");
  const [editEmail, setEditEmail]     = useState(initialUser.email ?? "");
  const [saving, setSaving]           = useState(false);
  const [savedMsg, setSavedMsg]       = useState(false);
  const fileRef                       = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    // Load recent from localStorage
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}

    // Load saved articles + watchlist + following
    setLoadingData(true);
    Promise.all([
      fetch("/api/saved-articles").then(r => r.ok ? r.json() : []),
      fetch("/api/watchlist").then(r => r.ok ? r.json() : []),
    ]).then(([arts, wl]) => {
      setArticles(Array.isArray(arts) ? arts : []);
      setWatchlist(Array.isArray(wl) ? wl : []);
    }).finally(() => setLoadingData(false));
  }, []);

  async function removeArticle(slug: string) {
    setArticles(prev => prev.filter(a => a.article_slug !== slug));
    await fetch(`/api/saved-articles?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
  }

  async function addWatch() {
    const sym = newSym.toUpperCase().trim();
    if (!sym || watchlist.find(c => c.coin_symbol === sym)) { setNewSym(""); return; }
    setAddingCoin(true);
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coin_symbol: sym, coin_name: sym }),
    });
    if (res.ok) { const data = await res.json(); setWatchlist(prev => [data, ...prev]); }
    setNewSym(""); setAddingCoin(false);
  }

  async function removeWatch(sym: string) {
    setWatchlist(prev => prev.filter(c => c.coin_symbol !== sym));
    await fetch(`/api/watchlist?symbol=${encodeURIComponent(sym)}`, { method: "DELETE" });
  }

  async function handleSaveProfile() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false); setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  const initials  = (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase();
  const avatarSrc = avatarPreview ?? user.picture;

  const inProgress  = articles.filter(a => (a.read_percent ?? 0) > 0 && (a.read_percent ?? 0) < 100);
  const unread      = articles.filter(a => !a.read_percent || a.read_percent === 0);
  const alreadyRead = articles.filter(a => a.read_percent === 100);

  const filtered = (() => {
    let base = articles;
    if (filter === "Unread") base = unread;
    else if (filter !== "All") base = articles.filter(a => a.article_category === filter);
    if (search) base = base.filter(a => a.article_title?.toLowerCase().includes(search.toLowerCase()));
    return base;
  })();

  // Recent articles not already in saved list
  const recentOnly = recent.filter(r => !articles.some(a => a.article_slug === r.slug));

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-6">
      <div className="max-w-[900px] mx-auto">

        {/* ── Hero card ─────────────────────────────── */}
        <div className="profile-card rounded-[20px] p-5 md:p-7 mb-6">
          <div className="flex flex-row items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-2 border-[rgba(255,106,0,0.35)] flex items-center justify-center"
                style={{ background: avatarSrc ? "transparent" : "var(--gradient-brand)" }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                  : <span className="text-lg sm:text-2xl font-extrabold text-black">{initials}</span>}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border border-[rgba(255,106,0,0.4)] hover:brightness-110 transition-all cursor-pointer"
                style={{ background: "var(--gradient-brand)" }}>
                <Camera size={10} className="text-black" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
            </div>

            <div className="flex-1 text-left min-w-0">
              <h1 className="text-[14px] sm:text-[18px] font-extrabold truncate" style={{ color: "var(--color-text)" }}>
                {user.name ?? user.email ?? "Blockto User"}
              </h1>
              <p className="text-[11px] sm:text-[12px] mt-0.5 truncate" style={{ color: "var(--color-muted)" }}>{user.email}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border border-[rgba(255,106,0,0.2)] text-[var(--color-brand)]"
                style={{ background: "rgba(255,106,0,0.06)" }}>
                Pro Member
              </span>
            </div>

            <button
              onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold border transition-all hover:border-[rgba(255,59,79,0.4)] hover:text-[#ff3b4f] cursor-pointer flex-shrink-0"
              style={{ color: "var(--color-muted)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <LogOut size={12} /> Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[rgba(255,255,255,0.05)]">
            {[
              { label: "Articles",  value: articles.length,    icon: <Bookmark size={13} /> },
              { label: "Reading",   value: inProgress.length,  icon: <Clock size={13} /> },
              { label: "Watchlist", value: watchlist.length,   icon: <TrendingUp size={13} /> },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-[20px] font-extrabold" style={{ color: "var(--color-brand)" }}>{s.value}</div>
                <div className="text-[10px] mt-0.5 flex items-center justify-center gap-1" style={{ color: "var(--color-muted)" }}>
                  {s.icon}{s.label}
                </div>
              </div>
            ))}
          </div>

          {articles.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--color-muted)" }}>
                <span>Reading progress</span>
                <span>{alreadyRead.length}/{articles.length} · {Math.round(alreadyRead.length / articles.length * 100)}% done</span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.round(alreadyRead.length / articles.length * 100)}%`, background: "var(--gradient-brand)" }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Continue Reading (from localStorage) ───── */}
        {recentOnly.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <History size={13} className="text-[var(--color-brand)]" />
              <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-brand)]">Continue Reading</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,106,0,0.08)] border border-[rgba(255,106,0,0.2)] text-[var(--color-brand)] font-bold">
                {recentOnly.length} recent
              </span>
            </div>

            {/* Featured card */}
            <Link href={`/news/${recentOnly[0].slug}`}
              className="profile-card rounded-[16px] block overflow-hidden hover:border-[rgba(255,106,0,0.3)] transition-all group mb-3">
              {recentOnly[0].image && (
                <div className="h-[200px] overflow-hidden">
                  <img src={recentOnly[0].image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                </div>
              )}
              <div className="p-4">
                {recentOnly[0].category && (
                  <span className="text-[9px] font-bold text-[var(--color-brand)] uppercase tracking-widest">{recentOnly[0].category}</span>
                )}
                <h3 className="text-[14px] font-extrabold leading-snug mt-1 line-clamp-2" style={{ color: "var(--color-text)" }}>
                  {recentOnly[0].title}
                </h3>
                <p className="text-[10px] mt-2" style={{ color: "var(--color-muted)" }}>
                  {recentOnly[0].date} · Tap to continue reading →
                </p>
              </div>
            </Link>

            {recentOnly.slice(1, 4).map(r => (
              <Link key={r.slug} href={`/news/${r.slug}`}
                className="profile-card flex gap-3 p-3 rounded-[12px] mb-2 hover:border-[rgba(255,106,0,0.2)] transition-all group">
                {r.image && (
                  <div className="w-[64px] h-[48px] rounded-[8px] overflow-hidden flex-shrink-0">
                    <img src={r.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {r.category && <span className="text-[9px] font-bold text-[var(--color-brand)] uppercase tracking-widest">{r.category}</span>}
                  <p className="text-[12px] font-bold leading-snug line-clamp-2 mt-0.5 group-hover:text-[var(--color-brand)] transition-colors" style={{ color: "var(--color-text)" }}>
                    {r.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────── */}
        <div className="flex gap-1 mb-6 border-b border-[rgba(255,255,255,0.05)] overflow-x-auto">
          {(["saved", "watchlist", "settings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[12px] font-bold capitalize transition-all border-b-2 cursor-pointer whitespace-nowrap ${tab === t ? "border-[var(--color-brand)]" : "border-transparent"}`}
              style={{ color: tab === t ? "var(--color-brand)" : "var(--color-muted)" }}>
              {t === "saved" ? `Saved${articles.length > 0 ? ` (${articles.length})` : ""}` : t === "watchlist" ? "Watchlist" : "Settings"}
            </button>
          ))}
        </div>

        {/* ── Saved Articles ─────────────────────────── */}
        {tab === "saved" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search saved articles…"
                  className="w-full pl-8 pr-4 py-2.5 rounded-[10px] text-[12px] font-medium outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", color: "var(--color-text)" }} />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-6 pb-4 border-b border-[rgba(255,255,255,0.05)]">
              {FILTER_TABS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${filter === f ? "border-[rgba(255,106,0,0.4)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,106,0,0.2)]"}`}
                  style={{ background: filter === f ? "rgba(255,106,0,0.08)" : "rgba(255,255,255,0.02)", color: filter === f ? "var(--color-brand)" : "var(--color-muted)" }}>
                  {f}{f === "Unread" && unread.length > 0 ? ` (${unread.length})` : ""}
                </button>
              ))}
            </div>

            {loadingData ? (
              <div className="flex justify-center py-16">
                <Loader2 size={22} className="animate-spin text-[var(--color-brand)]" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20" style={{ color: "var(--color-muted)" }}>
                <Bookmark size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-[14px] font-semibold">No saved articles yet</p>
                <p className="text-[12px] mt-1 opacity-60">Bookmark articles from any news page</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {filter === "All" && !search ? (
                  <>
                    {unread.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-3">
                          <Bookmark size={13} style={{ color: "var(--color-muted)" }} />
                          <h2 className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Recently Saved</h2>
                          <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>· {unread.length} unread</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {unread.map(art => <ArticleCard key={art.id} art={art} onRemove={removeArticle} />)}
                        </div>
                      </section>
                    )}
                    {alreadyRead.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-3 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                          <Star size={13} style={{ color: "var(--color-muted)" }} />
                          <h2 className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Already Read</h2>
                          <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>· {alreadyRead.length} articles</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {alreadyRead.map(art => <ArticleCard key={art.id} art={art} onRemove={removeArticle} />)}
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filtered.length === 0
                      ? <div className="text-center py-12" style={{ color: "var(--color-muted)" }}><p className="text-[13px] font-semibold">No results</p></div>
                      : filtered.map(art => <ArticleCard key={art.id} art={art} onRemove={removeArticle} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Watchlist ──────────────────────────────── */}
        {tab === "watchlist" && (
          <div>
            <div className="flex gap-2 mb-5">
              <input value={newSym} onChange={e => setNewSym(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addWatch()}
                placeholder="Add coin symbol (e.g. BTC)"
                className="flex-1 px-4 py-2.5 rounded-[10px] text-[13px] font-medium outline-none"
                style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", color: "var(--color-text)" }} />
              <button onClick={addWatch} disabled={addingCoin}
                className="px-5 py-2.5 rounded-[10px] text-[13px] font-extrabold text-black transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer"
                style={{ background: "var(--gradient-brand)" }}>
                {addingCoin ? <Loader2 size={14} className="animate-spin" /> : "Add"}
              </button>
            </div>
            {loadingData ? (
              <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-[var(--color-brand)]" /></div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-20" style={{ color: "var(--color-muted)" }}>
                <Star size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-[14px] font-semibold">Watchlist empty</p>
                <p className="text-[12px] mt-1 opacity-60">Add coins by symbol to track them</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {watchlist.map(coin => (
                  <div key={coin.id} className="profile-card flex items-center gap-4 px-4 py-3.5 rounded-[14px] hover:border-[rgba(255,106,0,0.2)] transition-all">
                    <CoinLogo sym={coin.coin_symbol} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px]" style={{ color: "var(--color-text)" }}>{coin.coin_name || coin.coin_symbol}</div>
                      <div className="text-[11px]" style={{ color: "var(--color-muted)" }}>{coin.coin_symbol}</div>
                    </div>
                    {coin.price && (
                      <div className="text-right">
                        <div className="font-extrabold text-[14px]" style={{ color: "var(--color-text)" }}>{coin.price}</div>
                        {coin.change !== undefined && (
                          <div className={`flex items-center justify-end gap-0.5 text-[11px] font-bold ${coin.change >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                            {coin.change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                            {Math.abs(coin.change).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <button onClick={() => removeWatch(coin.coin_symbol)}
                        className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all hover:bg-[rgba(255,59,79,0.1)] hover:text-[#ff3b4f] cursor-pointer"
                        style={{ color: "var(--color-muted)" }}>
                        <StarOff size={13} />
                      </button>
                      <Link href="/prices" className="w-7 h-7 rounded-[7px] flex items-center justify-center transition-all hover:text-[var(--color-brand)]" style={{ color: "var(--color-muted)" }}>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ── Settings ───────────────────────────────── */}
        {tab === "settings" && (
          <div className="profile-card rounded-[20px] p-6">
            <h2 className="text-[14px] font-extrabold mb-5" style={{ color: "var(--color-text)" }}>Basic Information</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[rgba(255,106,0,0.3)] flex items-center justify-center flex-shrink-0"
                style={{ background: avatarSrc ? "transparent" : "var(--gradient-brand)" }}>
                {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : <span className="text-lg font-extrabold text-black">{initials}</span>}
              </div>
              <div>
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12px] font-bold border transition-all hover:border-[rgba(255,106,0,0.4)] cursor-pointer"
                  style={{ color: "var(--color-text)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                  <Camera size={12} /> Change photo
                </button>
                <p className="text-[10px] mt-1.5" style={{ color: "var(--color-muted)" }}>JPG, PNG or GIF · Max 2MB</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Display name", value: editName, set: setEditName, placeholder: "Your name", type: "text" },
                { label: "Email", value: editEmail, set: setEditEmail, placeholder: "your@email.com", type: "email" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-[10px] text-[13px] font-medium outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", color: "var(--color-text)" }} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[rgba(255,255,255,0.05)]">
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[13px] font-extrabold text-black transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer"
                style={{ background: "var(--gradient-brand)" }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? "Saving…" : "Save changes"}
              </button>
              {savedMsg && <span className="text-[12px] font-semibold text-[#22c55e]">Saved!</span>}
            </div>
            <div className="mt-8 pt-6 border-t border-[rgba(255,59,79,0.1)]">
              <h3 className="text-[12px] font-bold text-[#ff3b4f] mb-3">Danger Zone</h3>
              <button className="px-4 py-2 rounded-[10px] text-[11px] font-bold border border-[rgba(255,59,79,0.2)] text-[#ff3b4f] hover:bg-[rgba(255,59,79,0.08)] transition-all cursor-pointer">
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

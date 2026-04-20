"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Clock, Flame, ArrowRight, Rss } from "lucide-react";
import type { WPPost, WPCategory } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory, stripExcerpt } from "@/lib/wordpress/queries";

/* ─── Category display metadata ─── */
const CAT_META: Record<string, {
  label: string; emoji: string; description: string;
  color: string; bg: string; border: string; glow: string;
  accentFrom: string; accentTo: string;
}> = {
  "general-news": {
    label: "General News", emoji: "📰",
    description: "Breaking stories, market-moving headlines, and the events shaping the crypto landscape.",
    color: "#ff6a00", bg: "rgba(255,106,0,0.08)", border: "rgba(255,106,0,0.2)", glow: "rgba(255,106,0,0.15)",
    accentFrom: "#ff6a00", accentTo: "#ffaa44",
  },
  "bitcoin": {
    label: "Bitcoin", emoji: "₿",
    description: "BTC price analysis, on-chain data, institutional flows, and the world's leading digital asset.",
    color: "#ff6a00", bg: "rgba(255,106,0,0.08)", border: "rgba(255,106,0,0.2)", glow: "rgba(255,106,0,0.15)",
    accentFrom: "#ff9a40", accentTo: "#ff6a00",
  },
  "ethereum": {
    label: "Ethereum", emoji: "Ξ",
    description: "ETH ecosystem updates, Layer 2 scaling, DeFi protocols, and smart contract developments.",
    color: "#4a9eff", bg: "rgba(74,158,255,0.08)", border: "rgba(74,158,255,0.2)", glow: "rgba(74,158,255,0.15)",
    accentFrom: "#627eea", accentTo: "#3c5ad6",
  },
  "altcoins": {
    label: "Altcoins", emoji: "🪙",
    description: "SOL, AVAX, LINK and the broader altcoin market — price action, fundamentals and trends.",
    color: "#00d47b", bg: "rgba(0,212,123,0.08)", border: "rgba(0,212,123,0.2)", glow: "rgba(0,212,123,0.15)",
    accentFrom: "#00d47b", accentTo: "#00a862",
  },
  "nfts": {
    label: "NFTs", emoji: "🎨",
    description: "Non-fungible token markets, collections, creator economy and digital ownership trends.",
    color: "#b16aff", bg: "rgba(177,106,255,0.08)", border: "rgba(177,106,255,0.2)", glow: "rgba(177,106,255,0.15)",
    accentFrom: "#b16aff", accentTo: "#8a3fff",
  },
  "blockchain": {
    label: "Blockchain", emoji: "⛓️",
    description: "Protocol upgrades, network security, consensus mechanisms, and infrastructure developments.",
    color: "#4a9eff", bg: "rgba(74,158,255,0.08)", border: "rgba(74,158,255,0.2)", glow: "rgba(74,158,255,0.15)",
    accentFrom: "#4a9eff", accentTo: "#1a7fe0",
  },
};

const DEFAULT_META = CAT_META["general-news"];

const SORT_TABS = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "top", label: "Top rated", icon: TrendingUp },
];

function FeaturedCard({ post, accentFrom, accentTo }: { post: WPPost; accentFrom: string; accentTo: string }) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="block rounded-[20px] overflow-hidden cursor-pointer card-hover border border-[rgba(255,255,255,0.06)] relative group"
      style={{ background: "rgba(255,255,255,0.025)" }}>
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none z-10" />
      <div className="h-[200px] md:h-[240px] relative overflow-hidden bg-[#0a0e1a]">
        {post.featuredImage ? (
          <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 50vw" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accentFrom}22, #0a0e1a)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3.5 left-3.5">
          <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)]"
            style={{ color: accentFrom, background: `${accentFrom}15`, border: `0.5px solid ${accentFrom}33` }}>
            {cat.name.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-[17px] md:text-[18px] font-extrabold leading-[1.3] mb-2.5 tracking-[-0.4px] line-clamp-2 art-heading font-[family-name:var(--font-display)]">
          {post.title}
        </h3>
        <p className="text-[13px] art-sub-text leading-[1.55] font-medium mb-4 line-clamp-2 font-[family-name:var(--font-display)]">
          {stripExcerpt(post.excerpt)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] art-sub-text font-medium">
            <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-extrabold text-black flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${accentFrom},${accentTo})` }}>
              {post.author.node.name.slice(0, 2).toUpperCase()}
            </span>
            {post.author.node.name} · {relativeDate(post.date)}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] art-sub-text font-semibold px-2 py-1 rounded-[7px] art-tag-pill font-[family-name:var(--font-data)]">
            <Clock size={10} />
            3 min
          </div>
        </div>
      </div>
    </Link>
  );
}

function ListCard({ post, accentFrom, accentTo }: { post: WPPost; accentFrom: string; accentTo: string }) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="flex gap-3.5 p-3.5 rounded-[16px] cursor-pointer card-hover border border-[rgba(255,255,255,0.06)] relative group block"
      style={{ background: "rgba(255,255,255,0.025)" }}>
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-[12px] overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.06)] relative bg-[#0a0e1a]">
        {post.featuredImage ? (
          <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill className="object-cover" sizes="110px" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentFrom}22, #0a0e1a)` }} />
        )}
      </div>
      <div className="flex flex-col justify-between min-w-0 flex-1">
        <div>
          <span className="inline-block text-[8px] font-extrabold px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] mb-1.5 font-[family-name:var(--font-data)]"
            style={{ color: accentFrom, background: `${accentFrom}15`, border: `0.5px solid ${accentFrom}33` }}>
            {cat.name.toUpperCase()}
          </span>
          <p className="text-[14px] font-bold leading-[1.35] tracking-[-0.2px] line-clamp-2 md:line-clamp-3 art-heading font-[family-name:var(--font-display)]">
            {post.title}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] art-sub-text font-medium mt-1.5">
          <span className="w-[16px] h-[16px] rounded-full flex items-center justify-center text-[7px] font-extrabold text-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${accentFrom},${accentTo})` }}>
            {post.author.node.name.slice(0, 2).toUpperCase()}
          </span>
          {post.author.node.name} · {relativeDate(post.date)}
          <span className="ml-auto flex items-center gap-1 font-[family-name:var(--font-data)]">
            <Clock size={9} />3 min
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── WP slug → app slug mapping for sidebar ─── */
const WP_TO_APP: Record<string, string> = {
  bitcoin: "bitcoin", ethereum: "ethereum", altcoin: "altcoins",
  nft: "nfts", news: "general-news", blog: "general-news", ai: "general-news",
};

export default function CategoryContent({
  slug, posts, allCategories,
}: {
  slug: string;
  posts: WPPost[];
  allCategories: WPCategory[];
}) {
  const meta = CAT_META[slug] ?? DEFAULT_META;
  const [activeSort, setActiveSort] = useState("latest");

  const featured = posts.slice(0, 2);
  const list     = posts.slice(2);

  const otherCats = allCategories
    .map((c) => ({ appSlug: WP_TO_APP[c.slug] ?? c.slug, label: c.name, count: c.count ?? 0 }))
    .filter((c) => c.appSlug !== slug && CAT_META[c.appSlug])
    .reduce<{ appSlug: string; label: string }[]>((acc, c) => {
      if (!acc.find((x) => x.appSlug === c.appSlug)) acc.push(c);
      return acc;
    }, [])
    .slice(0, 6);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" as const, delay },
  });

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pb-16 pt-4">

      {/* ── Category hero header ── */}
      <motion.div {...fadeUp(0)} className="relative rounded-[24px] overflow-hidden mb-8 p-7 md:p-10"
        style={{ background: `linear-gradient(135deg, ${meta.bg}, rgba(255,255,255,0.01))`, border: `0.5px solid ${meta.border}` }}>
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.15)] to-transparent pointer-events-none" />
        <span className="absolute top-[-30%] right-[-10%] w-[50%] h-[150%] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${meta.glow}, transparent 65%)`, filter: "blur(40px)" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-[70px] h-[70px] md:w-[80px] md:h-[80px] rounded-[22px] flex items-center justify-center text-[34px] md:text-[38px] flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${meta.accentFrom}, ${meta.accentTo})`, boxShadow: `0 0 30px ${meta.glow}, 0 8px 20px rgba(0,0,0,0.3)` }}>
            {meta.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[9px] font-extrabold uppercase tracking-[2px] px-2.5 py-1 rounded-full font-[family-name:var(--font-data)]"
                style={{ color: meta.color, background: meta.bg, border: `0.5px solid ${meta.border}` }}>
                Category
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold art-sub-text">
                <Rss size={9} style={{ color: meta.color }} />
                Live feed
              </span>
            </div>
            <h1 className="text-[30px] md:text-[40px] font-black tracking-[-1.2px] md:tracking-[-1.8px] leading-[1.05] mb-2 art-heading font-[family-name:var(--font-display)]">
              {meta.label}
            </h1>
            <p className="text-[13px] md:text-[14px] art-sub-text font-medium leading-[1.55] max-w-[520px]">
              {meta.description}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
            <div className="text-[28px] md:text-[32px] font-black font-[family-name:var(--font-data)] tracking-[-1px] leading-none"
              style={{ color: meta.color }}>
              {posts.length}
            </div>
            <div className="text-[10px] art-sub-text font-bold uppercase tracking-[1px]">articles</div>
          </div>
        </div>
      </motion.div>

      {/* ── Sort tabs ── */}
      <motion.div {...fadeUp(0.08)} className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center gap-1.5 p-1 rounded-[12px] border flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}>
          {SORT_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSort(id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-[12px] font-bold transition-all duration-150 cursor-pointer font-[family-name:var(--font-display)] flex-shrink-0"
              style={activeSort === id
                ? { background: `linear-gradient(135deg,${meta.accentFrom},${meta.accentTo})`, color: "#000", boxShadow: `0 0 12px ${meta.glow}` }
                : { color: "#666" }}>
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[11px] art-sub-text font-semibold flex-shrink-0 font-[family-name:var(--font-data)]">
          {posts.length} results
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7">

        <div>
          {/* Featured cards */}
          {featured.length > 0 && (
            <motion.div {...fadeUp(0.12)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {featured.map((p) => (
                <FeaturedCard key={p.id} post={p} accentFrom={meta.accentFrom} accentTo={meta.accentTo} />
              ))}
            </motion.div>
          )}

          {list.length > 0 && (
            <>
              <motion.div {...fadeUp(0.18)} className="flex items-center gap-2.5 mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-[2.5px] art-sub-text font-[family-name:var(--font-display)]">More stories</span>
                <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
              </motion.div>
              <motion.div {...fadeUp(0.22)} className="flex flex-col gap-3">
                {list.map((p) => (
                  <ListCard key={p.id} post={p} accentFrom={meta.accentFrom} accentTo={meta.accentTo} />
                ))}
              </motion.div>
            </>
          )}

          {posts.length === 0 && (
            <div className="py-20 text-center text-[#555] font-semibold">No articles found for this category.</div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div {...fadeUp(0.15)} className="hidden lg:flex flex-col gap-5">

          {/* Browse categories */}
          <div className="rounded-[18px] p-5 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
            <p className="text-[10px] font-extrabold uppercase tracking-[1.8px] art-heading mb-4 font-[family-name:var(--font-display)]">
              Browse categories
            </p>
            <div className="flex flex-col gap-1.5">
              {otherCats.map((cat) => {
                const m = CAT_META[cat.appSlug] ?? DEFAULT_META;
                return (
                  <Link href={`/category/${cat.appSlug}`} key={cat.appSlug}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.04)] group">
                    <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[16px] flex-shrink-0"
                      style={{ background: `${m.color}14`, border: `0.5px solid ${m.color}33` }}>
                      {m.emoji}
                    </span>
                    <span className="text-[13px] font-semibold art-heading group-hover:text-[var(--color-brand)] transition-colors font-[family-name:var(--font-display)]">
                      {m.label}
                    </span>
                    <ArrowRight size={12} className="ml-auto art-sub-text group-hover:text-[var(--color-brand)] transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="rounded-[18px] p-5 relative overflow-hidden text-center"
            style={{ background: `linear-gradient(135deg, ${meta.bg}, rgba(255,255,255,0.01))`, border: `0.5px solid ${meta.border}` }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <span className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] rounded-full pointer-events-none"
              style={{ background: `radial-gradient(ellipse, ${meta.glow}, transparent 65%)`, filter: "blur(30px)" }} />
            <div className="relative z-10">
              <div className="text-3xl mb-2">📬</div>
              <h3 className="text-[15px] font-extrabold tracking-[-0.3px] mb-1.5 art-heading font-[family-name:var(--font-display)]">{meta.label} digest</h3>
              <p className="text-[12px] art-sub-text font-medium mb-4 leading-[1.5]">
                Daily summary of top {meta.label.toLowerCase()} stories, delivered every morning.
              </p>
              <button className="w-full py-3 rounded-[11px] text-[13px] font-extrabold text-black cursor-pointer transition-all hover:brightness-110 font-[family-name:var(--font-display)]"
                style={{ background: `linear-gradient(135deg,${meta.accentFrom},${meta.accentTo})`, boxShadow: `0 6px 18px ${meta.glow}, inset 0 1px 0 rgba(255,255,255,0.2)` }}>
                Subscribe free
              </button>
            </div>
          </div>

        </motion.div>
      </div>

      {/* ── Mobile: Browse other categories ── */}
      <motion.div {...fadeUp(0.3)} className="lg:hidden mt-8">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-[2px] art-sub-text font-[family-name:var(--font-display)]">Browse categories</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {otherCats.map((cat) => {
            const m = CAT_META[cat.appSlug] ?? DEFAULT_META;
            return (
              <Link href={`/category/${cat.appSlug}`} key={cat.appSlug}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-[14px] cursor-pointer transition-all duration-150"
                style={{ background: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                <span className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[20px]"
                  style={{ background: `${m.color}14`, border: `0.5px solid ${m.color}33` }}>
                  {m.emoji}
                </span>
                <span className="text-[11px] font-bold art-heading text-center font-[family-name:var(--font-display)]">{m.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}

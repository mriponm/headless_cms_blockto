"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { use } from "react";
import { TrendingUp, Clock, Flame, ArrowRight, Rss } from "lucide-react";

/* ─── Category metadata ─── */
const CATEGORY_META: Record<string, {
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

const DEFAULT_META = CATEGORY_META["general-news"];

/* ─── Mock article data per category ─── */
const ARTICLES = {
  featured: [
    {
      id: 1, tag: "ANALYSIS", tagColor: "#ff6a00", tagBg: "rgba(255,106,0,0.08)", tagBorder: "rgba(255,106,0,0.2)",
      title: "Bitcoin safe-haven narrative strengthens as global tensions rise across multiple regions",
      excerpt: "Institutional allocators are rotating into BTC as geopolitical uncertainty pushes traditional safe-haven assets to multi-year highs.",
      author: "TL", authorName: "Tristan L.", time: "2h ago", readTime: "4 min",
      svgBg: "#2d1a05",
      svgPath: "M30 115 L80 90 L130 105 L180 70 L220 55 L270 40",
      pathColor: "#ff6a00",
    },
    {
      id: 2, tag: "MARKET", tagColor: "#00d47b", tagBg: "rgba(0,212,123,0.08)", tagBorder: "rgba(0,212,123,0.2)",
      title: "Spot Bitcoin ETFs record nearly $1B in single-day inflows as institutional demand accelerates",
      excerpt: "BlackRock's IBIT leads the pack with $680M in daily flows, signaling a structural shift in how TradFi accesses digital assets.",
      author: "TL", authorName: "Tristan L.", time: "5h ago", readTime: "3 min",
      svgBg: "#0e1f15",
      svgPath: "M30 120 L80 100 L130 85 L180 65 L220 50 L270 35",
      pathColor: "#00d47b",
    },
  ],
  list: [
    {
      id: 3, tag: "ON-CHAIN", tagColor: "#4a9eff", tagBg: "rgba(74,158,255,0.08)", tagBorder: "rgba(74,158,255,0.2)",
      title: "Bitcoin shows seller exhaustion as realized losses decline to 6-month low",
      author: "TL", authorName: "Tristan L.", time: "6h ago", readTime: "2 min",
      svgBg: "#1a1a2e",
      svgPath: "M30 100 L80 95 L130 90 L180 80 L220 70 L270 55",
      pathColor: "#4a9eff",
    },
    {
      id: 4, tag: "REGULATION", tagColor: "#ff3b4f", tagBg: "rgba(255,59,79,0.08)", tagBorder: "rgba(255,59,79,0.2)",
      title: "Trump administration signals softer crypto stance ahead of key SEC leadership change",
      author: "TL", authorName: "Tristan L.", time: "8h ago", readTime: "3 min",
      svgBg: "#2d0a10",
      svgPath: "M30 80 L80 90 L130 75 L180 85 L220 70 L270 80",
      pathColor: "#ff3b4f",
    },
    {
      id: 5, tag: "DEFI", tagColor: "#b16aff", tagBg: "rgba(177,106,255,0.08)", tagBorder: "rgba(177,106,255,0.2)",
      title: "Solana Foundation launches STRIDE to strengthen DeFi security across the ecosystem",
      author: "TL", authorName: "Tristan L.", time: "1d ago", readTime: "4 min",
      svgBg: "#1a0e2d",
      svgPath: "M30 90 L80 80 L130 85 L180 65 L220 55 L270 45",
      pathColor: "#b16aff",
    },
    {
      id: 6, tag: "MACRO", tagColor: "#ffaa44", tagBg: "rgba(255,170,68,0.08)", tagBorder: "rgba(255,170,68,0.2)",
      title: "Fed minutes reveal growing consensus on rate cuts despite persistent inflation concerns",
      author: "TL", authorName: "Tristan L.", time: "1d ago", readTime: "5 min",
      svgBg: "#2a2000",
      svgPath: "M30 85 L80 80 L130 70 L180 60 L220 65 L270 50",
      pathColor: "#ffaa44",
    },
    {
      id: 7, tag: "ETF", tagColor: "#ff6a00", tagBg: "rgba(255,106,0,0.08)", tagBorder: "rgba(255,106,0,0.2)",
      title: "Bhutan government transfers $25M in Bitcoin as weekly outflows exceed 1,000 BTC",
      author: "TL", authorName: "Tristan L.", time: "2d ago", readTime: "2 min",
      svgBg: "#2d1a05",
      svgPath: "M30 60 L80 70 L130 65 L180 75 L220 80 L270 90",
      pathColor: "#ff6a00",
    },
    {
      id: 8, tag: "MARKET", tagColor: "#00d47b", tagBg: "rgba(0,212,123,0.08)", tagBorder: "rgba(0,212,123,0.2)",
      title: "Ethereum activity climbs past 1.3M daily transactions, highest since May 2024",
      author: "TL", authorName: "Tristan L.", time: "2d ago", readTime: "3 min",
      svgBg: "#0e1f15",
      svgPath: "M30 100 L80 85 L130 75 L180 60 L220 45 L270 38",
      pathColor: "#00d47b",
    },
  ],
};

const SORT_TABS = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "top", label: "Top rated", icon: TrendingUp },
];

/* ─── Related categories ─── */
const OTHER_CATS = [
  { slug: "bitcoin",      label: "Bitcoin",      color: "#ff6a00", emoji: "₿" },
  { slug: "ethereum",     label: "Ethereum",     color: "#4a9eff", emoji: "Ξ" },
  { slug: "altcoins",     label: "Altcoins",     color: "#00d47b", emoji: "🪙" },
  { slug: "nfts",         label: "NFTs",         color: "#b16aff", emoji: "🎨" },
  { slug: "blockchain",   label: "Blockchain",   color: "#4a9eff", emoji: "⛓️" },
  { slug: "general-news", label: "General News", color: "#ff6a00", emoji: "📰" },
];

/* ─── Article card (featured) ─── */
function FeaturedCard({ article, accentFrom, accentTo }: {
  article: (typeof ARTICLES.featured)[0];
  accentFrom: string; accentTo: string;
}) {
  return (
    <Link href="/article" className="block rounded-[20px] overflow-hidden cursor-pointer card-hover border border-[rgba(255,255,255,0.06)] relative group"
      style={{ background: "rgba(255,255,255,0.025)" }}>
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none z-10" />
      <div className="h-[200px] md:h-[240px] relative overflow-hidden">
        <svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
          <rect width="600" height="240" fill={article.svgBg} />
          <path d={article.svgPath} stroke={article.pathColor} strokeWidth="2.5" fill="none" />
          <path d={article.svgPath + " L270 150 L30 150 Z"} fill={article.pathColor} opacity="0.15" />
          <text x="300" y="160" textAnchor="middle" fontFamily="Outfit" fontSize="110" fontWeight="900" fill={article.pathColor} opacity="0.07">BLOCKTO</text>
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3.5 left-3.5">
          <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)]"
            style={{ color: article.tagColor, background: article.tagBg, border: `0.5px solid ${article.tagBorder}` }}>
            {article.tag}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-[17px] md:text-[18px] font-extrabold leading-[1.3] mb-2.5 tracking-[-0.4px] line-clamp-2 art-heading font-[family-name:var(--font-display)]">
          {article.title}
        </h3>
        <p className="text-[13px] art-sub-text leading-[1.55] font-medium mb-4 line-clamp-2 font-[family-name:var(--font-display)]">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] art-sub-text font-medium">
            <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-extrabold text-black flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${accentFrom},${accentTo})` }}>
              {article.author}
            </span>
            {article.authorName} · {article.time}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] art-sub-text font-semibold px-2 py-1 rounded-[7px] art-tag-pill font-[family-name:var(--font-data)]">
            <Clock size={10} />
            {article.readTime}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Article card (list row) ─── */
function ListCard({ article, accentFrom, accentTo }: {
  article: (typeof ARTICLES.list)[0];
  accentFrom: string; accentTo: string;
}) {
  return (
    <Link href="/article" className="flex gap-3.5 p-3.5 rounded-[16px] cursor-pointer card-hover border border-[rgba(255,255,255,0.06)] relative group"
      style={{ background: "rgba(255,255,255,0.025)" }}>
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-[12px] overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.06)]">
        <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect width="110" height="110" fill={article.svgBg} />
          <path d={article.svgPath} stroke={article.pathColor} strokeWidth="2" fill="none" />
          <path d={article.svgPath + " L270 110 L30 110 Z"} fill={article.pathColor} opacity="0.18" />
        </svg>
      </div>
      <div className="flex flex-col justify-between min-w-0 flex-1">
        <div>
          <span className="inline-block text-[8px] font-extrabold px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] mb-1.5 font-[family-name:var(--font-data)]"
            style={{ color: article.tagColor, background: article.tagBg, border: `0.5px solid ${article.tagBorder}` }}>
            {article.tag}
          </span>
          <p className="text-[14px] font-bold leading-[1.35] tracking-[-0.2px] line-clamp-2 md:line-clamp-3 art-heading font-[family-name:var(--font-display)]">
            {article.title}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] art-sub-text font-medium mt-1.5">
          <span className="w-[16px] h-[16px] rounded-full flex items-center justify-center text-[7px] font-extrabold text-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${accentFrom},${accentTo})` }}>
            {article.author}
          </span>
          {article.authorName} · {article.time}
          <span className="ml-auto flex items-center gap-1 font-[family-name:var(--font-data)]">
            <Clock size={9} />
            {article.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ─── */
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const meta = CATEGORY_META[slug] ?? DEFAULT_META;
  const [activeSort, setActiveSort] = useState("latest");

  const otherCats = OTHER_CATS.filter((c) => c.slug !== slug);

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
              248
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
          248 results
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7">

        {/* Content column */}
        <div>
          {/* Featured cards */}
          <motion.div {...fadeUp(0.12)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {ARTICLES.featured.map((a) => (
              <FeaturedCard key={a.id} article={a} accentFrom={meta.accentFrom} accentTo={meta.accentTo} />
            ))}
          </motion.div>

          {/* Divider label */}
          <motion.div {...fadeUp(0.18)} className="flex items-center gap-2.5 mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-[2.5px] art-sub-text font-[family-name:var(--font-display)]">
              More stories
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
          </motion.div>

          {/* List cards */}
          <motion.div {...fadeUp(0.22)} className="flex flex-col gap-3">
            {ARTICLES.list.map((a) => (
              <ListCard key={a.id} article={a} accentFrom={meta.accentFrom} accentTo={meta.accentTo} />
            ))}
          </motion.div>

          {/* Load more */}
          <motion.div {...fadeUp(0.28)} className="mt-8 flex justify-center">
            <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-[14px] text-[13px] font-extrabold cursor-pointer transition-all duration-150 hover:brightness-110 font-[family-name:var(--font-display)]"
              style={{
                background: `linear-gradient(135deg,${meta.accentFrom},${meta.accentTo})`,
                color: "#000",
                boxShadow: `0 8px 22px ${meta.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}>
              Load more stories
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div {...fadeUp(0.15)} className="hidden lg:flex flex-col gap-5">

          {/* Trending in category */}
          <div className="rounded-[18px] p-5 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Flame size={13} style={{ color: meta.color }} />
              <span className="text-[10px] font-extrabold uppercase tracking-[1.8px] art-heading font-[family-name:var(--font-display)]">
                Trending in {meta.label}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {[
                "Bitcoin surges past $90K as ETF inflows hit monthly record",
                "Ethereum L2 ecosystem surpasses $50B in total value locked",
                "Altseason indicators flash green as dominance falls below 52%",
                "Fed signals pause — crypto markets rally on soft CPI print",
              ].map((title, i) => (
                <Link href="/article" key={i}
                  className="flex gap-3 py-3.5 border-b art-border last:border-none cursor-pointer group">
                  <span className="font-[family-name:var(--font-data)] text-[18px] font-black leading-none mt-0.5 flex-shrink-0 w-[26px]"
                    style={{ color: i === 0 ? meta.color : "#333" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[13px] font-semibold leading-[1.35] art-heading group-hover:text-[var(--color-brand)] transition-colors line-clamp-2 font-[family-name:var(--font-display)]">
                    {title}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Browse categories */}
          <div className="rounded-[18px] p-5 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
            <p className="text-[10px] font-extrabold uppercase tracking-[1.8px] art-heading mb-4 font-[family-name:var(--font-display)]">
              Browse categories
            </p>
            <div className="flex flex-col gap-1.5">
              {otherCats.map((cat) => (
                <Link href={`/category/${cat.slug}`} key={cat.slug}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.04)] group">
                  <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[16px] flex-shrink-0"
                    style={{ background: `${cat.color}14`, border: `0.5px solid ${cat.color}33` }}>
                    {cat.emoji}
                  </span>
                  <span className="text-[13px] font-semibold art-heading group-hover:text-[var(--color-brand)] transition-colors font-[family-name:var(--font-display)]">
                    {cat.label}
                  </span>
                  <ArrowRight size={12} className="ml-auto art-sub-text group-hover:text-[var(--color-brand)] transition-colors" />
                </Link>
              ))}
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
              <h3 className="text-[15px] font-extrabold tracking-[-0.3px] mb-1.5 art-heading font-[family-name:var(--font-display)]">
                {meta.label} digest
              </h3>
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
          <span className="text-[10px] font-extrabold uppercase tracking-[2px] art-sub-text font-[family-name:var(--font-display)]">
            Browse categories
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {otherCats.map((cat) => (
            <Link href={`/category/${cat.slug}`} key={cat.slug}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-[14px] cursor-pointer transition-all duration-150"
              style={{ background: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              <span className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[20px]"
                style={{ background: `${cat.color}14`, border: `0.5px solid ${cat.color}33` }}>
                {cat.emoji}
              </span>
              <span className="text-[11px] font-bold art-heading text-center font-[family-name:var(--font-display)]">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

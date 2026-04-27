"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import { pickAuthor } from "@/lib/authors";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp, Clock, Flame, ArrowRight, Rss,
  Newspaper, Bitcoin, Layers, BarChart2, Network,
  LineChart, PieChart, X,
} from "lucide-react";
import type { WPPost, WPCategory } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory, stripExcerpt } from "@/lib/wordpress/queries";
import TranslatedText from "@/components/ui/TranslatedText";
import NewsletterForm from "@/components/ui/NewsletterForm";

const BRAND = "#ff6a00";
const BRAND_BG = "rgba(255,106,0,0.08)";
const BRAND_BORDER = "rgba(255,106,0,0.2)";
const BRAND_GLOW = "rgba(255,106,0,0.15)";
const BRAND_GRAD_FROM = "#ff6a00";
const BRAND_GRAD_TO = "#ffaa44";

const CAT_META: Record<string, {
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  description: string;
}> = {
  "general-news": {
    label: "General News",
    Icon: Newspaper,
    description: "Breaking stories, market-moving headlines, and the events shaping the crypto landscape.",
  },
  "bitcoin": {
    label: "Bitcoin",
    Icon: Bitcoin,
    description: "BTC price analysis, on-chain data, institutional flows, and the world's leading digital asset.",
  },
  "ethereum": {
    label: "Ethereum",
    Icon: Layers,
    description: "ETH ecosystem updates, Layer 2 scaling, DeFi protocols, and smart contract developments.",
  },
  "altcoins": {
    label: "Altcoins",
    Icon: BarChart2,
    description: "SOL, AVAX, LINK and the broader altcoin market — price action, fundamentals and trends.",
  },
  "blockchain": {
    label: "Blockchain",
    Icon: Network,
    description: "Protocol upgrades, network security, consensus mechanisms, and infrastructure developments.",
  },
  "markets": {
    label: "Markets",
    Icon: TrendingUp,
    description: "Live market updates, price action, and macro conditions shaping crypto markets today.",
  },
  "analysis": {
    label: "Analysis",
    Icon: LineChart,
    description: "In-depth technical and fundamental analysis across major crypto assets.",
  },
  "bitcoin-analysis": {
    label: "Bitcoin Analysis",
    Icon: Bitcoin,
    description: "BTC technical analysis, chart breakdowns, key levels and price forecasts.",
  },
  "altcoin-focus": {
    label: "Altcoin Focus",
    Icon: PieChart,
    description: "Deep-dives into altcoin setups — SOL, LINK, AVAX, XRP and the broader alt market.",
  },
};

const DEFAULT_META = CAT_META["general-news"];

const SORT_TABS = [
  { id: "latest",   label: "Latest",    icon: Clock },
  { id: "trending", label: "Trending",  icon: Flame },
  { id: "top",      label: "Top rated", icon: TrendingUp },
];

function FeaturedCard({ post }: { post: WPPost }) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="hp-card block rounded-[20px] overflow-hidden cursor-pointer card-hover relative group">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none z-10" />
      <div className="h-[200px] md:h-[240px] relative overflow-hidden bg-[#0a0e1a]">
        {post.featuredImage ? (
          <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 50vw" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BRAND_BG}, #0a0e1a)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3.5 left-3.5">
          <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)]"
            style={{ color: BRAND, background: BRAND_BG, border: `0.5px solid ${BRAND_BORDER}` }}>
            {cat.name.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-[17px] md:text-[18px] font-extrabold leading-[1.3] mb-2.5 tracking-[-0.4px] line-clamp-2 art-heading font-[family-name:var(--font-display)]">
          <TranslatedText text={post.title} />
        </h3>
        <p className="text-[13px] art-sub-text leading-[1.55] font-medium mb-4 line-clamp-2 font-[family-name:var(--font-display)]">
          <TranslatedText text={stripExcerpt(post.excerpt)} />
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] art-sub-text font-medium">
            <AuthorAvatar slug={post.slug} size={22} />
            <span data-no-translate>{pickAuthor(post.slug).name}</span> · {relativeDate(post.date)}
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

function ListCard({ post }: { post: WPPost }) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="hp-card flex gap-3.5 p-3.5 rounded-[16px] cursor-pointer card-hover relative group block">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-[12px] overflow-hidden flex-shrink-0 img-thumb-border img-thumb-bg relative">
        {post.featuredImage ? (
          <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill className="object-cover" sizes="110px" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${BRAND_BG}, #0a0e1a)` }} />
        )}
      </div>
      <div className="flex flex-col justify-between min-w-0 flex-1">
        <div>
          <span className="inline-block text-[8px] font-extrabold px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] mb-1.5 font-[family-name:var(--font-data)]"
            style={{ color: BRAND, background: BRAND_BG, border: `0.5px solid ${BRAND_BORDER}` }}>
            {cat.name.toUpperCase()}
          </span>
          <p className="text-[14px] font-bold leading-[1.35] tracking-[-0.2px] line-clamp-2 md:line-clamp-3 art-heading font-[family-name:var(--font-display)]">
            <TranslatedText text={post.title} />
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] art-sub-text font-medium mt-1.5">
          <AuthorAvatar slug={post.slug} size={16} />
          {pickAuthor(post.slug).name} · {relativeDate(post.date)}
          <span className="ml-auto flex items-center gap-1 font-[family-name:var(--font-data)]">
            <Clock size={9} />3 min
          </span>
        </div>
      </div>
    </Link>
  );
}

const WP_TO_APP: Record<string, string> = {
  bitcoin: "bitcoin", ethereum: "ethereum", altcoin: "altcoins",
  news: "general-news", blog: "general-news", ai: "general-news",
};

export default function CategoryContent({
  slug, posts, allCategories,
}: {
  slug: string;
  posts: WPPost[];
  allCategories: WPCategory[];
}) {
  const meta = CAT_META[slug] ?? DEFAULT_META;
  const { Icon } = meta;
  const [activeSort, setActiveSort] = useState("latest");
  const [showNewsletter, setShowNewsletter] = useState(false);

  const sortedPosts = (() => {
    if (activeSort === "trending") {
      // deterministic shuffle by id — consistent "trending" order
      return [...posts].sort((a, b) => {
        const ha = a.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const hb = b.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return (ha % 17) - (hb % 17);
      });
    }
    if (activeSort === "top") {
      return [...posts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    // latest: date desc (API default)
    return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  const featured = sortedPosts.slice(0, 2);
  const list     = sortedPosts.slice(2);

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
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-4">

      {/* Category hero header */}
      <motion.div {...fadeUp(0)} className="relative rounded-[20px] md:rounded-[28px] overflow-hidden mb-8"
        style={{ background: `linear-gradient(135deg, rgba(255,106,0,0.10), rgba(255,106,0,0.03) 60%, rgba(0,0,0,0.2))`, border: `0.5px solid ${BRAND_BORDER}`, boxShadow: `0 0 60px rgba(255,106,0,0.08), 0 1px 0 rgba(255,255,255,0.06) inset` }}>
        {/* Top shimmer */}
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent pointer-events-none" />
        {/* Glow orb */}
        <span className="absolute top-[-40%] right-[-5%] w-[55%] h-[160%] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND_GLOW}, transparent 65%)`, filter: "blur(50px)" }} />
        {/* Bottom left accent */}
        <span className="absolute bottom-0 left-0 w-[200px] h-[1px] bg-gradient-to-r from-[rgba(255,106,0,0.3)] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-row items-center gap-4 md:gap-8 p-5 md:p-10">
          {/* Icon */}
          <div className="w-[56px] h-[56px] md:w-[88px] md:h-[88px] rounded-[16px] md:rounded-[24px] flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${BRAND_GRAD_FROM}, ${BRAND_GRAD_TO})`, boxShadow: `0 0 30px ${BRAND_GLOW}, 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)` }}>
            <Icon size={24} className="md:hidden" style={{ color: "#000" }} />
            <Icon size={40} className="hidden md:block" style={{ color: "#000" }} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="text-[8px] md:text-[9px] font-extrabold uppercase tracking-[2px] px-2.5 py-1 rounded-full font-[family-name:var(--font-data)]"
                style={{ color: BRAND, background: "rgba(255,106,0,0.1)", border: `0.5px solid rgba(255,106,0,0.25)` }}>
                Category
              </span>
              <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-semibold art-sub-text">
                <span className="w-[5px] h-[5px] rounded-full bg-[#00d47b] shadow-[0_0_6px_#00d47b] pls-anim" />
                Live feed
              </span>
            </div>
            <h1 className="text-[22px] md:text-[42px] font-black tracking-[-0.8px] md:tracking-[-2px] leading-[1.05] mb-2 md:mb-3 art-heading font-[family-name:var(--font-display)]">
              {meta.label}
            </h1>
            <p className="text-[11px] md:text-[14px] art-sub-text font-medium leading-[1.5] md:leading-[1.6] max-w-[540px] line-clamp-2 md:line-clamp-none">
              {meta.description}
            </p>
          </div>

          {/* Article count — right side stat */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 px-4 md:px-6 py-3 md:py-4 rounded-[14px] md:rounded-[18px]"
            style={{ background: "rgba(255,106,0,0.07)", border: "0.5px solid rgba(255,106,0,0.18)" }}>
            <div className="text-[26px] md:text-[36px] font-black font-[family-name:var(--font-data)] tracking-[-1px] leading-none"
              style={{ color: BRAND }}>
              {posts.length}
            </div>
            <div className="text-[8px] md:text-[9px] art-sub-text font-bold uppercase tracking-[1.5px] whitespace-nowrap">articles</div>
          </div>
        </div>
      </motion.div>

      {/* Sort tabs */}
      <motion.div {...fadeUp(0.08)} className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center gap-1 p-0.5 md:p-1 rounded-[10px] md:rounded-[12px] border flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}>
          {SORT_TABS.map(({ id, label, icon: TabIcon }) => (
            <button key={id} onClick={() => setActiveSort(id)}
              className="flex items-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-[7px] md:rounded-[9px] text-[10px] md:text-[12px] font-bold transition-all duration-150 cursor-pointer font-[family-name:var(--font-display)] flex-shrink-0"
              style={activeSort === id
                ? { background: `linear-gradient(135deg,${BRAND_GRAD_FROM},${BRAND_GRAD_TO})`, color: "#000", boxShadow: `0 0 12px ${BRAND_GLOW}` }
                : { color: "#666" }}>
              <TabIcon size={9} className="md:hidden" />
              <TabIcon size={11} className="hidden md:block" />
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[10px] md:text-[11px] art-sub-text font-semibold flex-shrink-0 font-[family-name:var(--font-data)]">
          {posts.length} results
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7">
        <div>
          {featured.length > 0 && (
            <motion.div {...fadeUp(0.12)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {featured.map((p) => <FeaturedCard key={p.id} post={p} />)}
            </motion.div>
          )}

          {list.length > 0 && (
            <>
              <motion.div {...fadeUp(0.18)} className="flex items-center gap-2.5 mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-[2.5px] art-sub-text font-[family-name:var(--font-display)]">More stories</span>
                <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
              </motion.div>
              <motion.div {...fadeUp(0.22)} className="flex flex-col gap-3">
                {list.map((p) => <ListCard key={p.id} post={p} />)}
              </motion.div>
            </>
          )}

          {posts.length === 0 && (
            <div className="py-20 text-center text-[#555] font-semibold">No articles found for this category.</div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div {...fadeUp(0.15)} className="hidden lg:flex flex-col gap-5">
          <div className="hp-card rounded-[18px] p-5 relative overflow-hidden">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
            <p className="text-[10px] font-extrabold uppercase tracking-[1.8px] art-heading mb-4 font-[family-name:var(--font-display)]">
              Browse categories
            </p>
            <div className="flex flex-col gap-1.5">
              {otherCats.map((cat) => {
                const m = CAT_META[cat.appSlug] ?? DEFAULT_META;
                const CatIcon = m.Icon;
                return (
                  <Link href={`/category/${cat.appSlug}`} key={cat.appSlug}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.04)] group">
                    <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                      style={{ background: BRAND_BG, border: `0.5px solid ${BRAND_BORDER}` }}>
                      <CatIcon size={15} style={{ color: BRAND }} />
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
            style={{ background: `linear-gradient(135deg, ${BRAND_BG}, rgba(255,255,255,0.01))`, border: `0.5px solid ${BRAND_BORDER}` }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <span className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] rounded-full pointer-events-none"
              style={{ background: `radial-gradient(ellipse, ${BRAND_GLOW}, transparent 65%)`, filter: "blur(30px)" }} />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mx-auto mb-3"
                style={{ background: `linear-gradient(135deg,${BRAND_GRAD_FROM},${BRAND_GRAD_TO})` }}>
                <Rss size={18} style={{ color: "#000" }} />
              </div>
              <h3 className="text-[15px] font-extrabold tracking-[-0.3px] mb-1.5 art-heading font-[family-name:var(--font-display)]">{meta.label} digest</h3>
              <p className="text-[12px] art-sub-text font-medium mb-4 leading-[1.5]">
                Daily summary of top {meta.label.toLowerCase()} stories, delivered every morning.
              </p>
              <button
                onClick={() => setShowNewsletter(true)}
                className="w-full py-3 rounded-[11px] text-[13px] font-extrabold text-black cursor-pointer transition-all hover:brightness-110 font-[family-name:var(--font-display)]"
                style={{ background: `linear-gradient(135deg,${BRAND_GRAD_FROM},${BRAND_GRAD_TO})`, boxShadow: `0 6px 18px ${BRAND_GLOW}, inset 0 1px 0 rgba(255,255,255,0.2)` }}>
                Subscribe free
              </button>

              {showNewsletter && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                  style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
                  onClick={e => { if (e.target === e.currentTarget) setShowNewsletter(false); }}>
                  <div className="w-full max-w-sm rounded-[20px] p-6 relative"
                    style={{ background: "#0e0e0e", border: "0.5px solid rgba(255,255,255,0.10)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                    <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.35)] to-transparent rounded-t-[20px] pointer-events-none" />
                    <button onClick={() => setShowNewsletter(false)}
                      className="absolute top-4 right-4 w-7 h-7 rounded-[8px] flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.06)]">
                      <X size={13} style={{ color: "#666" }} />
                    </button>
                    <p className="text-[14px] font-extrabold mb-1 font-[family-name:var(--font-display)]">{meta.label} digest</p>
                    <p className="text-[11px] mb-4 font-[family-name:var(--font-display)]" style={{ color: "#777" }}>
                      Daily summary delivered every morning.
                    </p>
                    <NewsletterForm />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile: Browse other categories */}
      <motion.div {...fadeUp(0.3)} className="lg:hidden mt-8">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-[2px] art-sub-text font-[family-name:var(--font-display)]">Browse categories</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {otherCats.map((cat) => {
            const m = CAT_META[cat.appSlug] ?? DEFAULT_META;
            const CatIcon = m.Icon;
            return (
              <Link href={`/category/${cat.appSlug}`} key={cat.appSlug}
                className="hp-card flex flex-col items-center gap-2 py-4 px-2 rounded-[14px] cursor-pointer transition-all duration-150">
                <span className="w-10 h-10 rounded-[11px] flex items-center justify-center"
                  style={{ background: BRAND_BG, border: `0.5px solid ${BRAND_BORDER}` }}>
                  <CatIcon size={18} style={{ color: BRAND }} />
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

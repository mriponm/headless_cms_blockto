import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, relativeDate, primaryCategory } from "@/lib/wordpress/queries";
import FadeIn from "@/components/ui/FadeIn";
import BreakingBanner from "@/components/features/BreakingBanner";
import PulseRow from "@/components/features/PulseRow";
import SectionLabel from "@/components/ui/SectionLabel";
import MarketHeroCard from "@/components/features/markets/MarketHeroCard";
import MarketAnalysisCard from "@/components/features/markets/MarketAnalysisCard";
import type { SignalType } from "@/components/features/markets/MarketAnalysisCard";

export const metadata: Metadata = {
  title: "Markets — Blockto",
  description: "Technical analysis, market updates, Bitcoin and altcoin price analysis.",
};

const SIG: SignalType[] = ["bull", "neu", "bear", "bull", "neu", "bull"];

const CAT_TAG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  bitcoin:             { label: "BTC", color: "#ff6a00", bg: "rgba(255,106,0,0.08)",   border: "rgba(255,106,0,0.2)" },
  "bitcoin-analysis":  { label: "BTC", color: "#ff6a00", bg: "rgba(255,106,0,0.08)",   border: "rgba(255,106,0,0.2)" },
  ethereum:            { label: "ETH", color: "#4a9eff", bg: "rgba(74,158,255,0.08)",  border: "rgba(74,158,255,0.2)" },
  altcoin:             { label: "ALT", color: "#b16aff", bg: "rgba(177,106,255,0.08)", border: "rgba(177,106,255,0.2)" },
  altcoins:            { label: "ALT", color: "#b16aff", bg: "rgba(177,106,255,0.08)", border: "rgba(177,106,255,0.2)" },
  "altcoin-focus":     { label: "ALT", color: "#b16aff", bg: "rgba(177,106,255,0.08)", border: "rgba(177,106,255,0.2)" },
  nft:                 { label: "NFT", color: "#ff6eb4", bg: "rgba(255,110,180,0.08)", border: "rgba(255,110,180,0.2)" },
  markets:             { label: "MKT", color: "#ff6a00", bg: "rgba(255,106,0,0.08)",   border: "rgba(255,106,0,0.2)" },
  analysis:            { label: "ANA", color: "#4a9eff", bg: "rgba(74,158,255,0.08)",  border: "rgba(74,158,255,0.2)" },
};
const DEFAULT_TAG = CAT_TAG.bitcoin;

export default async function MarketsPage() {
  const [latestPosts, bitcoinPosts, altcoinPosts] = await Promise.all([
    getPosts(14),
    getPosts(8, "bitcoin"),
    getPosts(8, "altcoins"),
  ]);

  const heroPost      = latestPosts[0] ?? null;
  const analysisPosts = latestPosts.slice(1, 7);
  const trendingPosts = latestPosts.slice(0, 5);

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pb-10 pt-4">

      <FadeIn delay={0.04}><BreakingBanner post={heroPost} /></FadeIn>
      <FadeIn delay={0.09}><PulseRow /></FadeIn>

      {/* Market Update */}
      <FadeIn delay={0.14}>
        <SectionLabel title="Market update" live viewAllHref="/category/markets" />
        {heroPost ? (
          <MarketHeroCard post={heroPost} />
        ) : (
          <div className="mkt-empty h-[220px] rounded-[20px] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-sm mb-5">
            No market update available
          </div>
        )}
      </FadeIn>

      {/* Latest Analysis */}
      {analysisPosts.length > 0 && (
        <FadeIn delay={0.19}>
          <SectionLabel
            title="Latest analysis"
            count={`${analysisPosts.length} ARTICLES`}
            viewAllHref="/category/analysis"
          />
          <div className="flex flex-col gap-2.5 mb-5">
            {analysisPosts.map((post, i) => (
              <MarketAnalysisCard
                key={post.id}
                post={post}
                signal={SIG[i % SIG.length]}
              />
            ))}
          </div>
        </FadeIn>
      )}

      {/* Most Read — horizontal scroll */}
      {trendingPosts.length > 0 && (
        <FadeIn delay={0.24}>
          <SectionLabel title="Most read" count="THIS WEEK" />
          <div className="overflow-x-auto scrollbar-hide pb-1 mb-5">
            <div className="flex gap-2.5" style={{ width: "max-content" }}>
              {trendingPosts.map((post, i) => {
                const cat = primaryCategory(post);
                const tag = CAT_TAG[cat.slug] ?? DEFAULT_TAG;
                return (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    className="glass mkt-trend-card flex-shrink-0 w-[220px] p-[14px] rounded-[14px] relative overflow-hidden cursor-pointer"
                  >
                    <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className="text-[20px] font-black font-[family-name:var(--font-data)] tracking-[-0.5px] leading-none"
                        style={{ background: "linear-gradient(135deg,#ff6a00,#ffaa44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="text-[9px] font-extrabold px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] font-[family-name:var(--font-data)] border"
                        style={{ color: tag.color, background: tag.bg, borderColor: tag.border }}
                      >
                        {tag.label}
                      </span>
                    </div>
                    <p className="mkt-trend-title text-[12px] font-bold leading-[1.3] mb-2 line-clamp-2 min-h-[31px]">
                      {post.title}
                    </p>
                    <div className="flex items-center justify-between text-[9px] font-semibold">
                      <span className="mkt-trend-author">
                        {post.author.node.name.split(" ")[0]}{" "}
                        {post.author.node.name.split(" ")[1]?.[0] ?? ""}.
                      </span>
                      <time dateTime={post.date} className="text-[#ff6a00] font-bold">
                        {relativeDate(post.date)}
                      </time>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Bitcoin Analysis */}
      {bitcoinPosts.length > 0 && (
        <FadeIn delay={0.28}>
          <SectionLabel
            title="Bitcoin analysis"
            count={String(bitcoinPosts.length)}
            viewAllHref="/category/bitcoin-analysis"
          />
          <div className="flex flex-col gap-2.5 mb-4">
            {bitcoinPosts.slice(0, 4).map((post, i) => (
              <MarketAnalysisCard
                key={post.id}
                post={post}
                signal={i % 2 === 0 ? "bull" : "neu"}
              />
            ))}
          </div>
          <Link
            href="/category/bitcoin-analysis"
            className="mkt-viewall-btn flex items-center justify-center w-full py-3 rounded-[12px] text-[12px] font-bold mb-6 cursor-pointer"
          >
            View all Bitcoin analysis ›
          </Link>
        </FadeIn>
      )}

      {/* Altcoin Focus */}
      {altcoinPosts.length > 0 && (
        <FadeIn delay={0.32}>
          <SectionLabel
            title="Altcoin focus"
            count={String(altcoinPosts.length)}
            viewAllHref="/category/altcoin-focus"
          />
          <div className="flex flex-col gap-2.5 mb-4">
            {altcoinPosts.slice(0, 4).map((post, i) => (
              <MarketAnalysisCard
                key={post.id}
                post={post}
                signal={i % 3 === 0 ? "bull" : i % 3 === 1 ? "bear" : "neu"}
              />
            ))}
          </div>
          <Link
            href="/category/altcoin-focus"
            className="mkt-viewall-btn flex items-center justify-center w-full py-3 rounded-[12px] text-[12px] font-bold mb-6 cursor-pointer"
          >
            View all Altcoin focus ›
          </Link>
        </FadeIn>
      )}

    </div>
  );
}

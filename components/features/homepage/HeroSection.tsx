import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import TranslatedText from "@/components/ui/TranslatedText";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";

const CAT_COLOR: Record<string, string> = {
  bitcoin:  "#ff6a00", ethereum: "#4a9eff", altcoin:  "#00d47b",
  nft:      "#b16aff", news:     "#ff6a00", ai:       "#00d4ff",
  regulation: "#e06aff", etf:   "#00c48c",
};

function catColor(post: WPPost) {
  const cat = primaryCategory(post);
  return CAT_COLOR[cat.slug] ?? "#ff6a00";
}

export default function HeroSection({ posts }: { posts: WPPost[] }) {
  const [hero, sec1, sec2] = posts;

  return (
    <>
      <SectionLabel title="Latest news" live viewAllHref="/news" />
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3 lg:gap-[18px] mb-6">

        {/* ── Hero card ── */}
        {hero && (
          <Link href={`/news/${hero.slug}`}
            className="hero-card relative rounded-[20px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.07)] group block">
            {/* Full-bleed image */}
            <div className="h-[220px] lg:h-[290px] relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(255,106,0,0.18) 0%, rgba(255,80,0,0.08) 50%, rgba(0,0,0,0.95) 100%)" }}>
              {hero.featuredImage && (
                <Image
                  src={hero.featuredImage.node.sourceUrl}
                  alt={hero.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              )}
              {/* Brand gradient overlay */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, rgba(255,106,0,0.06) 0%, transparent 30%, rgba(10,6,2,0.6) 60%, rgba(15,8,2,0.97) 100%)"
              }} />
            </div>

            {/* FEATURED badge */}
            <div className="absolute top-4 left-4 z-10 text-[10px] font-extrabold text-black px-3 py-[6px] rounded-[8px] tracking-[1px] font-[family-name:var(--font-display)]"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.4)" }}>
              FEATURED
            </div>

            {/* Time badge */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-[10px] px-3 py-[6px] rounded-[8px] border border-white/10">
              <span className="w-[5px] h-[5px] rounded-full bg-[#00d47b] shadow-[0_0_8px_#00d47b] pls-anim" />
              {relativeDate(hero.date)}
            </div>

            {/* Title + author overlaid at bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-6 lg:px-7 lg:pt-5 lg:pb-8 z-10">
              <h1 className="text-white text-[16px] lg:text-[22px] font-extrabold tracking-[-0.5px] leading-[1.2] mb-3 font-[family-name:var(--font-display)] line-clamp-3">
                <TranslatedText text={hero.title} />
              </h1>
              <div className="flex items-center gap-2 text-[12px] text-[#ccc] font-medium">
                <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-extrabold text-black flex-shrink-0"
                  style={{ background: "var(--gradient-brand)" }}>
                  {hero.author.node.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-[#ddd]" data-no-translate>{hero.author.node.name}</span>
                <span className="text-[#555]">·</span>
                <span className="text-[#888]">4 min read</span>
              </div>
            </div>
          </Link>
        )}

        {/* ── Two secondary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-3 lg:gap-[18px]">
          {[sec1, sec2].filter(Boolean).map((post) => {
            const color = catColor(post!);
            const cat   = primaryCategory(post!);
            return (
              <Link key={post!.id} href={`/news/${post!.slug}`}
                className="hero-card rounded-[18px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.07)] group block flex flex-col">

                {/* Image section */}
                <div className="relative overflow-hidden flex-shrink-0" style={{ height: "120px", background: `linear-gradient(135deg, ${color}25, rgba(255,106,0,0.06), rgba(0,0,0,0.9))` }}>
                  {post!.featuredImage && (
                    <Image
                      src={post!.featuredImage.node.sourceUrl}
                      alt={post!.title}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      sizes="(max-width: 1024px) 50vw, 40vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                </div>

                {/* Content section */}
                <div className="flex-1 p-3 lg:p-4 hp-card" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 0 }}>
                  {/* Small category badge */}
                  <span className="inline-block text-[8px] font-extrabold px-2 py-[3px] rounded-[5px] tracking-[0.8px] font-[family-name:var(--font-data)] mb-2"
                    style={{ color, background: `${color}18`, border: `0.5px solid ${color}44` }}>
                    {cat.name.toUpperCase()}
                  </span>
                  <p className="text-white text-[12px] lg:text-[15px] font-bold tracking-[-0.2px] leading-[1.35] mb-2 font-[family-name:var(--font-display)] line-clamp-2">
                    <TranslatedText text={post!.title} />
                  </p>
                  <p className="text-[10px] text-[#777] font-medium font-[family-name:var(--font-display)] flex items-center gap-1.5">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#00d47b] inline-block flex-shrink-0" />
                    {relativeDate(post!.date)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

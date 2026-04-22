import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory, stripExcerpt } from "@/lib/wordpress/queries";

const CAT_COLOR: Record<string, string> = {
  bitcoin:  "#ff6a00", ethereum: "#4a9eff", altcoin: "#00d47b",
  nft:      "#b16aff", news:     "#ff6a00", ai:      "#00d4ff",
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
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] mb-6">

        {/* ── Hero card ── */}
        {hero && (
          <Link href={`/news/${hero.slug}`}
            className="hero-card relative rounded-[22px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.08)] group block">
            <div className="h-[480px] relative bg-gradient-to-br from-[#1e3a5f] to-[#0a1929] overflow-hidden">
              {hero.featuredImage ? (
                <Image
                  src={hero.featuredImage.node.sourceUrl}
                  alt={hero.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                  <rect width="700" height="480" fill="#0a1929" />
                  <text x="350" y="260" textAnchor="middle" fontFamily="Outfit" fontSize="110" fontWeight="900" fill="rgba(255,106,0,0.1)">BLOCKTO</text>
                </svg>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.92]" />
            </div>

            <div className="absolute top-5 left-5 z-10 text-[10px] font-extrabold text-black px-3.5 py-[7px] rounded-[8px] tracking-[0.8px] font-[family-name:var(--font-display)]"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.3)" }}>
              FEATURED
            </div>
            <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 text-[11px] font-semibold text-white bg-black/50 backdrop-blur-[10px] px-3.5 py-[7px] rounded-[8px] border border-white/10">
              <span className="w-[5px] h-[5px] rounded-full bg-[var(--color-positive)] shadow-[0_0_8px_var(--color-positive)] pls-anim" />
              {relativeDate(hero.date)}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
              <span className="inline-block text-[10px] font-extrabold text-[var(--color-brand)] bg-[rgba(255,106,0,0.12)] px-2.5 py-1 rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)] mb-3 border border-[rgba(255,106,0,0.2)]">
                {primaryCategory(hero).name.toUpperCase()}
              </span>
              <h1 className="text-white text-[28px] font-extrabold tracking-[-0.8px] leading-[1.18] mb-3 max-w-[92%] font-[family-name:var(--font-display)]">
                {hero.title}
              </h1>
              <p className="text-[14px] text-[#bbb] leading-[1.55] mb-4 max-w-[85%] line-clamp-2">
                {stripExcerpt(hero.excerpt)}
              </p>
              <div className="flex items-center gap-2.5 text-[12px] text-[#aaa] font-medium">
                <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-extrabold text-black flex-shrink-0" style={{ background: "var(--gradient-brand)" }}>
                  {hero.author.node.name.slice(0, 2).toUpperCase()}
                </span>
                {hero.author.node.name}
              </div>
            </div>
          </Link>
        )}

        {/* ── Two secondary cards ── */}
        <div className="grid grid-rows-2 gap-[18px]">
          {[sec1, sec2].filter(Boolean).map((post) => {
            const color = catColor(post!);
            return (
              <Link key={post!.id} href={`/news/${post!.slug}`}
                className="hero-card relative rounded-[18px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.08)] group block">
                <div className="h-full relative overflow-hidden" style={{ background: "#0a0e1a", minHeight: "200px" }}>
                  {post!.featuredImage ? (
                    <Image
                      src={post!.featuredImage.node.sourceUrl}
                      alt={post!.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="40vw"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${color}22, #0a0e1a)` }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.92]" />
                </div>
                <div className="absolute top-3.5 left-3.5 z-10 text-[9px] font-extrabold px-2.5 py-[5px] rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)]"
                  style={{ color, background: `${color}20`, border: `0.5px solid ${color}44` }}>
                  {primaryCategory(post!).name.toUpperCase()}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-[18px] z-10">
                  <p className="text-white text-[17px] font-bold tracking-[-0.3px] leading-[1.3] mb-1.5 font-[family-name:var(--font-display)] line-clamp-2">
                    {post!.title}
                  </p>
                  <p className="text-[11px] text-[#999] font-medium font-[family-name:var(--font-display)] flex items-center gap-1.5 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[var(--color-positive)] before:inline-block">
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

import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";

const CAT_STYLE: Record<string, { color: string; bg: string; border: string; sym: string; symBg: string }> = {
  bitcoin:  { color: "#ff6a00", bg: "rgba(255,106,0,0.08)",  border: "rgba(255,106,0,0.15)",  sym: "₿", symBg: "linear-gradient(135deg,#ff9a40,#ff6a00)" },
  ethereum: { color: "#4a9eff", bg: "rgba(74,158,255,0.08)", border: "rgba(74,158,255,0.2)",  sym: "Ξ", symBg: "linear-gradient(135deg,#627eea,#3c5ad6)" },
  altcoin:  { color: "#00d47b", bg: "rgba(0,212,123,0.08)",  border: "rgba(0,212,123,0.2)",   sym: "◎", symBg: "linear-gradient(135deg,#00d47b,#00a862)" },
  news:     { color: "#ff6a00", bg: "rgba(255,106,0,0.08)",  border: "rgba(255,106,0,0.15)",  sym: "📰", symBg: "linear-gradient(135deg,#ff9a40,#ff6a00)" },
};

const DEFAULT = CAT_STYLE.news;

export default function CompactGrid({ posts }: { posts: WPPost[] }) {
  return (
    <>
      <SectionLabel title="Latest stories" count={posts.length} viewAllHref="/category/general-news" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {posts.map((post) => {
          const cat = primaryCategory(post);
          const style = CAT_STYLE[cat.slug] ?? DEFAULT;
          return (
            <Link key={post.id} href={`/news/${post.slug}`}
              className="hp-card grid grid-cols-[110px_1fr] gap-3.5 p-3.5 rounded-[16px] card-hover block">
              <div className="w-[110px] h-[110px] rounded-[14px] overflow-hidden flex-shrink-0 img-thumb-border img-thumb-bg relative">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="110px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[42px]" style={{ background: style.symBg }}>
                    <span>{style.sym}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="inline-block text-[9px] font-extrabold px-2 py-[3px] rounded-[5px] tracking-[0.4px] mb-2 font-[family-name:var(--font-data)] w-fit"
                  style={{ color: style.color, background: style.bg, border: `0.5px solid ${style.border}` }}>
                  {cat.name.toUpperCase()}
                </span>
                <p className="text-[14px] font-bold leading-[1.35] mb-2 tracking-[-0.2px] line-clamp-3 font-[family-name:var(--font-display)]">
                  {post.title}
                </p>
                <p className="text-[10px] text-[#666] font-medium font-[family-name:var(--font-display)]">
                  {relativeDate(post.date)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

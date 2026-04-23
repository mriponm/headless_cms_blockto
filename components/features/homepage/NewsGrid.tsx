import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import TranslatedText from "@/components/ui/TranslatedText";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";

const CAT_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  bitcoin:  { color: "#ff6a00", bg: "rgba(255,106,0,0.08)",  border: "rgba(255,106,0,0.2)" },
  ethereum: { color: "#4a9eff", bg: "rgba(74,158,255,0.08)", border: "rgba(74,158,255,0.2)" },
  altcoin:  { color: "#00d47b", bg: "rgba(0,212,123,0.08)",  border: "rgba(0,212,123,0.2)" },
  nft:      { color: "#b16aff", bg: "rgba(177,106,255,0.08)",border: "rgba(177,106,255,0.2)" },
  news:     { color: "#ff6a00", bg: "rgba(255,106,0,0.08)",  border: "rgba(255,106,0,0.2)" },
};

const DEFAULT_STYLE = CAT_STYLE.news;

export default function NewsGrid({ posts, title = "General news", viewAllHref = "/category/general-news" }: {
  posts: WPPost[];
  title?: string;
  viewAllHref?: string;
}) {
  return (
    <>
      <SectionLabel title={title} count={posts.length} viewAllHref={viewAllHref} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] mb-5">
        {posts.map((post) => {
          const cat = primaryCategory(post);
          const style = CAT_STYLE[cat.slug] ?? DEFAULT_STYLE;
          return (
            <Link key={post.id} href={`/news/${post.slug}`}
              className="news-grid-card rounded-[18px] overflow-hidden cursor-pointer card-hover block">
              <div className="h-[170px] relative overflow-hidden bg-[#0a0e1a]">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${style.bg}, #0a0e1a)` }}>
                    <span className="text-[40px] font-black opacity-10" style={{ color: style.color }}>B</span>
                  </div>
                )}
              </div>
              <div className="p-4 pb-[18px]">
                <span className="inline-block text-[9px] font-extrabold px-[9px] py-[3px] rounded-[5px] tracking-[0.5px] mb-2.5 font-[family-name:var(--font-data)]"
                  style={{ color: style.color, background: style.bg, border: `0.5px solid ${style.border}` }}>
                  {cat.name.toUpperCase()}
                </span>
                <p className="text-[15px] font-bold leading-[1.35] mb-3 tracking-[-0.2px] line-clamp-3 font-[family-name:var(--font-display)]">
                  <TranslatedText text={post.title} />
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#666] font-medium">
                  <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-extrabold text-black flex-shrink-0" style={{ background: "var(--gradient-brand)" }}>
                    {post.author.node.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span data-no-translate>{post.author.node.name}</span> · {relativeDate(post.date)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

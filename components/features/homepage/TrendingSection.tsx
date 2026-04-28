import RelativeTime from "@/components/ui/RelativeTime";
import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";

export default function TrendingSection({ posts }: { posts: WPPost[] }) {
  if (!posts.length) return null;
  return (
    <div className="mb-8">
      <SectionLabel title="Trending now" viewAllHref="/category/general-news" />
      <div className="flex flex-col gap-0">
        {posts.map((post, i) => {
          const cat = primaryCategory(post);
          return (
            <Link key={post.id} href={`/news/${post.slug}`}
              className="flex gap-4 py-4 border-b border-[rgba(255,255,255,0.05)] last:border-none cursor-pointer group items-center">
              <span className="text-[28px] font-black font-[family-name:var(--font-data)] leading-none flex-shrink-0 w-[40px] text-right"
                style={{ background: i === 0 ? "linear-gradient(135deg,#ff6a00,#ffaa44)" : "linear-gradient(135deg,#333,#555)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-[64px] h-[64px] rounded-[10px] overflow-hidden flex-shrink-0 img-thumb-bg relative">
                {post.featuredImage ? (
                  <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#1a1a2e,#2d1b4e)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold leading-[1.35] tracking-[-0.2px] line-clamp-2 art-heading group-hover:text-[var(--color-brand)] transition-colors font-[family-name:var(--font-display)] mb-1">
                  {post.title}
                </p>
                <span className="text-[10px] font-semibold art-sub-text font-[family-name:var(--font-display)]">
                  {cat.name} · <RelativeTime date={post.date} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

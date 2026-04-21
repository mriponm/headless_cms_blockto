import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";

interface Props {
  posts: WPPost[];
  title: string;
  viewAllHref: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentGrad: string;
  symbol: string;
}

function FeaturedCard({ post, accentColor, accentBg, accentBorder, accentGrad }: {
  post: WPPost; accentColor: string; accentBg: string; accentBorder: string; accentGrad: string;
}) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="block rounded-[20px] overflow-hidden cursor-pointer card-hover border border-[rgba(255,255,255,0.08)] relative group"
      style={{ background: "rgba(255,255,255,0.025)" }}>
      <div className="h-[200px] relative overflow-hidden bg-[#0a0e1a]">
        {post.featuredImage ? (
          <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw,33vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[60px] font-black opacity-10"
            style={{ background: `linear-gradient(135deg,${accentBg},#0a0e1a)`, color: accentColor }}>
            {post.title.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)]"
            style={{ color: accentColor, background: accentBg, border: `0.5px solid ${accentBorder}` }}>
            {cat.name.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[15px] font-bold leading-[1.35] mb-2.5 tracking-[-0.3px] line-clamp-2 art-heading font-[family-name:var(--font-display)]">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] art-sub-text font-medium">
          <span className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[8px] font-extrabold text-black flex-shrink-0"
            style={{ background: accentGrad }}>
            {post.author.node.name.slice(0, 2).toUpperCase()}
          </span>
          {post.author.node.name} · {relativeDate(post.date)}
        </div>
      </div>
    </Link>
  );
}

function ListCard({ post, accentColor, accentBg, accentBorder, accentGrad }: {
  post: WPPost; accentColor: string; accentBg: string; accentBorder: string; accentGrad: string;
}) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="flex gap-3 p-3 rounded-[14px] cursor-pointer card-hover border border-[rgba(255,255,255,0.08)] relative group block"
      style={{ background: "rgba(255,255,255,0.025)" }}>
      <div className="w-[80px] h-[80px] rounded-[10px] overflow-hidden flex-shrink-0 relative bg-[#0a0e1a]">
        {post.featuredImage ? (
          <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[28px] font-black opacity-20"
            style={{ background: `linear-gradient(135deg,${accentBg},#0a0e1a)`, color: accentColor }}>
            {post.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className="inline-block text-[8px] font-extrabold px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] mb-1 font-[family-name:var(--font-data)] w-fit"
          style={{ color: accentColor, background: accentBg, border: `0.5px solid ${accentBorder}` }}>
          {cat.name.toUpperCase()}
        </span>
        <p className="text-[13px] font-bold leading-[1.35] tracking-[-0.2px] line-clamp-2 art-heading font-[family-name:var(--font-display)] mb-1">
          {post.title}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] art-sub-text font-medium">
          <span className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[6px] font-extrabold text-black flex-shrink-0"
            style={{ background: accentGrad }}>
            {post.author.node.name.slice(0, 2).toUpperCase()}
          </span>
          {post.author.node.name} · {relativeDate(post.date)}
        </div>
      </div>
    </Link>
  );
}

export default function CategoryNewsSection({ posts, title, viewAllHref, accentColor, accentBg, accentBorder, accentGrad }: Props) {
  if (!posts.length) return null;
  const featured = posts.slice(0, 3);
  const list     = posts.slice(3);

  return (
    <div className="mb-8">
      <SectionLabel title={title} count={posts.length} viewAllHref={viewAllHref} />

      {/* Featured 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {featured.map((p) => (
          <FeaturedCard key={p.id} post={p}
            accentColor={accentColor} accentBg={accentBg} accentBorder={accentBorder} accentGrad={accentGrad} />
        ))}
      </div>

      {/* List rows for remaining posts */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {list.map((p) => (
            <ListCard key={p.id} post={p}
              accentColor={accentColor} accentBg={accentBg} accentBorder={accentBorder} accentGrad={accentGrad} />
          ))}
        </div>
      )}

      {/* View all link */}
      <div className="mt-4 flex items-center gap-2.5">
        <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
        <Link href={viewAllHref}
          className="text-[11px] font-bold px-4 py-2 rounded-[9px] transition-all hover:brightness-110 font-[family-name:var(--font-display)]"
          style={{ color: accentColor, background: accentBg, border: `0.5px solid ${accentBorder}` }}>
          View all {title} →
        </Link>
        <div className="flex-1 h-px bg-gradient-to-l from-[rgba(255,255,255,0.06)] to-transparent" />
      </div>
    </div>
  );
}

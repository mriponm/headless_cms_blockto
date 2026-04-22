import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";

interface Props {
  posts: WPPost[];
  title: string;
  viewAllHref: string;
  accentColor?: string;
  accentBg?: string;
  accentBorder?: string;
  variant?: "list" | "bitcoin";
}

function ListCard({ post }: { post: WPPost }) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="hp-card grid grid-cols-[auto_1fr] gap-3.5 p-3 rounded-[16px] mb-2.5 cursor-pointer relative overflow-hidden block">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="w-[90px] h-[90px] rounded-[12px] flex-shrink-0 border border-[rgba(255,255,255,0.06)] relative overflow-hidden bg-[#0a0e1a]">
        {post.featuredImage ? (
          <Image src={post.featuredImage.node.sourceUrl} alt={post.title} fill
            className="object-cover" sizes="90px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[36px]"
            style={{ background: "linear-gradient(135deg,#1a1a2e,#2d1b4e)" }}>📰</div>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <p className="text-[13.5px] font-bold leading-[1.35] tracking-[-0.3px] mb-2 line-clamp-3 font-[family-name:var(--font-display)]">
          {post.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-extrabold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] border border-[rgba(255,106,0,0.15)] px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] font-[family-name:var(--font-data)]">
            {cat.name.toUpperCase()}
          </span>
          <span className="text-[10px] text-[#888] font-medium font-[family-name:var(--font-display)]">
            {post.author.node.name}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#666] font-medium font-[family-name:var(--font-display)] before:content-[''] before:w-[3px] before:h-[3px] before:bg-[#444] before:rounded-full">
            {relativeDate(post.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HScrollCard({ post, index, accentColor, accentBg, accentBorder }: {
  post: WPPost; index: number;
  accentColor: string; accentBg: string; accentBorder: string;
}) {
  const cat = primaryCategory(post);
  return (
    <Link href={`/news/${post.slug}`}
      className="hp-card flex-shrink-0 w-[160px] p-3 rounded-[14px] cursor-pointer relative overflow-hidden flex flex-col gap-2 block">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <span className="text-[24px] font-black font-[family-name:var(--font-data)] leading-none gradient-text-alt">
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className="text-[12px] font-bold leading-[1.35] tracking-[-0.2px] line-clamp-3 font-[family-name:var(--font-display)] flex-1">
        {post.title}
      </p>
      <span className="text-[8px] font-extrabold px-[6px] py-[2px] rounded-[5px] tracking-[0.5px] font-[family-name:var(--font-data)] w-fit"
        style={{ color: accentColor, background: accentBg, border: `0.5px solid ${accentBorder}` }}>
        {cat.name.toUpperCase()}
      </span>
      <span className="text-[9px] text-[#666] font-medium font-[family-name:var(--font-display)]">
        {post.author.node.name} · {relativeDate(post.date)}
      </span>
    </Link>
  );
}

export default function MobileNewsCards({
  posts, title, viewAllHref,
  accentColor = "#ff6a00",
  accentBg = "rgba(255,106,0,0.08)",
  accentBorder = "rgba(255,106,0,0.15)",
  variant = "list",
}: Props) {
  const unique = posts.filter((p, i, a) => a.findIndex(x => x.id === p.id) === i);

  if (variant === "bitcoin") {
    const scrollPosts = unique.slice(0, 3);
    const listPosts   = unique.slice(3);
    return (
      <div className="md:hidden mb-5">
        <SectionLabel title={title} count={unique.length} viewAllHref={viewAllHref} />
        {/* Horizontal scroll row */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 mb-3 scrollbar-hide -mx-3 px-3">
          {scrollPosts.map((post, i) => (
            <HScrollCard key={post.id} post={post} index={i}
              accentColor={accentColor} accentBg={accentBg} accentBorder={accentBorder} />
          ))}
        </div>
        {/* Remaining as list cards */}
        {listPosts.map((post) => (
          <ListCard key={post.id} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div className="md:hidden mb-5">
      <SectionLabel title={title} count={unique.length} viewAllHref={viewAllHref} />
      {unique.map((post) => (
        <ListCard key={post.id} post={post} />
      ))}
    </div>
  );
}

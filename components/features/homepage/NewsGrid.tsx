"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
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
const PER_PAGE = 9;

export default function NewsGrid({ posts, title = "General news", viewAllHref }: {
  posts: WPPost[];
  title?: string;
  viewAllHref?: string;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(posts.length / PER_PAGE);
  const visible = posts.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <>
      <SectionLabel title={title} count={posts.length} viewAllHref={viewAllHref} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] mb-5">
        {visible.map((post) => {
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
                  <AuthorAvatar name={post.author.node.name} avatarUrl={post.author.node.avatar?.url} size={18} />
                  <span data-no-translate>{post.author.node.name}</span> · {relativeDate(post.date)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mb-6">
          {/* page buttons: 1, 2, 3, ..., last */}
          {(() => {
            const btn = (i: number) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded-[7px] text-[11px] font-bold transition-all duration-150 ${
                  i === page ? "text-black" : "glass hover:brightness-125 text-[#888]"
                }`}
                style={i === page ? { background: "var(--gradient-brand)" } : {}}
              >
                {i + 1}
              </button>
            );

            const pages: React.ReactNode[] = [];
            const show = new Set([0, 1, 2, totalPages - 1]);
            // also include current page and neighbours
            [page - 1, page, page + 1].forEach(p => { if (p >= 0 && p < totalPages) show.add(p); });

            const sorted = [...show].sort((a, b) => a - b);
            sorted.forEach((i, idx) => {
              if (idx > 0 && i - sorted[idx - 1] > 1) {
                pages.push(<span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-[#555] text-[13px]">…</span>);
              }
              pages.push(btn(i));
            });

            return pages;
          })()}

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-7 h-7 rounded-[7px] text-[11px] font-bold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed glass hover:brightness-125 text-[#888]"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </>
  );
}

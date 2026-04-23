"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ArticleMetaBar({
  authorName, dateStr,
}: {
  authorName: string;
  dateStr: string;
}) {
  const [followed, setFollowed]   = useState(false);
  const [following, setFollowing] = useState(false);

  const { openModal }             = useAuthModal();
  const { t }                     = useI18n();
  const authorSlug                = authorName.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    fetch("/api/following")
      .then(r => r.ok ? r.json() : [])
      .then((list: { author_slug: string }[]) => {
        if (Array.isArray(list)) setFollowed(list.some(f => f.author_slug === authorSlug));
      })
      .catch(() => {});
  }, [authorSlug]);

  async function toggleFollow() {
    if (following) return;
    setFollowing(true);
    try {
      if (followed) {
        const res = await fetch(`/api/following?slug=${encodeURIComponent(authorSlug)}`, { method: "DELETE" });
        if (res.status === 401) { openModal("signin"); setFollowing(false); return; }
        if (res.ok) setFollowed(false);
      } else {
        const res = await fetch("/api/following", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author_name: authorName, author_slug: authorSlug }),
        });
        if (res.status === 401) { openModal("signin"); setFollowing(false); return; }
        if (res.ok) setFollowed(true);
      }
    } catch { /* noop */ }
    setFollowing(false);
  }


  return (
    <div>
      <div className="h-px my-4 bg-gradient-to-r from-[rgba(255,106,0,0.4)] via-[rgba(255,255,255,0.06)] to-transparent" />
      <div className="flex items-center gap-3 pb-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0"
            style={{ boxShadow: "0 0 10px rgba(255,106,0,0.2)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Tristan.jpeg" alt={authorName} className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-[-2px] right-[-2px] w-[15px] h-[15px] rounded-full bg-[#4a9eff] flex items-center justify-center border-[1.5px] border-black z-10">
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Author info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold art-heading font-[family-name:var(--font-display)]">
              {t("article.by")} <span data-no-translate>{authorName}</span>
            </span>
            <button
              onClick={toggleFollow}
              disabled={following}
              className="text-[10px] font-extrabold px-[8px] py-[3px] rounded-[6px] cursor-pointer transition-all duration-200 font-[family-name:var(--font-display)] disabled:opacity-60"
              style={followed
                ? { color: "#aaa", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)" }
                : { color: "#ff6a00", background: "rgba(255,106,0,0.07)", border: "0.5px solid rgba(255,106,0,0.18)" }}>
              {followed ? t("footer.following") : t("footer.follow")}
            </button>
          </div>
          <p className="text-[10px] art-author-role font-medium mt-0.5 font-[family-name:var(--font-display)]">
            {t("article.seniorAnalyst")} · {dateStr}
          </p>
        </div>

        {/* Read time */}
        <div className="flex items-center gap-1 text-[10px] text-[#666] font-medium font-[family-name:var(--font-data)] flex-shrink-0">
          <Clock size={10} /> 2 {t("article.minRead")}
        </div>
      </div>
    </div>
  );
}

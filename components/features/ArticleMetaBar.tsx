"use client";
import { useState, useEffect } from "react";
import { Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ArticleMetaBar({
  authorName, dateStr, slug, title, excerpt, category, image,
}: {
  authorName: string;
  dateStr: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  image?: string;
}) {
  const [followed, setFollowed] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const { openModal }           = useAuthModal();
  const { t }                   = useI18n();
  const initials = authorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Check if already saved
  useEffect(() => {
    if (!slug) return;
    fetch("/api/saved-articles")
      .then(r => r.ok ? r.json() : [])
      .then((list: { article_slug: string }[]) => {
        if (Array.isArray(list)) setSaved(list.some(a => a.article_slug === slug));
      })
      .catch(() => {});
  }, [slug]);

  async function toggleSave() {
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        const res = await fetch(`/api/saved-articles?slug=${encodeURIComponent(slug ?? "")}`, { method: "DELETE" });
        if (res.status === 401) { openModal("signin"); setSaving(false); return; }
        if (res.ok) setSaved(false);
      } else {
        const res = await fetch("/api/saved-articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ article_slug: slug, article_title: title, article_excerpt: excerpt, article_category: category, article_image: image, article_date: dateStr }),
        });
        if (res.status === 401) { openModal("signin"); setSaving(false); return; }
        if (res.ok) setSaved(true);
      }
    } catch { /* noop */ }
    setSaving(false);
  }

  return (
    <div>
      <div className="h-px my-4 bg-gradient-to-r from-[rgba(255,106,0,0.4)] via-[rgba(255,255,255,0.06)] to-transparent" />
      <div className="flex items-center gap-3 pb-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[13px] font-extrabold text-black"
            style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 10px rgba(255,106,0,0.2)" }}>
            {initials}
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
              onClick={() => setFollowed(v => !v)}
              className="text-[10px] font-extrabold px-[8px] py-[3px] rounded-[6px] cursor-pointer transition-all duration-200 font-[family-name:var(--font-display)]"
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

        {/* Read time + Save */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-[#666] font-medium font-[family-name:var(--font-data)]">
            <Clock size={10} /> 2 {t("article.minRead")}
          </div>
          <button
            onClick={toggleSave}
            disabled={saving}
            title={saved ? "Remove from saved" : "Save article"}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={saved
              ? { background: "rgba(255,106,0,0.12)", border: "0.5px solid rgba(255,106,0,0.3)", color: "#ff6a00" }
              : { background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", color: "#666" }}>
            {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

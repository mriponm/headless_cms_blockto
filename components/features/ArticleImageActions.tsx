"use client";
import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

interface Props {
  title: string;
  url: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  image?: string;
  date?: string;
}

export default function ArticleImageActions({ title, url, slug, excerpt, category, image, date }: Props) {
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const { openModal }       = useAuthModal();

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
          body: JSON.stringify({ article_slug: slug, article_title: title, article_excerpt: excerpt, article_category: category, article_image: image, article_date: date }),
        });
        if (res.status === 401) { openModal("signin"); setSaving(false); return; }
        if (res.ok) setSaved(true);
      }
    } catch { /* noop */ }
    setSaving(false);
  }

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 flex gap-2">
      <button
        onClick={toggleSave}
        disabled={saving}
        title={saved ? "Remove from saved" : "Save article"}
        className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-60"
        style={saved
          ? { background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 16px rgba(255,106,0,0.4),0 4px 12px rgba(0,0,0,0.4)" }
          : { background: "rgba(0,0,0,0.65)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
        {saved
          ? <BookmarkCheck size={15} className="fill-black text-black" />
          : <Bookmark size={15} className="text-white" />}
      </button>
      <button
        onClick={handleShare}
        className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer transition-all duration-200"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
        <Share2 size={15} className="text-white" />
      </button>
    </div>
  );
}

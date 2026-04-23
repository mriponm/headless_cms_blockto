"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  slug?: string;
  title?: string;
  image?: string;
  category?: string;
  date?: string;
}

const RECENT_KEY = "blockto_recent_articles";
const MAX_RECENT = 10;

function saveToRecent(slug: string, title: string, image: string, category: string, date: string) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: { slug: string; title: string; image: string; category: string; date: string; visitedAt: number }[] =
      raw ? JSON.parse(raw) : [];
    const filtered = list.filter(a => a.slug !== slug);
    filtered.unshift({ slug, title, image, category, date, visitedAt: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {}
}

function ReadingProgress({ slug }: { slug?: string }) {
  const [progress, setProgress] = useState(0);
  const lastSaved = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function saveProgress(pct: number) {
    if (!slug) return;
    const rounded = Math.round(pct);
    if (Math.abs(rounded - lastSaved.current) < 5) return; // only save on 5% change
    lastSaved.current = rounded;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/saved-articles/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, percent: rounded }),
      }).catch(() => {});
    }, 2000); // debounce 2s
  }

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const pct = total > 0 ? (el.scrollTop / total) * 100 : 0;
      setProgress(pct);
      saveProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="h-full transition-none"
      style={{ width: `${progress}%`, background: "linear-gradient(90deg,#ff6a00,#ffaa44)", boxShadow: "0 0 8px rgba(255,106,0,0.5)" }} />
  );
}

export default function ArticleInteractive({ slug, title, image, category, date }: Props) {
  // Track recently viewed in localStorage on mount
  useEffect(() => {
    if (slug && title) {
      saveToRecent(slug, title ?? "", image ?? "", category ?? "", date ?? "");
    }
  }, [slug, title, image, category, date]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-[rgba(255,255,255,0.05)]">
      <ReadingProgress slug={slug} />
    </div>
  );
}

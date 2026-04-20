"use client";
import { useState, useEffect } from "react";

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="h-full transition-none"
      style={{ width: `${progress}%`, background: "linear-gradient(90deg,#ff6a00,#ffaa44)", boxShadow: "0 0 8px rgba(255,106,0,0.5)" }} />
  );
}

export default function ArticleInteractive() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-[rgba(255,255,255,0.05)]">
      <ReadingProgress />
    </div>
  );
}

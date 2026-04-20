"use client";
import { useState, useEffect } from "react";
import { Bookmark, Share2 } from "lucide-react";

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
  const [saved, setSaved] = useState(false);

  return (
    <>
      {/* Reading progress bar */}
      <div className="sticky top-0 z-40 h-[3px] art-progress-bg">
        <ReadingProgress />
      </div>

      {/* Floating save/share */}
      <div className="fixed bottom-6 right-4 z-50 flex gap-2">
        <button
          onClick={() => setSaved((v) => !v)}
          className="art-fa-btn w-[42px] h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer transition-all duration-200 relative"
          style={saved
            ? { background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 16px rgba(255,106,0,0.4),0 8px 20px rgba(0,0,0,0.4)", border: "none" }
            : { background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          <Bookmark size={15} className={saved ? "text-black fill-black" : "text-white"} />
        </button>
        <button
          className="art-fa-btn w-[42px] h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer transition-all duration-200 relative"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          <Share2 size={15} className="text-white" />
        </button>
      </div>
    </>
  );
}

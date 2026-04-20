"use client";
import { useState } from "react";
import { Bookmark, Share2 } from "lucide-react";

export default function ArticleImageActions({ title, url }: { title: string; url: string }) {
  const [saved, setSaved] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 flex gap-2">
      <button
        onClick={() => setSaved((v) => !v)}
        className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer transition-all duration-200"
        style={saved
          ? { background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 16px rgba(255,106,0,0.4),0 4px 12px rgba(0,0,0,0.4)" }
          : { background: "rgba(0,0,0,0.65)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
        <Bookmark size={15} className={saved ? "fill-black text-black" : "text-white"} />
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

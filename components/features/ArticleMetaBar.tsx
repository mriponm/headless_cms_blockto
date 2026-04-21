"use client";
import { useState } from "react";
import { Clock } from "lucide-react";

export default function ArticleMetaBar({
  authorName, dateStr,
}: { authorName: string; dateStr: string }) {
  const [followed, setFollowed] = useState(false);
  const initials = authorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="h-px my-4 bg-gradient-to-r from-[rgba(255,106,0,0.4)] via-[rgba(255,255,255,0.06)] to-transparent" />
    <div className="flex items-center gap-3 pb-5">
      {/* Avatar with blue badge */}
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
            By {authorName}
          </span>
          <button
            onClick={() => setFollowed(v => !v)}
            className="text-[10px] font-extrabold px-[8px] py-[3px] rounded-[6px] cursor-pointer transition-all duration-200 font-[family-name:var(--font-display)]"
            style={followed
              ? { color: "#aaa", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)" }
              : { color: "#ff6a00", background: "rgba(255,106,0,0.07)", border: "0.5px solid rgba(255,106,0,0.18)" }}>
            {followed ? "Following" : "+ Follow"}
          </button>
        </div>
        <p className="text-[10px] art-author-role font-medium mt-0.5 font-[family-name:var(--font-display)]">
          Senior market analyst · {dateStr}
        </p>
      </div>

      {/* Read time */}
      <div className="flex items-center gap-1 text-[10px] text-[#666] font-medium flex-shrink-0 font-[family-name:var(--font-data)]">
        <Clock size={10} />
        2 min
      </div>
    </div>
    </div>
  );
}

"use client";
import { Clock } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ArticleMetaBar({
  authorName, avatarUrl, dateStr,
}: {
  authorName: string;
  avatarUrl?: string;
  dateStr: string;
}) {
  const { t } = useI18n();

  return (
    <div>
      <div className="h-px my-4 bg-gradient-to-r from-[rgba(255,106,0,0.4)] via-[rgba(255,255,255,0.06)] to-transparent" />
      <div className="flex items-center gap-3 pb-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#ff6a00] to-[#ff8a30] flex items-center justify-center"
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
          <span className="text-[13px] font-bold art-heading font-[family-name:var(--font-display)]">
            {t("article.by")} <span data-no-translate>{authorName}</span>
          </span>
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

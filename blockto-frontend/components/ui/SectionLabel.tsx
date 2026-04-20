import Link from "next/link";

interface SectionLabelProps {
  title: string;
  count?: string | number;
  viewAllHref?: string;
  live?: boolean;
}

export default function SectionLabel({ title, count, viewAllHref, live }: SectionLabelProps) {
  return (
    <div className="sec-line flex items-center gap-3 mb-4">
      <span className="text-[11px] font-extrabold uppercase tracking-[2.5px] gradient-text-alt font-[family-name:var(--font-display)]">
        {title}
      </span>
      {live ? (
        <span className="text-[10px] text-[#444] font-bold tracking-[1px] font-[family-name:var(--font-data)]">LIVE</span>
      ) : count !== undefined ? (
        <span className="text-[10px] text-[#444] font-bold tracking-[1px] font-[family-name:var(--font-data)]">{count}</span>
      ) : null}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-[10px] text-[var(--color-brand)] font-bold tracking-[0.8px] px-3.5 py-1.5 rounded-[7px] border border-[rgba(255,106,0,0.2)] bg-[rgba(255,106,0,0.05)] cursor-pointer hover:bg-[rgba(255,106,0,0.1)] transition-colors font-[family-name:var(--font-display)]"
        >
          View all ›
        </Link>
      )}
    </div>
  );
}

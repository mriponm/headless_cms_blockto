import Link from "next/link";

interface Section { heading?: string; body: string | string[]; }

interface Props {
  badge?: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  sections: Section[];
}

export default function InfoPage({ badge, title, subtitle, lastUpdated, sections }: Props) {
  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pb-20 pt-10">
      <div className="max-w-[760px] mx-auto">
        {badge && (
          <span className="inline-block mb-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-brand)] border border-[rgba(255,106,0,0.2)]"
            style={{ background: "rgba(255,106,0,0.06)" }}>
            {badge}
          </span>
        )}
        <h1 className="text-[32px] md:text-[40px] font-black tracking-[-1.2px] leading-[1.1] mb-3"
          style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        {subtitle && <p className="text-[15px] leading-[1.6] mb-2" style={{ color: "var(--color-muted)" }}>{subtitle}</p>}
        {lastUpdated && <p className="text-[11px] mb-8 font-semibold" style={{ color: "var(--color-muted)" }}>Last updated: {lastUpdated}</p>}

        <div className="h-px mb-8 bg-gradient-to-r from-[rgba(255,106,0,0.4)] via-[rgba(255,255,255,0.06)] to-transparent" />

        <div className="flex flex-col gap-8">
          {sections.map((s, i) => (
            <div key={i}>
              {s.heading && (
                <h2 className="text-[18px] font-extrabold mb-3" style={{ color: "var(--color-text)" }}>{s.heading}</h2>
              )}
              {Array.isArray(s.body)
                ? s.body.map((p, j) => (
                    <p key={j} className="text-[14px] leading-[1.75] mb-3" style={{ color: "var(--color-muted)" }}>{p}</p>
                  ))
                : <p className="text-[14px] leading-[1.75]" style={{ color: "var(--color-muted)" }}>{s.body}</p>}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.05)]">
          <Link href="/" className="text-[13px] font-bold text-[var(--color-brand)] hover:underline">← Back to Blockto</Link>
        </div>
      </div>
    </div>
  );
}

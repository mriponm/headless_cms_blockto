export default function BreakingBanner() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-[12px] mb-4 overflow-hidden md:hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,106,0,0.12), rgba(255,106,0,0.03))",
        border: "0.5px solid rgba(255,106,0,0.2)",
      }}
    >
      <span
        className="flex items-center gap-1 flex-shrink-0 text-[9px] font-extrabold text-black px-[9px] py-1 rounded-[6px] tracking-[0.8px] font-[family-name:var(--font-display)]"
        style={{ background: "var(--gradient-brand)", boxShadow: "0 0 12px rgba(255,106,0,0.3)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-black pls-anim inline-block" />
        JUST IN
      </span>
      <p className="text-[12px] font-semibold flex-1 truncate font-[family-name:var(--font-display)]">
        BlackRock Bitcoin ETF inflows hit $1.34B as institutional demand accelerates
      </p>
      <span className="text-[14px] text-[var(--color-brand)] flex-shrink-0">›</span>
    </div>
  );
}

import SectionLabel from "@/components/ui/SectionLabel";

const BTC_NEWS = [
  { title: "Bhutan government transfers $25M in Bitcoin as weekly outflows exceed 1,000 BTC", time: "3h ago", coin: "BTC", coinBg: "linear-gradient(135deg,#ff9a40,#ff6a00)", sym: "₿", symColor: "rgba(0,0,0,0.7)" },
  { title: "US government transfers seized Bitcoin linked to major distribution case", time: "1d ago", coin: "BTC", coinBg: "linear-gradient(135deg,#ff9a40,#ff6a00)", sym: "₿", symColor: "rgba(0,0,0,0.7)" },
  { title: "$1.6 billion Ether Machine SPAC deal cancelled amid weak market conditions", time: "15h ago", coin: "ETH", coinBg: "linear-gradient(135deg,#627eea,#3c5ad6)", sym: "Ξ", symColor: "rgba(255,255,255,0.9)" },
  { title: "Bitmine uplists to NYSE with 4.803M ETH holdings and $4B buyback authorization", time: "3d ago", coin: "ETH", coinBg: "linear-gradient(135deg,#627eea,#3c5ad6)", sym: "Ξ", symColor: "rgba(255,255,255,0.9)" },
];

const COIN_TAG_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  BTC: { color: "#ff6a00", bg: "rgba(255,106,0,0.08)", border: "rgba(255,106,0,0.15)" },
  ETH: { color: "#4a9eff", bg: "rgba(74,158,255,0.08)", border: "rgba(74,158,255,0.2)" },
};

export default function CompactGrid() {
  return (
    <>
      <SectionLabel title="Bitcoin news" count={24} viewAllHref="/news/bitcoin" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {BTC_NEWS.map((n) => {
          const tag = COIN_TAG_STYLE[n.coin];
          return (
            <div
              key={n.title}
              className="grid grid-cols-[110px_1fr] gap-3.5 p-3.5 rounded-[16px] card-hover border border-[rgba(255,255,255,0.06)]"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <div
                className="w-[110px] h-[110px] rounded-[14px] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[rgba(255,255,255,0.06)]"
                style={{ background: n.coinBg, position: "relative" }}
              >
                <span
                  className="font-[family-name:var(--font-data)] font-black text-[50px] leading-none relative z-10"
                  style={{ color: n.symColor }}
                >
                  {n.sym}
                </span>
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_50%)]" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span
                  className="inline-block text-[9px] font-extrabold px-2 py-[3px] rounded-[5px] tracking-[0.4px] mb-2 font-[family-name:var(--font-data)] w-fit"
                  style={{ color: tag.color, background: tag.bg, border: `0.5px solid ${tag.border}` }}
                >
                  {n.coin}
                </span>
                <p className="text-[14px] font-bold leading-[1.35] mb-2 tracking-[-0.2px] line-clamp-3 font-[family-name:var(--font-display)]">
                  {n.title}
                </p>
                <p className="text-[10px] text-[#666] font-medium font-[family-name:var(--font-display)]">
                  Tristan L. · {n.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

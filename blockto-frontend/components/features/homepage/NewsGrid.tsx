import SectionLabel from "@/components/ui/SectionLabel";

const NEWS = [
  {
    tag: "MARKET", tagColor: "#00d47b", tagBg: "rgba(0,212,123,0.08)", tagBorder: "rgba(0,212,123,0.2)",
    title: "Spot Bitcoin ETFs record nearly $1B in single-day trading volume",
    author: "TL", authorName: "Tristan L.", time: "35m",
    svgBg: "#0e1f15",
    svgContent: (
      <>
        <path d="M30 115 L80 90 L130 105 L180 80 L230 60 L270 45" stroke="#00d47b" strokeWidth="2" fill="none" />
        <path d="M30 115 L80 90 L130 105 L180 80 L230 60 L270 45 L270 150 L30 150 Z" fill="#00d47b" opacity="0.2" />
      </>
    ),
  },
  {
    tag: "BTC", tagColor: "#ff6a00", tagBg: "rgba(255,106,0,0.08)", tagBorder: "rgba(255,106,0,0.2)",
    title: "Bitcoin shows seller exhaustion as realized losses decline",
    author: "TL", authorName: "Tristan L.", time: "5h",
    svgBg: "#2d1a05",
    svgContent: (
      <g stroke="#ff6a00" strokeWidth="2">
        <line x1="60" y1="115" x2="60" y2="55" /><rect x="54" y="60" width="12" height="35" fill="#00d47b" />
        <line x1="100" y1="100" x2="100" y2="45" /><rect x="94" y="50" width="12" height="40" fill="#00d47b" />
        <line x1="140" y1="110" x2="140" y2="60" /><rect x="134" y="65" width="12" height="28" fill="#ff3b4f" />
        <line x1="180" y1="125" x2="180" y2="50" /><rect x="174" y="60" width="12" height="50" fill="#00d47b" />
        <line x1="220" y1="110" x2="220" y2="35" /><rect x="214" y="38" width="12" height="55" fill="#00d47b" />
      </g>
    ),
  },
  {
    tag: "DEFI", tagColor: "#8b7fff", tagBg: "rgba(139,127,255,0.08)", tagBorder: "rgba(139,127,255,0.2)",
    title: "Solana Foundation launches STRIDE to strengthen DeFi security",
    author: "TL", authorName: "Tristan L.", time: "5d",
    svgBg: "#1a1a2e",
    svgContent: (
      <>
        <circle cx="100" cy="85" r="45" fill="none" stroke="#8b7fff" strokeWidth="2" opacity="0.6" />
        <circle cx="190" cy="85" r="35" fill="none" stroke="#8b7fff" strokeWidth="2" opacity="0.4" />
        <circle cx="235" cy="65" r="18" fill="#8b7fff" opacity="0.3" />
      </>
    ),
  },
];

export default function NewsGrid() {
  return (
    <>
      <SectionLabel title="General news" count={42} viewAllHref="/news" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] mb-8">
        {NEWS.map((n) => (
          <div
            key={n.title}
            className="rounded-[18px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.06)] card-hover"
            style={{ background: "rgba(255,255,255,0.025)" }}
          >
            <div className="h-[170px] relative overflow-hidden">
              <svg viewBox="0 0 300 170" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                <rect width="300" height="170" fill={n.svgBg} />
                {n.svgContent}
              </svg>
            </div>
            <div className="p-4 pb-[18px]">
              <span
                className="inline-block text-[9px] font-extrabold px-[9px] py-[3px] rounded-[5px] tracking-[0.5px] mb-2.5 font-[family-name:var(--font-data)]"
                style={{ color: n.tagColor, background: n.tagBg, border: `0.5px solid ${n.tagBorder}` }}
              >
                {n.tag}
              </span>
              <p className="text-[15px] font-bold leading-[1.35] mb-3 tracking-[-0.2px] line-clamp-3 font-[family-name:var(--font-display)]">
                {n.title}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#666] font-medium">
                <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-extrabold text-black flex-shrink-0" style={{ background: "var(--gradient-brand)" }}>
                  {n.author}
                </span>
                {n.authorName} · {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

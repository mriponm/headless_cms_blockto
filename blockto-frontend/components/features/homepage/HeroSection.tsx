import SectionLabel from "@/components/ui/SectionLabel";

export default function HeroSection() {
  return (
    <>
      <SectionLabel title="Latest news" live viewAllHref="/news" />
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] mb-6">
        {/* ── Hero card ── */}
        <div className="relative rounded-[22px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.08)] group">
          <div className="h-[480px] relative bg-gradient-to-br from-[#1e3a5f] to-[#0a1929] overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 480" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="hg1" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="rgba(255,180,100,0.4)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect width="700" height="480" fill="#0a1929" />
              <circle cx="220" cy="160" r="300" fill="url(#hg1)" />
              <g opacity="0.12">
                {[60,120,180,240,300,360,420,480,540,600].map((x, i) => (
                  <line key={x} x1={x} y1="460" x2={x} y2={[200,160,240,120,190,140,170,100,150,200][i]} stroke="#ff6a00" strokeWidth="1" />
                ))}
              </g>
              <text x="350" y="250" textAnchor="middle" fontFamily="Outfit" fontSize="110" fontWeight="900" fill="rgba(255,106,0,0.2)">$1.34B</text>
            </svg>
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.92]" />
          </div>

          {/* FEATURED tag */}
          <div
            className="absolute top-5 left-5 z-10 text-[10px] font-extrabold text-black px-3.5 py-[7px] rounded-[8px] tracking-[0.8px] font-[family-name:var(--font-display)]"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.3)" }}
          >
            FEATURED
          </div>

          {/* Time badge */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 text-[11px] font-semibold text-white bg-black/50 backdrop-blur-[10px] px-3.5 py-[7px] rounded-[8px] border border-white/10">
            <span className="w-[5px] h-[5px] rounded-full bg-[var(--color-positive)] shadow-[0_0_8px_var(--color-positive)] pls-anim" />
            10 min ago
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
            <span className="inline-block text-[10px] font-extrabold text-[var(--color-brand)] bg-[rgba(255,106,0,0.12)] px-2.5 py-1 rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)] mb-3 border border-[rgba(255,106,0,0.2)]">
              BTC · ETF
            </span>
            <h1 className="text-white text-[30px] font-extrabold tracking-[-0.8px] leading-[1.18] mb-3 max-w-[92%] font-[family-name:var(--font-display)]">
              BlackRock Bitcoin ETF inflows hit $1.34B as institutional demand accelerates
            </h1>
            <p className="text-[14px] text-[#bbb] leading-[1.55] mb-4 max-w-[85%]">
              Record weekly flows signal a shift in institutional sentiment as ETF products continue to reshape how traditional finance accesses Bitcoin exposure.
            </p>
            <div className="flex items-center gap-2.5 text-[12px] text-[#aaa] font-medium">
              <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-extrabold text-black flex-shrink-0" style={{ background: "var(--gradient-brand)" }}>TL</span>
              Tristan Lodenberg
              <span className="w-[3px] h-[3px] bg-[#555] rounded-full" />
              4 min read
              <span className="w-[3px] h-[3px] bg-[#555] rounded-full" />
              Apr 18, 2026
            </div>
          </div>
        </div>

        {/* ── Two secondary cards ── */}
        <div className="grid grid-rows-2 gap-[18px]">
          <SecCard
            bg="linear-gradient(180deg, #4d0a2a, #1a0510)"
            tag="POLICY"
            tagColor="#ff6eb4"
            tagBg="rgba(255,110,180,0.12)"
            tagBorder="rgba(255,110,180,0.25)"
            title="Russia introduces bill to criminalize unregistered crypto services"
            time="55 min ago"
            svgContent={
              <g opacity="0.5">
                <rect x="120" y="60" width="30" height="80" fill="#ff6eb4" opacity="0.4" />
                <rect x="170" y="45" width="30" height="95" fill="#ff6eb4" opacity="0.5" />
                <rect x="220" y="70" width="30" height="70" fill="#ff6eb4" opacity="0.3" />
                <path d="M100 160 L300 160" stroke="#ff6eb4" strokeWidth="1.5" opacity="0.6" />
                <text x="200" y="215" textAnchor="middle" fontFamily="Outfit" fontSize="16" fontWeight="700" fill="rgba(255,110,180,0.7)" letterSpacing="3">REGULATION</text>
              </g>
            }
          />
          <SecCard
            bg="linear-gradient(180deg, #0a1e4d, #05102a)"
            tag="ETH"
            tagColor="#4a9eff"
            tagBg="rgba(74,158,255,0.12)"
            tagBorder="rgba(74,158,255,0.25)"
            title="Ethereum activity climbs past 1.3M daily transactions as staking tops 30%"
            time="2 hours ago"
            svgContent={
              <g opacity="0.7">
                <path d="M60 180 L120 145 L180 155 L240 105 L300 85 L360 60" stroke="#4a9eff" strokeWidth="2.5" fill="none" />
                <path d="M60 180 L120 145 L180 155 L240 105 L300 85 L360 60 L360 215 L60 215 Z" fill="#4a9eff" opacity="0.2" />
                <circle cx="360" cy="60" r="5" fill="#4a9eff" />
                <text x="200" y="215" textAnchor="middle" fontFamily="Outfit" fontSize="16" fontWeight="700" fill="rgba(74,158,255,0.7)" letterSpacing="3">ETH PECTRA</text>
              </g>
            }
          />
        </div>
      </div>
    </>
  );
}

function SecCard({ bg, tag, tagColor, tagBg, tagBorder, title, time, svgContent }: {
  bg: string; tag: string; tagColor: string; tagBg: string; tagBorder: string;
  title: string; time: string; svgContent: React.ReactNode;
}) {
  return (
    <div className="relative rounded-[18px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.08)] group">
      <div className="h-full relative overflow-hidden" style={{ background: bg, minHeight: "200px" }}>
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
          <rect width="400" height="240" fill="transparent" />
          {svgContent}
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.92]" />
      </div>
      <div
        className="absolute top-3.5 left-3.5 z-10 text-[9px] font-extrabold px-2.5 py-[5px] rounded-[6px] tracking-[0.5px] font-[family-name:var(--font-data)]"
        style={{ color: tagColor, background: tagBg, border: `0.5px solid ${tagBorder}` }}
      >
        {tag}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-[18px] z-10">
        <p className="text-white text-[17px] font-bold tracking-[-0.3px] leading-[1.3] mb-1.5 font-[family-name:var(--font-display)]">
          {title}
        </p>
        <p className="text-[11px] text-[#999] font-medium font-[family-name:var(--font-display)] flex items-center gap-1.5 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-[var(--color-positive)] before:inline-block">
          {time}
        </p>
      </div>
    </div>
  );
}

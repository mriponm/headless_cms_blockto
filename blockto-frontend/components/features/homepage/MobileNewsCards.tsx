import SectionLabel from "@/components/ui/SectionLabel";

const GENERAL_NEWS = [
  { thumb: "🏛️", thumbBg: "linear-gradient(135deg,#1a1a2e,#2d1b4e)", tag: "GLOBAL", title: "Iran threatens to close Strait of Hormuz again as US blockade continues", author: "Tristan L.", time: "2h" },
  { thumb: "📈", thumbBg: "linear-gradient(135deg,#1a1a2e,#2d1b4e)", tag: "MARKET", title: "Crypto market recovery remains fragile as liquidity stays weak after October crash", author: "Tristan L.", time: "3h" },
];

const BTC_NEWS = [
  { title: "Bitcoin shows seller exhaustion as realized losses decline",           time: "5h ago",  num: "01" },
  { title: "BTC and ETH approach key levels that could signal reversal",           time: "7h ago",  num: "02" },
  { title: "Bitcoin holds above $73.5K as Iran tensions persist",                  time: "24h ago", num: "03" },
];

const ETH_NEWS = [
  { thumb: "Ξ", thumbBg: "linear-gradient(135deg,#627eea,#3c5ad6)", tag: "ETH", title: "$1.6 billion Ether Machine SPAC deal cancelled amid weak market conditions", author: "Tristan L.", time: "15h" },
  { thumb: "Ξ", thumbBg: "linear-gradient(135deg,#627eea,#3c5ad6)", tag: "ETH", title: "Ethereum activity climbs past 1.3M daily transactions as staking tops 30%", author: "Tristan L.", time: "2d" },
];

function NewsCard({ thumb, thumbBg, tag, title, author, time }: { thumb: string; thumbBg: string; tag: string; title: string; author: string; time: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3.5 p-3 rounded-[16px] mb-2.5 cursor-pointer relative overflow-hidden border border-[rgba(255,255,255,0.06)]" style={{ background: "rgba(255,255,255,0.03)" }}>
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="w-[110px] h-[110px] rounded-[14px] flex items-center justify-center text-[42px] flex-shrink-0 border border-[rgba(255,255,255,0.06)]" style={{ background: thumbBg }}>
        {thumb}
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <p className="text-[14px] font-bold leading-[1.35] tracking-[-0.3px] mb-2 line-clamp-3 font-[family-name:var(--font-display)]">{title}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-extrabold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] border border-[rgba(255,106,0,0.15)] px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] font-[family-name:var(--font-data)]">{tag}</span>
          <span className="text-[10px] text-[#888] font-medium font-[family-name:var(--font-display)]">{author}</span>
          <span className="flex items-center gap-1 text-[10px] text-[#666] font-medium font-[family-name:var(--font-display)] before:content-[''] before:w-[3px] before:h-[3px] before:bg-[#444] before:rounded-full">{time}</span>
        </div>
      </div>
    </div>
  );
}

export default function MobileNewsCards() {
  return (
    <div className="md:hidden">
      <SectionLabel title="General news" count={42} viewAllHref="/news" />
      {GENERAL_NEWS.map(n => <NewsCard key={n.title} {...n} />)}

      <SectionLabel title="Bitcoin news" count={24} viewAllHref="/news/bitcoin" />

      {/* Horizontal scroll trending strip */}
      <div className="overflow-x-auto scrollbar-hide pb-1 mb-2.5 -mx-3 px-3">
        <div className="flex gap-2.5" style={{ width: "max-content" }}>
          {BTC_NEWS.map(n => (
            <div key={n.num} className="w-[200px] p-3.5 rounded-[14px] cursor-pointer relative overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.06)]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <p className="text-[24px] font-black font-[family-name:var(--font-data)] gradient-text-alt leading-none mb-1.5">{n.num}</p>
              <p className="text-[12px] font-bold leading-[1.3] mb-1.5 line-clamp-2 font-[family-name:var(--font-display)]">{n.title}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-extrabold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] px-1.5 py-0.5 rounded font-[family-name:var(--font-data)]">BTC</span>
                <span className="text-[9px] text-[#555] font-semibold font-[family-name:var(--font-display)]">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewsCard thumb="₿" thumbBg="linear-gradient(135deg,#ff9a40,#ff6a00)" tag="BTC" title="Bhutan government transfers $25M in Bitcoin as weekly outflows exceed 1,000 BTC" author="Tristan L." time="3h" />

      <SectionLabel title="Ethereum news" count={18} viewAllHref="/news/ethereum" />
      {ETH_NEWS.map(n => <NewsCard key={n.title} {...n} />)}
    </div>
  );
}

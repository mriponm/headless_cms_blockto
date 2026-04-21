import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";
import MarketPriceLine from "./MarketPriceLine";

interface Props {
  post: WPPost;
}

const COIN_LABEL: Record<string, string> = {
  bitcoin:            "BTC / USD",
  "bitcoin-analysis": "BTC / USD",
  ethereum:           "ETH / USD",
  altcoin:            "ALT / USD",
  "altcoin-focus":    "ALT / USD",
  altcoins:           "ALT / USD",
  nft:                "NFT",
  news:               "CRYPTO",
  markets:            "MARKETS",
  analysis:           "ANALYSIS",
};

const SIGNAL_LABEL: Record<string, string> = {
  bitcoin:            "Bullish setup",
  "bitcoin-analysis": "Bullish setup",
  ethereum:           "Bullish setup",
  altcoin:            "Bullish setup",
  "altcoin-focus":    "Bullish setup",
};

export default function MarketHeroCard({ post }: Props) {
  const cat = primaryCategory(post);
  const imgUrl = post.featuredImage?.node.sourceUrl;
  const authorInitials = post.author.node.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const coinLabel  = COIN_LABEL[cat.slug]  ?? cat.name.toUpperCase();
  const signalLabel = SIGNAL_LABEL[cat.slug] ?? "Live update";

  return (
    <div className="mb-2.5">
      {/* ── Hero card ─────────────────────────────────────────── */}
      <Link href={`/news/${post.slug}`} className="block group">

        {/* Outer card — positions all children */}
        <div
          className="mkt-hero-border relative rounded-[20px] overflow-hidden cursor-pointer mb-0"
          style={{ height: "clamp(240px,32vw,320px)" }}
        >

          {/* ── Background — dark gradient base ── */}
          <div className="mkt-hero-img-bg absolute inset-0" />

          {/* ── Featured image at low opacity ── */}
          {imgUrl && (
            <Image
              src={imgUrl}
              alt={post.title}
              fill
              className="object-cover"
              style={{ opacity: 0.28 }}
              sizes="(max-width:768px) 100vw,(max-width:1200px) 65vw,700px"
              priority
            />
          )}

          {/* ── TA chart SVG ── */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 240"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mh-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,106,0,0.35)" />
                <stop offset="100%" stopColor="rgba(255,106,0,0)" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <g opacity="0.08" stroke="#ff6a00" strokeWidth="0.5">
              <line x1="0" y1="60"  x2="400" y2="60" />
              <line x1="0" y1="120" x2="400" y2="120" />
              <line x1="0" y1="180" x2="400" y2="180" />
            </g>
            {/* Support */}
            <line x1="0" y1="165" x2="400" y2="165" stroke="#00d47b" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="6" y="162" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="700" fill="#00d47b" opacity="0.8">SUPPORT 81.2K</text>
            {/* Resistance */}
            <line x1="0" y1="75" x2="400" y2="75" stroke="#ff3b4f" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="6" y="72" fontFamily="JetBrains Mono,monospace" fontSize="8" fontWeight="700" fill="#ff3b4f" opacity="0.8">RESISTANCE 87.5K</text>
            {/* Area fill */}
            <path
              d="M0 190 L30 170 L55 180 L80 155 L105 140 L130 150 L155 125 L180 135 L205 110 L230 120 L260 95 L290 105 L320 85 L360 95 L400 80 L400 240 L0 240 Z"
              fill="url(#mh-fill)"
            />
            {/* Price line */}
            <path
              d="M0 190 L30 170 L55 180 L80 155 L105 140 L130 150 L155 125 L180 135 L205 110 L230 120 L260 95 L290 105 L320 85 L360 95 L400 80"
              fill="none" stroke="#ff6a00" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Live dot */}
            <circle cx="400" cy="80" r="4" fill="#ff6a00" />
            <circle cx="400" cy="80" r="8" fill="#ff6a00" opacity="0.25" />
          </svg>

          {/* ── Bottom gradient fade ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.92) 100%)" }}
          />

          {/* ── Badges top-left ── */}
          <div className="absolute top-[14px] left-[14px] z-10 flex gap-1.5 flex-wrap">
            <span
              className="text-[9px] font-extrabold text-black px-[11px] py-[5px] rounded-[7px] tracking-[0.8px] shadow-[0_4px_14px_rgba(255,106,0,0.3)]"
              style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)" }}
            >
              Featured
            </span>
            <span className="text-[9px] font-extrabold text-[#ff6a00] bg-black/50 backdrop-blur-[10px] px-[9px] py-[5px] rounded-[7px] border border-[rgba(255,106,0,0.25)] font-[family-name:var(--font-data)] tracking-[0.5px]">
              {coinLabel}
            </span>
          </div>

          {/* ── Signal badge top-right ── */}
          <div className="absolute top-[14px] right-[14px] z-10 flex items-center gap-[5px] text-[10px] font-extrabold text-[#00d47b] px-3 py-[6px] rounded-[8px] bg-[rgba(0,212,123,0.15)] border border-[rgba(0,212,123,0.3)] backdrop-blur-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
            <span className="w-[5px] h-[5px] rounded-full bg-[#00d47b] shadow-[0_0_8px_#00d47b] pls-anim flex-shrink-0" />
            {signalLabel}
          </div>

          {/* ── Content overlay at bottom ── */}
          <div className="absolute bottom-0 left-0 right-0 p-[18px] z-10">
            <h2 className="mkt-hero-title text-[19px] md:text-[21px] lg:text-[23px] font-extrabold tracking-[-0.5px] leading-[1.22] mb-2.5 line-clamp-2">
              {post.title}
            </h2>
            <MarketPriceLine catSlug={cat.slug} />
            <div className="mkt-hero-meta flex items-center gap-2 text-[11px] font-medium">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)" }}
                aria-hidden="true"
              >
                {authorInitials}
              </div>
              <span className="truncate">{post.author.node.name}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#555] flex-shrink-0" aria-hidden="true" />
              <span className="flex-shrink-0">8 min read</span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#555] flex-shrink-0" aria-hidden="true" />
              <time dateTime={post.date} className="flex-shrink-0">{relativeDate(post.date)}</time>
            </div>
          </div>

        </div>
      </Link>

      {/* ── Key Levels Strip ─────────────────────────────────── */}
      <div className="mkt-levels-bg grid grid-cols-4 gap-px rounded-[12px] overflow-hidden mt-2.5 mb-2.5">
        {([
          { label: "Entry",      value: "$84.2K", cls: "text-white" },
          { label: "Support",    value: "$81.2K", cls: "text-[#00d47b]" },
          { label: "Resistance", value: "$87.5K", cls: "text-[#ff3b4f]" },
          { label: "Target",     value: "$92K",   cls: "text-[#ff6a00]" },
        ] as const).map(({ label, value, cls }) => (
          <div key={label} className="mkt-levels-cell px-2 py-[10px] text-center">
            <p className="mkt-levels-label text-[8px] uppercase tracking-[0.7px] font-bold mb-[3px] font-[family-name:var(--font-display)]">
              {label}
            </p>
            <p className={`${cls} text-[12px] font-bold font-[family-name:var(--font-data)]`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

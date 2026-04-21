import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/lib/wordpress/types";
import { relativeDate, primaryCategory } from "@/lib/wordpress/queries";

/* ── Per-category colour tokens ────────────────────────────────── */
const CAT_STYLE: Record<string, {
  label: string;
  textColor: string;
  stroke: string;
  fillOpacity: string;
  bgTop: string;
  border: string;
}> = {
  bitcoin: {
    label: "BTC",
    textColor: "#ff6a00",
    stroke: "#ff6a00",
    fillOpacity: "0.2",
    bgTop: "#2d1a05",
    border: "rgba(255,106,0,0.2)",
  },
  ethereum: {
    label: "ETH",
    textColor: "#4a9eff",
    stroke: "#4a9eff",
    fillOpacity: "0.2",
    bgTop: "#0a0e1f",
    border: "rgba(74,158,255,0.2)",
  },
  altcoin: {
    label: "ALT",
    textColor: "#b16aff",
    stroke: "#b16aff",
    fillOpacity: "0.2",
    bgTop: "#1a0e2d",
    border: "rgba(177,106,255,0.2)",
  },
  nft: {
    label: "NFT",
    textColor: "#ff6eb4",
    stroke: "#ff6eb4",
    fillOpacity: "0.2",
    bgTop: "#2d0a20",
    border: "rgba(255,110,180,0.2)",
  },
  "altcoin-focus": {
    label: "ALT",
    textColor: "#b16aff",
    stroke: "#b16aff",
    fillOpacity: "0.2",
    bgTop: "#1a0e2d",
    border: "rgba(177,106,255,0.2)",
  },
  altcoins: {
    label: "ALT",
    textColor: "#b16aff",
    stroke: "#b16aff",
    fillOpacity: "0.2",
    bgTop: "#1a0e2d",
    border: "rgba(177,106,255,0.2)",
  },
  "bitcoin-analysis": {
    label: "BTC",
    textColor: "#ff6a00",
    stroke: "#ff6a00",
    fillOpacity: "0.2",
    bgTop: "#2d1a05",
    border: "rgba(255,106,0,0.2)",
  },
  markets: {
    label: "MKT",
    textColor: "#ff6a00",
    stroke: "#ff6a00",
    fillOpacity: "0.2",
    bgTop: "#2d1a05",
    border: "rgba(255,106,0,0.2)",
  },
  analysis: {
    label: "ANA",
    textColor: "#4a9eff",
    stroke: "#4a9eff",
    fillOpacity: "0.2",
    bgTop: "#0a0e1f",
    border: "rgba(74,158,255,0.2)",
  },
  /* Default for news / general */
  news: {
    label: "NEWS",
    textColor: "#ff6a00",
    stroke: "#ff6a00",
    fillOpacity: "0.2",
    bgTop: "#2d1a05",
    border: "rgba(255,106,0,0.2)",
  },
};

const DEFAULT_STYLE = CAT_STYLE.bitcoin;

/* ── Signal badge ────────────────────────────────────────────── */
const SIGNAL = {
  bull: {
    label: "Bullish",
    cls: "text-[#00d47b] bg-[rgba(0,212,123,0.1)] border border-[rgba(0,212,123,0.2)]",
  },
  bear: {
    label: "Bearish",
    cls: "text-[#ff3b4f] bg-[rgba(255,59,79,0.1)] border border-[rgba(255,59,79,0.2)]",
  },
  neu: {
    label: "Analysis",
    cls: "text-[#999] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]",
  },
} as const;

export type SignalType = keyof typeof SIGNAL;

/* Converts "#rrggbb" → "r,g,b" for rgba() */
function hex2rgb(hex: string): string {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ].join(",");
}

interface Props {
  post: WPPost;
  signal?: SignalType;
  /** compact = sidebar variant */
  compact?: boolean;
}

export default function MarketAnalysisCard({ post, signal = "neu", compact = false }: Props) {
  const cat = primaryCategory(post);
  const style = CAT_STYLE[cat.slug] ?? DEFAULT_STYLE;
  const sig = SIGNAL[signal];
  const imgUrl = post.featuredImage?.node.sourceUrl;
  const authorInitials = post.author.node.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* ── Compact (desktop sidebar) variant ─────────────────────── */
  if (compact) {
    return (
      <Link
        href={`/news/${post.slug}`}
        className="glass mkt-sidebar-card flex items-start gap-2.5 p-2.5 rounded-[12px] relative overflow-hidden cursor-pointer"
      >
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

        {/* Thumb */}
        <div className="mkt-ana-thumb w-[52px] h-[52px] flex-shrink-0 rounded-[9px] overflow-hidden relative">
          {imgUrl ? (
            <Image src={imgUrl} alt={post.title} fill className="object-cover" sizes="52px" />
          ) : (
            <SvgThumb post={post} style={style} size={52} />
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col min-w-0 flex-1 gap-[5px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CatTag style={style} />
            <span className={`text-[7px] font-extrabold px-1.5 py-[2px] rounded-[4px] tracking-[0.4px] uppercase ${sig.cls}`}>
              {sig.label}
            </span>
          </div>
          <h4 className="mkt-sidebar-title text-[11px] font-bold leading-[1.3] line-clamp-2 min-w-0">
            {post.title}
          </h4>
          <p className="mkt-sidebar-meta text-[9px] font-medium">
            <time dateTime={post.date}>{relativeDate(post.date)}</time>
          </p>
        </div>
      </Link>
    );
  }

  /* ── Full list card (mobile + desktop main column) ─────────── */
  return (
    <Link
      href={`/news/${post.slug}`}
      className="glass mkt-ana-card grid grid-cols-[110px_1fr] gap-3 p-3 rounded-[16px] cursor-pointer relative overflow-hidden"
    >
      {/* top shimmer */}
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

      {/* ── Thumbnail ──────────────────────────────────────── */}
      <div className="mkt-ana-thumb w-[110px] h-[110px] rounded-[14px] overflow-hidden flex-shrink-0 relative">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="110px"
          />
        ) : (
          <SvgThumb post={post} style={style} size={110} />
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between min-w-0">
        <div>
          {/* Tags row — matches HTML .ana-top */}
          <div className="flex items-center gap-[5px] mb-[6px] flex-wrap">
            <CatTag style={style} />
            <span className={`text-[8px] font-extrabold px-[6px] py-[2px] rounded-[4px] tracking-[0.4px] uppercase ${sig.cls}`}>
              {sig.label}
            </span>
          </div>

          {/* Title — matches HTML .ana-ti */}
          <h3 className="mkt-ana-title text-[13px] font-bold leading-[1.35] tracking-[-0.2px] line-clamp-2 mb-[6px]">
            {post.title}
          </h3>
        </div>

        {/* Meta row — matches HTML .ana-meta */}
        <div className="flex items-center gap-[5px] text-[10px] font-medium">
          {/* Author */}
          <div className="mkt-ana-author flex items-center gap-1 flex-shrink-0">
            <div
              className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-extrabold text-black flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)" }}
              aria-hidden="true"
            >
              {authorInitials}
            </div>
            <span className="truncate max-w-[60px]">
              {post.author.node.name.split(" ")[0]}{" "}
              {post.author.node.name.split(" ")[1]?.[0]}.
            </span>
          </div>
          {/* Time */}
          <span className="mkt-ana-meta before:content-['•'] before:text-[#333] before:mr-[3px] flex-shrink-0">
            <time dateTime={post.date}>{relativeDate(post.date)}</time>
          </span>
          {/* Read time — right aligned */}
          <span className="ml-auto text-[#ff6a00] font-bold flex-shrink-0">5 min</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Shared sub-components ──────────────────────────────────── */

function CatTag({ style }: { style: typeof DEFAULT_STYLE }) {
  return (
    <span
      className="text-[9px] font-extrabold px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] border font-[family-name:var(--font-data)]"
      style={{
        color: style.textColor,
        background: `rgba(${hex2rgb(style.textColor)},0.08)`,
        borderColor: style.border,
      }}
    >
      {style.label}
    </span>
  );
}

function SvgThumb({
  post,
  style,
  size,
}: {
  post: WPPost;
  style: typeof DEFAULT_STYLE;
  size: number;
}) {
  const id = `svgbg-${post.id}`;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={style.bgTop} />
          <stop offset="100%" stopColor="#050302" />
        </linearGradient>
      </defs>
      <rect width={size} height={size} fill={`url(#${id})`} />
      <path
        d={`M0 ${size * 0.75} L${size * 0.18} ${size * 0.62} L${size * 0.35} ${size * 0.65} L${size * 0.52} ${size * 0.47} L${size * 0.68} ${size * 0.4} L${size * 0.84} ${size * 0.3} L${size} ${size * 0.2}`}
        stroke={style.stroke}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d={`M0 ${size * 0.75} L${size * 0.18} ${size * 0.62} L${size * 0.35} ${size * 0.65} L${size * 0.52} ${size * 0.47} L${size * 0.68} ${size * 0.4} L${size * 0.84} ${size * 0.3} L${size} ${size * 0.2} L${size} ${size} L0 ${size} Z`}
        fill={style.stroke}
        fillOpacity={style.fillOpacity}
      />
      <text
        x={size / 2}
        y={size * 0.92}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={size * 0.085}
        fontWeight="800"
        fill={style.stroke}
        opacity="0.75"
      >
        {style.label}/USD
      </text>
    </svg>
  );
}

import type { Metadata } from "next";
import BrandLogo from "@/components/ui/BrandLogo";
import FadeIn from "@/components/ui/FadeIn";
import { Check, ExternalLink, ChevronRight, Star, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Buy Crypto",
  description:
    "Hand-picked crypto exchanges vetted for security, low fees, and deep liquidity. Start trading with exclusive Blockto bonuses.",
};

/* ─── Brand constants ────────────────────────────────────────── */
const BRAND        = "#ff6a00";
const BRAND_BORDER = "rgba(255,106,0,0.2)";
const BRAND_GLOW   = "rgba(255,106,0,0.15)";

/* ─── Types ──────────────────────────────────────────────────── */

type RankStyle = "gold" | "silver" | "bronze";

interface FeatureGroup {
  label: string;
  items: React.ReactNode[];
}

interface Exchange {
  id: string;
  rank: number;
  rankStyle: RankStyle;
  name: string;
  logoColor: string;
  score: string;
  stars: number;
  featured: boolean;
  desc: string;
  maker: string;
  taker: string;
  kyc: string;
  kycAccent: boolean;
  bonus: string;
  featureGroups: FeatureGroup[];
  signupUrl: string;
  websiteUrl: string;
}

function Hl({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-bold" style={{ color: BRAND, borderBottom: "0.5px dashed rgba(255,106,0,0.35)" }}>
      {children}
    </span>
  );
}

/* ─── Data ───────────────────────────────────────────────────── */

const EXCHANGES: Exchange[] = [
  {
    id: "blofin",
    rank: 1,
    rankStyle: "gold",
    name: "BloFin",
    logoColor: BRAND,
    score: "4.9",
    stars: 5,
    featured: true,
    desc: "Global crypto trading platform for beginners & pros. Strong focus on futures, derivatives, and deep liquidity with institutional-grade security.",
    maker: "0.02%",
    taker: "0.06%",
    kyc: "Optional",
    kycAccent: true,
    bonus: "+$500 bonus",
    featureGroups: [
      {
        label: "Trading products",
        items: [
          <>Derivatives: wide range of <Hl>USDT-M perpetuals</Hl> and <Hl>spot trading</Hl></>,
          <>Also offers <Hl>copy trading</Hl> and <Hl>demo trading</Hl></>,
        ],
      },
      {
        label: "Security & compliance",
        items: [
          <>Partners with <Hl>Fireblocks</Hl> and <Hl>Chainalysis</Hl> to secure user funds</>,
          <>Offers <Hl>no-KYC option</Hl> for additional privacy</>,
        ],
      },
      {
        label: "Company",
        items: [<>Founded 2019 &mdash; George Town, Cayman Islands</>],
      },
    ],
    signupUrl: "#",
    websiteUrl: "#",
  },
  {
    id: "bybit",
    rank: 2,
    rankStyle: "silver",
    name: "Bybit",
    logoColor: "#ffc107",
    score: "4.7",
    stars: 4,
    featured: false,
    desc: "One of the largest global exchanges. Offers spot, futures, options, copy trading, and institutional-grade tools with industry-low fees.",
    maker: "0.01%",
    taker: "0.06%",
    kyc: "Required",
    kycAccent: false,
    bonus: "+$300 bonus",
    featureGroups: [
      {
        label: "Key features",
        items: [
          <><Hl>Spot, futures, options</Hl> and structured products</>,
          <>Advanced copy trading with over <Hl>100K+ master traders</Hl></>,
          <>Regulated &amp; insured with <Hl>Proof-of-Reserves</Hl></>,
        ],
      },
    ],
    signupUrl: "#",
    websiteUrl: "#",
  },
  {
    id: "bitget",
    rank: 3,
    rankStyle: "bronze",
    name: "Bitget",
    logoColor: "#4a9eff",
    score: "4.6",
    stars: 4,
    featured: false,
    desc: "Leading copy trading exchange with deep liquidity across spot and futures. Trusted by 25M+ users worldwide with strong security track record.",
    maker: "0.02%",
    taker: "0.06%",
    kyc: "Required",
    kycAccent: false,
    bonus: "+$200 bonus",
    featureGroups: [
      {
        label: "Key features",
        items: [
          <>Industry-leading <Hl>copy trading</Hl> platform</>,
          <><Hl>$600M Protection Fund</Hl> for user asset safety</>,
          <>800+ trading pairs with <Hl>low spreads</Hl></>,
        ],
      },
    ],
    signupUrl: "#",
    websiteUrl: "#",
  },
];

const RANK_BADGE: Record<RankStyle, { bg: string; shadow: string }> = {
  gold:   { bg: "linear-gradient(135deg,#ff6a00,#ff8a30)", shadow: "0 0 20px rgba(255,106,0,0.4),-4px 4px 16px rgba(0,0,0,0.4)" },
  silver: { bg: "linear-gradient(135deg,#c0c0c0,#e8e8e8)", shadow: "0 0 14px rgba(192,192,192,0.3),-4px 4px 16px rgba(0,0,0,0.4)" },
  bronze: { bg: "linear-gradient(135deg,#cd7f32,#e0a570)", shadow: "0 0 14px rgba(205,127,50,0.3),-4px 4px 16px rgba(0,0,0,0.4)" },
};

/* ─── Star rating ────────────────────────────────────────────── */

function StarRating({ count, score }: { count: number; score: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          style={{
            color: BRAND,
            fill: i < count ? BRAND : "none",
            filter: i < count ? "drop-shadow(0 0 3px rgba(255,106,0,0.5))" : "none",
            opacity: i < count ? 1 : 0.22,
          }}
        />
      ))}
      <span className="ml-1.5 text-[11px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "#888" }}>
        {score}&thinsp;/&thinsp;5
      </span>
    </div>
  );
}

/* ─── Exchange card ──────────────────────────────────────────── */

function ExchangeCard({ ex }: { ex: Exchange }) {
  const badge = RANK_BADGE[ex.rankStyle];

  return (
    <article
      className={`buy-ex-card relative rounded-[20px] overflow-hidden card-hover${ex.featured ? " buy-ex-card--featured" : ""}`}
      style={
        ex.featured
          ? {
              background: "linear-gradient(135deg,rgba(255,106,0,0.08),rgba(255,106,0,0.02) 50%,rgba(0,0,0,0))",
              border: `0.5px solid ${BRAND_BORDER}`,
            }
          : {
              background: "rgba(255,255,255,0.025)",
              border: "0.5px solid rgba(255,255,255,0.06)",
            }
      }
    >
      {/* rank badge */}
      <div
        className="absolute top-0 right-0 z-[3] w-[46px] h-[46px] flex items-center justify-center font-black text-[14px] tracking-[-0.5px] rounded-bl-[16px] font-[family-name:var(--font-data)]"
        style={{ background: badge.bg, color: "#000", boxShadow: badge.shadow }}
      >
        #{ex.rank}
      </div>

      {/* shimmer + featured glow */}
      <span
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background: ex.featured
            ? "linear-gradient(90deg,transparent,rgba(255,106,0,0.4),transparent)"
            : "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)",
        }}
      />
      {ex.featured && (
        <span
          className="absolute -top-[30%] -right-[20%] w-[60%] h-[80%] pointer-events-none"
          style={{ background: `radial-gradient(circle,${BRAND_GLOW},transparent 70%)`, filter: "blur(30px)" }}
        />
      )}

      <div className="relative z-[1] p-[22px] lg:p-7">

        {/* header */}
        <div className="flex items-center gap-[14px] mb-[14px] pr-8">
          <div
            className="buy-logo-bg w-[60px] h-[60px] rounded-[16px] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{
              border: `1.5px solid ${ex.logoColor}55`,
              boxShadow: `0 0 14px ${ex.logoColor}25,inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent" />
            <span className="font-black text-[13px] tracking-[-0.5px] font-[family-name:var(--font-display)]" style={{ color: ex.logoColor }}>
              {ex.name}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[19px] font-black tracking-[-0.5px] mb-1 header-brand-text font-[family-name:var(--font-display)]">
              {ex.name}
            </h2>
            <StarRating count={ex.stars} score={ex.score} />
          </div>
          <div
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,212,123,0.15)", border: "0.5px solid rgba(0,212,123,0.3)" }}
          >
            <Check size={9} strokeWidth={3} color="#00d47b" />
          </div>
        </div>

        {/* desc */}
        <p className="text-[12px] buy-ex-desc leading-[1.55] font-medium mb-[14px]">{ex.desc}</p>

        {/* desktop split: left = stats+features, right = CTA */}
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-8">
          <div>
            {/* quick stats */}
            <div
              className="buy-stats-grid grid grid-cols-3 gap-px rounded-[10px] overflow-hidden mb-[14px]"
            >
              {[
                { label: "Maker", value: ex.maker, color: "#00d47b" },
                { label: "Taker", value: ex.taker, color: null },
                { label: "KYC",   value: ex.kyc,   color: ex.kycAccent ? BRAND : null },
              ].map(({ label, value, color }) => (
                <div key={label} className="buy-quick-stat px-2.5 py-2 text-center">
                  <div className="text-[8px] buy-eq-label uppercase tracking-[0.6px] font-bold mb-[2px]">{label}</div>
                  <div
                    className="text-[12px] font-bold font-[family-name:var(--font-data)] buy-eq-v"
                    style={color ? { color } : undefined}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* feature groups */}
            <div className="flex flex-col gap-[12px] mb-[16px] lg:mb-0">
              {ex.featureGroups.map((group) => (
                <div key={group.label}>
                  <div className="text-[9px] font-extrabold uppercase tracking-[1.5px] buy-feat-label mb-[8px] px-0.5">
                    {group.label}
                  </div>
                  <ul className="flex flex-col gap-[6px]">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-[10px] text-[12px] leading-[1.45]">
                        <span
                          className="w-[18px] h-[18px] rounded-[6px] flex items-center justify-center flex-shrink-0 mt-[1px]"
                          style={{ background: "linear-gradient(135deg,#00d47b,#00a862)", boxShadow: "0 0 8px rgba(0,212,123,0.2)" }}
                        >
                          <Check size={9} strokeWidth={3} color="#000" />
                        </span>
                        <span className="buy-feat-txt font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA — stacks below on mobile, right column on desktop */}
          <div className="flex flex-col gap-[10px] mt-[16px] lg:mt-0 lg:justify-end">
            <a
              href={ex.signupUrl}
              className="w-full py-[14px] rounded-[12px] font-extrabold text-[14px] text-black flex items-center justify-center gap-2 cursor-pointer font-[family-name:var(--font-display)] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
              style={{
                background: "linear-gradient(135deg,#ff6a00,#ff8a30)",
                boxShadow: "0 8px 20px rgba(255,106,0,0.25),0 0 24px rgba(255,106,0,0.12),inset 0 1px 0 rgba(255,255,255,0.25)",
                letterSpacing: "0.3px",
              }}
            >
              Sign up on {ex.name}
              <ChevronRight size={14} strokeWidth={2.5} />
              <span className="text-[9px] font-extrabold bg-black/20 px-1.5 py-0.5 rounded font-[family-name:var(--font-data)] ml-1">
                {ex.bonus}
              </span>
            </a>
            <a
              href={ex.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-[12px] rounded-[12px] text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer btn-secondary-buy font-[family-name:var(--font-display)]"
            >
              <ExternalLink size={12} strokeWidth={2} />
              Visit website
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function BuyPage() {
  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pb-16 pt-4">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <section
          className="relative rounded-[22px] overflow-hidden mb-[14px] text-center px-5 py-[26px] md:py-[36px]"
          style={{
            background: "linear-gradient(160deg,rgba(255,106,0,0.12),rgba(255,106,0,0.02) 40%,rgba(0,0,0,0))",
            border: `0.5px solid ${BRAND_BORDER}`,
          }}
        >
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.5)] to-transparent" />
          <span
            className="absolute -top-[30%] -left-[10%] w-[80%] h-[80%] pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,106,0,0.18),transparent 70%)", filter: "blur(40px)" }}
          />
          <div className="relative z-[1]">
            {/* tag */}
            <div
              className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[1.5px] mb-4"
              style={{ color: BRAND, padding: "5px 12px", borderRadius: "20px", border: `0.5px solid rgba(255,106,0,0.3)`, background: "rgba(255,106,0,0.08)" }}
            >
              <span className="w-[5px] h-[5px] rounded-full pulse-anim" style={{ background: BRAND, boxShadow: `0 0 8px ${BRAND}` }} />
              Trusted partners
            </div>

            <h1 className="text-[30px] md:text-[40px] font-black tracking-[-1.2px] leading-[1.05] mb-3 font-[family-name:var(--font-display)] header-brand-text">
              Buy &amp; sell<br />
              <span className="gradient-text-alt">the smart way</span>
            </h1>
            <p className="text-[13px] md:text-[15px] buy-ex-desc leading-[1.55] font-medium max-w-[380px] mx-auto">
              Hand-picked crypto exchanges vetted for security, low fees, and deep liquidity.
              Start trading with exclusive Blockto bonuses.
            </p>

            {/* blockto × Exchanges */}
            <div className="flex items-center justify-center gap-5 mt-5 mb-1">
              <div className="flex items-center gap-2 text-[16px] font-extrabold font-[family-name:var(--font-display)] header-brand-text">
                <div
                  className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 14px rgba(255,106,0,0.3)" }}
                >
                  <BrandLogo size={20} />
                </div>
                blockto
              </div>
              <span className="text-[18px] font-black" style={{ color: "#555" }}>&times;</span>
              <div className="flex items-center gap-2 text-[16px] font-extrabold font-[family-name:var(--font-display)] header-brand-text">
                <div className="w-[28px] h-[28px] rounded-[8px] bg-white flex items-center justify-center text-black text-[12px] font-black">
                  E
                </div>
                Exchanges
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── Stats ────────────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
          {[
            { label: "Partners",   value: "3",     sub: "exchanges", accent: true },
            { label: "Best bonus", value: "$500",  sub: "sign-up",   accent: false },
            { label: "Lowest fee", value: "0.02%", sub: "maker",     accent: false },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} className="glass relative overflow-hidden rounded-[14px] py-3 px-2.5 text-center">
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <div className="text-[8px] font-bold uppercase tracking-[0.8px] buy-stat-label mb-[3px]">{label}</div>
              <div
                className={`text-[18px] font-black tracking-[-0.5px] leading-none font-[family-name:var(--font-data)] ${accent ? "gradient-text-alt" : "header-brand-text"}`}
              >
                {value}
              </div>
              <div className="text-[9px] buy-stat-sub mt-[3px] font-semibold">{sub}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Section label ────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-[14px] mt-[22px] px-1">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[2.5px] gradient-text-alt font-[family-name:var(--font-display)]"
        >
          Top-rated exchanges
        </span>
        <span className="text-[9px] buy-section-count font-bold tracking-[1px] font-[family-name:var(--font-data)]">RANKED</span>
        <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,106,0,0.2),transparent)" }} />
      </div>

      {/* ── Cards — stacked full-width, desktop inner split ──── */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col gap-[14px]">
          {EXCHANGES.map((ex) => (
            <ExchangeCard key={ex.id} ex={ex} />
          ))}
        </div>
      </FadeIn>

      {/* ── Disclosure ───────────────────────────────────────── */}
      <div
        className="rounded-[12px] p-[14px] flex gap-2.5 items-start mt-[18px] mb-[10px]"
        style={{ background: "rgba(255,106,0,0.04)", border: "0.5px solid rgba(255,106,0,0.1)" }}
      >
        <div
          className="w-6 h-6 rounded-[7px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,106,0,0.12)", border: "0.5px solid rgba(255,106,0,0.2)" }}
        >
          <Info size={12} color={BRAND} />
        </div>
        <p className="text-[10px] buy-ex-desc leading-[1.5] font-medium">
          <strong className="font-bold" style={{ color: BRAND }}>Affiliate disclosure: </strong>
          Blockto.io may earn a commission when you sign up through our links. This does not affect our rankings,
          which are based on security, fees, features, and user reviews. Always do your own research before trading.
          Crypto involves risk.
        </p>
      </div>

    </div>
  );
}

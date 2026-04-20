"use client";
import { useState, useEffect } from "react";
import { Bookmark, Share2, Zap, TrendingUp, AlertCircle, ArrowUpRight } from "lucide-react";

/* ─── Reading progress ─── */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="h-full transition-none"
      style={{ width: `${progress}%`, background: "linear-gradient(90deg,#ff6a00,#ffaa44)", boxShadow: "0 0 8px rgba(255,106,0,0.5)" }} />
  );
}

/* ─── Takeaway item ─── */
function TkItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 py-[7px] text-[13px] leading-[1.5] font-medium art-body-text">
      <div className="w-[18px] h-[18px] rounded-[6px] flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg,#00d47b,#00a862)", boxShadow: "0 0 8px rgba(0,212,123,0.2)" }}>
        <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l3 3 6-6"/>
        </svg>
      </div>
      {text}
    </div>
  );
}

/* ─── Related card ─── */
function RelCard({ tag, title, author, time, svgBg, svgPath, pathColor }: {
  tag: string; title: string; author: string; time: string;
  svgBg: string; svgPath: string; pathColor: string;
}) {
  return (
    <div className="art-related-card rounded-[16px] p-3 grid grid-cols-[110px_1fr] gap-3 mb-2.5 cursor-pointer relative overflow-hidden">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="w-[110px] h-[110px] rounded-[14px] overflow-hidden flex-shrink-0 art-related-thumb">
        <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect width="110" height="110" fill={svgBg} />
          <path d={svgPath} stroke={pathColor} strokeWidth="2" fill="none" />
          <path d={svgPath + " L110 110 L0 110 Z"} fill={pathColor} opacity="0.2" />
        </svg>
      </div>
      <div className="flex flex-col justify-between min-w-0">
        <div>
          <span className="inline-block text-[8px] font-extrabold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] font-[family-name:var(--font-data)] border border-[rgba(255,106,0,0.2)] mb-1.5">
            {tag}
          </span>
          <p className="text-[13px] font-bold leading-[1.35] art-heading line-clamp-3 tracking-[-0.2px]">{title}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] art-sub-text font-medium mt-1.5">
          <span className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-extrabold text-black flex-shrink-0" style={{ background: "var(--gradient-brand)" }}>
            {author}
          </span>
          {author === "TL" ? "Tristan L." : author} · {time}
        </div>
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const [saved, setSaved] = useState(true);

  return (
    <>
      {/* ── Sticky reading progress bar ── */}
      <div className="sticky top-0 z-40 h-[3px] art-progress-bg">
        <ReadingProgress />
      </div>

      {/* ── Main content: full-width on mobile, centered on desktop ── */}
      <div className="w-full max-w-[860px] mx-auto">

        {/* ── Hero image ── */}
        <div className="relative">
          <div className="w-full h-[300px] md:h-[480px] md:rounded-b-[24px] lg:rounded-[20px] overflow-hidden relative" style={{ background: "#0a0a0a" }}>
            <svg viewBox="0 0 860 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4b85b8"/>
                  <stop offset="60%" stopColor="#6a9bc4"/>
                  <stop offset="100%" stopColor="#8fbcdc"/>
                </linearGradient>
                <linearGradient id="sea" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2a5a82"/>
                  <stop offset="100%" stopColor="#0f2a4a"/>
                </linearGradient>
                <radialGradient id="sun" cx="75%" cy="25%">
                  <stop offset="0%" stopColor="rgba(255,220,150,0.6)"/>
                  <stop offset="100%" stopColor="transparent"/>
                </radialGradient>
              </defs>
              <rect width="860" height="300" fill="url(#sky)"/>
              <circle cx="680" cy="120" r="200" fill="url(#sun)"/>
              <rect y="240" width="860" height="50" fill="#c9a876" opacity="0.7"/>
              <rect y="280" width="860" height="120" fill="url(#sea)"/>
              <g>
                <rect x="430" y="220" width="280" height="50" fill="#9a2e24" rx="2"/>
                <rect x="430" y="255" width="280" height="18" fill="#6e1e18"/>
                <rect x="635" y="190" width="60" height="30" fill="#e8e8e8"/>
                <rect x="648" y="177" width="14" height="13" fill="#e8e8e8"/>
                <rect x="675" y="168" width="11" height="22" fill="#9a2e24"/>
                <rect x="645" y="200" width="4" height="6" fill="#1a1a1a"/>
                <rect x="655" y="200" width="4" height="6" fill="#1a1a1a"/>
                <rect x="665" y="200" width="4" height="6" fill="#1a1a1a"/>
                <rect x="675" y="200" width="4" height="6" fill="#1a1a1a"/>
                <rect x="685" y="200" width="4" height="6" fill="#1a1a1a"/>
              </g>
              <g opacity="0.4">
                <path d="M0 310 Q30 304 60 310 T120 310 T180 310 T240 310 T300 310 T360 310 T420 310 T480 310 T540 310 T600 310 T660 310 T720 310 T780 310 T860 310" stroke="#8fbcdc" strokeWidth="1.5" fill="none"/>
                <path d="M0 340 Q35 332 70 340 T140 340 T210 340 T280 340 T350 340 T420 340 T490 340 T560 340 T630 340 T700 340 T770 340 T860 340" stroke="#8fbcdc" strokeWidth="1" fill="none" opacity="0.5"/>
              </g>
              <rect y="400" width="860" height="80" fill="#14100c"/>
              <rect y="393" width="860" height="2.5" fill="#3a3530"/>
              <g transform="translate(280,310)">
                <ellipse cx="0" cy="-5" rx="30" ry="22" fill="#3a4a2a"/>
                <rect x="-34" y="14" width="68" height="95" fill="#4a5a2a" rx="3"/>
                <rect x="-25" y="25" width="50" height="60" fill="#3a4a2a" opacity="0.85" rx="2"/>
                <line x1="0" y1="0" x2="75" y2="-28" stroke="#1a1a1a" strokeWidth="4.5"/>
                <rect x="56" y="-34" width="28" height="9" fill="#1a1a1a"/>
              </g>
              <g transform="translate(420,335)">
                <ellipse cx="0" cy="-5" rx="25" ry="20" fill="#2a2a2a"/>
                <rect x="-7" y="-11" width="14" height="6" fill="#1a1a1a"/>
                <rect x="-29" y="12" width="58" height="80" fill="#4a5a2a" rx="3"/>
                <rect x="-20" y="22" width="40" height="50" fill="#3a4a2a" opacity="0.85" rx="2"/>
              </g>
              <text x="430" y="440" textAnchor="middle" fontFamily="Outfit" fontSize="200" fontWeight="900" fill="rgba(255,106,0,0.08)">$30B</text>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
          </div>

          {/* Floating tag */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-black px-3 py-[6px] rounded-[7px] tracking-[0.8px] font-[family-name:var(--font-data)]"
              style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 4px 14px rgba(255,106,0,0.3)" }}>
              NEWS
            </span>
            <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-[10px] px-3 py-[6px] rounded-[7px] border border-white/10 flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] bg-[var(--color-positive)] rounded-full shadow-[0_0_6px_var(--color-positive)] pls-anim" />
              57 min ago
            </span>
          </div>

          {/* Floating save/share */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setSaved(v => !v)}
              className="art-fa-btn w-[42px] h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer transition-all duration-200 relative"
              style={saved
                ? { background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 16px rgba(255,106,0,0.4),0 8px 20px rgba(0,0,0,0.4)", border: "none" }
                : { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none rounded-t-[12px]" />
              <Bookmark size={15} className={saved ? "text-black fill-black" : "text-white"} />
            </button>
            <button
              className="art-fa-btn w-[42px] h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer transition-all duration-200 relative"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none rounded-t-[12px]" />
              <Share2 size={15} className="text-white" />
            </button>
          </div>
        </div>

        {/* ── Caption ── */}
        <p className="text-[10px] art-sub-text font-medium italic leading-[1.5] px-4 md:px-6 lg:px-0 pt-2">
          U.S. Naval Forces conducting operations near the Strait of Hormuz — Photo: illustrative
        </p>

        {/* ── Article wrapper ── */}
        <div className="px-4 md:px-6 lg:px-0 mt-5">

          {/* Title block */}
          <div className="pb-4 border-b art-border mb-5 relative">
            <div className="absolute bottom-[-0.5px] left-0 w-10 h-px bg-gradient-to-r from-[#ff6a00] to-transparent" />
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {["#Geopolitics", "#OilMarkets", "#Iran"].map((tag) => (
                <span key={tag} className="art-tag-pill text-[10px] font-bold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] px-[9px] py-1 rounded-[6px] tracking-[0.4px] border border-[rgba(255,106,0,0.2)] font-[family-name:var(--font-data)] cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-[26px] md:text-[34px] font-black tracking-[-1px] md:tracking-[-1.4px] leading-[1.1] mb-3.5 art-heading font-[family-name:var(--font-display)]">
              U.S. military plans to board Iran-linked ships as Hormuz tensions escalate
            </h1>
            <p className="text-[14px] md:text-[16px] art-lead-text leading-[1.55] font-medium">
              Naval operations in the Strait of Hormuz signal a hardening U.S. stance against sanction-violating vessels, with potential ripple effects across global energy markets and crypto sentiment.
            </p>
          </div>

          {/* Key takeaways */}
          <div className="rounded-[16px] p-5 mb-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,rgba(255,106,0,0.08),rgba(255,106,0,0.01))", border: "0.5px solid rgba(255,106,0,0.2)" }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.35)] to-transparent pointer-events-none" />
            <span className="absolute top-[-30%] right-[-15%] w-[50%] h-[80%] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,106,0,0.1),transparent 70%)", filter: "blur(25px)" }} />
            <div className="flex items-center gap-2 mb-3.5 relative z-10">
              <Zap size={14} className="text-[var(--color-brand)]" style={{ filter: "drop-shadow(0 0 4px rgba(255,106,0,0.4))" }} />
              <span className="text-[10px] font-extrabold text-[var(--color-brand)] uppercase tracking-[1.5px]">Key takeaways</span>
            </div>
            <div className="relative z-10">
              <TkItem text="U.S. Navy to forcibly board vessels suspected of violating Iran sanctions" />
              <TkItem text="Hormuz handles roughly 20% of global oil trade — any disruption moves markets" />
              <TkItem text="Bitcoin historically tracks as a safe-haven during geopolitical flare-ups" />
            </div>
          </div>

          {/* Body */}
          <div className="mb-6 art-body">

            {/* Lead paragraph with drop cap */}
            <p className="art-lead-para mb-[18px] text-[16px] md:text-[17px] leading-[1.65] font-[family-name:var(--font-lora)] font-medium art-lead-text">
              <span className="float-left text-[50px] font-black leading-[0.95] mr-2.5 mt-1 font-[family-name:var(--font-display)]"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ffaa44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                T
              </span>
              he United States is preparing a dramatic escalation of maritime enforcement in the Strait of Hormuz, with plans to physically board commercial vessels suspected of transporting Iranian oil in violation of sanctions.
            </p>

            <p className="mb-[18px] text-[15px] md:text-[15.5px] leading-[1.75] font-[family-name:var(--font-lora)] art-body-text">
              According to senior Pentagon officials familiar with the operation, the U.S. Navy will deploy additional surface combatants and special boarding teams to key chokepoints across the Persian Gulf. The move comes as tensions with Tehran reach their highest level in over a decade, and as sanctioned crude continues flowing to Chinese refiners through shadow fleet networks.
            </p>

            <h2 className="art-h2 text-[22px] md:text-[24px] font-extrabold tracking-[-0.6px] leading-[1.2] mb-3.5 mt-7 pt-2.5 relative font-[family-name:var(--font-display)]">
              <span className="absolute top-0 left-0 w-[30px] h-[2px] bg-gradient-to-r from-[#ff6a00] to-transparent" />
              What&apos;s driving the escalation
            </h2>

            <p className="mb-[18px] text-[15px] md:text-[15.5px] leading-[1.75] font-[family-name:var(--font-lora)] art-body-text">
              The announcement follows months of failed diplomatic efforts to curb Iran&apos;s use of obscure shipping routes and flag-of-convenience vessels. U.S. officials estimate that <strong className="art-heading font-semibold">over $30 billion in sanctioned oil</strong> has been delivered to Asian buyers since the start of 2025.
            </p>

            {/* Stat card */}
            <div className="art-stat-card rounded-[16px] p-5 my-6 flex items-center gap-4 relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.25)] to-transparent pointer-events-none" />
              <span className="absolute left-[-20%] top-[-20%] w-[40%] h-[140%] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,106,0,0.08),transparent 60%)", filter: "blur(20px)" }} />
              <div className="text-[36px] font-black font-[family-name:var(--font-data)] tracking-[-1.5px] leading-none flex-shrink-0 relative z-10"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ffaa44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                20%
              </div>
              <p className="text-[13px] art-sub-text leading-[1.5] font-medium relative z-10 font-[family-name:var(--font-display)]">
                of global oil trade passes through the <strong className="art-heading">Strait of Hormuz</strong> daily — any disruption has immediate ripple effects across energy and risk markets.
              </p>
            </div>

            <p className="mb-[18px] text-[15px] md:text-[15.5px] leading-[1.75] font-[family-name:var(--font-lora)] art-body-text">
              Historically, geopolitical flare-ups in oil-sensitive regions have produced correlated volatility across risk assets. Bitcoin, often framed as digital gold during such moments, tends to see mixed reactions — short-term selling as leverage unwinds, followed by inflows as investors seek non-sovereign alternatives.
            </p>

            <blockquote className="art-blockquote my-6 px-6 py-5 rounded-[16px] relative font-[family-name:var(--font-lora)] italic text-[15px] md:text-[16px] leading-[1.6]"
              style={{ background: "linear-gradient(135deg,rgba(255,106,0,0.06),rgba(255,106,0,0))", border: "0.5px solid rgba(255,106,0,0.18)", boxShadow: "0 0 16px rgba(255,106,0,0.03)" }}>
              <span className="absolute top-[-8px] left-3.5 font-[family-name:var(--font-display)] text-[56px] font-black text-[#ff6a00] leading-none not-italic" style={{ opacity: 0.6 }}>&ldquo;</span>
              When Hormuz heats up, every asset class gets a pricing reset within 48 hours. Crypto is no exception — the question is whether this time we see the safe-haven flow or the risk-off cascade.
              <span className="block mt-2.5 text-[11px] not-italic art-sub-text font-semibold font-[family-name:var(--font-display)]">— Marko Papic, Chief Strategist at BCA Research</span>
            </blockquote>

            <h2 className="art-h2 text-[22px] md:text-[24px] font-extrabold tracking-[-0.6px] leading-[1.2] mb-3.5 mt-7 pt-2.5 relative font-[family-name:var(--font-display)]">
              <span className="absolute top-0 left-0 w-[30px] h-[2px] bg-gradient-to-r from-[#ff6a00] to-transparent" />
              How markets are positioning
            </h2>

            {/* Market reaction */}
            <div className="art-market-card rounded-[16px] p-4 my-6 relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent pointer-events-none" />
              <div className="flex items-center gap-2 mb-3 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[var(--color-brand)] font-[family-name:var(--font-display)]">
                <TrendingUp size={13} className="text-[var(--color-brand)]" />
                Live market reaction
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "WTI Crude", val: "+3.4%", up: true },
                  { label: "Gold",      val: "+1.8%", up: true },
                  { label: "Bitcoin",   val: "-1.8%", up: false },
                  { label: "DXY",       val: "+0.6%", up: true },
                ].map((m) => (
                  <div key={m.label} className="art-market-cell rounded-[10px] px-3 py-2.5">
                    <div className="text-[9px] art-market-label uppercase tracking-[0.8px] font-bold mb-1">{m.label}</div>
                    <div className="text-[14px] font-extrabold font-[family-name:var(--font-data)] tracking-[-0.3px]"
                      style={{ color: m.up ? "var(--color-positive)" : "var(--color-negative)" }}>
                      {m.val} {m.up ? "▲" : "▼"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mb-[18px] text-[15px] md:text-[15.5px] leading-[1.75] font-[family-name:var(--font-lora)] art-body-text">
              Oil futures surged 3.4% on the news, while gold touched fresh highs. In crypto, <strong className="art-heading font-semibold">Bitcoin</strong> tested the $84K resistance zone before pulling back. Traders remain split on whether this marks the start of a safe-haven rotation or simply a short-lived spike.
            </p>

            <ul className="mb-[20px] ml-[22px] text-[15px] leading-[1.75] font-[family-name:var(--font-lora)] art-body-text" style={{ listStyleType: "disc" }}>
              <li className="mb-2 pl-2"><strong className="art-heading font-semibold">Oil:</strong> WTI crude up 3.4%, with Brent tracking similarly</li>
              <li className="mb-2 pl-2"><strong className="art-heading font-semibold">Gold:</strong> at multi-year highs above $2,780</li>
              <li className="mb-2 pl-2"><strong className="art-heading font-semibold">BTC:</strong> tested $84K before a 1.8% pullback on profit-taking</li>
              <li className="mb-2 pl-2"><strong className="art-heading font-semibold">DXY:</strong> strengthening on flight-to-safety flows</li>
            </ul>

            <h3 className="text-[17px] md:text-[18px] font-bold tracking-[-0.3px] mb-2.5 mt-5 art-heading font-[family-name:var(--font-display)]">
              What to watch next
            </h3>
            <p className="mb-[18px] text-[15px] md:text-[15.5px] leading-[1.75] font-[family-name:var(--font-lora)] art-body-text">
              The immediate flashpoint is whether Iranian naval forces will actively interdict any boarding attempts. Any direct confrontation would almost certainly cause a sharp spike in oil prices and force an immediate reassessment of risk premiums across global markets.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="rounded-[12px] p-4 mb-6 flex gap-2.5 items-start font-[family-name:var(--font-display)]"
            style={{ background: "rgba(255,106,0,0.04)", border: "0.5px solid rgba(255,106,0,0.12)" }}>
            <div className="w-[22px] h-[22px] rounded-[6px] bg-[rgba(255,106,0,0.12)] border border-[rgba(255,106,0,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle size={11} className="text-[var(--color-brand)]" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-[var(--color-brand)] uppercase tracking-[1.3px] mb-1">Disclaimer</div>
              <p className="text-[11px] art-sub-text leading-[1.55] font-medium">
                This content is for informational purposes only and does not constitute financial, investment, or legal advice. Cryptocurrency trading involves risk and may result in financial loss.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-[20px] p-7 mb-6 text-center relative overflow-hidden font-[family-name:var(--font-display)]"
            style={{ background: "linear-gradient(135deg,rgba(255,106,0,0.1),rgba(255,106,0,0.02))", border: "0.5px solid rgba(255,106,0,0.22)" }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent pointer-events-none" />
            <span className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[140%] h-[150%] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(255,106,0,0.12),transparent 60%)", filter: "blur(30px)" }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold text-[var(--color-brand)] px-2.5 py-1 rounded-full border border-[rgba(255,106,0,0.3)] bg-[rgba(255,106,0,0.05)] mb-3.5 uppercase tracking-[1.2px]">
                <span className="w-1 h-1 bg-[var(--color-brand)] rounded-full" />
                Exclusive partner offer
              </div>
              <h3 className="text-[20px] font-black tracking-[-0.6px] leading-[1.15] mb-2 art-heading">
                Start trading<br /><span className="gradient-text-alt">with BloFin today</span>
              </h3>
              <p className="text-[12px] art-sub-text font-medium mb-4 leading-[1.5]">Up to $500 sign-up bonus and zero-fee trading on your first 30 days.</p>
              <button className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[12px] text-[14px] font-extrabold text-black cursor-pointer transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 22px rgba(255,106,0,0.3),0 0 24px rgba(255,106,0,0.15),inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                Buy crypto now
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </button>
              <p className="text-[10px] art-sub-text font-medium mt-2.5">You will be redirected to <span className="text-[var(--color-brand)] font-bold">BloFin</span></p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {["#Geopolitics", "#OilMarkets", "#Iran", "#Bitcoin", "#SafeHaven"].map((tag) => (
              <span key={tag} className="art-tag-big text-[11px] font-semibold art-sub-text px-3.5 py-[7px] rounded-full cursor-pointer hover:text-[var(--color-brand)] hover:border-[rgba(255,106,0,0.2)] transition-all font-[family-name:var(--font-display)]">
                <span className="text-[var(--color-brand)] font-bold">#</span>{tag.slice(1)}
              </span>
            ))}
          </div>

          {/* Share bar */}
          <div className="art-share-bar rounded-[12px] p-3.5 flex items-center gap-2.5 mb-6 font-[family-name:var(--font-display)]">
            <span className="text-[10px] art-sub-text font-bold uppercase tracking-[1.2px] mr-auto">Share article</span>
            {[
              <path key="x" fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>,
              <path key="tg" fill="currentColor" d="M22.05 2.14L2.8 9.86c-1.32.53-1.3 1.27-.24 1.6l4.94 1.54 11.42-7.2c.54-.33 1.03-.15.63.21L10.3 14.35l-.36 5.1c.52 0 .75-.24 1.04-.52l2.5-2.43 5.2 3.85c.96.53 1.65.26 1.89-.89L23.9 3.4c.35-1.44-.56-2.1-1.85-1.26z"/>,
              <path key="em" d="M22 4l-10 9L2 4M2 4h20v16H2z" stroke="currentColor" strokeWidth="2" fill="none"/>,
              <path key="lk" d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>,
            ].map((icon, i) => (
              <button key={i} className="art-share-btn w-[34px] h-[34px] rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[rgba(255,106,0,0.08)] hover:border-[rgba(255,106,0,0.2)]">
                <svg width="13" height="13" viewBox="0 0 24 24" className="art-sub-text">{icon}</svg>
              </button>
            ))}
          </div>

          {/* Author bio */}
          <div className="art-bio-card rounded-[18px] p-5 mb-8 relative overflow-hidden font-[family-name:var(--font-display)]">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.2)] to-transparent pointer-events-none" />
            <span className="absolute top-[-30%] right-[-20%] w-[50%] h-[80%] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,106,0,0.08),transparent 70%)", filter: "blur(30px)" }} />
            <div className="text-[9px] font-extrabold text-[var(--color-brand)] uppercase tracking-[1.5px] mb-3 relative z-10">About the author</div>
            <div className="flex items-center gap-3 mb-3.5 relative z-10">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-[19px] font-extrabold text-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 16px rgba(255,106,0,0.3)" }}>
                TL
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold art-heading flex items-center gap-1.5">
                  Tristan Lodenberg
                  <span className="text-[#4a9eff] text-[12px]">✓</span>
                </div>
                <div className="text-[10px] text-[var(--color-brand)] uppercase font-bold tracking-[1px] mt-0.5">Senior market analyst</div>
              </div>
              <button className="px-4 py-2 rounded-[10px] text-[11px] font-extrabold text-black cursor-pointer transition-all flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 12px rgba(255,106,0,0.2),inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                + Follow
              </button>
            </div>
            <p className="text-[12px] art-sub-text leading-[1.55] font-medium mb-3.5 relative z-10">
              8+ years covering crypto markets, macro, and geopolitics. Previously at Decrypt and CoinDesk. Focused on the intersection of digital assets and traditional finance.
            </p>
            <div className="flex gap-3.5 pt-3 border-t art-border relative z-10">
              {[{ v: "142", l: "Articles" }, { v: "4.2K", l: "Followers" }, { v: "186K", l: "Reads" }].map((s) => (
                <div key={s.l}>
                  <div className="text-[14px] font-extrabold art-heading font-[family-name:var(--font-data)]">{s.v}</div>
                  <div className="text-[9px] art-sub-text uppercase font-bold tracking-[0.8px] mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-[2.5px] art-heading font-[family-name:var(--font-display)]">
              Related <span className="gradient-text-alt">posts</span>
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,106,0,0.25)] to-transparent" />
          </div>

          <RelCard tag="SOL" title="Solana gains 4% but range resistance still caps momentum as traders watch breakout signals"
            author="TL" time="30m" svgBg="#1a0e2d"
            svgPath="M0 70 L15 60 L30 65 L45 50 L60 55 L75 40 L90 45 L110 30" pathColor="#b16aff" />
          <RelCard tag="BTC" title="Bitcoin safe-haven narrative strengthens as global tensions rise across multiple regions"
            author="TL" time="2h" svgBg="#2d1a05"
            svgPath="M0 80 L15 72 L30 75 L45 55 L60 60 L75 40 L90 35 L110 25" pathColor="#ff6a00" />
          <RelCard tag="BTC" title="Trump administration signals softer crypto stance ahead of key SEC leadership change"
            author="TL" time="5h" svgBg="#4d0a2a"
            svgPath="M0 80 L20 70 L40 75 L60 55 L80 60 L110 40" pathColor="#ff6eb4" />

        </div>
      </div>
    </>
  );
}

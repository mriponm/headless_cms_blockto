import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";
import SignalFeedScroll from "./SignalFeedScroll";
import {
  Check, ChevronRight, Zap, Shield, BarChart3,
  Clock, Users, Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trading",
  description:
    "Join the official Blockto Trading Telegram channel. Real-time setups, institutional-grade analysis, and trade alongside 4,000+ members.",
};

/* ─── Telegram SVG ───────────────────────────────────────────── */
function TelegramIcon({ size = 18, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M22.05 2.14L2.8 9.86c-1.32.53-1.3 1.27-.24 1.6l4.94 1.54 11.42-7.2c.54-.33 1.03-.15.63.21L10.3 14.35l-.36 5.1c.52 0 .75-.24 1.04-.52l2.5-2.43 5.2 3.85c.96.53 1.65.26 1.89-.89L23.9 3.4c.35-1.44-.56-2.1-1.85-1.26z" />
    </svg>
  );
}

/* ─── Features ───────────────────────────────────────────────── */
const FEATURES = [
  { Icon: Zap,      title: "Real-time signals",   desc: "Instant notifications for entry prices, stop losses, and take profit targets based on technical and on-chain analysis." },
  { Icon: Shield,   title: "Risk management",     desc: "We don't just give levels. We teach position sizing, leverage management, and capital preservation strategies." },
  { Icon: BarChart3,title: "Expert human analysis",desc: "Our analysts manually scan the market 24/7, verifying every setup to ensure high-precision entries. No noisy bots." },
  { Icon: Clock,    title: "24/7 admin support",  desc: "Questions about a setup? Our admins are active around the clock to help you understand every trade before you take it." },
];

const CHECKLIST = [
  "Clear entry & exit zones",
  "Chart analysis screenshots",
  "Reasoning & thesis per trade",
  "24/7 admin support",
  "Weekly market outlook",
];

/* ─── Feed messages ──────────────────────────────────────────── */
type SignalMsg = {
  kind: "signal";
  id: string;
  pair: string;
  dir: "BUY" | "SELL";
  lev: string;
  entry: string;
  stop: string;
  tps: string[];
  views: number;
  time: string;
};
type ClosedMsg = {
  kind: "closed";
  id: string;
  pair: string;
  result: string;
  note: string;
  views: number;
  time: string;
};
type FeedMsg = SignalMsg | ClosedMsg;

const FEED: FeedMsg[] = [
  { kind: "signal", id: "m1", pair: "QNTUSDT",  dir: "BUY",  lev: "3x", entry: "76.39",    stop: "73.36",    tps: ["78.00", "83.00", "90.00"],          views: 610,  time: "12:04 AM" },
  { kind: "closed", id: "m2", pair: "ETHUSDT",  result: "+38%", note: "TP2 hit",             views: 1240, time: "9:31 AM" },
  { kind: "signal", id: "m3", pair: "BTCUSDT",  dir: "BUY",  lev: "2x", entry: "84,200",   stop: "82,000",   tps: ["87,000", "91,000", "96,000"],        views: 890,  time: "8:15 AM"  },
  { kind: "signal", id: "m4", pair: "SOLUSDT",  dir: "SELL", lev: "2x", entry: "134.50",   stop: "138.00",   tps: ["128.00", "120.00", "112.00"],        views: 445,  time: "7:02 AM"  },
  { kind: "closed", id: "m5", pair: "QNTUSDT",  result: "+52%", note: "TP3 hit",            views: 730,  time: "Yesterday" },
  { kind: "signal", id: "m6", pair: "LINKUSDT", dir: "BUY",  lev: "3x", entry: "14.80",    stop: "13.90",    tps: ["16.00", "18.50", "22.00"],           views: 320,  time: "Yesterday" },
  { kind: "signal", id: "m7", pair: "BNBUSDT",  dir: "BUY",  lev: "2x", entry: "578.00",   stop: "560.00",   tps: ["600.00", "625.00", "660.00"],        views: 512,  time: "2 days ago" },
  { kind: "closed", id: "m8", pair: "BTCUSDT",  result: "+29%", note: "TP2 hit",            views: 2100, time: "2 days ago" },
];

/* ─── Single feed message render ────────────────────────────── */
function SignalBubble({ msg }: { msg: FeedMsg }) {
  if (msg.kind === "closed") {
    return (
      <div className="sig-row-border px-[18px] py-[14px]">
        <div
          className="rounded-[12px] p-[14px] flex items-start gap-3"
          style={{ background: "rgba(0,212,123,0.06)", border: "0.5px solid rgba(0,212,123,0.15)" }}
        >
          <span
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-black"
            style={{ background: "linear-gradient(135deg,#00d47b,#00a862)", boxShadow: "0 0 10px rgba(0,212,123,0.3)" }}
          >
            <Check size={13} strokeWidth={3} color="#000" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold mb-0.5 font-[family-name:var(--font-display)]" style={{ color: "#00d47b" }}>
              Trade Closed — {msg.pair}
            </div>
            <div className="text-[20px] font-black tracking-[-0.5px] font-[family-name:var(--font-data)]" style={{ color: "#00d47b" }}>
              {msg.result}
            </div>
            <div className="text-[11px] font-medium mt-0.5" style={{ color: "#666" }}>{msg.note}</div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#444" }}>
              <Eye size={10} />
              {msg.views}
            </div>
            <div className="text-[10px] font-[family-name:var(--font-data)]" style={{ color: "#444" }}>{msg.time}</div>
          </div>
        </div>
      </div>
    );
  }

  const dirColor = msg.dir === "BUY" ? "#00d47b" : "#ff3b4f";

  return (
    <div className="sig-row-border px-[18px] py-[14px]">
      <div className="sig-bubble">

        {/* header row */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span
            className="text-[9px] font-extrabold text-black px-1.5 py-0.5 rounded-[5px] font-[family-name:var(--font-data)] tracking-[0.3px]"
            style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)" }}
          >
            Signal
          </span>
          <span className="text-[12px] font-extrabold header-brand-text font-[family-name:var(--font-display)]">
            Trading signal alert
          </span>
        </div>

        {/* order + leverage */}
        <div className="flex items-center gap-2 mb-1.5 text-[12px]">
          <span className="trading-sig-key font-semibold w-[90px] flex-shrink-0">Order</span>
          <span className="font-bold font-[family-name:var(--font-data)] text-[13px]" style={{ color: dirColor }}>
            {msg.dir} {msg.pair}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-[12px]">
          <span className="trading-sig-key font-semibold w-[90px] flex-shrink-0">Leverage</span>
          <span className="font-bold font-[family-name:var(--font-data)] text-[13px]" style={{ color: "#ff6a00" }}>
            {msg.lev}
          </span>
        </div>

        <div className="h-px mb-2" style={{ background: "var(--color-border)" }} />

        {/* entry + stop */}
        {[
          { dot: "#4a9eff", shadow: "rgba(74,158,255,0.5)",  label: "Entry zone", value: msg.entry, color: null },
          { dot: "#ff3b4f", shadow: "rgba(255,59,79,0.5)",   label: "Stop loss",  value: msg.stop,  color: "#ff3b4f" },
        ].map(({ dot, shadow, label, value, color }) => (
          <div key={label} className="flex items-center gap-2 py-1 text-[12px]">
            <span className="trading-sig-key font-semibold w-[90px] flex-shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: dot, boxShadow: `0 0 5px ${shadow}`, flexShrink: 0 }} />
              {label}
            </span>
            <span className="font-bold font-[family-name:var(--font-data)] text-[13px] trading-sig-value" style={color ? { color } : undefined}>
              {value}
            </span>
          </div>
        ))}

        <div className="h-px my-2" style={{ background: "var(--color-border)" }} />

        {/* take profits */}
        {msg.tps.map((tp, i) => (
          <div key={i} className="flex items-center gap-2 py-1 text-[12px]">
            <span className="trading-sig-key font-semibold w-[90px] flex-shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: "#00d47b", boxShadow: "0 0 5px rgba(0,212,123,0.5)", flexShrink: 0 }} />
              TP {i + 1}
            </span>
            <span className="font-bold font-[family-name:var(--font-data)] text-[13px]" style={{ color: "#00d47b" }}>{tp}</span>
          </div>
        ))}

        {/* footer */}
        <div
          className="flex items-center justify-between mt-2.5 pt-2.5 text-[10px] font-semibold"
          style={{ borderTop: "0.5px solid var(--color-border)", color: "#555" }}
        >
          <div className="flex items-center gap-1"><Eye size={11} />{msg.views} views</div>
          <span className="font-[family-name:var(--font-data)]">{msg.time}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Animated signal feed ───────────────────────────────────── */
function SignalFeed() {
  const doubled = [...FEED, ...FEED];

  return (
    <div className="trading-sig-card relative rounded-[18px] overflow-hidden flex flex-col" style={{ height: "460px" }}>
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10" />

      {/* channel header */}
      <div
        className="sig-sticky-bar flex items-center gap-3 px-[18px] py-[14px] flex-shrink-0 relative z-10 sig-row-border"
      >
        <div
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center font-black text-[18px] text-black flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 14px rgba(255,106,0,0.3)" }}
        >
          B
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold header-brand-text flex items-center gap-1.5 font-[family-name:var(--font-display)] tracking-[-0.3px]">
            Blockto Trading <span style={{ color: "#4a9eff" }}>✓</span>
          </div>
          <div className="text-[11px] trading-sig-sub font-medium mt-0.5 font-[family-name:var(--font-data)]">
            4,030 subscribers
          </div>
        </div>
        <div
          className="text-[9px] font-extrabold px-2.5 py-1.5 rounded-[6px] flex items-center gap-1.5 font-[family-name:var(--font-data)] tracking-[0.5px] flex-shrink-0"
          style={{ color: "#00d47b", border: "0.5px solid rgba(0,212,123,0.25)", background: "rgba(0,212,123,0.08)" }}
        >
          <span className="w-1 h-1 rounded-full pulse-anim" style={{ background: "#00d47b", boxShadow: "0 0 6px #00d47b" }} />
          LIVE
        </div>
      </div>

      {/* scrolling feed — client component handles rAF auto-scroll */}
      <div className="relative flex-1 min-h-0">
        {/* top fade overlay */}
        <div className="sig-fade-top absolute inset-x-0 top-0 h-16 pointer-events-none z-10" />
        {/* bottom fade overlay */}
        <div className="sig-fade-bottom absolute inset-x-0 bottom-0 h-20 pointer-events-none z-10" />
        <SignalFeedScroll>
          {doubled.map((msg, i) => (
            <SignalBubble key={`${msg.id}-${i}`} msg={msg} />
          ))}
        </SignalFeedScroll>
      </div>

      {/* join CTA */}
      <div className="sig-sticky-bar px-[18px] py-[14px] flex-shrink-0 relative z-10" style={{ borderTop: "0.5px solid var(--color-border)" }}>
        <a
          href="#"
          className="w-full py-[13px] rounded-[12px] font-extrabold text-[14px] text-white flex items-center justify-center gap-2.5 cursor-pointer font-[family-name:var(--font-display)] transition-all duration-200 hover:-translate-y-[1px] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#229ED9,#1a7fb0)",
            boxShadow: "0 6px 20px rgba(34,158,217,0.3),inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <TelegramIcon size={16} />
          Join Channel
          <ChevronRight size={14} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function TradingPage() {
  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-4">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <section
          className="relative rounded-[22px] overflow-hidden mb-[14px] text-center px-5 py-[28px] md:py-[40px]"
          style={{
            background: "linear-gradient(160deg,rgba(255,106,0,0.12),rgba(255,106,0,0.02) 40%,rgba(0,0,0,0))",
            border: "0.5px solid rgba(255,106,0,0.18)",
          }}
        >
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.5)] to-transparent" />
          <span className="absolute -top-[30%] -left-[10%] w-[80%] h-[80%] pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,106,0,0.18),transparent 70%)", filter: "blur(40px)" }} />
          <div className="relative z-[1]">
            <div
              className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[1.5px] mb-[18px]"
              style={{ color: "#ff6a00", padding: "5px 12px", borderRadius: "20px", border: "0.5px solid rgba(255,106,0,0.3)", background: "rgba(255,106,0,0.08)" }}
            >
              <span className="w-[5px] h-[5px] rounded-full pulse-anim" style={{ background: "#ff6a00", boxShadow: "0 0 8px #ff6a00" }} />
              Live trading community
            </div>
            <h1 className="text-[34px] md:text-[46px] font-black tracking-[-1.5px] leading-[1.05] mb-0 font-[family-name:var(--font-league-spartan)] header-brand-text">
              Trade together.<br />
              <span className="gradient-text-alt">Win together.</span>
            </h1>
            <p className="text-[13px] md:text-[15px] buy-ex-desc leading-[1.55] font-medium max-w-[360px] mx-auto mt-[14px] mb-[22px]">
              Join the official Blockto.io Trading Telegram channel. Real-time setups,
              institutional-grade analysis, and trade alongside 4,000+ members.
            </p>
            <div className="flex flex-col gap-[10px] max-w-[360px] mx-auto">
              <a
                href="#"
                className="w-full py-[16px] rounded-[14px] font-extrabold text-[15px] text-white flex items-center justify-center gap-2.5 cursor-pointer font-[family-name:var(--font-display)] transition-all duration-200 hover:-translate-y-[1px] relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#229ED9,#1a7fb0)",
                  boxShadow: "0 8px 24px rgba(34,158,217,0.3),0 0 30px rgba(34,158,217,0.15),inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <TelegramIcon size={18} />
                Join Telegram channel
                <ChevronRight size={16} strokeWidth={2.5} />
              </a>
              <a href="#" className="w-full py-[14px] rounded-[14px] text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer btn-secondary-buy font-[family-name:var(--font-display)]">
                <BarChart3 size={14} strokeWidth={2} />
                View performance history
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-2 mt-[18px]">
              {[
                { Icon: Users,  label: "4,030 members" },
                { Icon: Check,  label: "Verified signals" },
                { Icon: Shield, label: "2-year track record" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#888" }}>
                  <Icon size={13} color="#ff6a00" strokeWidth={2} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── Stats ────────────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
          {[
            { label: "Win rate", value: "78%",   sub: "Last 90 days", accent: true,  color: null },
            { label: "Avg ROI",  value: "+142%", sub: "Per month",    accent: false, color: "#00d47b" },
            { label: "Signals",  value: "1,284", sub: "Published",    accent: false, color: null },
          ].map(({ label, value, sub, accent, color }) => (
            <div key={label} className="glass relative overflow-hidden rounded-[14px] py-[14px] px-2.5 text-center">
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <div className="text-[9px] font-bold uppercase tracking-[0.8px] buy-stat-label mb-1">{label}</div>
              <div
                className={`text-[22px] font-black tracking-[-0.5px] leading-none font-[family-name:var(--font-data)] ${accent ? "gradient-text-alt" : ""}`}
                style={color ? { color } : undefined}
              >
                {value}
              </div>
              <div className="text-[9px] buy-stat-sub mt-1 font-semibold">{sub}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Why join us ──────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-3 mt-[22px] px-1">
        <span className="text-[10px] font-extrabold uppercase tracking-[2.5px] gradient-text-alt font-[family-name:var(--font-display)]">Why join us</span>
        <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,106,0,0.2),transparent)" }} />
      </div>
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] mb-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="glass relative overflow-hidden rounded-[16px] p-5 card-hover">
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <div className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center mb-[14px]"
                style={{ background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.2)", boxShadow: "0 0 20px rgba(255,106,0,0.1)" }}>
                <Icon size={22} color="#ff6a00" strokeWidth={2} style={{ filter: "drop-shadow(0 0 6px rgba(255,106,0,0.4))" }} />
              </div>
              <h3 className="text-[16px] font-extrabold tracking-[-0.3px] mb-2 header-brand-text font-[family-name:var(--font-display)]">{title}</h3>
              <p className="text-[13px] trading-feat-txt leading-[1.55] font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Checklist + Live feed ─────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-3 mt-[22px] px-1">
        <span className="text-[10px] font-extrabold uppercase tracking-[2.5px] gradient-text-alt font-[family-name:var(--font-display)]">What you get inside</span>
        <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,106,0,0.2),transparent)" }} />
      </div>
      <FadeIn delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px] mb-4">

          {/* Checklist */}
          <div className="trading-check-card relative rounded-[18px] overflow-hidden p-6 md:p-7">
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />
            <h2 className="text-[26px] font-black tracking-[-1px] leading-[1.1] mb-[18px] font-[family-name:var(--font-display)] header-brand-text">
              What it looks <span className="gradient-text-alt">like inside</span>
            </h2>
            <div className="flex flex-col">
              {CHECKLIST.map((item, i) => (
                <div key={item} className="flex items-center gap-3 py-[10px]"
                  style={{ borderBottom: i < CHECKLIST.length - 1 ? "0.5px solid var(--color-border)" : "none" }}>
                  <span className="w-6 h-6 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#00d47b,#00a862)", boxShadow: "0 0 10px rgba(0,212,123,0.2)" }}>
                    <Check size={12} strokeWidth={3} color="#000" />
                  </span>
                  <span className="text-[14px] font-semibold trading-check-txt tracking-[-0.2px]">{item}</span>
                </div>
              ))}
            </div>
            <a href="#"
              className="mt-[20px] w-full py-[14px] rounded-[12px] font-extrabold text-[14px] text-black flex items-center justify-center gap-2 cursor-pointer font-[family-name:var(--font-display)] transition-all duration-200 hover:-translate-y-[1px]"
              style={{
                background: "linear-gradient(135deg,#ff6a00,#ff8a30)",
                boxShadow: "0 8px 24px rgba(255,106,0,0.3),0 0 20px rgba(255,106,0,0.15),inset 0 1px 0 rgba(255,255,255,0.2)",
                letterSpacing: "0.3px",
              }}
            >
              <TelegramIcon size={14} color="#000" />
              Join now — it&apos;s free
            </a>
          </div>

          {/* Animated signal feed */}
          <SignalFeed />
        </div>
      </FadeIn>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <FadeIn delay={0.2}>
        <div className="trading-final-cta relative rounded-[20px] overflow-hidden py-[28px] px-5 text-center mt-[20px] mb-[10px]">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent" />
          <span className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[140%] h-[150%] pointer-events-none"
            style={{ background: "radial-gradient(ellipse,rgba(255,106,0,0.12),transparent 60%)", filter: "blur(30px)" }} />
          <div className="relative z-[1]">
            <h3 className="text-[22px] font-black tracking-[-0.5px] leading-[1.15] mb-2 font-[family-name:var(--font-display)] header-brand-text">
              Ready to <span className="gradient-text-alt">trade smarter?</span>
            </h3>
            <p className="text-[12px] buy-ex-desc font-medium mb-[18px]">Join 4,030+ traders getting daily setups</p>
            <a href="#"
              className="inline-flex items-center justify-center gap-2.5 py-[16px] px-8 rounded-[14px] font-extrabold text-[15px] text-white cursor-pointer font-[family-name:var(--font-display)] transition-all duration-200 hover:-translate-y-[1px] relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#229ED9,#1a7fb0)",
                boxShadow: "0 8px 24px rgba(34,158,217,0.3),0 0 30px rgba(34,158,217,0.15),inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <TelegramIcon size={18} />
              Join Telegram channel
              <ChevronRight size={16} strokeWidth={2.5} />
            </a>
            <p className="text-[10px] mt-[14px] font-semibold" style={{ color: "#555" }}>
              Free forever &bull; No spam &bull; Leave anytime
            </p>
          </div>
        </div>
      </FadeIn>

    </div>
  );
}

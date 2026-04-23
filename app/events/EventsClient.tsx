"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter, Star, Bitcoin, Calendar, ChevronDown, Clock, ExternalLink } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import type { Impact, MacroEvent, CryptoEvent, AnyEvent, DayData } from "./types";

/* ─── Countdown hook ─────────────────────────────────────────── */
function useCountdown(eventTime: string, eventDate: Date) {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const [h, m] = eventTime.split(":").map(Number);
      const target = new Date(eventDate);
      target.setHours(h, m, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setDisplay(null); return; }
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor((diff % 3600000) / 60000);
      const ss = Math.floor((diff % 60000) / 1000);
      setDisplay(hh > 0 ? `${hh}h ${String(mm).padStart(2, "0")}m` : `${mm}m ${String(ss).padStart(2, "0")}s`);
    };
    compute();
    const t = setInterval(compute, 1000);
    return () => clearInterval(t);
  }, [eventTime, eventDate]);

  return display;
}

/* ─── Event status helper ────────────────────────────────────── */
function getStatus(time: string, dayDate: Date): "upcoming" | "live" | "past" | "other" {
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const evDay = new Date(dayDate); evDay.setHours(0, 0, 0, 0);
  if (evDay.getTime() !== today.getTime()) return "other";
  const [h, m] = time.split(":").map(Number);
  const evTime = new Date(); evTime.setHours(h, m, 0, 0);
  const diffMin = (evTime.getTime() - now.getTime()) / 60000;
  if (diffMin > 1)    return "upcoming";
  if (diffMin >= -15) return "live";
  return "past";
}

/* ─── Impact bars ────────────────────────────────────────────── */
function ImpactBars({ level }: { level: Impact }) {
  const color = level === "high" ? "#ff3b4f" : level === "med" ? "#ff6a00" : "#00d47b";
  const glow  = level === "high" ? "rgba(255,59,79,0.4)" : level === "med" ? "rgba(255,106,0,0.4)" : "rgba(0,212,123,0.35)";
  const active = level === "high" ? 3 : level === "med" ? 2 : 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ width: 3, height: 10, borderRadius: 1, background: n <= active ? color : "#2a2a2a", boxShadow: n <= active ? `0 0 4px ${glow}` : "none" }} />
      ))}
    </div>
  );
}

/* ─── Country flags via flagcdn.com ─────────────────────────── */
function CountryFlag({ code }: { code: string }) {
  const lower = code.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${lower}.png`}
      alt={code.toUpperCase()}
      title={code.toUpperCase()}
      width={22}
      height={15}
      style={{ borderRadius: 3, flexShrink: 0, objectFit: "cover", display: "inline-block", boxShadow: "0 0 0 0.5px rgba(255,255,255,0.15)" }}
    />
  );
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status, countdown }: { status: "upcoming" | "live" | "past" | "other"; countdown: string | null }) {
  if (status === "live") return (
    <span style={{ fontSize: 8, fontWeight: 800, color: "#00d47b", background: "rgba(0,212,123,0.1)", border: "0.5px solid rgba(0,212,123,0.3)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d47b", boxShadow: "0 0 6px #00d47b", animation: "pls 1.5s infinite" }} />
      Live
    </span>
  );
  if (status === "upcoming") return (
    <span style={{ fontSize: 8, fontWeight: 800, color: "#ff6a00", background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.3)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Clock size={8} style={{ flexShrink: 0 }} />
      {countdown ?? "Upcoming"}
    </span>
  );
  if (status === "past") return (
    <span style={{ fontSize: 8, fontWeight: 700, color: "#555", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
      Released
    </span>
  );
  return null;
}

/* ─── Expanded detail section ────────────────────────────────── */
function ExpandedDetail({ ev, isOpen }: { ev: AnyEvent; isOpen: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.28s ease" }}>
      <div style={{ overflow: "hidden" }}>
        <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "0 0 14px" }} />

        {ev.kind === "macro" && ev.affected && ev.affected.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }} className="ev-cell-label">
              Affected assets
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {ev.affected.map((a) => (
                <span key={a} style={{ fontSize: 10, fontWeight: 700, color: "#ff6a00", background: "rgba(255,106,0,0.08)", border: "0.5px solid rgba(255,106,0,0.2)", padding: "2px 8px", borderRadius: 5, fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {ev.history && ev.history.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }} className="ev-cell-label">
              Historical data
            </div>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(255,255,255,0.04)", padding: "7px 12px" }}>
                {["Period", "Actual", "Forecast"].map((h) => (
                  <div key={h} style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }} className="ev-cell-label">{h}</div>
                ))}
              </div>
              {ev.history.map((row, i) => (
                <div key={i} className="ev-data-cell" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 12px", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-jetbrains-mono,monospace)" }} className="ev-cell-label">{row.date}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono,monospace)" }} className="ev-cell-val">{row.actual}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-jetbrains-mono,monospace)" }} className="ev-cell-label">{row.forecast ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ev.kind === "crypto" && ev.links && ev.links.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ev.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#ff6a00", background: "rgba(255,106,0,0.08)", border: "0.5px solid rgba(255,106,0,0.2)", padding: "5px 10px", borderRadius: 7, textDecoration: "none", transition: "opacity 0.15s" }}
              >
                <ExternalLink size={10} />
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Macro card ─────────────────────────────────────────────── */
function MacroCard({ ev, dayDate, expanded, onToggle }: { ev: MacroEvent; dayDate: Date; expanded: boolean; onToggle: () => void }) {
  const status    = getStatus(ev.time, dayDate);
  const countdown = useCountdown(ev.time, dayDate);
  const isUpcoming = status === "upcoming";
  const isLive     = status === "live";

  const cardBg = ev.important
    ? "linear-gradient(135deg,rgba(255,59,79,0.06),rgba(255,106,0,0.02))"
    : "rgba(255,255,255,0.03)";
  const cardBorder = isLive
    ? "0.5px solid rgba(0,212,123,0.3)"
    : isUpcoming
    ? "0.5px solid rgba(255,106,0,0.2)"
    : ev.important
    ? "0.5px solid rgba(255,106,0,0.15)"
    : "0.5px solid rgba(255,255,255,0.06)";

  return (
    <div
      className={`ev-card-wrap card-hover ${ev.important ? "ev-card-important-wrap" : ""}`}
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      style={{ padding: "14px 16px", borderRadius: 14, marginBottom: 8, cursor: "pointer", position: "relative", overflow: "hidden", background: cardBg, border: cardBorder, transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxShadow: isLive ? "0 0 0 1px rgba(0,212,123,0.15),0 0 20px rgba(0,212,123,0.06)" : isUpcoming ? "0 0 16px rgba(255,106,0,0.08)" : "none" }}
    >
      <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)", pointerEvents: "none" }} />
      {(() => {
        const impactColor = ev.impact === "high" ? "#ff3b4f" : ev.impact === "med" ? "#f5c518" : "#00d47b";
        const impactGlow  = ev.impact === "high" ? "rgba(255,59,79,0.7)" : ev.impact === "med" ? "rgba(245,197,24,0.7)" : "rgba(0,212,123,0.7)";
        return (
          <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, background: impactColor, borderRadius: "0 2px 2px 0", boxShadow: `0 0 ${isUpcoming ? 12 : 8}px ${impactGlow}` }} />
        );
      })()}

      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span className="ev-time" style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.3px", minWidth: 48 }}>{ev.time}</span>
        <CountryFlag code={ev.countryCode} />
        <span className="ev-country" style={{ fontSize: 12, fontWeight: 600 }}>{ev.country}</span>
        {ev.important && (
          <span style={{ fontSize: 8, fontWeight: 800, color: "#ff6a00", background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.2)", padding: "2px 7px", borderRadius: 5, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
            Important
          </span>
        )}
        <StatusBadge status={status} countdown={countdown} />
        <ImpactBars level={ev.impact} />
        <ChevronDown size={13} style={{ color: "#555", flexShrink: 0, transition: "transform 0.25s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", marginLeft: 2 }} />
      </div>

      {/* title */}
      <div className="ev-title" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px", marginBottom: 10, lineHeight: 1.3 }}>{ev.title}</div>

      {/* description — 2-line preview, full when expanded */}
      {ev.description && (
        <p className="ev-detail-desc" style={{ fontSize: 12, lineHeight: 1.6, fontWeight: 500, marginBottom: 12, opacity: 0.75, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: expanded ? "unset" : 2 }}>
          {ev.description}
        </p>
      )}

      {/* countdown bar for upcoming events */}
      {isUpcoming && countdown && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 12px", borderRadius: 10, background: "rgba(255,106,0,0.06)", border: "0.5px solid rgba(255,106,0,0.15)" }}>
          <Clock size={12} style={{ color: "#ff6a00", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#ff6a00", fontFamily: "var(--font-jetbrains-mono,monospace)" }}>Starts in {countdown}</span>
        </div>
      )}

      {/* data grid: actual / forecast / previous */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.03)", borderRadius: 10, overflow: "hidden" }}>
        {[
          { label: "Actual",   value: ev.actual,   trend: ev.actual && ev.forecast ? (parseFloat(ev.actual) >= parseFloat(ev.forecast) ? "up" : "dn") : null },
          { label: "Forecast", value: ev.forecast, trend: null },
          { label: "Previous", value: ev.previous, trend: null },
        ].map(({ label, value, trend }) => (
          <div key={label} className="ev-data-cell" style={{ padding: "9px 11px" }}>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 3 }} className="ev-cell-label">{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono,monospace)", display: "flex", alignItems: "center", gap: 3, color: trend === "up" ? "#00d47b" : trend === "dn" ? "#ff3b4f" : undefined }} className={!trend ? "ev-cell-val" : ""}>
              {value ?? "—"}
              {trend === "up" && <span style={{ fontSize: 10 }}>▲</span>}
              {trend === "dn" && <span style={{ fontSize: 10 }}>▼</span>}
            </div>
          </div>
        ))}
      </div>

      {/* expanded: historical data only */}
      <ExpandedDetail ev={ev} isOpen={expanded} />
    </div>
  );
}

/* ─── Crypto card ────────────────────────────────────────────── */
function CryptoCard({ ev, dayDate, expanded, onToggle }: { ev: CryptoEvent; dayDate: Date; expanded: boolean; onToggle: () => void }) {
  const status    = getStatus(ev.time, dayDate);
  const countdown = useCountdown(ev.time, dayDate);

  return (
    <div
      className="ev-card-wrap ev-card-crypto-wrap card-hover"
      onClick={onToggle}
      role="button"
      aria-expanded={expanded}
      style={{ padding: "14px 16px", borderRadius: 14, marginBottom: 8, cursor: "pointer", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(255,106,0,0.08),rgba(0,0,0,0))", border: "0.5px solid rgba(255,106,0,0.2)" }}
    >
      <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,106,0,0.15),transparent)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span className="ev-time" style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.3px", minWidth: 48 }}>{ev.time}</span>
        <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, background: ev.platformBg, color: ev.platformColor, boxShadow: "0 0 8px rgba(255,106,0,0.3)" }}>
          {ev.platformSymbol}
        </div>
        <span className="ev-country" style={{ fontSize: 12, fontWeight: 600 }}>{ev.platform}</span>
        <span style={{ fontSize: 8, fontWeight: 800, color: "#000", background: "linear-gradient(135deg,#ff6a00,#ff8a30)", padding: "3px 8px", borderRadius: 5, letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono,monospace)", boxShadow: "0 0 10px rgba(255,106,0,0.2)" }}>
          {ev.badge}
        </span>
        <StatusBadge status={status} countdown={countdown} />
        <ChevronDown size={13} style={{ color: "#ff6a00", opacity: 0.6, flexShrink: 0, marginLeft: "auto", transition: "transform 0.25s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>

      <div className="ev-title" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px", marginBottom: 12, lineHeight: 1.3 }}>{ev.title}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,106,0,0.05)", borderRadius: 10, overflow: "hidden" }}>
        {ev.fields.map(({ label, value, color }) => (
          <div key={label} className="ev-data-cell" style={{ padding: "9px 11px" }}>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 3 }} className="ev-cell-label">{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono,monospace)", color: color ?? undefined }} className={!color ? "ev-cell-val" : ""}>{value}</div>
          </div>
        ))}
      </div>

      <ExpandedDetail ev={ev} isOpen={expanded} />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function EventsClient({ days, todayIdx }: { days: DayData[]; todayIdx: number }) {
  const [selectedIdx, setSelectedIdx]   = useState(todayIdx);
  const [activeFilter, setActiveFilter] = useState<"all" | "important" | "high">("all");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [showPast, setShowPast]         = useState(false);
  const [limit, setLimit]               = useState(10);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const day     = days[selectedIdx] ?? days[0];
  const dayDate = new Date(day.year, day.month, day.date);

  const isToday = selectedIdx === todayIdx;

  const handleDayChange    = (i: number) => { setSelectedIdx(i); setExpandedId(null); setShowPast(false); setLimit(10); };
  const handleFilterChange = (f: "all" | "important" | "high") => { setActiveFilter(f); setExpandedId(null); setLimit(10); };

  const isPastEvent = (ev: AnyEvent) => {
    if (!isToday) return false;
    const now = new Date();
    const [h, m] = ev.time.split(":").map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    return t.getTime() < now.getTime() - 15 * 60000;
  };

  const filtered = day.events.filter((ev: AnyEvent) => {
    if (activeFilter === "important") return ev.kind === "macro" && (ev as MacroEvent).important;
    if (activeFilter === "high")      return ev.kind === "macro" && (ev as MacroEvent).impact === "high";
    return true;
  });

  const pastCount     = isToday ? filtered.filter(isPastEvent).length : 0;
  const activeEvents  = filtered.filter((ev) => showPast || !isPastEvent(ev));
  const visibleEvents = activeEvents.slice(0, limit);
  const hasMore       = activeEvents.length > limit;

  const counts = {
    all:       day.events.length,
    important: day.events.filter((e: AnyEvent) => e.kind === "macro" && (e as MacroEvent).important).length,
    high:      day.events.filter((e: AnyEvent) => e.kind === "macro" && (e as MacroEvent).impact === "high").length,
  };

  const todayDay       = days[todayIdx];
  const totalWeek      = days.reduce((s: number, d: DayData) => s + d.events.length, 0);
  const totalHighToday = todayDay?.events.filter((e: AnyEvent) => e.kind === "macro" && (e as MacroEvent).impact === "high").length ?? 0;
  const totalUpcoming  = todayDay?.events.filter((e: AnyEvent) => {
    const now = new Date();
    const [h, m] = e.time.split(":").map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    return t > now;
  }).length ?? 0;

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-4">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <section className="relative rounded-[20px] overflow-hidden mb-[14px] px-5 py-[24px]"
          style={{ background: "linear-gradient(135deg,rgba(255,106,0,0.12),rgba(255,106,0,0.02) 40%,rgba(0,0,0,0))", border: "0.5px solid rgba(255,106,0,0.15)" }}>
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent" />
          <span className="absolute -top-[40%] -right-[20%] w-[60%] h-[80%] pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,106,0,0.15),transparent 70%)", filter: "blur(30px)" }} />
          <div className="relative z-[1]">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[1.5px] mb-[14px]"
              style={{ color: "#ff6a00", padding: "5px 12px", borderRadius: 20, border: "0.5px solid rgba(255,106,0,0.3)", background: "rgba(255,106,0,0.08)" }}>
              <span className="w-[5px] h-[5px] rounded-full pls-anim" style={{ background: "#ff6a00", boxShadow: "0 0 8px #ff6a00" }} />
              Live calendar
            </div>
            <h1 className="text-[28px] md:text-[34px] font-black tracking-[-1px] leading-[1.1] mb-2.5 font-[family-name:var(--font-league-spartan)] header-brand-text">
              Crypto events calendar
            </h1>
            <p className="text-[13px] buy-ex-desc leading-[1.5] font-medium max-w-[440px]">
              Upcoming crypto events, listings, launches, and macro market dates. Click any event for full details.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* ── Stats ────────────────────────────────────────────── */}
      <FadeIn delay={0.04}>
        <div className="grid grid-cols-4 gap-2 mb-[14px]">
          {[
            { label: "Today",       value: String(todayDay?.events.length ?? 0), sub: "events",    accent: true,  color: null },
            { label: "This week",   value: String(totalWeek),                    sub: "scheduled", accent: false, color: null },
            { label: "High impact", value: String(totalHighToday),               sub: "today",     accent: false, color: "#ff3b4f" },
            { label: "Upcoming",    value: String(totalUpcoming),                sub: "today",     accent: false, color: "#ff6a00" },
          ].map(({ label, value, sub, accent, color }) => (
            <div key={label} className="glass relative overflow-hidden rounded-[14px] py-[12px] px-2 text-center">
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <div className="text-[8px] font-bold uppercase tracking-[0.6px] buy-stat-label mb-1">{label}</div>
              <div className={`text-[18px] font-extrabold tracking-[-0.3px] leading-none font-[family-name:var(--font-data)] ${accent ? "gradient-text-alt" : ""}`} style={color ? { color } : undefined}>{value}</div>
              <div className="text-[8px] buy-stat-sub mt-1 font-semibold">{sub}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Filter chips ─────────────────────────────────────── */}
      <FadeIn delay={0.06}>
        <div className="flex items-center gap-2 mb-[12px]">
          {([
            { key: "all",       label: "All events",   Icon: Filter  },
            { key: "important", label: "Important",    Icon: Star    },
            { key: "high",      label: "High impact",  Icon: Bitcoin },
          ] as const).map(({ key, label, Icon }) => {
            const active = activeFilter === key;
            return (
              <button key={key} onClick={() => handleFilterChange(key)}
                className="flex items-center gap-1.5 font-bold cursor-pointer transition-all duration-150 font-[family-name:var(--font-display)]"
                style={{ padding: "9px 14px", borderRadius: 12, fontSize: 12, background: active ? "linear-gradient(135deg,rgba(255,106,0,0.12),rgba(255,106,0,0.04))" : "rgba(255,255,255,0.04)", border: active ? "0.5px solid rgba(255,106,0,0.28)" : "0.5px solid rgba(255,255,255,0.08)", color: active ? "#ff6a00" : "#aaa" }}>
                <Icon size={12} strokeWidth={2} style={{ stroke: active ? "#ff6a00" : "#666" }} />
                {label}
                <span style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono,monospace)", fontWeight: 700, marginLeft: 2, color: active ? "#ff6a00" : "#555", ...(active ? { background: "rgba(255,106,0,0.1)", padding: "1px 5px", borderRadius: 4 } : {}) }}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* ── Date scrubber ────────────────────────────────────── */}
      <FadeIn delay={0.08}>
        <div className="flex gap-[6px] overflow-x-auto pb-1 mb-[16px]" style={{ scrollbarWidth: "none" }}>
          {days.map((d: DayData, i: number) => {
            const active = i === selectedIdx;
            return (
              <button key={`${d.year}-${d.month}-${d.date}`} onClick={() => handleDayChange(i)}
                className="flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-150"
                style={{ padding: "10px 14px", borderRadius: 12, minWidth: 58, background: active ? "linear-gradient(135deg,#ff6a00,#ff8a30)" : "rgba(255,255,255,0.03)", border: active ? "0.5px solid transparent" : "0.5px solid rgba(255,255,255,0.06)", boxShadow: active ? "0 0 16px rgba(255,106,0,0.25)" : "none" }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3, color: active ? "rgba(0,0,0,0.7)" : "#666" }}>{d.day}</span>
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-jetbrains-mono,monospace)", lineHeight: 1, color: active ? "#000" : "#ccc" }}>{d.date}</span>
                <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 5, background: active ? "rgba(0,0,0,0.5)" : d.hasEvents ? "#ff6a00" : "transparent", boxShadow: (!active && d.hasEvents) ? "0 0 6px rgba(255,106,0,0.5)" : "none" }} />
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* ── Day header ───────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-1 mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-[2px] gradient-text-alt font-[family-name:var(--font-display)]">{day.fullLabel}</span>
        <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,106,0,0.2),transparent)" }} />
        <span className="text-[9px] font-extrabold tracking-[1px] font-[family-name:var(--font-data)]" style={{ color: "#444" }}>{activeEvents.length} EVENTS</span>
      </div>

      {/* ── Past events toggle (today only) ──────────────────── */}
      {isToday && pastCount > 0 && (
        <button
          onClick={() => { setShowPast((p) => !p); setLimit(10); }}
          style={{ width: "100%", marginBottom: 10, padding: "9px 16px", borderRadius: 12, background: showPast ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", border: showPast ? "0.5px solid rgba(255,255,255,0.1)" : "0.5px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 700, color: showPast ? "#888" : "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
        >
          <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: showPast ? "rotate(180deg)" : "rotate(0deg)" }} />
          {showPast ? `Hide today's past events (${pastCount})` : `Show today's past events (${pastCount})`}
        </button>
      )}

      {/* ── Event list ───────────────────────────────────────── */}
      {activeEvents.length === 0 ? (
        <FadeIn delay={0}>
          <div className="glass rounded-[16px] py-12 text-center">
            <Calendar size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-[13px] font-semibold buy-ex-desc">
              {day.hasEvents ? "No events match this filter" : "No events scheduled for this day"}
            </p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.1} key={`${selectedIdx}-${activeFilter}-${showPast}`}>
          <div>
            {visibleEvents.map((ev: AnyEvent) =>
              ev.kind === "macro"
                ? <MacroCard  key={ev.id} ev={ev as MacroEvent}  dayDate={dayDate} expanded={expandedId === ev.id} onToggle={() => toggleExpand(ev.id)} />
                : <CryptoCard key={ev.id} ev={ev as CryptoEvent} dayDate={dayDate} expanded={expandedId === ev.id} onToggle={() => toggleExpand(ev.id)} />
            )}

            {/* load more */}
            {hasMore && (
              <button
                onClick={() => setLimit((l) => l + 10)}
                style={{ width: "100%", marginTop: 8, padding: "11px 16px", borderRadius: 12, background: "rgba(255,106,0,0.06)", border: "0.5px solid rgba(255,106,0,0.15)", fontSize: 12, fontWeight: 700, color: "#ff6a00", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
              >
                <ChevronDown size={13} />
                Load {Math.min(activeEvents.length - limit, 10)} more
                <span style={{ fontSize: 10, color: "rgba(255,106,0,0.5)", fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
                  {activeEvents.length - limit} remaining
                </span>
              </button>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}

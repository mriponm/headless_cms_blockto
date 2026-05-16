"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { usePriceStore } from "@/lib/store/priceStore";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Power-law regression ──────────────────────────────────────────────────────
// Model: log10(price) = A * log10(days_from_genesis) + B
// Calibrated so that:
//   2017 peak ~$20K → "Sell. Seriously, sell!"
//   2021 peak ~$65K → "Sell. Seriously, sell!"
//   2024 peak ~$100K → "Is this a bubble?"
const GENESIS_MS = new Date("2009-01-03").getTime();
const REG_A = 5.84;
const REG_B = -17.35;

function dayFromGenesis(ts: number): number {
  return Math.max(1, (ts - GENESIS_MS) / 86_400_000);
}
function regLog10(day: number): number {
  return REG_A * Math.log10(day) + REG_B;
}

// ── Rainbow bands (bottom → top, rendered back-to-front) ─────────────────────
// lo / hi are log10 offsets from the regression line
const BANDS = [
  { label: "Fire sale!",               color: "#6d28d9", lo: -3.0,  hi: -0.35 },
  { label: "BUY!",                     color: "#1d4ed8", lo: -0.35, hi: -0.18 },
  { label: "Accumulate",               color: "#0891b2", lo: -0.18, hi: -0.02 },
  { label: "Still cheap",              color: "#059669", lo: -0.02, hi:  0.14 },
  { label: "HOLD",                     color: "#65a30d", lo:  0.14, hi:  0.29 },
  { label: "Is this a bubble?",        color: "#d97706", lo:  0.29, hi:  0.46 },
  { label: "FOMO Intensifies",         color: "#ea580c", lo:  0.46, hi:  0.69 },
  { label: "Sell. Seriously, sell!",   color: "#dc2626", lo:  0.69, hi:  1.00 },
  { label: "Maximum Bubble Territory", color: "#9f1239", lo:  1.00, hi:  3.5  },
] as const;

// ── SVG layout constants ──────────────────────────────────────────────────────
const CX = 56; // left margin (Y-axis labels)
const CY = 8;  // top margin
const CW = 576; // chart width
const CH = 228; // chart height

// ── Y-axis helpers (log scale) ────────────────────────────────────────────────
function makeLogY(logMin: number, logMax: number) {
  return (price: number): number => {
    const lp = Math.log10(Math.max(price, 1e-9));
    const cl = Math.max(logMin, Math.min(logMax, lp));
    return CY + CH - ((cl - logMin) / (logMax - logMin)) * CH;
  };
}

const Y_TICKS_ALL = [
  0.01, 0.1, 1, 10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000,
];

function fmtPrice(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  if (v >= 1)         return `$${v.toFixed(0)}`;
  return `$${v.toFixed(2)}`;
}

// ── Time frames ───────────────────────────────────────────────────────────────
type TF = "1Y" | "3Y" | "5Y" | "All";
const TF_MS: Record<TF, number | null> = {
  "1Y": 365 * 86_400_000,
  "3Y": 3 * 365 * 86_400_000,
  "5Y": 5 * 365 * 86_400_000,
  "All": null,
};
// CryptoCompare daily data starts around here
const ALL_START_MS = new Date("2010-07-17").getTime();

// ── Catmull-Rom spline path builder ──────────────────────────────────────────
function buildSplinePath(pts: { x: number; y: number }[]): string {
  if (!pts.length) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function RainbowChart() {
  const [tf, setTf] = useState<TF>("All");
  const live = usePriceStore((s) => s.prices["BTCUSDT"]);

  const { data: raw, isLoading } = useSWR<[number, number][]>(
    "/api/rainbow",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 86_400_000 },
  );

  // Stable "now" for this render
  const now = useMemo(() => Date.now(), []);
  // Extend X axis slightly past today so price dot isn't at the very edge
  const xMax = now + 18 * 86_400_000;

  const xMin = useMemo(() => {
    const ms = TF_MS[tf];
    return ms === null ? ALL_START_MS : now - ms;
  }, [tf, now]);

  // ── Adaptive Y range ────────────────────────────────────────────────────────
  const { logYMin, logYMax } = useMemo(() => {
    if (tf === "All") return { logYMin: -2.0, logYMax: 7.0 };

    // For shorter TFs, fit Y range around visible bands + actual prices
    const startDay = dayFromGenesis(xMin);
    const endDay   = dayFromGenesis(xMax);
    const baseLo   = regLog10(startDay) - 0.5; // below lowest band
    const baseHi   = regLog10(endDay)   + 1.3; // above top band

    const arr = Array.isArray(raw) ? raw : [];
    const visible = arr
      .filter(([ts]) => ts >= xMin && ts <= now)
      .map(([, p]) => p);
    const liveP = live ?? (visible.length ? visible[visible.length - 1] : 0);
    const allPrices = liveP > 0 ? [...visible, liveP] : visible;

    const priceLogMin = allPrices.length ? Math.log10(Math.min(...allPrices)) : baseLo;
    const priceLogMax = allPrices.length ? Math.log10(Math.max(...allPrices)) : baseHi;

    return {
      logYMin: Math.max(-2, Math.min(baseLo, priceLogMin) - 0.25),
      logYMax: Math.min(7,  Math.max(baseHi, priceLogMax) + 0.25),
    };
  }, [tf, xMin, xMax, now, raw, live]);

  // Create Y mapper with current log range
  const toY = useMemo(() => makeLogY(logYMin, logYMax), [logYMin, logYMax]);
  const toX = (ts: number) => CX + ((ts - xMin) / (xMax - xMin)) * CW;

  // ── Band polygon paths ──────────────────────────────────────────────────────
  const bandPaths = useMemo(() => {
    const N = 320;
    const step = (xMax - xMin) / N;
    const times = Array.from({ length: N + 1 }, (_, i) => xMin + i * step);

    return BANDS.map((band) => {
      const upper = times.map((t) => ({
        x: toX(t),
        y: toY(Math.pow(10, regLog10(dayFromGenesis(t)) + band.hi)),
      }));
      const lower = times.map((t) => ({
        x: toX(t),
        y: toY(Math.pow(10, regLog10(dayFromGenesis(t)) + band.lo)),
      }));

      const fwd = upper.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
      const bwd = lower
        .slice()
        .reverse()
        .map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" L ");

      return { ...band, d: `M ${fwd} L ${bwd} Z` };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xMin, xMax, logYMin, logYMax]);

  // ── Historical price path — expensive spline; stable, no live dependency ───
  const pricePath = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : [];
    const pts = arr
      .filter(([ts]) => ts >= xMin && ts <= now)
      .map(([ts, p]) => ({ x: toX(ts), y: toY(p) }));
    // Downsample to ≤500 points for path performance
    const step = Math.max(1, Math.floor(pts.length / 500));
    const sampled = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
    return buildSplinePath(sampled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, xMin, logYMin, logYMax]);

  // ── Live dot + band — cheap; updates on each price tick ─────────────────────
  const { lastPt, currentPrice, currentBand } = useMemo(() => {
    const liveP = live ?? 0;
    const lastPt = liveP > 0 ? { x: toX(now), y: toY(liveP) } : null;
    const currentDay = dayFromGenesis(now);
    const offset = liveP > 0 ? Math.log10(liveP) - regLog10(currentDay) : 0;
    const currentBand = [...BANDS].find((b) => offset >= b.lo && offset < b.hi) ?? BANDS[4];
    return { lastPt, currentPrice: liveP, currentBand };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, logYMin, logYMax]);

  // ── X-axis year labels ──────────────────────────────────────────────────────
  const xLabels = useMemo(() => {
    const labels: { x: number; text: string }[] = [];
    const startY = new Date(xMin).getFullYear();
    const endY   = new Date(xMax).getFullYear() + 1;
    for (let y = startY; y <= endY; y++) {
      const ts = new Date(`${y}-01-01`).getTime();
      if (ts >= xMin && ts <= xMax) {
        labels.push({ x: toX(ts), text: String(y) });
      }
    }
    return labels;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xMin, xMax]);

  // ── Y-axis ticks (filter to visible log range) ────────────────────────────
  const yTicks = Y_TICKS_ALL.filter((v) => {
    const lv = Math.log10(v);
    return lv >= logYMin + 0.05 && lv <= logYMax - 0.05;
  });

  const viewW = CX + CW + 6;
  const viewH = CY + CH + 28;

  return (
    <div className="rbc-wrap">

      {/* ── Header ── */}
      <div className="mtr-card-head" style={{ paddingBottom: 8 }}>
        <div>
          <span className="mtr-card-title">
            <span style={{ fontWeight: 800 }}>Bitcoin</span>{" "}
            <span className="gradient-text-alt">Rainbow Price Chart</span>
          </span>
          {currentPrice > 0 && (
            <div className="rbc-zone-badge" style={{ color: currentBand.color }}>
              <span className="rbc-zone-dot" style={{ background: currentBand.color }} />
              {currentBand.label}
            </div>
          )}
        </div>
        <div className="rbc-tf">
          {(["1Y", "3Y", "5Y", "All"] as TF[]).map((t) => (
            <button
              key={t}
              className={`rbc-tf-btn${tf === t ? " rbc-tf-active" : ""}`}
              onClick={() => setTf(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Legend (top, Coinglass-style) ── */}
      <div className="rbc-legend-top">
        {/* BTC Price first */}
        <div className="rbc-legend-item">
          <span className="rbc-legend-swatch" style={{ background: "rgba(255,255,255,0.85)" }} />
          <span>BTC Price</span>
        </div>
        {/* Bands from highest to lowest (left-to-right like Coinglass) */}
        {[...BANDS].reverse().map((b) => (
          <div key={b.label} className="rbc-legend-item">
            <span className="rbc-legend-swatch" style={{ background: b.color }} />
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="rbc-chart-area" style={{ flex: 1, paddingBottom: 6 }}>
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260 }}>
            <div
              style={{
                width: 20, height: 20,
                borderRadius: "50%",
                border: "2px solid var(--color-brand)",
                borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", display: "block" }}
          >
            <defs>
              <clipPath id="rbc-chart-clip">
                <rect x={CX} y={CY} width={CW} height={CH} />
              </clipPath>
            </defs>

            {/* Band fills */}
            <g clipPath="url(#rbc-chart-clip)">
              {bandPaths.map((b) => (
                <path key={b.label} d={b.d} fill={b.color} fillOpacity="0.88" />
              ))}
            </g>

            {/* Y-axis grid lines + labels */}
            {yTicks.map((v) => {
              const y = toY(v);
              if (y < CY || y > CY + CH) return null;
              return (
                <g key={v}>
                  <line
                    x1={CX} y1={y} x2={CX + CW} y2={y}
                    stroke="rgba(0,0,0,0.22)" strokeWidth="0.6"
                  />
                  <text
                    x={CX - 4} y={y + 3.5}
                    textAnchor="end"
                    fontSize="7" fill="#888"
                    fontFamily="var(--font-data)"
                  >
                    {fmtPrice(v)}
                  </text>
                </g>
              );
            })}

            {/* Price line glow */}
            {pricePath && (
              <path
                d={pricePath} fill="none"
                stroke="rgba(255,255,255,0.22)" strokeWidth="5.5"
                strokeLinecap="round" strokeLinejoin="round"
                clipPath="url(#rbc-chart-clip)"
              />
            )}

            {/* Price line */}
            {pricePath && (
              <path
                d={pricePath} fill="none"
                stroke="rgba(255,255,255,0.92)" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                clipPath="url(#rbc-chart-clip)"
              />
            )}

            {/* Live price dashed horizontal */}
            {lastPt && (
              <line
                x1={CX} y1={lastPt.y} x2={CX + CW} y2={lastPt.y}
                stroke="rgba(255,255,255,0.18)" strokeWidth="0.7"
                strokeDasharray="4 3"
              />
            )}

            {/* Live dot */}
            {lastPt && (
              <g clipPath="url(#rbc-chart-clip)">
                <circle cx={lastPt.x} cy={lastPt.y} r="7" fill="rgba(255,255,255,0.15)" />
                <circle
                  cx={lastPt.x} cy={lastPt.y} r="3.5"
                  fill="#fff" stroke="rgba(0,0,0,0.45)" strokeWidth="1.2"
                />
              </g>
            )}

            {/* Current price tag (top-right of dashed line) */}
            {lastPt && currentPrice > 0 && (() => {
              const label = fmtPrice(currentPrice);
              const tagW = label.length * 5.2 + 8;
              const tagX = CX + CW - tagW - 2;
              const tagY = lastPt.y - 13;
              return (
                <g>
                  <rect
                    x={tagX} y={tagY} width={tagW} height={12} rx="3"
                    fill="rgba(255,255,255,0.12)"
                  />
                  <text
                    x={tagX + tagW / 2} y={tagY + 8.5}
                    textAnchor="middle" fontSize="7.5"
                    fill="rgba(255,255,255,0.9)"
                    fontFamily="var(--font-data)" fontWeight="700"
                  >
                    {label}
                  </text>
                </g>
              );
            })()}

            {/* X-axis baseline */}
            <line
              x1={CX} y1={CY + CH} x2={CX + CW} y2={CY + CH}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
            />

            {/* X-axis year labels */}
            {xLabels.map((l) => (
              <text
                key={l.text} x={l.x} y={CY + CH + 14}
                textAnchor="middle" fontSize="7.5"
                fill="#666" fontFamily="var(--font-display)"
              >
                {l.text}
              </text>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

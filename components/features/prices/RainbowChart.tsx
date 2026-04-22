"use client";
import { useState } from "react";

const MONTHS = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
const PRICES = [67200,71500,63400,58900,62100,54800,48200,52400,61300,72800,78500,84231];

// Band definitions: [label, fill, bandTops per month]
const BANDS: { label: string; fill: string; solid: string; tops: number[] }[] = [
  { label: "Fire sale",  fill: "rgba(139,0,255,0.13)",  solid: "#8b00ff", tops: [45e3,46e3,47e3,48e3,49e3,5e4,51e3,52e3,53e3,54e3,55e3,56e3] },
  { label: "Buy",        fill: "rgba(37,99,235,0.13)",  solid: "#2563eb", tops: [52e3,53.5e3,55e3,56.5e3,58e3,59.5e3,61e3,62.5e3,64e3,65.5e3,67e3,68.5e3] },
  { label: "Accumulate", fill: "rgba(0,200,100,0.13)",  solid: "#00c864", tops: [6e4,62e3,64e3,66e3,68e3,7e4,72e3,74e3,76e3,78e3,8e4,82e3] },
  { label: "Hold",       fill: "rgba(255,194,51,0.13)", solid: "#ffc233", tops: [72e3,74e3,76e3,78e3,8e4,82e3,84e3,86e3,88e3,9e4,92e3,94e3] },
  { label: "Bubble",     fill: "rgba(255,106,0,0.13)",  solid: "#ff6a00", tops: [88e3,9e4,92e3,94e3,96e3,98e3,1e5,102e3,104e3,106e3,108e3,11e4] },
  { label: "FOMO",       fill: "rgba(255,32,32,0.13)",  solid: "#ff2020", tops: [11e4,112e3,114e3,116e3,118e3,12e4,122e3,124e3,126e3,128e3,13e4,132e3] },
];

// SVG dimensions
const CX = 52, CY = 12, CW = 536, CH = 176;
const Y_MIN = 40000, Y_MAX = 116000;
const COL_W = CW / 12;
const GAP = 3;

function toSvgY(v: number) {
  return CY + CH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * CH;
}
function toSvgX(i: number) {
  return CX + i * COL_W;
}

const Y_TICKS = [40000, 60000, 80000, 100000];

// Build band rects for each month
type BandRect = { x: number; y: number; h: number; fill: string };
function buildRects(): BandRect[][] {
  return MONTHS.map((_, mi) => {
    let bottom = Y_MIN;
    return BANDS.map((b) => {
      const top = b.tops[mi];
      const yTop = toSvgY(Math.min(top, Y_MAX));
      const yBot = toSvgY(Math.min(bottom, Y_MAX));
      const rect = { x: toSvgX(mi) + GAP / 2, y: yTop, h: Math.max(0, yBot - yTop), fill: b.fill };
      bottom = top;
      return rect;
    });
  });
}

// Build smooth price path
function buildPath() {
  const pts = PRICES.map((p, i) => ({
    x: toSvgX(i) + COL_W / 2,
    y: toSvgY(p),
  }));
  // Catmull-Rom to cubic bezier
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return { d, pts };
}

const RECTS = buildRects();
const { d: PATH, pts: PTS } = buildPath();
// Arrow indicator position at index 11 (current = 62%)
const ARROW_PCT = 62;

export default function RainbowChart() {
  const [tf, setTf] = useState<"1M" | "3M" | "1Y" | "All">("1Y");

  return (
    <div className="rbc-wrap">
      {/* Header */}
      <div className="mtr-card-head" style={{ paddingBottom: 14 }}>
        <span className="mtr-card-title">
          <span style={{ fontWeight: 800 }}>Bitcoin</span>{" "}
          <span className="gradient-text-alt">rainbow chart</span>
        </span>
        <div className="rbc-tf">
          {(["1M","3M","1Y","All"] as const).map((t) => (
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

      {/* Chart */}
      <div className="rbc-chart-area">
        <svg
          viewBox={`0 0 ${CX + CW + 4} ${CY + CH + 36}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", display: "block" }}
        >
          {/* Y grid lines + labels */}
          {Y_TICKS.map((v) => {
            const y = toSvgY(v);
            return (
              <g key={v}>
                <line x1={CX} y1={y} x2={CX + CW} y2={y}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <text x={CX - 4} y={y + 4} textAnchor="end"
                  fontSize="7.5" fill="#444" fontFamily="var(--font-data)">
                  ${v / 1000}K
                </text>
              </g>
            );
          })}

          {/* Band rects per month */}
          {RECTS.map((monthRects, mi) =>
            monthRects.map((r, bi) =>
              r.h > 0 ? (
                <rect
                  key={`${mi}-${bi}`}
                  x={r.x} y={r.y}
                  width={COL_W - GAP} height={r.h}
                  fill={r.fill}
                  rx="1"
                />
              ) : null
            )
          )}

          {/* Price glow line (shadow) */}
          <path d={PATH} fill="none"
            stroke="rgba(255,106,0,0.25)" strokeWidth="6"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Price line */}
          <path d={PATH} fill="none"
            stroke="#ff6a00" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Last price dot */}
          <circle cx={PTS[11].x} cy={PTS[11].y} r="5"
            fill="#ff6a00" stroke="rgba(0,0,0,0.6)" strokeWidth="2" />

          {/* X labels (months) */}
          {MONTHS.map((m, i) => (
            <text
              key={m}
              x={toSvgX(i) + COL_W / 2}
              y={CY + CH + 14}
              textAnchor="middle"
              fontSize="8"
              fill="#444"
              fontFamily="var(--font-display)"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>

      {/* Rainbow legend */}
      <div className="rbc-legend-wrap">
        {/* Zone labels */}
        <div className="rbc-zone-labels">
          {BANDS.map((b) => (
            <span key={b.label} className="rbc-zone-lbl">{b.label}</span>
          ))}
        </div>
        {/* Colored bar */}
        <div className="rbc-bar">
          {BANDS.map((b) => (
            <div key={b.label} className="rbc-bar-seg" style={{ background: b.solid }} />
          ))}
        </div>
        {/* Arrow indicator */}
        <div className="rbc-arrow-row">
          <div className="rbc-arrow" style={{ left: `${ARROW_PCT}%` }}>▲</div>
        </div>
      </div>
    </div>
  );
}

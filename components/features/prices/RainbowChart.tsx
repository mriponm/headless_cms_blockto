"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { usePriceStore } from "@/lib/store/priceStore";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Band definitions (Bitcoin Rainbow Chart log-regression bands)
const BANDS: { label: string; fill: string; solid: string; minPct: number; maxPct: number }[] = [
  { label: "Fire sale",  fill: "rgba(139,0,255,0.13)",  solid: "#8b00ff", minPct: 0,   maxPct: 10  },
  { label: "Buy",        fill: "rgba(37,99,235,0.13)",  solid: "#2563eb", minPct: 10,  maxPct: 25  },
  { label: "Accumulate", fill: "rgba(0,200,100,0.13)",  solid: "#00c864", minPct: 25,  maxPct: 45  },
  { label: "Hold",       fill: "rgba(255,194,51,0.13)", solid: "#ffc233", minPct: 45,  maxPct: 65  },
  { label: "Bubble",     fill: "rgba(255,106,0,0.13)",  solid: "#ff6a00", minPct: 65,  maxPct: 82  },
  { label: "FOMO",       fill: "rgba(255,32,32,0.13)",  solid: "#ff2020", minPct: 82,  maxPct: 100 },
];

const CX = 52, CY = 12, CW = 536, CH = 176;

function toSvgY(v: number, yMin: number, yMax: number) {
  return CY + CH - ((v - yMin) / (yMax - yMin)) * CH;
}
function toSvgX(i: number, n: number) {
  return CX + (i / Math.max(n - 1, 1)) * CW;
}

function buildPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
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
  return d;
}

type TF = "1M" | "3M" | "1Y" | "All";
const TF_DAYS: Record<TF, number> = { "1M": 30, "3M": 90, "1Y": 365, "All": 1460 };

export default function RainbowChart() {
  const [tf, setTf] = useState<TF>("All");
  const livePrice = usePriceStore((s) => s.prices["BTCUSDT"]);

  const { data: rawPrices, isLoading } = useSWR<[number, number][]>(
    "/api/rainbow",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 86_400_000 }
  );

  const { pts, yMin, yMax, labels, currentY, arrowPct } = useMemo(() => {
    if (!Array.isArray(rawPrices) || rawPrices.length === 0) {
      return { pts: [], yMin: 40000, yMax: 120000, labels: [], currentY: 0, arrowPct: 50 };
    }

    const days = TF_DAYS[tf];
    const slice = rawPrices.slice(-days);
    const prices = slice.map(([, p]) => p);
    const currentPrice = livePrice ?? prices[prices.length - 1];

    const yMin = Math.min(...prices) * 0.95;
    const yMax = Math.max(Math.max(...prices, currentPrice)) * 1.05;

    // Sample to max 60 points for performance
    const step = Math.max(1, Math.floor(slice.length / 60));
    const sampled = slice.filter((_, i) => i % step === 0 || i === slice.length - 1);

    const pts = sampled.map(([, p], i) => ({
      x: toSvgX(i, sampled.length),
      y: toSvgY(p, yMin, yMax),
    }));

    // X-axis labels (month/year)
    const labelIdxs = [0, Math.floor(sampled.length / 3), Math.floor(2 * sampled.length / 3), sampled.length - 1];
    const labels = labelIdxs.map((idx) => {
      const [ts] = sampled[Math.min(idx, sampled.length - 1)];
      const d = new Date(ts);
      return {
        x: toSvgX(idx, sampled.length),
        text: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      };
    });

    // Y ticks
    const currentY = toSvgY(currentPrice, yMin, yMax);

    // Arrow position on legend bar (which band is current price in)
    const range = yMax - yMin;
    const pct = ((currentPrice - yMin) / range) * 100;
    const arrowPct = Math.max(2, Math.min(98, pct));

    return { pts, yMin, yMax, labels, currentY, arrowPct };
  }, [rawPrices, tf, livePrice]);

  const path = buildPath(pts);
  const lastPt = pts[pts.length - 1];

  // Y ticks
  const yTicks = useMemo(() => {
    const step = (yMax - yMin) / 4;
    return [0, 1, 2, 3, 4].map((i) => yMin + i * step);
  }, [yMin, yMax]);

  return (
    <div className="rbc-wrap">
      <div className="mtr-card-head" style={{ paddingBottom: 14 }}>
        <span className="mtr-card-title">
          <span style={{ fontWeight: 800 }}>Bitcoin</span>{" "}
          <span className="gradient-text-alt">rainbow chart</span>
        </span>
        <div className="rbc-tf">
          {(["1M","3M","1Y","All"] as const).map((t) => (
            <button key={t} className={`rbc-tf-btn${tf === t ? " rbc-tf-active" : ""}`} onClick={() => setTf(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rbc-chart-area">
        {isLoading && pts.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="w-5 h-5 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${CX + CW + 4} ${CY + CH + 36}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", display: "block" }}
          >
            {/* Y grid + labels */}
            {yTicks.map((v) => {
              const y = toSvgY(v, yMin, yMax);
              return (
                <g key={v}>
                  <line x1={CX} y1={y} x2={CX + CW} y2={y}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  <text x={CX - 4} y={y + 4} textAnchor="end"
                    fontSize="7.5" fill="#444" fontFamily="var(--font-data)">
                    ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Band fills (full height bands based on pct zones) */}
            {BANDS.map((b) => {
              const yTop = CY + CH * (1 - b.maxPct / 100);
              const yBot = CY + CH * (1 - b.minPct / 100);
              return (
                <rect key={b.label} x={CX} y={yTop} width={CW} height={Math.max(0, yBot - yTop)}
                  fill={b.fill} />
              );
            })}

            {/* Price glow */}
            {path && <path d={path} fill="none" stroke="rgba(255,106,0,0.25)" strokeWidth="6"
              strokeLinecap="round" strokeLinejoin="round" />}

            {/* Price line */}
            {path && <path d={path} fill="none" stroke="#ff6a00" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />}

            {/* Live price dot */}
            {lastPt && (
              <>
                <circle cx={lastPt.x} cy={lastPt.y} r="7" fill="rgba(255,106,0,0.2)" />
                <circle cx={lastPt.x} cy={lastPt.y} r="4" fill="#ff6a00" stroke="rgba(0,0,0,0.6)" strokeWidth="2" />
              </>
            )}

            {/* Live price horizontal line */}
            {lastPt && (
              <line x1={CX} y1={lastPt.y} x2={CX + CW} y2={lastPt.y}
                stroke="rgba(255,106,0,0.3)" strokeWidth="0.8" strokeDasharray="4 3" />
            )}

            {/* X labels */}
            {labels.map((l, i) => (
              <text key={i} x={l.x} y={CY + CH + 14} textAnchor="middle"
                fontSize="8" fill="#444" fontFamily="var(--font-display)">
                {l.text}
              </text>
            ))}
          </svg>
        )}
      </div>

      <div className="rbc-legend-wrap">
        <div className="rbc-zone-labels">
          {BANDS.map((b) => <span key={b.label} className="rbc-zone-lbl">{b.label}</span>)}
        </div>
        <div className="rbc-bar">
          {BANDS.map((b) => <div key={b.label} className="rbc-bar-seg" style={{ background: b.solid }} />)}
        </div>
        <div className="rbc-arrow-row">
          <div className="rbc-arrow" style={{ left: `${arrowPct}%` }}>▲</div>
        </div>
      </div>
    </div>
  );
}

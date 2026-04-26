"use client";
import useSWR from "swr";
import clsx from "clsx";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface FGEntry {
  value: number;
  value_classification: string;
  timestamp: string;
}

interface FGResponse {
  current: FGEntry;
  history: FGEntry[];
}

function classificationColor(c: string) {
  if (c.includes("Extreme Fear")) return "#8b5cf6";
  if (c.includes("Fear")) return "#ef4444";
  if (c.includes("Neutral")) return "#f59e0b";
  if (c.includes("Greed")) return "#22c55e";
  if (c.includes("Extreme Greed")) return "#00d47b";
  return "#888";
}

export default function FearGreedWidget() {
  const { data, isLoading } = useSWR<FGResponse>("/api/fear-greed", fetcher, {
    refreshInterval: 3_600_000,
    keepPreviousData: true,
  });

  const current = data?.current;
  const history = data?.history ?? [];
  const value = current?.value ?? 0;
  const classification = current?.value_classification ?? "—";
  const color = classificationColor(classification);

  // Gauge: 0-100 mapped to 180° arc
  const angle = (value / 100) * 180 - 90; // -90° = 0, +90° = 100

  if (isLoading && !data) {
    return (
      <div className="glass rounded-[20px] p-6 flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-[20px] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-extrabold font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
          Fear & Greed Index
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[1px] px-2 py-1 rounded-[6px] font-[family-name:var(--font-display)]"
          style={{ background: "rgba(255,106,0,0.1)", color: "var(--color-brand)" }}>
          CMC Live
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
          {/* Colored arc (stroke-dasharray trick for partial fill) */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
            stroke="url(#fgGradient)" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 251.3} 251.3`}
          />
          <defs>
            <linearGradient id="fgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#00d47b" />
            </linearGradient>
          </defs>
          {/* Needle */}
          <g transform={`rotate(${angle}, 100, 100)`}>
            <line x1="100" y1="100" x2="100" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          </g>
          <circle cx="100" cy="100" r="5" fill="white" opacity="0.9" />
          {/* Value text */}
          <text x="100" y="85" textAnchor="middle" fontSize="28" fontWeight="800" fill={color} fontFamily="var(--font-data)">
            {value}
          </text>
          <text x="100" y="115" textAnchor="middle" fontSize="11" fill={color} fontFamily="var(--font-display)" fontWeight="700">
            {classification}
          </text>
        </svg>

        {/* Labels */}
        <div className="flex justify-between w-full max-w-[260px] text-[9px] font-bold uppercase tracking-[0.6px] font-[family-name:var(--font-display)]">
          <span style={{ color: "#8b5cf6" }}>Extreme Fear</span>
          <span style={{ color: "#f59e0b" }}>Neutral</span>
          <span style={{ color: "#00d47b" }}>Extreme Greed</span>
        </div>
      </div>

      {/* Historical table */}
      {history.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[1px] mb-3 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
            30-Day History
          </p>
          <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto scrollbar-hide">
            {history.slice(0, 30).map((h, i) => (
              <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-[8px]"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-[10px] font-[family-name:var(--font-data)]" style={{ color: "var(--color-muted)" }}>
                  {new Date(parseInt(h.timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-[11px] font-extrabold font-[family-name:var(--font-data)]"
                  style={{ color: classificationColor(h.value_classification) }}>
                  {h.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useCryptoData } from "@/lib/hooks/useCryptoData";
import { formatDollarCompact, formatPercent, percentClass } from "@/lib/utils/formatters";
import clsx from "clsx";

const STATIC_METRICS = [
  { label: "Market cap",    value: "$2.87T", change: "+1.8%", up: true },
  { label: "24h volume",   value: "$94.2B", change: "-3.1%", up: false },
  { label: "BTC dominance",value: "52.4%",  change: "+0.3%", up: true },
  { label: "Fear & greed", value: "45",     change: "Fear",  special: "brand" },
  { label: "ETH gas",      value: "8",      change: "gwei",  special: "neutral" },
  { label: "BTC halving",  value: "696d",   change: "Mar 2028", special: "gradient" },
];

export default function PulseRow() {
  const { data } = useCryptoData();

  const metrics = data ? [
    { label: "Market cap",    value: formatDollarCompact(data.global.total_market_cap.usd ?? 0), change: formatPercent(data.global.market_cap_change_percentage_24h_usd), up: data.global.market_cap_change_percentage_24h_usd >= 0 },
    { label: "24h volume",   value: formatDollarCompact(data.global.total_volume.usd ?? 0), change: "", up: true },
    { label: "BTC dominance",value: `${(data.global.market_cap_percentage.btc ?? 0).toFixed(1)}%`, change: "", up: true },
    { label: "Fear & greed", value: "45",     change: "Fear",  special: "brand" as const },
    { label: "ETH gas",      value: "8",      change: "gwei",  special: "neutral" as const },
    { label: "BTC halving",  value: "696d",   change: "Mar 2028", special: "gradient" as const },
  ] : STATIC_METRICS;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
      {metrics.map((m) => (
        <div key={m.label} className="glass relative overflow-hidden p-4 rounded-[14px]">
          {/* top shimmer */}
          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <p className="text-[9px] text-[#666] uppercase tracking-[0.8px] font-bold mb-1.5 font-[family-name:var(--font-display)]">
            {m.label}
          </p>
          <p
            className={clsx(
              "text-xl md:text-[22px] font-extrabold font-[family-name:var(--font-data)] tracking-[-0.5px] leading-none",
              (m as any).special === "gradient" && "gradient-text-alt",
              (m as any).special === "brand" && "text-[var(--color-brand)]",
            )}
          >
            {m.value}
          </p>
          <p
            className={clsx(
              "text-[10px] font-bold mt-1.5 font-[family-name:var(--font-data)]",
              (m as any).special === "brand" ? "text-[var(--color-brand)]" :
              (m as any).special === "neutral" ? "text-[#999]" :
              (m as any).special === "gradient" ? "text-[#999]" :
              (m as any).up ? "text-positive" : "text-negative"
            )}
          >
            {(m as any).up && !(m as any).special ? "▲ " : ""}{!(m as any).up && !(m as any).special ? "▼ " : ""}{m.change}
          </p>
        </div>
      ))}
    </div>
  );
}

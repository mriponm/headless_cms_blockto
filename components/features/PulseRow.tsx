"use client";
import Link from "next/link";
import { useCryptoData } from "@/lib/hooks/useCryptoData";
import { formatDollarCompact, formatPercent } from "@/lib/utils/formatters";
import clsx from "clsx";

export default function PulseRow() {
  const { data } = useCryptoData();

  const btc = data?.coins.find((c) => c.id === "bitcoin");
  const eth = data?.coins.find((c) => c.id === "ethereum");

  const metrics = [
    {
      label: "BTC",
      value: btc ? formatDollarCompact(btc.current_price) : "$94.2K",
      change: btc ? formatPercent(btc.price_change_percentage_24h) : "+1.8%",
      up: (btc?.price_change_percentage_24h ?? 1) >= 0,
      href: "/prices",
    },
    {
      label: "ETH",
      value: eth ? formatDollarCompact(eth.current_price) : "$1,790",
      change: eth ? formatPercent(eth.price_change_percentage_24h) : "-0.5%",
      up: (eth?.price_change_percentage_24h ?? -0.5) >= 0,
      href: "/prices",
    },
    {
      label: "Fear & greed",
      value: "45",
      change: "Fear",
      special: "brand" as const,
      href: "/fear-greed",
    },
    {
      label: "Market cap",
      value: data ? formatDollarCompact(data.global.total_market_cap.usd ?? 0) : "$2.87T",
      change: data ? formatPercent(data.global.market_cap_change_percentage_24h_usd) : "+1.8%",
      up: (data?.global.market_cap_change_percentage_24h_usd ?? 1) >= 0,
      href: "/metrics",
    },
    {
      label: "24h volume",
      value: data ? formatDollarCompact(data.global.total_volume.usd ?? 0) : "$94.2B",
      change: "24h",
      up: true,
      href: "/metrics",
    },
    {
      label: "BTC dominance",
      value: data ? `${(data.global.market_cap_percentage.btc ?? 0).toFixed(1)}%` : "58.1%",
      change: "dominance",
      up: true,
      href: "/metrics",
    },
  ];

  return (
    <div className="relative mb-6">
    <div className="flex md:grid md:grid-cols-6 gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
      {metrics.map((m) => (
        <Link key={m.label} href={m.href} className="block flex-shrink-0 w-[calc((100vw-40px)/3.4)] md:w-auto">
          <div className="glass relative overflow-hidden p-3 md:p-4 rounded-[12px] md:rounded-[14px] hover:brightness-110 transition-all duration-150 h-[80px] md:h-[88px] flex flex-col justify-between">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <p className="text-[8.5px] text-[#666] uppercase tracking-[0.8px] font-bold font-[family-name:var(--font-display)] truncate">
              {m.label}
            </p>
            <p
              className={clsx(
                "font-extrabold font-[family-name:var(--font-data)] tracking-[-0.5px] leading-none truncate",
                m.value.length > 6 ? "text-[14px]" : "text-[17px]",
                m.special === "brand" && "text-[var(--color-brand)]",
              )}
            >
              {m.value}
            </p>
            <p
              className={clsx(
                "text-[9.5px] font-bold font-[family-name:var(--font-data)]",
                m.special === "brand" ? "text-[var(--color-brand)]" :
                m.up ? "text-positive" : "text-negative"
              )}
            >
              {!m.special && m.change && (m.up ? "▲ " : "▼ ")}{m.change}
            </p>
          </div>
        </Link>
      ))}
    </div>
    </div>
  );
}

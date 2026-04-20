"use client";
import { useCryptoData } from "@/lib/hooks/useCryptoData";
import { TrendingUp } from "lucide-react";

function pct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
export default function ArticleMarketCard() {
  const { data } = useCryptoData();

  const btc = data?.coins.find(c => c.id === "bitcoin");

  const cells = [
    {
      label: "WTI Crude",
      icon: "🛢️",
      iconBg: "rgba(255,255,255,0.06)",
      value: "+3.4%",
      up: true,
    },
    {
      label: "Gold",
      icon: "★",
      iconBg: "rgba(255,200,0,0.1)",
      iconColor: "#ffc800",
      value: "+1.8%",
      up: true,
    },
    {
      label: "Bitcoin",
      icon: "₿",
      iconBg: "rgba(255,106,0,0.12)",
      iconColor: "#ff6a00",
      value: btc ? pct(btc.price_change_percentage_24h) : "-1.8%",
      up: btc ? btc.price_change_percentage_24h >= 0 : false,
    },
    {
      label: "DXY",
      icon: "$",
      iconBg: "rgba(74,158,255,0.12)",
      iconColor: "#4a9eff",
      value: "+0.6%",
      up: true,
    },
  ];

  return (
    <div className="rounded-[16px] p-[18px] my-6 relative overflow-hidden art-market-card">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={13} className="text-[var(--color-brand)]" />
        <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[var(--color-brand)] font-[family-name:var(--font-display)]">
          Live market reaction
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cells.map((c) => (
          <div key={c.label} className="p-[10px_12px] rounded-[10px] art-market-cell">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-extrabold flex-shrink-0"
                style={{ background: c.iconBg, color: c.iconColor ?? "#999" }}>
                {c.icon}
              </span>
              <span className="text-[9px] art-market-label uppercase tracking-[0.8px] font-extrabold font-[family-name:var(--font-display)]">
                {c.label}
              </span>
            </div>
            <div className={`text-[14px] font-extrabold font-[family-name:var(--font-data)] ${c.up ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
              {c.value} {c.up ? "▲" : "▼"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

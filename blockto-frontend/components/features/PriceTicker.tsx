"use client";
import { useCryptoData } from "@/lib/hooks/useCryptoData";
import { formatPrice, formatPercent, percentClass } from "@/lib/utils/formatters";
import clsx from "clsx";

const STATIC = [
  { s: "BTC", p: "$84,231", c: "+2.4%", up: true }, { s: "ETH", p: "$1,842", c: "+1.9%", up: true },
  { s: "SOL", p: "$134.20", c: "-0.8%", up: false }, { s: "XRP", p: "$1.33", c: "-4.1%", up: false },
  { s: "BNB", p: "$587.40", c: "+0.6%", up: true }, { s: "ADA", p: "$0.42", c: "+3.1%", up: true },
  { s: "DOGE", p: "$0.081", c: "-1.2%", up: false }, { s: "AVAX", p: "$28.40", c: "+4.7%", up: true },
  { s: "LINK", p: "$14.80", c: "+2.8%", up: true }, { s: "DOT", p: "$5.12", c: "-0.4%", up: false },
];

export default function PriceTicker() {
  const { data } = useCryptoData();

  const items = data
    ? [...data.coins, ...data.coins]
    : [...STATIC, ...STATIC];

  return (
    <div className="ticker-fade ticker-bar relative overflow-hidden py-3">
      <div
        className="ticker-inner flex gap-9 w-max pl-10"
        style={{ animation: "ticker-scroll 30s linear infinite" }}
      >
        {items.map((item, i) => {
          if (data) {
            const coin = item as (typeof data.coins)[0];
            return (
              <span key={`${coin.id}-${i}`} className="flex items-center gap-2 text-[13px] whitespace-nowrap">
                <span className="ticker-symbol font-bold text-[11px] text-[#888] font-[family-name:var(--font-data)] uppercase">{coin.symbol}</span>
                <span className="ticker-price font-[family-name:var(--font-data)] font-medium text-[#e5e5e5]">{formatPrice(coin.current_price)}</span>
                <span className={clsx("text-[11px] font-bold font-[family-name:var(--font-data)]", percentClass(coin.price_change_percentage_24h))}>
                  {formatPercent(coin.price_change_percentage_24h)}
                </span>
              </span>
            );
          }
          const s = item as typeof STATIC[0];
          return (
            <span key={`${s.s}-${i}`} className="flex items-center gap-2 text-[13px] whitespace-nowrap">
              <span className="ticker-symbol font-bold text-[11px] text-[#888] font-[family-name:var(--font-data)]">{s.s}</span>
              <span className="ticker-price font-[family-name:var(--font-data)] font-medium text-[#e5e5e5]">{s.p}</span>
              <span className={clsx("text-[11px] font-bold font-[family-name:var(--font-data)]", s.up ? "text-positive" : "text-negative")}>{s.c}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

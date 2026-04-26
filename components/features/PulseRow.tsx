"use client";
import Link from "next/link";
import useSWR from "swr";
import { usePriceStore } from "@/lib/store/priceStore";
import { formatDollarCompact, formatPercent } from "@/lib/utils/formatters";
import clsx from "clsx";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MarketCoin {
  symbol: string; current_price: number; price_change_percentage_24h: number;
}

// CMC global-metrics/quotes/latest — btc_dominance is at top level, not inside quote.USD
interface GlobalData {
  btc_dominance?: number;
  eth_dominance?: number;
  quote?: {
    USD?: {
      total_market_cap?: number;
      total_volume_24h?: number;
      total_market_cap_yesterday_percentage_change?: number;
    };
  };
}

interface FearGreedResponse {
  current?: { value?: number; value_classification?: string };
}

export default function PulseRow() {
  const prices  = usePriceStore((s) => s.prices);
  const changes = usePriceStore((s) => s.changes);

  const { data: global } = useSWR<GlobalData>("/api/global", fetcher, {
    refreshInterval: 60_000, dedupingInterval: 30_000, keepPreviousData: true,
  });
  const { data: fg } = useSWR<FearGreedResponse>("/api/fear-greed", fetcher, {
    refreshInterval: 3_600_000, dedupingInterval: 1_800_000, keepPreviousData: true,
  });
  const { data: markets } = useSWR<MarketCoin[]>("/api/markets", fetcher, {
    refreshInterval: 60_000, dedupingInterval: 30_000, keepPreviousData: true,
  });

  // WS price takes priority; fall back to CoinGecko markets while WS connects
  const btcMeta   = markets?.find((c) => c.symbol.toUpperCase() === "BTC");
  const ethMeta   = markets?.find((c) => c.symbol.toUpperCase() === "ETH");
  const btcPrice  = prices["BTCUSDT"] || btcMeta?.current_price || 0;
  const ethPrice  = prices["ETHUSDT"] || ethMeta?.current_price || 0;
  const btcChange = changes["BTCUSDT"] ?? btcMeta?.price_change_percentage_24h ?? 0;
  const ethChange = changes["ETHUSDT"] ?? ethMeta?.price_change_percentage_24h ?? 0;

  const q          = global?.quote?.USD;
  const btcDom     = global?.btc_dominance ?? 0;
  const marketCap  = q?.total_market_cap ?? 0;
  const vol24h     = q?.total_volume_24h ?? 0;
  const mcapChg    = q?.total_market_cap_yesterday_percentage_change ?? 0;
  const fgValue    = fg?.current?.value;
  const fgLabel    = fg?.current?.value_classification ?? "—";

  const metrics = [
    {
      label: "BTC",
      value: btcPrice ? formatDollarCompact(btcPrice) : "—",
      change: formatPercent(btcChange),
      up: btcChange >= 0,
      href: "/coins/bitcoin",
    },
    {
      label: "ETH",
      value: ethPrice ? formatDollarCompact(ethPrice) : "—",
      change: formatPercent(ethChange),
      up: ethChange >= 0,
      href: "/coins/ethereum",
    },
    {
      label: "Fear & greed",
      value: fgValue !== undefined ? String(fgValue) : "—",
      change: fgLabel,
      special: "brand" as const,
      href: "/fear-greed",
    },
    {
      label: "Market cap",
      value: marketCap ? formatDollarCompact(marketCap) : "—",
      change: marketCap ? formatPercent(mcapChg) : "—",
      up: mcapChg >= 0,
      href: "/metrics",
    },
    {
      label: "24h volume",
      value: vol24h ? formatDollarCompact(vol24h) : "—",
      change: "24h",
      up: true,
      href: "/metrics",
    },
    {
      label: "BTC dominance",
      value: btcDom ? `${btcDom.toFixed(1)}%` : "—",
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
              <p className={clsx(
                "font-extrabold font-[family-name:var(--font-data)] tracking-[-0.5px] leading-none truncate",
                m.value.length > 6 ? "text-[14px]" : "text-[17px]",
                m.special === "brand" && "text-[var(--color-brand)]",
              )}>
                {m.value}
              </p>
              <p className={clsx(
                "text-[9.5px] font-bold font-[family-name:var(--font-data)]",
                m.special === "brand" ? "text-[var(--color-brand)]" :
                m.up ? "text-positive" : "text-negative"
              )}>
                {!m.special && m.change && (m.up ? "▲ " : "▼ ")}{m.change}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

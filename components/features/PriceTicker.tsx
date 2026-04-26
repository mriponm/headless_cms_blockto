"use client";
import useSWR from "swr";
import { usePriceStore } from "@/lib/store/priceStore";
import { formatPrice, formatPercent, percentClass } from "@/lib/utils/formatters";
import { COIN_ICONS } from "@/components/features/prices/coinIcons";
import clsx from "clsx";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MarketCoin {
  id: string; symbol: string; name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const SYMBOLS = [
  { symbol: "BTC",  binance: "BTCUSDT"  },
  { symbol: "ETH",  binance: "ETHUSDT"  },
  { symbol: "SOL",  binance: "SOLUSDT"  },
  { symbol: "XRP",  binance: "XRPUSDT"  },
  { symbol: "BNB",  binance: "BNBUSDT"  },
  { symbol: "ADA",  binance: "ADAUSDT"  },
  { symbol: "DOGE", binance: "DOGEUSDT" },
  { symbol: "AVAX", binance: "AVAXUSDT" },
  { symbol: "LINK", binance: "LINKUSDT" },
  { symbol: "DOT",  binance: "DOTUSDT"  },
  { symbol: "LTC",  binance: "LTCUSDT"  },
  { symbol: "TRX",  binance: "TRXUSDT"  },
];

function priceAnimName(dir: "up" | "down", version: number) {
  const ab = version % 2 === 0 ? "" : "-b";
  return dir === "up" ? `price-flash-up${ab}` : `price-flash-dn${ab}`;
}

export default function PriceTicker() {
  const prices       = usePriceStore((s) => s.prices);
  const changes      = usePriceStore((s) => s.changes);
  const flash        = usePriceStore((s) => s.flash);
  const flashVersion = usePriceStore((s) => s.flashVersion);

  const { data: markets } = useSWR<MarketCoin[]>("/api/markets", fetcher, {
    refreshInterval: 60_000,
    dedupingInterval: 30_000,
    keepPreviousData: true,
  });

  // Triple-duplicate so the seamless loop always has content visible
  const items = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS];

  return (
    <div className="ticker-fade ticker-bar relative overflow-hidden py-2.5">
      <div
        className="ticker-inner flex items-center w-max"
        style={{ animation: "ticker-scroll 65s linear infinite" }}
      >
        {items.map((item, i) => {
          const meta       = markets?.find((c) => c.symbol.toUpperCase() === item.symbol);
          const livePrice  = prices[item.binance] || meta?.current_price || 0;
          const liveChange = changes[item.binance] ?? meta?.price_change_percentage_24h ?? 0;
          const flashDir   = flash[item.binance];
          const version    = flashVersion[item.binance] ?? 0;
          const iconSrc    = (COIN_ICONS as Record<string, string>)[item.symbol];

          return (
            <span
              key={`${item.symbol}-${i}`}
              className="flex items-center gap-1.5 whitespace-nowrap px-5 border-r border-[rgba(255,255,255,0.06)] last:border-0"
            >
              {/* Coin logo */}
              {iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconSrc} alt={item.symbol} width={16} height={16}
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-extrabold flex-shrink-0"
                  style={{ background: "rgba(255,106,0,0.15)", color: "#ff6a00" }}>
                  {item.symbol[0]}
                </span>
              )}

              {/* Symbol */}
              <span className="font-bold text-[11px] text-[#888] font-[family-name:var(--font-data)] uppercase tracking-[0.3px]">
                {item.symbol}
              </span>

              {/* Price — white base, flash green/red on tick */}
              <span
                key={version}
                className="font-[family-name:var(--font-data)] font-semibold text-[13px]"
                style={{
                  color: "var(--color-text)",
                  animation: flashDir
                    ? `${priceAnimName(flashDir, version)} 800ms ease-out forwards`
                    : undefined,
                }}
              >
                {livePrice ? formatPrice(livePrice) : "…"}
              </span>

              {/* 24h change — always green/red */}
              <span className={clsx("text-[11px] font-bold font-[family-name:var(--font-data)]", percentClass(liveChange))}>
                {formatPercent(liveChange)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

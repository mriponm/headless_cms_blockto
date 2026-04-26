"use client";
import { useEffect } from "react";
import useSWR from "swr";
import { usePriceSocket } from "@/lib/hooks/usePriceSocket";
import { usePriceStore } from "@/lib/store/priceStore";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MarketCoin {
  symbol: string;
  price_change_percentage_24h: number;
}

// Seeds stable 24h % changes from CoinGecko markets into the price store
function ChangesFeeder() {
  const setChanges = usePriceStore((s) => s.setChanges);
  const { data: markets } = useSWR<MarketCoin[]>("/api/markets", fetcher, {
    refreshInterval: 60_000,
    dedupingInterval: 30_000,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!markets) return;
    const map: Record<string, number> = {};
    for (const c of markets) {
      const binSym = `${c.symbol.toUpperCase()}USDT`;
      map[binSym] = c.price_change_percentage_24h ?? 0;
    }
    setChanges(map);
  }, [markets, setChanges]);

  return null;
}

export default function PriceProvider({ children }: { children: React.ReactNode }) {
  usePriceSocket();
  return (
    <>
      <ChangesFeeder />
      {children}
    </>
  );
}

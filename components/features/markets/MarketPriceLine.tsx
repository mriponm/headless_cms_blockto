"use client";
import { useCryptoData } from "@/lib/hooks/useCryptoData";

interface Props {
  catSlug: string;
}

function fmt(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

const COIN_MAP: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  altcoin: "solana",
  nft: "ethereum",
};

export default function MarketPriceLine({ catSlug }: Props) {
  const { data } = useCryptoData();
  const coinId = COIN_MAP[catSlug] ?? "bitcoin";
  const coin = data?.coins.find((c) => c.id === coinId);

  if (!coin) {
    return (
      <div className="flex items-baseline gap-2.5 mb-3">
        <span
          className="text-[22px] font-black font-[family-name:var(--font-data)] tracking-[-0.5px]"
          style={{
            background: "linear-gradient(135deg,#fff,#ffaa44)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Loading…
        </span>
      </div>
    );
  }

  const pct = coin.price_change_percentage_24h ?? 0;
  const up = pct >= 0;

  return (
    <div className="flex items-baseline gap-2.5 mb-3">
      <span
        className="text-[22px] font-black font-[family-name:var(--font-data)] tracking-[-0.5px]"
        style={{
          background: "linear-gradient(135deg,#fff,#ffaa44)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {fmt(coin.current_price)}
      </span>
      <span
        className="text-[12px] font-bold"
        style={{ color: up ? "#00d47b" : "#ff3b4f" }}
      >
        {up ? "▲" : "▼"} {up ? "+" : ""}{pct.toFixed(1)}% (24h)
      </span>
    </div>
  );
}

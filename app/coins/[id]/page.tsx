import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPosts } from "@/lib/wordpress/queries";
import CoinDetailView from "@/components/features/coins/CoinDetailView";

const BASE = "https://api.coingecko.com/api/v3";

async function fetchCoin(id: string) {
  try {
    const res = await fetch(
      `${BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const coin = await fetchCoin(id);
  if (!coin) return { title: "Coin not found · Blockto" };

  const price = coin.market_data?.current_price?.usd;
  const change = coin.market_data?.price_change_percentage_24h;

  return {
    title: `${coin.name} (${coin.symbol?.toUpperCase()}) $${price?.toLocaleString()} · Blockto`,
    description: `Live ${coin.name} price, chart, market cap and analysis. ${change >= 0 ? "+" : ""}${change?.toFixed(2)}% in the last 24h.`,
    openGraph: {
      images: [coin.image?.large],
    },
  };
}

export default async function CoinPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [coin, news] = await Promise.all([
    fetchCoin(id),
    getPosts(3, id).catch(() => []),
  ]);

  if (!coin) notFound();

  return <CoinDetailView coin={coin} news={news} />;
}

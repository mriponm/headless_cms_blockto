import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPosts } from "@/lib/wordpress/queries";
import CoinDetailView from "@/components/features/coins/CoinDetailView";

const CG_KEY = process.env.COINGECKO_PRO_API_KEY;
const CG_BASE = "https://pro-api.coingecko.com/api/v3";

// On-demand ISR: any coin page generated at first request, revalidated every 60s
// No generateStaticParams = fully dynamic, works for ANY CoinGecko coin ID
export const revalidate = 60;

async function fetchCoin(id: string) {
  try {
    const res = await fetch(
      `${CG_BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
      {
        headers: { "x-cg-pro-api-key": CG_KEY!, Accept: "application/json" },
        next: { revalidate: 60 },
      },
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

  const price  = coin.market_data?.current_price?.usd;
  const change = coin.market_data?.price_change_percentage_24h ?? 0;
  const sym    = coin.symbol?.toUpperCase() ?? "";

  return {
    title: `${coin.name} (${sym}) ${price ? `$${price.toLocaleString()}` : ""} · Blockto`,
    description: `Live ${coin.name} price, chart, market cap and analysis. ${change >= 0 ? "+" : ""}${change.toFixed(2)}% in the last 24h.`,
    openGraph: {
      title: `${coin.name} · Blockto`,
      description: `${sym} — $${price?.toLocaleString() ?? "—"} (${change >= 0 ? "+" : ""}${change.toFixed(2)}%)`,
      images: coin.image?.large ? [coin.image.large] : [],
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

  // If coin ID is invalid or CoinGecko has no data → 404 page
  if (!coin) notFound();

  return <CoinDetailView coin={coin} news={news} />;
}

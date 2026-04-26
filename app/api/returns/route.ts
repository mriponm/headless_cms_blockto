import { NextResponse } from "next/server";

const CG_KEY = process.env.COINGECKO_PRO_API_KEY;
const BASE = "https://pro-api.coingecko.com/api/v3";

// Returns yearly BTC price data for annual returns calculation
export async function GET() {
  try {
    const res = await fetch(
      `${BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=3650&interval=daily`,
      {
        headers: { "x-cg-pro-api-key": CG_KEY!, Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) throw new Error(`CoinGecko returns error: ${res.status}`);
    const json = await res.json();
    const prices: [number, number][] = json.prices ?? [];

    // Group by year → start price and end price → compute annual return
    const byYear: Record<number, { start: number; end: number }> = {};
    for (const [ts, price] of prices) {
      const year = new Date(ts).getUTCFullYear();
      if (!byYear[year]) byYear[year] = { start: price, end: price };
      byYear[year].end = price;
    }

    const returns = Object.entries(byYear).map(([year, { start, end }]) => ({
      year: parseInt(year),
      startPrice: start,
      endPrice: end,
      returnPct: ((end - start) / start) * 100,
    }));

    return NextResponse.json(returns);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

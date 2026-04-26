import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`Binance pairs error: ${res.status}`);
    const all = await res.json() as Array<{
      symbol: string; volume: string; quoteVolume: string;
      priceChangePercent: string; lastPrice: string;
    }>;

    // Top 10 USDT pairs by quote volume
    const usdt = all
      .filter((t) => t.symbol.endsWith("USDT"))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 10)
      .map((t) => ({
        symbol: t.symbol,
        base: t.symbol.replace("USDT", ""),
        price: parseFloat(t.lastPrice),
        volume24h: parseFloat(t.quoteVolume),
        change24h: parseFloat(t.priceChangePercent),
      }));

    return NextResponse.json(usdt);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

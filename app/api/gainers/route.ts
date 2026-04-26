import { NextResponse } from "next/server";

const CG_KEY = process.env.COINGECKO_PRO_API_KEY;
const CG_BASE = "https://pro-api.coingecko.com/api/v3";

const STABLES = new Set([
  "USDT","USDC","BUSD","DAI","TUSD","USDP","FRAX","GUSD","PAXG",
  "FDUSD","USDD","USDJ","USTC","AEUR","EURR","EURI","USDE","PYUSD",
]);

interface BinanceTicker {
  symbol: string; priceChangePercent: string;
  lastPrice: string; quoteVolume: string;
}

interface CGCoin {
  id: string; symbol: string; name: string; image: string;
  current_price: number; price_change_percentage_24h: number;
}

export async function GET() {
  try {
    // Parallel: Binance 24hr ticker + CoinGecko top 250 (covers all legit high-volume coins)
    const [binanceRes, cgRes] = await Promise.all([
      fetch("https://api.binance.com/api/v3/ticker/24hr", { next: { revalidate: 60 } }),
      fetch(
        `${CG_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
        { headers: { "x-cg-pro-api-key": CG_KEY!, Accept: "application/json" }, next: { revalidate: 300 } }
      ),
    ]);

    if (!binanceRes.ok) throw new Error("Binance error");
    if (!cgRes.ok)     throw new Error("CoinGecko error");

    const binanceAll: BinanceTicker[] = await binanceRes.json();
    const cgCoins: CGCoin[]           = await cgRes.json();

    // Build symbol → CoinGecko coin map (uppercase key)
    const cgMap = new Map<string, CGCoin>();
    for (const c of cgCoins) cgMap.set(c.symbol.toUpperCase(), c);

    // Filter Binance USDT pairs:
    // - $1M+ 24h volume (catch pumping coins that might be mid-cap)
    // - NOT a stablecoin
    // - EXISTS in CoinGecko top 250 → guarantees icon + detail page + legit coin
    const enriched = binanceAll
      .filter((t) => {
        const base = t.symbol.replace("USDT", "");
        return (
          t.symbol.endsWith("USDT") &&
          !STABLES.has(base) &&
          parseFloat(t.quoteVolume) > 1_000_000 &&
          cgMap.has(base)
        );
      })
      .map((t) => {
        const base = t.symbol.replace("USDT", "");
        const cg   = cgMap.get(base)!;
        return {
          symbol:    base,
          price:     parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          volume24h: parseFloat(t.quoteVolume),
          cgId:      cg.id,
          name:      cg.name,
          image:     cg.image,
        };
      });

    const sorted = [...enriched].sort((a, b) => b.change24h - a.change24h);

    return NextResponse.json({
      gainers: sorted.slice(0, 10),
      losers:  sorted.slice(-10).reverse(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

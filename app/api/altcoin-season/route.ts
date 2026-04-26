import { NextResponse } from "next/server";

// Top 30 alts — good coverage, ~10s first call (then 6hr cached)
const TOP_ALTS = [
  "ETH","SOL","BNB","XRP","ADA","DOGE","AVAX","LINK","DOT","LTC",
  "UNI","ATOM","NEAR","TRX","SHIB","OP","ARB","APT","INJ","SUI",
  "MATIC","HBAR","XLM","ETC","AAVE","MKR","ALGO","RUNE","PEPE","KAS",
];

const CC = "https://min-api.cryptocompare.com/data";

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// Sequential with 350ms gap = ~2.8 req/sec — well under CC 5/sec free limit
async function fetchAllHistorical(
  symbols: string[],
  ts: number
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};

  for (const sym of symbols) {
    try {
      const r   = await fetch(`${CC}/pricehistorical?fsym=${sym}&tsyms=USD&ts=${ts}`, { cache: "no-store" });
      const j   = await r.json();
      const p   = j?.[sym]?.USD;
      if (typeof p === "number" && p > 0) result[sym] = p;
    } catch {
      // skip
    }
    await sleep(210); // 210ms = ~4.7 req/sec, safely under CC 5/sec free limit
  }

  return result;
}

// In-memory cache — only store if we got good data (>= 15 valid alts)
let cache: { data: object; ts: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000;

export async function GET() {
  // Serve cached result if fresh and valid
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600" },
    });
  }

  try {
    const ts90d   = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
    const allSyms = ["BTC", ...TOP_ALTS];

    // Current prices — 1 call
    const currRes  = await fetch(`${CC}/pricemulti?fsyms=${allSyms.join(",")}&tsyms=USD`, { cache: "no-store" });
    const currJson = await currRes.json();

    // Historical prices 90d ago — sequential, 350ms gap
    const hist90d = await fetchAllHistorical(allSyms, ts90d);

    // Calculate 90d returns
    const returns: Record<string, number> = {};
    for (const sym of allSyms) {
      const now  = currJson?.[sym]?.USD ?? 0;
      const then = hist90d[sym] ?? 0;
      if (now > 0 && then > 0) {
        returns[sym] = ((now - then) / then) * 100;
      }
    }

    const btcReturn    = returns["BTC"] ?? 0;
    const validAlts    = TOP_ALTS.filter((s) => s in returns);
    const outperformed = validAlts.filter((s) => returns[s] > btcReturn);
    const index = validAlts.length > 0
      ? Math.round((outperformed.length / validAlts.length) * 100)
      : 0;

    const label =
      index >= 75 ? "Altcoin Season" :
      index >= 55 ? "Altcoin Month"  :
      index >= 45 ? "Neutral"        :
      index >= 25 ? "Bitcoin Month"  : "Bitcoin Season";

    const data = {
      index,
      label,
      btcReturn90d:     parseFloat(btcReturn.toFixed(2)),
      outperformed:     outperformed.length,
      total:            validAlts.length,
      topOutperformers: outperformed
        .sort((a, b) => returns[b] - returns[a])
        .slice(0, 5)
        .map((s) => ({ symbol: s, return90d: parseFloat(returns[s].toFixed(2)) })),
    };

    // Only cache if we got enough valid data
    if (validAlts.length >= 20) {
      cache = { data, ts: Date.now() };
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

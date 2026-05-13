import { NextRequest, NextResponse } from "next/server";

const BINANCE = "https://api.binance.com/api/v3";

const INTERVAL_MS: Record<string, number> = {
  "1m": 60_000, "3m": 180_000, "5m": 300_000, "15m": 900_000, "30m": 1_800_000,
  "1h": 3_600_000, "2h": 7_200_000, "4h": 14_400_000, "6h": 21_600_000,
  "8h": 28_800_000, "12h": 43_200_000, "1d": 86_400_000, "3d": 259_200_000,
  "1w": 604_800_000,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const { searchParams } = new URL(req.url);
  const interval = searchParams.get("interval") ?? "1h";
  const months   = searchParams.get("months");

  // -- Multi-page fetch for long history (e.g. 6M of 1h candles = ~4320 bars) --
  if (months) {
    const monthCount = Math.min(parseInt(months, 10) || 6, 24); // cap at 24 months
    const startMs    = Date.now() - monthCount * 30 * 24 * 60 * 60 * 1000;
    const intervalMs = INTERVAL_MS[interval] ?? 3_600_000;
    const allBars: unknown[] = [];
    let currentStart = startMs;

    while (currentStart < Date.now() && allBars.length < 10_000) {
      try {
        const res = await fetch(
          `${BINANCE}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&startTime=${currentStart}&limit=1000`,
          { next: { revalidate: 0 } },
        );
        if (!res.ok) break;
        const chunk: unknown[][] = await res.json();
        if (!Array.isArray(chunk) || chunk.length === 0) break;
        allBars.push(...chunk);
        if (chunk.length < 1000) break; // reached current time
        currentStart = Number(chunk[chunk.length - 1][0]) + intervalMs;
      } catch { break; }
    }

    return NextResponse.json(allBars, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  }

  // -- Single request (short timeframes) --
  const limit = searchParams.get("limit") ?? "200";
  try {
    const res = await fetch(
      `${BINANCE}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Binance fetch failed" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

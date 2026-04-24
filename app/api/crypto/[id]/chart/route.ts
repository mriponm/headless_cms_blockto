import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.coingecko.com/api/v3";

// CoinGecko OHLC accepts specific day values only
const VALID_OHLC_DAYS = new Set(["1", "7", "14", "30", "90", "180", "365", "max"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const days = searchParams.get("days") ?? "1";
  const type = searchParams.get("type") ?? "ohlc";

  try {
    let url: string;

    if (type === "ohlc") {
      const ohlcDays = VALID_OHLC_DAYS.has(days) ? days : "1";
      url = `${BASE}/coins/${id}/ohlc?vs_currency=usd&days=${ohlcDays}`;
    } else {
      url = `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&precision=4`;
    }

    const res = await fetch(url, { next: { revalidate: 0 } });

    if (!res.ok) {
      return NextResponse.json({ error: "Chart data unavailable" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

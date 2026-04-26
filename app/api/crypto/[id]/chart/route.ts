import { NextRequest, NextResponse } from "next/server";

const CG_KEY = process.env.COINGECKO_PRO_API_KEY;
const BASE   = "https://pro-api.coingecko.com/api/v3";

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
      const d = VALID_OHLC_DAYS.has(days) ? days : "1";
      url = `${BASE}/coins/${id}/ohlc?vs_currency=usd&days=${d}`;
    } else {
      url = `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&precision=6`;
    }

    const res = await fetch(url, {
      headers: { "x-cg-pro-api-key": CG_KEY!, Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Chart data unavailable" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

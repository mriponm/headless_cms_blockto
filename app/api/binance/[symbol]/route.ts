import { NextRequest, NextResponse } from "next/server";

const BINANCE = "https://api.binance.com/api/v3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const { searchParams } = new URL(req.url);
  const interval = searchParams.get("interval") ?? "1h";
  const limit    = searchParams.get("limit")    ?? "200";

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

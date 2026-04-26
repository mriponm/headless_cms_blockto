import { NextResponse } from "next/server";

// CryptoCompare — free, no key, 4yr+ daily BTC/USD data
const CC_BASE = "https://min-api.cryptocompare.com/data/v2";

export async function GET() {
  try {
    const res = await fetch(
      `${CC_BASE}/histoday?fsym=BTC&tsym=USD&limit=1460`,
      { next: { revalidate: 3600 } }   // cache 1hr — daily data doesn't change faster
    );
    if (!res.ok) throw new Error(`CryptoCompare error: ${res.status}`);
    const json = await res.json();

    if (json.Response !== "Success" || !json.Data?.Data) {
      throw new Error(`CryptoCompare: ${json.Message ?? "unknown error"}`);
    }

    // Transform to [timestamp_ms, price] — same format RainbowChart expects
    const prices: [number, number][] = json.Data.Data.map(
      (d: { time: number; close: number }) => [d.time * 1000, d.close]
    );

    return NextResponse.json(prices);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

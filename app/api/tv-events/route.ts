import { NextResponse } from "next/server";

const TV_URL = "https://economic-calendar.tradingview.com/events";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const now   = new Date();
  const start = searchParams.get("from") ?? new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end   = searchParams.get("to")   ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

  try {
    const res = await fetch(`${TV_URL}?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`, {
      headers: {
        "Origin":  "https://www.tradingview.com",
        "Referer": "https://www.tradingview.com/",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) return NextResponse.json([], { status: res.status });

    const data = await res.json();
    return NextResponse.json(data?.result ?? []);
  } catch (err) {
    console.error("[/api/tv-events]", err);
    return NextResponse.json([], { status: 502 });
  }
}

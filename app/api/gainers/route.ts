import { NextResponse } from "next/server";

const CMC_KEY = process.env.CMC_PRO_API_KEY;

export async function GET() {
  try {
    const res = await fetch(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/gainers-losers?limit=10&time_period=24h",
      {
        headers: { "X-CMC_PRO_API_KEY": CMC_KEY!, Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) throw new Error(`CMC gainers error: ${res.status}`);
    const json = await res.json();
    return NextResponse.json(json.data ?? {});
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

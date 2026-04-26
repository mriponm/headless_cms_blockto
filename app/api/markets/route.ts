import { NextResponse } from "next/server";

const CG_KEY = process.env.COINGECKO_PRO_API_KEY;
const BASE = "https://pro-api.coingecko.com/api/v3";

export async function GET() {
  try {
    const res = await fetch(
      `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C30d`,
      {
        headers: { "x-cg-pro-api-key": CG_KEY!, Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) throw new Error(`CoinGecko markets error: ${res.status}`);
    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

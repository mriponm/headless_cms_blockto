import { NextResponse } from "next/server";

const BASE = "https://api.coingecko.com/api/v3";
const COINS = "bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano,avalanche-2,chainlink,polkadot";

export async function GET() {
  try {
    const [coinsRes, globalRes] = await Promise.all([
      fetch(`${BASE}/coins/markets?vs_currency=usd&ids=${COINS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`, { next: { revalidate: 0 } }),
      fetch(`${BASE}/global`, { next: { revalidate: 0 } }),
    ]);

    if (!coinsRes.ok || !globalRes.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
    }

    const [coins, globalWrapper] = await Promise.all([coinsRes.json(), globalRes.json()]);

    return NextResponse.json({ coins, global: globalWrapper.data, timestamp: Date.now() });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

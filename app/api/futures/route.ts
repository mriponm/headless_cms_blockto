import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [liqRes, oiRes, fundRes] = await Promise.all([
      // Recent liquidations (last 24h window, top symbol BTC)
      fetch("https://fapi.binance.com/fapi/v1/forceOrders?symbol=BTCUSDT&limit=1000", {
        next: { revalidate: 30 },
      }),
      // Open interest for major pairs
      fetch("https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT", {
        next: { revalidate: 30 },
      }),
      // Funding rate
      fetch("https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=1", {
        next: { revalidate: 300 },
      }),
    ]);

    let longLiq = 0;
    let shortLiq = 0;
    let largestSingle = 0;

    if (liqRes.ok) {
      const orders = await liqRes.json() as Array<{
        side: string; origQty: string; price: string; averagePrice: string;
      }>;
      for (const o of orders) {
        const value = parseFloat(o.origQty) * parseFloat(o.averagePrice || o.price);
        if (o.side === "SELL") longLiq += value;   // long position liquidated = sell order
        else shortLiq += value;
        if (value > largestSingle) largestSingle = value;
      }
    }

    let openInterest = 0;
    if (oiRes.ok) {
      const oi = await oiRes.json();
      openInterest = parseFloat(oi.openInterest ?? "0");
    }

    let fundingRate = 0;
    if (fundRes.ok) {
      const fr = await fundRes.json() as Array<{ fundingRate: string }>;
      fundingRate = parseFloat(fr[0]?.fundingRate ?? "0");
    }

    return NextResponse.json({
      longLiquidations: longLiq,
      shortLiquidations: shortLiq,
      total: longLiq + shortLiq,
      largestSingle,
      openInterest,
      fundingRate,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

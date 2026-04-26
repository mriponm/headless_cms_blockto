import { NextResponse } from "next/server";

const BASE = "https://fapi.binance.com";

export async function GET() {
  try {
    const [oiHistRes, takerRes, lsRatioRes, fundingRes, oiRes] = await Promise.all([
      // 24h hourly OI history — to get OI change
      fetch(`${BASE}/futures/data/openInterestHist?symbol=BTCUSDT&period=1h&limit=24`, { next: { revalidate: 300 } }),
      // 24h hourly taker buy/sell volume — buy vs sell pressure
      fetch(`${BASE}/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=1h&limit=24`, { next: { revalidate: 300 } }),
      // Current global long/short account ratio
      fetch(`${BASE}/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1h&limit=1`, { next: { revalidate: 60 } }),
      // Current funding rate
      fetch(`${BASE}/fapi/v1/fundingRate?symbol=BTCUSDT&limit=1`, { next: { revalidate: 300 } }),
      // Current OI
      fetch(`${BASE}/fapi/v1/openInterest?symbol=BTCUSDT`, { next: { revalidate: 60 } }),
    ]);

    // Open interest
    const oiData   = oiRes.ok  ? await oiRes.json()   : null;
    const oiHistData = oiHistRes.ok ? await oiHistRes.json() : [];
    const currentOI  = parseFloat(oiData?.openInterest ?? "0");

    // OI 24h ago vs now (% change)
    const oi24hAgo = oiHistData.length > 0
      ? parseFloat(oiHistData[0]?.sumOpenInterest ?? "0")
      : 0;
    const oiChange24h = oi24hAgo > 0
      ? ((currentOI - oi24hAgo) / oi24hAgo) * 100
      : 0;

    // 24h OI value in USD (last data point)
    const lastOIHist = oiHistData[oiHistData.length - 1];
    const oiValueUSD = parseFloat(lastOIHist?.sumOpenInterestValue ?? "0");

    // Taker buy/sell volumes (sum 24h)
    const takerData: Array<{ buyVol: string; sellVol: string }> = takerRes.ok ? await takerRes.json() : [];
    const buyVol24h  = takerData.reduce((s, r) => s + parseFloat(r.buyVol  ?? "0"), 0);
    const sellVol24h = takerData.reduce((s, r) => s + parseFloat(r.sellVol ?? "0"), 0);
    // Convert BTC volumes to USD using last OI price proxy
    const btcPrice   = oiValueUSD > 0 && currentOI > 0 ? oiValueUSD / currentOI : 0;
    const buyVolUSD  = buyVol24h  * btcPrice;
    const sellVolUSD = sellVol24h * btcPrice;

    // Long/short ratio
    const lsData    = lsRatioRes.ok ? await lsRatioRes.json() : [];
    const lsEntry   = Array.isArray(lsData) ? lsData[0] : null;
    const lsRatio   = parseFloat(lsEntry?.longShortRatio ?? "0");
    const longPct   = parseFloat(lsEntry?.longAccount    ?? "0") * 100;
    const shortPct  = parseFloat(lsEntry?.shortAccount   ?? "0") * 100;

    // Funding rate
    const fundData  = fundingRes.ok ? await fundingRes.json() : [];
    const fundRate  = parseFloat((Array.isArray(fundData) ? fundData[0] : fundData)?.fundingRate ?? "0");

    return NextResponse.json({
      oiValueUSD,
      oiChange24h:  parseFloat(oiChange24h.toFixed(2)),
      buyVolUSD,
      sellVolUSD,
      lsRatio:      parseFloat(lsRatio.toFixed(4)),
      longPct:      parseFloat(longPct.toFixed(1)),
      shortPct:     parseFloat(shortPct.toFixed(1)),
      fundingRate:  fundRate,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

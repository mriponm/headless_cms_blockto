import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [tvlRes, stableRes] = await Promise.all([
      fetch("https://api.llama.fi/v2/globalCharts", { next: { revalidate: 3600 } }),
      fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", { next: { revalidate: 3600 } }),
    ]);

    if (!tvlRes.ok) throw new Error("DefiLlama TVL error");

    const tvlData = await tvlRes.json();
    const latestTvl = Array.isArray(tvlData) ? tvlData[tvlData.length - 1] : null;

    let stables: Array<{ name: string; symbol: string; peggedUSD: number }> = [];
    if (stableRes.ok) {
      const s = await stableRes.json();
      stables = (s.peggedAssets ?? [])
        .sort((a: { circulating: { peggedUSD: number } }, b: { circulating: { peggedUSD: number } }) =>
          (b.circulating?.peggedUSD ?? 0) - (a.circulating?.peggedUSD ?? 0)
        )
        .slice(0, 6)
        .map((a: { name: string; symbol: string; circulating: { peggedUSD: number } }) => ({
          name: a.name,
          symbol: a.symbol,
          peggedUSD: a.circulating?.peggedUSD ?? 0,
        }));
    }

    return NextResponse.json({
      totalTvl: latestTvl?.totalLiquidityUSD ?? 0,
      stables,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

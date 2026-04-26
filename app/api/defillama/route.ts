import { NextResponse } from "next/server";

export async function GET() {
  // Fetch stablecoins + chains TVL in parallel — each failure handled independently
  const [stableRes, chainsRes] = await Promise.allSettled([
    fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", {
      next: { revalidate: 3600 },
    }),
    fetch("https://api.llama.fi/v2/chains", {
      next: { revalidate: 3600 },
    }),
  ]);

  // Stablecoin supply
  let stables: Array<{ name: string; symbol: string; peggedUSD: number }> = [];
  if (stableRes.status === "fulfilled" && stableRes.value.ok) {
    try {
      const s = await stableRes.value.json();
      stables = (s.peggedAssets ?? [])
        .filter((a: { circulating?: { peggedUSD?: number } }) =>
          (a.circulating?.peggedUSD ?? 0) > 100_000_000   // min $100M supply
        )
        .sort((a: { circulating: { peggedUSD: number } }, b: { circulating: { peggedUSD: number } }) =>
          (b.circulating?.peggedUSD ?? 0) - (a.circulating?.peggedUSD ?? 0)
        )
        .slice(0, 6)
        .map((a: { name: string; symbol: string; circulating: { peggedUSD: number } }) => ({
          name:      a.name,
          symbol:    a.symbol,
          peggedUSD: a.circulating?.peggedUSD ?? 0,
        }));
    } catch { /* ignore parse error */ }
  }

  // Total DeFi TVL — sum of all chains
  let totalTvl = 0;
  if (chainsRes.status === "fulfilled" && chainsRes.value.ok) {
    try {
      const chains: Array<{ tvl: number }> = await chainsRes.value.json();
      totalTvl = chains.reduce((sum, c) => sum + (c.tvl ?? 0), 0);
    } catch { /* ignore */ }
  }

  return NextResponse.json({ totalTvl, stables });
}

import { NextResponse } from "next/server";

const CC_BASE = "https://min-api.cryptocompare.com/data/v2";
const CACHE: RequestInit = { next: { revalidate: 3600 } };

async function fetchBatch(
  limit: number,
  toTs?: number,
): Promise<[number, number][]> {
  const ts = toTs ? `&toTs=${toTs}` : "";
  const res = await fetch(
    `${CC_BASE}/histoday?fsym=BTC&tsym=USD&limit=${limit}${ts}`,
    CACHE,
  );
  if (!res.ok) throw new Error(`CryptoCompare ${res.status}`);
  const json = await res.json();
  if (json.Response !== "Success" || !json.Data?.Data) {
    throw new Error(json.Message ?? "CryptoCompare error");
  }
  return (json.Data.Data as { time: number; close: number }[])
    .filter((d) => d.close > 0)
    .map((d) => [d.time * 1000, d.close]);
}

export async function GET() {
  try {
    // First batch: most recent 2000 days (~5.5 years)
    const batch1 = await fetchBatch(2000);

    // Second batch: 2000 days before that (~another 5.5 years → ~11 years total)
    let all = batch1;
    if (batch1.length >= 1990) {
      const oldestSec = Math.floor(batch1[0][0] / 1000);
      try {
        const batch2 = await fetchBatch(2000, oldestSec);
        all = [...batch2, ...batch1];
      } catch {
        // Use what we have if older data is unavailable
      }
    }

    // Deduplicate by timestamp and sort ascending
    const seen = new Set<number>();
    const prices: [number, number][] = all
      .filter(([ts]) => {
        if (seen.has(ts)) return false;
        seen.add(ts);
        return true;
      })
      .sort(([a], [b]) => a - b);

    return NextResponse.json(prices);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

const CMC_KEY = process.env.CMC_PRO_API_KEY;
const BASE = "https://pro-api.coinmarketcap.com";

export async function GET() {
  try {
    const [latestRes, histRes] = await Promise.all([
      fetch(`${BASE}/v3/fear-and-greed/latest`, {
        headers: { "X-CMC_PRO_API_KEY": CMC_KEY!, Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
      fetch(`${BASE}/v3/fear-and-greed/historical?limit=30`, {
        headers: { "X-CMC_PRO_API_KEY": CMC_KEY!, Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!latestRes.ok) throw new Error(`CMC F&G error: ${latestRes.status}`);

    const latest = await latestRes.json();
    const history = histRes.ok ? await histRes.json() : { data: [] };

    return NextResponse.json({
      current: latest.data,
      history: history.data ?? [],
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

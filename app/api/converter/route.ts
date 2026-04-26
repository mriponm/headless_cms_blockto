import { NextResponse } from "next/server";

const CMC_KEY = process.env.CMC_PRO_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount") ?? "1";
  const from = searchParams.get("from") ?? "BTC";
  const to = searchParams.get("to") ?? "USD";

  try {
    const res = await fetch(
      `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?amount=${amount}&symbol=${from}&convert=${to}`,
      {
        headers: { "X-CMC_PRO_API_KEY": CMC_KEY!, Accept: "application/json" },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`CMC converter error: ${res.status}`);
    const json = await res.json();
    const price = json.data?.[0]?.quote?.[to]?.price ?? 0;
    return NextResponse.json({ price, from, to, amount: parseFloat(amount) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

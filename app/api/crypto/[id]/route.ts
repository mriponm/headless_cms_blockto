import { NextRequest, NextResponse } from "next/server";

const CG_KEY = process.env.COINGECKO_PRO_API_KEY;
const BASE   = "https://pro-api.coingecko.com/api/v3";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const res = await fetch(
      `${BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
      {
        headers: { "x-cg-pro-api-key": CG_KEY!, Accept: "application/json" },
        next: { revalidate: 60 },
      },
    );

    if (res.status === 404) {
      return NextResponse.json({ error: "Coin not found" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error", status: res.status }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

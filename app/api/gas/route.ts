import { NextResponse } from "next/server";

const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY;

export async function GET() {
  try {
    const res = await fetch(
      `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_KEY}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) throw new Error(`Etherscan gas error: ${res.status}`);
    const json = await res.json();
    if (json.status !== "1") throw new Error(`Etherscan: ${json.message}`);
    const r = json.result;
    return NextResponse.json({
      slow: parseInt(r.SafeGasPrice),
      standard: parseInt(r.ProposeGasPrice),
      fast: parseInt(r.FastGasPrice),
      baseFee: parseFloat(r.suggestBaseFee ?? "0"),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

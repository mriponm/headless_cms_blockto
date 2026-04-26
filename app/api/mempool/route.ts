import { NextResponse } from "next/server";

const BASE = "https://mempool.space/api";
const NEXT_HALVING_BLOCK = 1_050_000;
const AVG_BLOCK_TIME_SEC = 600; // 10 minutes

export async function GET() {
  try {
    const [heightRes, hashrateRes, diffRes] = await Promise.all([
      fetch(`${BASE}/blocks/tip/height`, { next: { revalidate: 60 } }),
      fetch(`${BASE}/v1/mining/hashrate/3d`, { next: { revalidate: 60 } }),
      fetch(`${BASE}/v1/difficulty-adjustment`, { next: { revalidate: 60 } }),
    ]);

    if (!heightRes.ok) throw new Error("Mempool height error");

    const currentBlock: number = await heightRes.json();
    const blocksRemaining = Math.max(0, NEXT_HALVING_BLOCK - currentBlock);
    const secondsRemaining = blocksRemaining * AVG_BLOCK_TIME_SEC;
    const halvingDate = new Date(Date.now() + secondsRemaining * 1000).toISOString();

    let hashrate = 0;
    let difficulty = 0;
    if (hashrateRes.ok) {
      const hr = await hashrateRes.json();
      hashrate = hr.currentHashrate ?? 0;
    }
    if (diffRes.ok) {
      const d = await diffRes.json();
      difficulty = d.difficultyChange ?? 0;
    }

    return NextResponse.json({
      currentBlock,
      blocksRemaining,
      halvingDate,
      halvingBlock: NEXT_HALVING_BLOCK,
      progressPct: ((currentBlock % 210_000) / 210_000) * 100,
      hashratePH: hashrate / 1e15, // convert to PH/s
      difficultyChange: difficulty,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

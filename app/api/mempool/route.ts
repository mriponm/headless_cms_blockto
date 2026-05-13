import { NextResponse } from "next/server";

export const revalidate = 60;

const BASE = "https://mempool.space/api";
const NEXT_HALVING_BLOCK = 1_050_000;
const AVG_BLOCK_TIME_SEC = 600;

// Estimate block height from last halving when mempool.space is unavailable
const LAST_HALVING_BLOCK = 840_000;
const LAST_HALVING_MS = new Date("2024-04-20T00:00:00Z").getTime();

function estimateBlock(): number {
  return LAST_HALVING_BLOCK + Math.floor((Date.now() - LAST_HALVING_MS) / (AVG_BLOCK_TIME_SEC * 1000));
}

function fetchTimeout(url: string, ms = 5000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal, next: { revalidate: 60 } }).finally(() => clearTimeout(id));
}

export async function GET() {
  // All three fetches run in parallel — total wait ≤ 5s even if all fail
  const [heightResult, hashrateResult, diffResult] = await Promise.allSettled([
    fetchTimeout(`${BASE}/blocks/tip/height`),
    fetchTimeout(`${BASE}/v1/mining/hashrate/3d`),
    fetchTimeout(`${BASE}/v1/difficulty-adjustment`),
  ]);

  // Block height — fall back to estimate if unavailable
  let currentBlock: number;
  try {
    const r = heightResult.status === "fulfilled" ? heightResult.value : null;
    currentBlock = r?.ok ? await r.json() : estimateBlock();
  } catch {
    currentBlock = estimateBlock();
  }

  // Hash rate
  let hashrate = 0;
  try {
    const r = hashrateResult.status === "fulfilled" ? hashrateResult.value : null;
    if (r?.ok) { const d = await r.json(); hashrate = d.currentHashrate ?? 0; }
  } catch { /* leave 0 */ }

  // Difficulty change
  let difficulty = 0;
  try {
    const r = diffResult.status === "fulfilled" ? diffResult.value : null;
    if (r?.ok) { const d = await r.json(); difficulty = d.difficultyChange ?? 0; }
  } catch { /* leave 0 */ }

  const blocksRemaining = Math.max(0, NEXT_HALVING_BLOCK - currentBlock);
  const halvingDate = new Date(Date.now() + blocksRemaining * AVG_BLOCK_TIME_SEC * 1000).toISOString();

  return NextResponse.json({
    currentBlock,
    blocksRemaining,
    halvingDate,
    halvingBlock: NEXT_HALVING_BLOCK,
    progressPct: ((currentBlock % 210_000) / 210_000) * 100,
    hashratePH: hashrate / 1e15,
    difficultyChange: difficulty,
  });
}

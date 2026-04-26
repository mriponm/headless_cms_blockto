"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MempoolData {
  currentBlock: number;
  blocksRemaining: number;
  halvingDate: string;
  halvingBlock: number;
  progressPct: number;
  hashratePH: number;
  difficultyChange: number;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function HalvingWidget() {
  const { data, isLoading } = useSWR<MempoolData>("/api/mempool", fetcher, {
    refreshInterval: 60_000,
    keepPreviousData: true,
  });

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const halvingMs = data ? new Date(data.halvingDate).getTime() - now : 0;
  const cd = formatCountdown(halvingMs);

  if (isLoading && !data) {
    return (
      <div className="glass rounded-[20px] p-6 flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-[20px] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-extrabold font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
          BTC Halving Countdown
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[1px] px-2 py-1 rounded-[6px] font-[family-name:var(--font-display)]"
          style={{ background: "rgba(255,106,0,0.1)", color: "var(--color-brand)" }}>
          Live
        </span>
      </div>

      {/* Countdown units */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Days", value: cd.days },
          { label: "Hours", value: cd.hours },
          { label: "Mins", value: cd.minutes },
          { label: "Secs", value: cd.seconds },
        ].map((u) => (
          <div key={u.label} className="rounded-[12px] p-3 text-center"
            style={{ background: "rgba(255,106,0,0.06)", border: "0.5px solid rgba(255,106,0,0.15)" }}>
            <div className="text-[24px] font-extrabold font-[family-name:var(--font-data)] tabular-nums"
              style={{ color: "var(--color-brand)" }}>
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.8px] mt-0.5 font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-muted)" }}>
              {u.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {data && (
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1.5 font-[family-name:var(--font-data)]">
            <span style={{ color: "var(--color-muted)" }}>Block {(data.halvingBlock - 210_000).toLocaleString()}</span>
            <span style={{ color: "var(--color-muted)" }}>Block {data.halvingBlock.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${data.progressPct.toFixed(2)}%`, background: "var(--gradient-brand)" }} />
          </div>
          <div className="flex justify-between text-[10px] mt-1.5 font-[family-name:var(--font-data)]">
            <span style={{ color: "var(--color-muted)" }}>Current: {data.currentBlock.toLocaleString()}</span>
            <span style={{ color: "var(--color-brand)" }}>{data.progressPct.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {data && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Blocks Remaining", value: data.blocksRemaining.toLocaleString() },
            { label: "Est. Halving Date", value: new Date(data.halvingDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
            { label: "Hash Rate", value: `${data.hashratePH.toFixed(0)} EH/s` },
            { label: "Reward After", value: "1.5625 BTC" },
          ].map((s) => (
            <div key={s.label} className="rounded-[10px] p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-[9px] font-bold uppercase tracking-[0.6px] mb-0.5 font-[family-name:var(--font-display)]"
                style={{ color: "var(--color-muted)" }}>
                {s.label}
              </div>
              <div className="text-[13px] font-extrabold font-[family-name:var(--font-data)]"
                style={{ color: "var(--color-text)" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

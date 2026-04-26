"use client";
import { useEffect, useRef, useState, useMemo, memo } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { BINANCE_SYMBOLS } from "@/lib/binanceSymbols";

export interface HoverData {
  date: string;
  open?: string; high?: string; low?: string; close?: string;
  value?: string;
  volume?: string;
  isUp?: boolean;
}

interface KlineBar {
  time: number;
  open: number; high: number; low: number; close: number;
  volume: number;
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error("fetch failed");
  return r.json();
});

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n < 0.001) return n.toFixed(6);
  if (n < 1)     return n.toFixed(4);
  return n.toFixed(2);
}

function fmtVol(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(0);
}

function CoinChartInner({
  coinId,
  type,
  interval,
  limit,
  isLight,
  height = 320,
  onHoverChange,
}: {
  coinId: string;
  type: "candles" | "line";
  interval: string;
  limit: number;
  isLight: boolean;
  height?: number;
  onHoverChange?: (data: HoverData | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const priceRef     = useRef<any>(null);
  const volRef       = useRef<any>(null);
  const onHoverRef   = useRef(onHoverChange);
  onHoverRef.current = onHoverChange;

  const [chartReady, setChartReady]   = useState(false);
  const [wsLive, setWsLive]           = useState(false);
  const [hasData, setHasData]         = useState(false);

  const binanceSymbol = BINANCE_SYMBOLS[coinId] ?? null;

  // ── REST data ─────────────────────────────────────────────────────────────
  const apiUrl = binanceSymbol
    ? `/api/binance/${binanceSymbol}?interval=${interval}&limit=${limit}`
    : null;

  const { data: rawKlines, isLoading } = useSWR<number[][]>(apiUrl, fetcher, {
    refreshInterval: 30_000,
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const klines = useMemo((): KlineBar[] => {
    if (!Array.isArray(rawKlines)) return [];
    const seen = new Set<number>();
    return rawKlines
      .map(k => ({
        time:   Math.floor(Number(k[0]) / 1000),
        open:   parseFloat(k[1] as any),
        high:   parseFloat(k[2] as any),
        low:    parseFloat(k[3] as any),
        close:  parseFloat(k[4] as any),
        volume: parseFloat(k[5] as any),
      }))
      .sort((a, b) => a.time - b.time)
      .filter(b => { if (seen.has(b.time)) return false; seen.add(b.time); return true; });
  }, [rawKlines]);

  // ── Chart init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    setChartReady(false);
    let chart: any = null;
    let ro: ResizeObserver | null = null;
    let rafId = 0;

    async function init() {
      const lw = await import("lightweight-charts");
      if (!containerRef.current) return;

      const bg          = isLight ? "#ffffff" : "transparent";
      const textColor   = isLight ? "#666" : "#555";
      const borderColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)";
      const gridColor   = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.025)";

      chart = lw.createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height,
        layout: {
          background:  { type: lw.ColorType.Solid, color: bg },
          textColor,
          fontFamily:  "'JetBrains Mono', monospace",
          fontSize:    10,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        rightPriceScale: {
          borderColor,
          textColor,
          scaleMargins: { top: 0.06, bottom: 0.22 },
        },
        timeScale: {
          borderColor,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 5,
          lockVisibleTimeRangeOnResize: true,
        },
        crosshair: {
          mode: lw.CrosshairMode.Normal,
          vertLine: { color: "rgba(255,106,0,0.5)", style: 0 as any, width: 1, labelBackgroundColor: "#ff6a00" },
          horzLine: { color: "rgba(255,106,0,0.4)", style: 0 as any, width: 1, labelBackgroundColor: "#ff6a00" },
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale:  { mouseWheel: true, pinch: true },
      });

      chartRef.current = chart;

      // ── Price series ──
      if (type === "candles") {
        priceRef.current = chart.addCandlestickSeries({
          upColor:         "#00d47b",
          downColor:       "#ff3b4f",
          borderUpColor:   "#00d47b",
          borderDownColor: "#ff3b4f",
          wickUpColor:     "rgba(0,212,123,0.7)",
          wickDownColor:   "rgba(255,59,79,0.7)",
        });
      } else {
        priceRef.current = chart.addAreaSeries({
          lineColor:                     "#ff6a00",
          topColor:                      "rgba(255,106,0,0.16)",
          bottomColor:                   "rgba(255,106,0,0)",
          lineWidth:                     2,
          crosshairMarkerRadius:         4,
          crosshairMarkerBorderColor:    "#ff6a00",
          crosshairMarkerBackgroundColor:"#ff6a00",
        });
      }

      // ── Volume histogram ──
      volRef.current = chart.addHistogramSeries({
        priceFormat:   { type: "volume" },
        priceScaleId:  "vol",
        color:         "rgba(255,106,0,0.3)",
      });
      chart.priceScale("vol").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });

      // ── Crosshair hover ──
      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !priceRef.current) { onHoverRef.current?.(null); return; }
        const priceData = param.seriesData.get(priceRef.current);
        const volData   = param.seriesData.get(volRef.current);
        if (!priceData) { onHoverRef.current?.(null); return; }

        const d = new Date((param.time as number) * 1000);
        const dateStr = d.toLocaleDateString("en-US", {
          month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
        const vol = volData ? fmtVol((volData as any).value ?? 0) : undefined;

        if (type === "candles") {
          const bar = priceData as any;
          onHoverRef.current?.({
            date: dateStr,
            open:  fmt(bar.open),
            high:  fmt(bar.high),
            low:   fmt(bar.low),
            close: fmt(bar.close),
            isUp:  bar.close >= bar.open,
            volume: vol,
          });
        } else {
          onHoverRef.current?.({
            date: dateStr,
            value: fmt((priceData as any).value),
            volume: vol,
          });
        }
      });

      // ── Resize observer ──
      ro = new ResizeObserver(entries => {
        for (const e of entries) {
          if (e.contentRect.width > 0) {
            chart?.applyOptions({ width: e.contentRect.width, height });
          }
        }
      });
      ro.observe(containerRef.current);
      setChartReady(true);
    }

    rafId = requestAnimationFrame(() => { init(); });

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      chart?.remove();
      chartRef.current = null;
      priceRef.current = null;
      volRef.current   = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, isLight, height]);

  // ── Load REST data into chart ─────────────────────────────────────────────
  useEffect(() => {
    if (!chartReady || !priceRef.current || !volRef.current || !klines.length) return;
    try {
      if (type === "candles") {
        priceRef.current.setData(klines.map(k => ({
          time: k.time, open: k.open, high: k.high, low: k.low, close: k.close,
        })));
      } else {
        priceRef.current.setData(klines.map(k => ({ time: k.time, value: k.close })));
      }
      volRef.current.setData(klines.map(k => ({
        time:  k.time,
        value: k.volume,
        color: k.close >= k.open
          ? "rgba(0,212,123,0.35)"
          : "rgba(255,59,79,0.35)",
      })));
      chartRef.current?.timeScale().fitContent();
      setHasData(true);
    } catch { /* chart removed */ }
  }, [chartReady, klines, type]);

  // ── WebSocket live updates ────────────────────────────────────────────────
  useEffect(() => {
    if (!chartReady || !binanceSymbol) return;

    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol.toLowerCase()}@kline_${interval}`;
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      ws = new WebSocket(wsUrl);

      ws.onopen  = () => setWsLive(true);
      ws.onclose = () => {
        setWsLive(false);
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.e !== "kline") return;
          const k = msg.k;
          const bar = {
            time:   Math.floor(Number(k.t) / 1000) as any,
            open:   parseFloat(k.o),
            high:   parseFloat(k.h),
            low:    parseFloat(k.l),
            close:  parseFloat(k.c),
            volume: parseFloat(k.v),
          };
          if (priceRef.current) {
            if (type === "candles") {
              priceRef.current.update({ time: bar.time, open: bar.open, high: bar.high, low: bar.low, close: bar.close });
            } else {
              priceRef.current.update({ time: bar.time, value: bar.close });
            }
          }
          if (volRef.current) {
            volRef.current.update({
              time:  bar.time,
              value: bar.volume,
              color: bar.close >= bar.open ? "rgba(0,212,123,0.35)" : "rgba(255,59,79,0.35)",
            });
          }
        } catch { /* ignore malformed */ }
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      setWsLive(false);
      ws?.close();
    };
  }, [chartReady, binanceSymbol, interval, type]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      {/* Live indicator */}
      {wsLive && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-[6px] pointer-events-none"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "0.5px solid rgba(0,212,123,0.3)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d47b] shadow-[0_0_5px_#00d47b] animate-pulse" />
          <span className="text-[9px] font-extrabold text-[#00d47b] font-[family-name:var(--font-data)] tracking-[0.5px]">LIVE</span>
        </div>
      )}

      {/* No Binance pair */}
      {!binanceSymbol && (
        <div className="flex items-center justify-center text-[12px] font-[family-name:var(--font-display)]"
          style={{ height, color: "#555" }}>
          Chart unavailable for this coin
        </div>
      )}

      {/* Loading */}
      {binanceSymbol && isLoading && !hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ height }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-brand)", opacity: 0.7 }} />
        </div>
      )}

      {binanceSymbol && <div ref={containerRef} style={{ height, width: "100%" }} />}
    </div>
  );
}

const CoinChart = memo(CoinChartInner);
export default CoinChart;

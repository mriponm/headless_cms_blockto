"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatters";

interface OHLCBar  { time: number; open: number; high: number; low: number; close: number; }
interface LinePoint { time: number; value: number; }

interface HoverData {
  date: string;
  open?: string; high?: string; low?: string; close?: string;
  value?: string;
  isUp?: boolean;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CoinChart({
  coinId,
  type,
  days,
  isLight,
  containerClassName = "h-[260px]",
}: {
  coinId: string;
  type: "candles" | "line";
  days: string;
  isLight: boolean;
  containerClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const seriesRef    = useRef<any>(null);
  const [hover, setHover] = useState<HoverData | null>(null);

  const apiType = type === "candles" ? "ohlc" : "line";
  const { data: rawData, isLoading } = useSWR(
    `/api/crypto/${coinId}/chart?days=${days}&type=${apiType}`,
    fetcher,
    { refreshInterval: 60_000, keepPreviousData: true },
  );

  const chartData = useMemo((): OHLCBar[] | LinePoint[] => {
    if (!rawData) return [];
    if (apiType === "ohlc" && Array.isArray(rawData)) {
      const seen = new Set<number>();
      return (rawData as number[][])
        .map(([t, o, h, l, c]) => ({ time: Math.floor(t / 1000), open: o, high: h, low: l, close: c }))
        .sort((a, b) => a.time - b.time)
        .filter(bar => { if (seen.has(bar.time)) return false; seen.add(bar.time); return true; }) as OHLCBar[];
    }
    if (apiType === "line" && rawData.prices) {
      const seen = new Set<number>();
      return (rawData.prices as number[][])
        .map(([t, v]) => ({ time: Math.floor(t / 1000), value: v }))
        .sort((a, b) => a.time - b.time)
        .filter(pt => { if (seen.has(pt.time)) return false; seen.add(pt.time); return true; }) as LinePoint[];
    }
    return [];
  }, [rawData, apiType]);

  // Init / re-init chart when type or theme changes
  useEffect(() => {
    if (!containerRef.current) return;

    let chart: any = null;
    let series: any = null;
    let ro: ResizeObserver | null = null;
    let rafId = 0;

    async function init() {
      // Wait one animation frame so CSS height classes are computed
      await new Promise<void>(res => { rafId = requestAnimationFrame(() => res()); });
      if (!containerRef.current) return;

      const lw = await import("lightweight-charts");
      if (!containerRef.current) return;

      const textColor   = isLight ? "#888" : "#555";
      const borderColor = isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.06)";
      const gridColor   = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.025)";

      const initH = containerRef.current.offsetHeight || containerRef.current.clientHeight || 300;

      chart = lw.createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height: initH,
        layout: {
          background: { type: lw.ColorType.Solid, color: "transparent" },
          textColor,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        rightPriceScale: {
          borderColor,
          textColor,
          scaleMargins: { top: 0.1, bottom: 0.12 },
        },
        timeScale: {
          borderColor,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 3,
          fixLeftEdge: false,
          lockVisibleTimeRangeOnResize: true,
        },
        crosshair: {
          mode: lw.CrosshairMode.Normal,
          vertLine: { color: "rgba(255,106,0,0.5)", style: 1 as any, width: 1 },
          horzLine: { color: "rgba(255,106,0,0.5)", style: 1 as any, width: 1 },
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { mouseWheel: true, pinch: true },
      });

      chartRef.current = chart;

      if (type === "candles") {
        series = chart.addCandlestickSeries({
          upColor:         "#00d47b",
          downColor:       "#ff3b4f",
          borderUpColor:   "#00d47b",
          borderDownColor: "#ff3b4f",
          wickUpColor:     "#00d47b",
          wickDownColor:   "#ff3b4f",
        });
      } else {
        series = chart.addAreaSeries({
          lineColor:                     "#ff6a00",
          topColor:                      "rgba(255,106,0,0.18)",
          bottomColor:                   "rgba(255,106,0,0)",
          lineWidth:                     2,
          crosshairMarkerRadius:         4,
          crosshairMarkerBorderColor:    "#ff6a00",
          crosshairMarkerBackgroundColor:"#ff6a00",
        });
      }

      seriesRef.current = series;

      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !seriesRef.current) { setHover(null); return; }
        const price = param.seriesData.get(seriesRef.current);
        if (!price) { setHover(null); return; }
        const d = new Date((param.time as number) * 1000);
        const dateStr = d.toLocaleDateString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
        if (type === "candles") {
          const bar = price as any;
          setHover({
            date: dateStr,
            open:  formatPrice(bar.open),
            high:  formatPrice(bar.high),
            low:   formatPrice(bar.low),
            close: formatPrice(bar.close),
            isUp:  bar.close >= bar.open,
          });
        } else {
          setHover({ date: dateStr, value: formatPrice((price as any).value) });
        }
      });

      ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          chart?.applyOptions({
            width:  entry.contentRect.width,
            height: entry.contentRect.height || 260,
          });
        }
      });
      ro.observe(containerRef.current);
    }

    init();

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      chart?.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, [type, isLight]);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !chartData.length) return;
    try {
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    } catch {
      // silently ignore if chart was removed
    }
  }, [chartData]);

  const hasData = chartData.length > 0;

  return (
    <div className="relative">
      {/* OHLC hover overlay */}
      {hover && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-3 px-3 py-2 rounded-[9px] pointer-events-none"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255,255,255,0.1)", fontSize: "10px", fontFamily: "'JetBrains Mono',monospace" }}>
          <span style={{ color: "#555" }}>{hover.date}</span>
          {hover.value ? (
            <span style={{ color: "#fff", fontWeight: 700 }}>{hover.value}</span>
          ) : (
            <>
              <span style={{ color: "#555" }}>O <span style={{ color: "#fff" }}>{hover.open}</span></span>
              <span style={{ color: hover.isUp ? "#00d47b" : "#ff3b4f" }}>H {hover.high}</span>
              <span style={{ color: hover.isUp ? "#00d47b" : "#ff3b4f" }}>L {hover.low}</span>
              <span style={{ color: hover.isUp ? "#00d47b" : "#ff3b4f", fontWeight: 800 }}>C {hover.close}</span>
            </>
          )}
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && !hasData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-brand)" }} />
        </div>
      )}

      <div ref={containerRef} className={containerClassName} />
    </div>
  );
}

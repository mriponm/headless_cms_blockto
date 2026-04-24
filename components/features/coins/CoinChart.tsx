"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatters";

interface OHLCBar  { time: number; open: number; high: number; low: number; close: number; }
interface LinePoint { time: number; value: number; }

export interface HoverData {
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
  height = 300,
  onHoverChange,
}: {
  coinId: string;
  type: "candles" | "line";
  days: string;
  isLight: boolean;
  height?: number;
  onHoverChange?: (data: HoverData | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const seriesRef    = useRef<any>(null);
  const onHoverRef   = useRef(onHoverChange);
  onHoverRef.current = onHoverChange;

  const [isLoading, setIsLoading] = useState(true);

  const apiType = type === "candles" ? "ohlc" : "line";
  const { data: rawData, isLoading: swrLoading } = useSWR(
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

  useEffect(() => {
    if (!containerRef.current) return;

    let chart: any = null;
    let series: any = null;
    let ro: ResizeObserver | null = null;
    let rafId = 0;

    async function init() {
      const lw = await import("lightweight-charts");
      if (!containerRef.current) return;

      const textColor   = isLight ? "#888" : "#555";
      const borderColor = isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.06)";
      const gridColor   = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.02)";

      chart = lw.createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height,
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
          scaleMargins: { top: 0.08, bottom: 0.1 },
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
          vertLine: { color: "rgba(255,106,0,0.45)", style: 1 as any, width: 1 },
          horzLine: { color: "rgba(255,106,0,0.45)", style: 1 as any, width: 1 },
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
          wickUpColor:     "rgba(0,212,123,0.8)",
          wickDownColor:   "rgba(255,59,79,0.8)",
        });
      } else {
        series = chart.addAreaSeries({
          lineColor:                     "#ff6a00",
          topColor:                      "rgba(255,106,0,0.16)",
          bottomColor:                   "rgba(255,106,0,0)",
          lineWidth:                     2,
          crosshairMarkerRadius:         4,
          crosshairMarkerBorderColor:    "#ff6a00",
          crosshairMarkerBackgroundColor:"#ff6a00",
        });
      }

      seriesRef.current = series;

      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !seriesRef.current) { onHoverRef.current?.(null); return; }
        const price = param.seriesData.get(seriesRef.current);
        if (!price) { onHoverRef.current?.(null); return; }
        const d = new Date((param.time as number) * 1000);
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        if (type === "candles") {
          const bar = price as any;
          onHoverRef.current?.({
            date: dateStr,
            open:  formatPrice(bar.open),
            high:  formatPrice(bar.high),
            low:   formatPrice(bar.low),
            close: formatPrice(bar.close),
            isUp:  bar.close >= bar.open,
          });
        } else {
          onHoverRef.current?.({ date: dateStr, value: formatPrice((price as any).value) });
        }
      });

      ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            chart?.applyOptions({ width: entry.contentRect.width, height });
          }
        }
      });
      ro.observe(containerRef.current);
      setIsLoading(false);
    }

    rafId = requestAnimationFrame(() => { init(); });

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      chart?.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, [type, isLight, height]);

  useEffect(() => {
    if (!seriesRef.current || !chartData.length) return;
    try {
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    } catch { /* chart removed */ }
  }, [chartData]);

  return (
    <div className="relative">
      {(swrLoading || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ height }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-brand)", opacity: 0.7 }} />
        </div>
      )}
      <div ref={containerRef} style={{ height, width: "100%" }} />
    </div>
  );
}

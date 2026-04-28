"use client";
import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
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

// Stablecoins that have no meaningful price chart (pegged to $1)
export const STABLECOINS = new Set(["USDT","USDC","BUSD","DAI","TUSD","USDP","FDUSD","USDE","USDS","FRAX","GUSD","PYUSD","USDD","USD1"]);

function calcEMA(data: KlineBar[], period: number): { time: number; value: number }[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result: { time: number; value: number }[] = [];
  let ema = data.slice(0, period).reduce((s, b) => s + b.close, 0) / period;
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

function calcRSI(data: KlineBar[], period = 14): { time: number; value: number }[] {
  if (data.length < period + 1) return [];
  const result: { time: number; value: number }[] = [];
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = data[i].close - data[i - 1].close;
    if (d > 0) avgGain += d; else avgLoss -= d;
  }
  avgGain /= period; avgLoss /= period;
  for (let i = period; i < data.length; i++) {
    if (i > period) {
      const d = data[i].close - data[i - 1].close;
      avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: data[i].time, value: 100 - 100 / (1 + rs) });
  }
  return result;
}

function CoinChartInner({
  coinId,
  symbol,
  type,
  interval,
  limit,
  isLight,
  height = 320,
  onHoverChange,
  onNoChart,
  indicators = [],
}: {
  coinId: string;
  symbol?: string;
  type: "candles" | "line";
  interval: string;
  limit: number;
  isLight: boolean;
  height?: number;
  onHoverChange?: (data: HoverData | null) => void;
  onNoChart?: () => void;
  indicators?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const priceRef     = useRef<any>(null);
  const volRef       = useRef<any>(null);
  const onHoverRef   = useRef(onHoverChange);
  onHoverRef.current = onHoverChange;
  const onNoChartRef = useRef(onNoChart);
  onNoChartRef.current = onNoChart;

  const [chartReady, setChartReady]   = useState(false);
  const [wsLive, setWsLive]           = useState(false);
  const [hasData, setHasData]         = useState(false);
  const klinesRef = useRef<KlineBar[]>([]);
  const emaRef    = useRef<any>(null);
  const rsiRef    = useRef<any>(null);

  // Stablecoins — use CoinGecko line chart instead of Binance candlestick
  const symUpper = symbol?.toUpperCase() ?? "";
  const isStable = STABLECOINS.has(symUpper);

  // Map interval → CoinGecko days param (used for stablecoins and non-Binance coins)
  const cgDays = interval === "5m"  ? "1"
    : interval === "15m" ? "1"
    : interval === "1h"  ? "14"
    : interval === "4h"  ? "30"
    : interval === "1d"  ? limit >= 300 ? "365" : "90"
    : interval === "1w"  ? "max"
    : "1";

  // Only use explicit Binance map — no symbol-based fallback (avoids failed requests)
  const binanceSymbol = isStable ? null : (BINANCE_SYMBOLS[coinId] ?? null);
  // Non-Binance, non-stable coins fall back to CoinGecko OHLC/market_chart
  const useCoinGecko = !binanceSymbol && !isStable;

  // -- REST data -------------------------------------------------------------
  // Stablecoins:       CG market_chart (line)
  // Binance coins:     Binance klines (candles/line + WebSocket)
  // Other coins:       CG ohlc (candles) or CG market_chart (line)
  const apiUrl = isStable
    ? `/api/crypto/${coinId}/chart?days=${cgDays}&type=line`
    : binanceSymbol
    ? `/api/binance/${binanceSymbol}?interval=${interval}&limit=${limit}`
    : `/api/crypto/${coinId}/chart?days=${cgDays}&type=${type === "candles" ? "ohlc" : "line"}`;

  type CgMarketChart = { prices: [number, number][]; total_volumes?: [number, number][] };
  const { data: rawKlines, isLoading, error: fetchError } = useSWR<number[][] | CgMarketChart>(apiUrl, fetcher, {
    refreshInterval: (isStable || useCoinGecko) ? 300_000 : 30_000,
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  // Signal parent only when data fetch fails (truly no chart data)
  useEffect(() => {
    if (fetchError && !hasData) onNoChartRef.current?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError, hasData]);

  const klines = useMemo((): KlineBar[] => {
    if (!rawKlines) return [];

    // CG market_chart: { prices: [[ts, price], ...], total_volumes?: [[ts, vol], ...] }
    if ("prices" in (rawKlines as any)) {
      const cg = rawKlines as CgMarketChart;
      const prices = cg.prices ?? [];
      const vols   = cg.total_volumes ?? [];
      const seen   = new Set<number>();
      const result = prices
        .map((p, i) => {
          const t = Math.floor(p[0] / 1000);
          if (seen.has(t)) return null;
          seen.add(t);
          const price = parseFloat(String(p[1]));
          return { time: t, open: price, high: price, low: price, close: price, volume: vols[i] ? parseFloat(String(vols[i][1])) : 0 };
        })
        .filter((b): b is KlineBar => b !== null)
        .sort((a, b) => a.time - b.time);
      klinesRef.current = result;
      return result;
    }

    // Array format: CG OHLC [[ts,o,h,l,c]] or Binance [[ts,o,h,l,c,v,...]]
    const raw = rawKlines as number[][];
    if (!Array.isArray(raw)) return [];
    const seen = new Set<number>();
    const result = raw
      .map(k => ({
        time:   Math.floor(Number(k[0]) / 1000),
        open:   parseFloat(k[1] as any),
        high:   parseFloat(k[2] as any),
        low:    parseFloat(k[3] as any),
        close:  parseFloat(k[4] as any),
        volume: binanceSymbol ? parseFloat(k[5] as any) : 0,
      }))
      .sort((a, b) => a.time - b.time)
      .filter(b => { if (seen.has(b.time)) return false; seen.add(b.time); return true; });
    klinesRef.current = result;
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawKlines, isStable, binanceSymbol]);

  // -- Helper: load klines into chart series --------------------------------
  function loadKlines(data: KlineBar[], chartType: "candles" | "line") {
    if (!priceRef.current || !volRef.current || !data.length) return;
    try {
      if (chartType === "candles") {
        priceRef.current.setData(data.map(k => ({ time: k.time, open: k.open, high: k.high, low: k.low, close: k.close })));
      } else {
        priceRef.current.setData(data.map(k => ({ time: k.time, value: k.close })));
      }
      volRef.current.setData(data.map(k => ({
        time: k.time, value: k.volume,
        color: k.close >= k.open ? "rgba(0,212,123,0.35)" : "rgba(255,59,79,0.35)",
      })));
      if (emaRef.current) emaRef.current.setData(calcEMA(data, 20));
      if (rsiRef.current) rsiRef.current.setData(calcRSI(data, 14));
      chartRef.current?.timeScale().fitContent();
      setHasData(true);
      // Emit latest bar as default OHLC so bar shows values when not hovering
      const last = data[data.length - 1];
      if (last) {
        const d = new Date(last.time * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        onHoverRef.current?.(chartType === "candles"
          ? { date: d, open: fmt(last.open), high: fmt(last.high), low: fmt(last.low), close: fmt(last.close), isUp: last.close >= last.open }
          : { date: d, value: fmt(last.close) });
      }
    } catch { /* chart removed mid-load */ }
  }

  // -- Chart init ------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    setChartReady(false);
    setHasData(false);
    let chart: any = null;
    let ro: ResizeObserver | null = null;
    let cancelled = false;

    async function init() {
      const lw = await import("lightweight-charts");
      if (cancelled || !containerRef.current) return;

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

      // -- Price series --
      if (type === "candles") {
        priceRef.current = chart.addSeries(lw.CandlestickSeries, {
          upColor:         "#00d47b",
          downColor:       "#ff3b4f",
          borderUpColor:   "#00d47b",
          borderDownColor: "#ff3b4f",
          wickUpColor:     "rgba(0,212,123,0.7)",
          wickDownColor:   "rgba(255,59,79,0.7)",
        });
      } else {
        priceRef.current = chart.addSeries(lw.AreaSeries, {
          lineColor:                      "#ff6a00",
          topColor:                       "rgba(255,106,0,0.16)",
          bottomColor:                    "rgba(0,0,0,0)",
          lineWidth:                      2,
          crosshairMarkerRadius:          4,
          crosshairMarkerBorderColor:     "#ff6a00",
          crosshairMarkerBackgroundColor: "#ff6a00",
        });
      }

      // -- Volume histogram (v5 API) --
      volRef.current = chart.addSeries(lw.HistogramSeries, {
        priceFormat:  { type: "volume" },
        priceScaleId: "vol",
        color:        "rgba(255,106,0,0.3)",
      });
      chart.priceScale("vol").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });

      // -- EMA 20 line (hidden by default if not in indicators) --
      emaRef.current = chart.addSeries(lw.LineSeries, {
        color:                  "#4a9eff",
        lineWidth:              1,
        crosshairMarkerVisible: false,
        priceLineVisible:       false,
        lastValueVisible:       false,
        visible:                indicators.includes("EMA"),
      });
      // Apply initial VOL visibility
      volRef.current?.applyOptions({ visible: indicators.includes("VOL") });

      // -- RSI 14 — separate price scale (bottom 20% of chart) --
      rsiRef.current = chart.addSeries(lw.LineSeries, {
        color:                  "#b16aff",
        lineWidth:              1,
        priceScaleId:           "rsi",
        crosshairMarkerVisible: false,
        priceLineVisible:       false,
        lastValueVisible:       true,
        visible:                indicators.includes("RSI"),
      });
      chart.priceScale("rsi").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
        visible:      false,  // hide RSI axis labels to keep chart clean
      });

      // -- Crosshair hover --
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

      // -- Resize observer --
      ro = new ResizeObserver(entries => {
        for (const e of entries) {
          if (e.contentRect.width > 0) {
            chart?.applyOptions({ width: e.contentRect.width, height });
          }
        }
      });
      ro.observe(containerRef.current);
      // Load any klines already in cache immediately — no useEffect race
      if (klinesRef.current.length > 0) {
        loadKlines(klinesRef.current, type);
      }
      setChartReady(true);
    }

    init();

    return () => {
      cancelled = true;
      ro?.disconnect();
      chart?.remove();
      chartRef.current = null;
      priceRef.current = null;
      volRef.current   = null;
      emaRef.current   = null;
      rsiRef.current   = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, isLight, height]);

  // -- Load REST data when klines update (also handles initial load fallback) -
  useEffect(() => {
    if (!chartReady || !klines.length) return;
    loadKlines(klines, type);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartReady, klines, type]);

  // -- Toggle indicators visibility ------------------------------------------
  useEffect(() => {
    if (!chartReady) return;
    try {
      emaRef.current?.applyOptions({ visible: indicators.includes("EMA") });
      volRef.current?.applyOptions({ visible: indicators.includes("VOL") });
      rsiRef.current?.applyOptions({ visible: indicators.includes("RSI") });
    } catch { /* chart may be reiniting */ }
  }, [chartReady, indicators]);

  // -- WebSocket live updates ------------------------------------------------
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
              time:  bar.time, value: bar.volume,
              color: bar.close >= bar.open ? "rgba(0,212,123,0.35)" : "rgba(255,59,79,0.35)",
            });
          }
          // Keep OHLC bar updated with latest live bar
          onHoverRef.current?.(type === "candles"
            ? { date: "", open: fmt(bar.open), high: fmt(bar.high), low: fmt(bar.low), close: fmt(bar.close), isUp: bar.close >= bar.open }
            : { date: "", value: fmt(bar.close) });
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

  // -- Render ----------------------------------------------------------------
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

      {/* Loading */}
      {isLoading && !hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ height }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-brand)", opacity: 0.7 }} />
        </div>
      )}

      {/* Chart canvas — all coin types render here */}
      <div ref={containerRef} style={{ height, width: "100%" }} />
    </div>
  );
}

const CoinChart = memo(CoinChartInner);
export default CoinChart;

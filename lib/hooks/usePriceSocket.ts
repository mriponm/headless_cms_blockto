"use client";
import { useEffect, useRef } from "react";
import { usePriceStore } from "@/lib/store/priceStore";

const SYMBOLS = [
  "btcusdt", "ethusdt", "solusdt", "bnbusdt", "xrpusdt",
  "dogeusdt", "adausdt", "avaxusdt", "linkusdt", "dotusdt",
  "ltcusdt", "uniusdt", "maticusdt", "atomusdt", "etcusdt",
  "xlmusdt", "hbarusdt", "opusdt", "filusdt", "arbusdt",
  "aptusdt", "vetusdt", "nearusdt", "shibusdt", "injusdt",
  "renderusdt", "suiusdt", "kasusdt", "pepeusdt", "trxusdt",
];

const STREAM = SYMBOLS.map((s) => `${s}@miniTicker`).join("/");
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${STREAM}`;

export function usePriceSocket() {
  const setPrice     = usePriceStore((s) => s.setPrice);
  const wsRef        = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef   = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      if (!mountedRef.current) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg  = JSON.parse(event.data);
          const tick = msg.data;
          if (!tick?.s || !tick?.c) return;

          const symbol = tick.s as string;
          const price  = parseFloat(tick.c);
          // Read prev from store at call time — never from stale closure
          const prev   = usePriceStore.getState().prices[symbol] ?? price;

          setPrice(symbol, price, prev);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        reconnectRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

"use client";
import { useEffect, useRef, useState } from "react";
import { usePriceStore } from "@/lib/store/priceStore";
import { BINANCE_SYMBOLS } from "@/lib/binanceSymbols";
import { formatPrice } from "@/lib/utils/formatters";

interface Alert {
  id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  target_price: number;
  condition: "above" | "below";
}

interface Toast {
  id: string;
  coinName: string;
  coinSymbol: string;
  condition: "above" | "below";
  targetPrice: number;
}

export default function AlertChecker() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const alertsRef           = useRef<Alert[]>([]);
  alertsRef.current         = alerts;

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Load active alerts (only when logged in)
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(me => { if (!me) return; return fetch("/api/alerts"); })
      .then(r => r && r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data)) setAlerts(data); })
      .catch(() => {});
  }, []);

  // Check live prices against alerts on every price update
  const prices = usePriceStore(s => s.prices);

  useEffect(() => {
    const active = alertsRef.current;
    if (!active.length) return;

    const fired: Alert[] = [];

    for (const alert of active) {
      // Resolve Binance pair: explicit map first, then symbol+USDT fallback
      const binSym = BINANCE_SYMBOLS[alert.coin_id] ?? `${alert.coin_symbol.toUpperCase()}USDT`;
      const price = prices[binSym];
      if (!price) continue;

      const triggered =
        (alert.condition === "above" && price >= alert.target_price) ||
        (alert.condition === "below" && price <= alert.target_price);

      if (triggered) fired.push(alert);
    }

    if (!fired.length) return;

    // Remove triggered alerts from state immediately
    setAlerts(prev => prev.filter(a => !fired.find(f => f.id === a.id)));

    for (const alert of fired) {
      // Mark triggered in DB
      fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alert.id }),
      }).catch(() => {});

      // Browser notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(`${alert.coin_name} Alert Triggered`, {
            body: `${alert.coin_symbol.toUpperCase()} is ${alert.condition} ${formatPrice(alert.target_price)}`,
            icon: "/favicon.jpeg",
          });
        } catch { /* unsupported context */ }
      }

      // In-app toast
      const toast: Toast = {
        id:          alert.id,
        coinName:    alert.coin_name,
        coinSymbol:  alert.coin_symbol,
        condition:   alert.condition,
        targetPrice: alert.target_price,
      };
      setToasts(prev => [...prev, toast]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-[14px] pointer-events-auto animate-in slide-in-from-right"
          style={{
            background: "rgba(14,14,14,0.96)",
            border: "0.5px solid rgba(255,106,0,0.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,106,0,0.05)",
            backdropFilter: "blur(12px)",
          }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: toast.condition === "above" ? "#00d47b" : "#ff3b4f",
              boxShadow: `0 0 6px ${toast.condition === "above" ? "#00d47b" : "#ff3b4f"}` }} />
          <div>
            <p className="text-[12px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: "#fff" }}>
              {toast.coinSymbol.toUpperCase()} Alert
            </p>
            <p className="text-[10px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "#888" }}>
              Price {toast.condition === "above" ? "exceeded" : "dropped below"} {formatPrice(toast.targetPrice)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

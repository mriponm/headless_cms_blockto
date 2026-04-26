"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, Trash2, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatters";

export interface Alert {
  id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  target_price: number;
  condition: "above" | "below";
  created_at: string;
}

interface Props {
  isLight: boolean;
  onClose: () => void;
}

export default function AlertDropdown({ isLight, onClose }: Props) {
  const [alerts, setAlerts]       = useState<Alert[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const dropdownRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onClose]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(async (me) => {
        if (!me) return;
        setLoggedIn(true);
        const res = await fetch("/api/alerts");
        if (res.ok) setAlerts(await res.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function removeAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  const bg     = isLight ? "#fff" : "rgba(14,14,14,0.98)";
  const border = isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.09)";
  const rowBorder = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)";
  const textPrimary = isLight ? "#222" : "var(--color-text)";
  const shadow = isLight
    ? "0 16px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(255,106,0,0.06)"
    : "0 16px 40px rgba(0,0,0,0.6), 0 4px 16px rgba(255,106,0,0.08)";

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-[320px] rounded-[16px] overflow-hidden z-50"
      style={{ background: bg, border: `0.5px solid ${border}`, boxShadow: shadow }}
    >
      <span className="block h-px mx-3 mt-2 mb-1 bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <p className="text-[11px] font-extrabold uppercase tracking-[2px] font-[family-name:var(--font-display)]"
          style={{ color: textPrimary }}>
          Price Alerts
        </p>
        {alerts.length > 0 && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full font-[family-name:var(--font-data)]"
            style={{ background: "rgba(255,106,0,0.12)", color: "var(--color-brand)", border: "0.5px solid rgba(255,106,0,0.25)" }}>
            {alerts.length} active
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={16} className="animate-spin" style={{ color: "#555" }} />
        </div>
      ) : !isLoggedIn ? (
        <div className="px-4 py-8 text-center">
          <Bell size={22} className="mx-auto mb-3 opacity-25" style={{ color: "#888" }} />
          <p className="text-[12px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "#666" }}>
            Sign in to set price alerts
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Bell size={22} className="mx-auto mb-3 opacity-25" style={{ color: "#888" }} />
          <p className="text-[12px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "#666" }}>
            No active alerts
          </p>
          <p className="text-[10px] mt-1 font-[family-name:var(--font-display)]" style={{ color: "#444" }}>
            Set alerts from any coin page
          </p>
        </div>
      ) : (
        <div className="max-h-[340px] overflow-y-auto pb-1.5">
          {alerts.map(alert => (
            <div key={alert.id}
              className="flex items-center gap-3 px-4 py-3 transition-all"
              style={{ borderBottom: `0.5px solid ${rowBorder}` }}>
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={alert.condition === "above"
                  ? { background: "rgba(0,212,123,0.10)", border: "0.5px solid rgba(0,212,123,0.25)" }
                  : { background: "rgba(255,59,79,0.10)", border: "0.5px solid rgba(255,59,79,0.25)" }}>
                {alert.condition === "above"
                  ? <TrendingUp size={11} style={{ color: "#00d47b" }} />
                  : <TrendingDown size={11} style={{ color: "#ff3b4f" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-extrabold font-[family-name:var(--font-data)]" style={{ color: textPrimary }}>
                  {alert.coin_symbol.toUpperCase()}
                  <span className="font-normal text-[10px] ml-1.5" style={{ color: "#666" }}>{alert.coin_name}</span>
                </p>
                <p className="text-[10px] font-semibold font-[family-name:var(--font-data)]"
                  style={{ color: alert.condition === "above" ? "#00d47b" : "#ff3b4f" }}>
                  {alert.condition === "above" ? "↑ above" : "↓ below"} {formatPrice(alert.target_price)}
                </p>
              </div>
              <button onClick={() => removeAlert(alert.id)}
                className="w-6 h-6 rounded-[6px] flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(255,59,79,0.12)]"
                style={{ border: `0.5px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)"}` }}>
                <Trash2 size={10} style={{ color: "#666" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

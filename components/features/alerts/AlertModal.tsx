"use client";
import { useState } from "react";
import { Bell, X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { formatPrice } from "@/lib/utils/formatters";

interface Props {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  currentPrice: number;
  isLoggedIn: boolean;
  isLight: boolean;
  onClose: () => void;
}

export default function AlertModal({ coinId, coinSymbol, coinName, currentPrice, isLoggedIn, isLight, onClose }: Props) {
  const { openModal } = useAuthModal();
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState(
    currentPrice < 0.001 ? currentPrice.toFixed(6) : currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(2)
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!isLoggedIn) { openModal("signin"); onClose(); return; }
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) { setError("Enter a valid price"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin_id: coinId, coin_symbol: coinSymbol, coin_name: coinName, target_price: price, condition }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 pb-24 sm:pb-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-[20px] p-5 relative"
        style={{
          background: isLight ? "#fff" : "#0e0e0e",
          border: `0.5px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)"}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}>
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.35)] to-transparent rounded-t-[20px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center"
              style={{ background: "rgba(255,106,0,0.12)", border: "0.5px solid rgba(255,106,0,0.3)" }}>
              <Bell size={15} style={{ color: "var(--color-brand)" }} />
            </div>
            <div>
              <p className="text-[13px] font-extrabold font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
                Price Alert
              </p>
              <p className="text-[10px] font-semibold font-[family-name:var(--font-data)]" style={{ color: "#777" }}>
                {coinSymbol.toUpperCase()} · {formatPrice(currentPrice)}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.06)]">
            <X size={13} style={{ color: "#666" }} />
          </button>
        </div>

        {/* Condition */}
        <div className="flex gap-2 mb-4">
          {(["above", "below"] as const).map(c => (
            <button key={c} onClick={() => setCondition(c)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[11px] font-extrabold cursor-pointer transition-all font-[family-name:var(--font-display)]"
              style={condition === c
                ? c === "above"
                  ? { background: "rgba(0,212,123,0.12)", border: "0.5px solid rgba(0,212,123,0.4)", color: "#00d47b" }
                  : { background: "rgba(255,59,79,0.12)", border: "0.5px solid rgba(255,59,79,0.4)", color: "#ff3b4f" }
                : { background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", border: `0.5px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)"}`, color: "#666" }}>
              {c === "above" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {c === "above" ? "Goes above" : "Goes below"}
            </button>
          ))}
        </div>

        {/* Target price */}
        <div className="mb-5">
          <label className="text-[10px] font-extrabold uppercase tracking-[1.5px] mb-1.5 block font-[family-name:var(--font-data)]"
            style={{ color: "#777" }}>
            Target Price (USD)
          </label>
          <div className="flex items-center gap-2 px-3.5 py-3 rounded-[12px]"
            style={{
              background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
              border: `0.5px solid ${isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
            }}>
            <span className="text-[14px] font-bold font-[family-name:var(--font-data)]" style={{ color: "#666" }}>$</span>
            <input
              type="number"
              value={targetPrice}
              onChange={e => { setTargetPrice(e.target.value); setError(""); }}
              className="flex-1 bg-transparent text-[15px] font-extrabold font-[family-name:var(--font-data)] outline-none"
              style={{ color: "var(--color-text)" }}
              placeholder="0.00"
              min="0"
              step="any"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-[10px] font-semibold mt-1.5 font-[family-name:var(--font-data)]" style={{ color: "#ff3b4f" }}>{error}</p>
          )}
        </div>

        <button
          onClick={save}
          disabled={loading || success}
          className="w-full py-3 rounded-[12px] text-[12px] font-extrabold text-black transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer font-[family-name:var(--font-display)] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 3px 12px rgba(255,106,0,0.35)", inset: "0 1px 0 rgba(255,255,255,0.2)" }}>
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : success ? (
            "✓ Alert set!"
          ) : (
            <><Bell size={13} /> Set Alert</>
          )}
        </button>
      </div>
    </div>
  );
}

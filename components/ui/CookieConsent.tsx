"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Check } from "lucide-react";

const STORAGE_KEY = "blockto_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-[620px] rounded-[18px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{
          background: "rgba(12,12,12,0.96)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,106,0,0.15)",
        }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 4px 14px rgba(255,106,0,0.3)" }}
        >
          <Cookie size={18} className="text-black" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white mb-0.5 font-[family-name:var(--font-display)]">
            We use cookies
          </p>
          <p className="text-[11px] leading-[1.55] font-[family-name:var(--font-display)]" style={{ color: "rgba(255,255,255,0.5)" }}>
            Blockto uses strictly necessary cookies for authentication and preferences. No tracking pixels or ad cookies.{" "}
            <Link href="/cookies" className="text-[var(--color-brand)] hover:underline">Cookie Policy</Link>
            {" · "}
            <Link href="/privacy" className="text-[var(--color-brand)] hover:underline">Privacy Policy</Link>
          </p>
        </div>

        {/* Action */}
        <button
          onClick={accept}
          className="flex items-center gap-1.5 text-[11px] font-bold px-5 py-2.5 rounded-[10px] cursor-pointer transition-opacity hover:opacity-85 flex-shrink-0 font-[family-name:var(--font-display)]"
          style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", color: "#000", boxShadow: "0 4px 14px rgba(255,106,0,0.25)" }}
        >
          <Check size={12} />
          Got it
        </button>
      </div>
    </div>
  );
}

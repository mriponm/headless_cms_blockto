"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, LogIn, UserPlus } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

interface Props {
  href: string;
  icon: React.ReactNode;
  label: string;
  popupTitle: string;
  popupDesc: string;
  className?: string;
  ariaLabel?: string;
}

export default function AuthGateLink({ href, icon, label, popupTitle, popupDesc, className, ariaLabel }: Props) {
  const { openModal } = useAuthModal();
  const [authed, setAuthed]   = useState<boolean | null>(null);
  const [open, setOpen]       = useState(false);
  const popupRef              = useRef<HTMLDivElement>(null);
  const btnRef                = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => setAuthed(!!d))
      .catch(() => setAuthed(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (authed === null) {
    return <div className={`w-10 h-10 rounded-[10px] theme-btn animate-pulse ${className ?? ""}`} />;
  }

  if (authed) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel ?? label} title={label}>
        {icon}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className={className}
        aria-label={ariaLabel ?? label}
        title={label}
      >
        {icon}
      </button>

      {open && (
        <div
          ref={popupRef}
          className="absolute right-0 top-[calc(100%+10px)] w-[260px] rounded-[16px] p-4 z-[200] shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          style={{
            background: "rgba(12,12,12,0.97)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.06)] transition-all cursor-pointer"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={12} />
          </button>

          {/* Icon */}
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-3"
            style={{ background: "rgba(255,106,0,0.1)", border: "0.5px solid rgba(255,106,0,0.2)" }}>
            <span className="text-[var(--color-brand)]">{icon}</span>
          </div>

          <p className="text-[13px] font-extrabold text-white mb-1 pr-4 font-[family-name:var(--font-display)]">
            {popupTitle}
          </p>
          <p className="text-[11px] leading-[1.5] mb-4 font-[family-name:var(--font-display)]"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            {popupDesc}
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setOpen(false); openModal("signin"); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[12px] font-extrabold text-black cursor-pointer hover:brightness-110 transition-all font-[family-name:var(--font-display)]"
              style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 4px 14px rgba(255,106,0,0.25)" }}>
              <LogIn size={13} /> Sign in
            </button>
            <button
              onClick={() => { setOpen(false); openModal("signup"); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[12px] font-bold cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all font-[family-name:var(--font-display)]"
              style={{ color: "rgba(255,255,255,0.7)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
              <UserPlus size={13} /> Create account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

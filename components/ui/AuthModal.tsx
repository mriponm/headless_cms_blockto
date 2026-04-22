"use client";
import { useEffect, useCallback } from "react";
import { ArrowRight, Shield, X } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import BrandLogo from "@/components/ui/BrandLogo";

/* ── Auth0 routes (must use <a> not <Link>) ── */
const LOGIN_URL = "/auth/login";
const SIGNUP_URL = "/auth/login?screen_hint=signup";
const GOOGLE_URL = "/auth/login?connection=google-oauth2";
const TWITTER_URL = "/auth/login?connection=twitter";

const VALUE_PROPS = [
  { icon: "📈", text: "Track unlimited crypto prices" },
  { icon: "⭐", text: "Follow top crypto KOLs" },
  { icon: "🤖", text: "Daily AI market briefs" },
  { icon: "🔔", text: "Custom price alerts" },
];

function GoogleSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function XSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

/* ─── Sign In panel ─── */
function SignInPanel({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="flex flex-col gap-0">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-1.5 mb-5">
        {[
          { icon: "📈", value: "+4.2%", label: "watchlist 24h" },
          { icon: "🔖", value: "18",    label: "unread saved" },
          { icon: "📋", value: "3",     label: "new AI briefs" },
        ].map((s) => (
          <div key={s.label} className="auth-stat-card rounded-[12px] py-3 px-2 text-center relative overflow-hidden">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-[13px] font-extrabold font-[family-name:var(--font-data)] auth-heading">{s.value}</div>
            <div className="text-[9px] auth-sub-text font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <a href={GOOGLE_URL} className="auth-social-btn flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold transition-all duration-150">
          <GoogleSvg /> Google
        </a>
        <a href={TWITTER_URL} className="auth-social-btn flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold transition-all duration-150">
          <XSvg /> X / Twitter
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px auth-divider-line" />
        <span className="text-[10px] font-bold text-[#555] uppercase tracking-[2px] font-[family-name:var(--font-data)]">or continue with email</span>
        <div className="flex-1 h-px auth-divider-line" />
      </div>

      {/* Auth0 Universal Login CTA */}
      <a
        href={LOGIN_URL}
        className="w-full flex items-center justify-center gap-2 py-[15px] px-5 rounded-[13px] text-[14px] font-extrabold text-black font-[family-name:var(--font-display)] transition-all duration-150 hover:-translate-y-0.5 relative overflow-hidden mb-2.5"
        style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 24px rgba(255,106,0,0.3),0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.3)" }}
      >
        <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
        Sign in to Blockto <ArrowRight size={12} strokeWidth={3} />
      </a>

      <div className="text-center mt-4 pt-4 auth-bottom-border text-[12px] auth-sub-text font-medium">
        Don&apos;t have an account?
        <button onClick={onSwitch} className="text-[var(--color-brand)] font-bold ml-1 cursor-pointer">Sign up for free</button>
      </div>
    </div>
  );
}

/* ─── Sign Up panel ─── */
function SignUpPanel({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="flex flex-col gap-0">
      {/* Value props */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {VALUE_PROPS.map((p) => (
          <div key={p.text} className="auth-stat-card rounded-[12px] p-3 flex items-center gap-2.5 relative overflow-hidden">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[rgba(255,106,0,0.15)] to-[rgba(255,106,0,0.05)] border border-[rgba(255,106,0,0.25)] flex items-center justify-center flex-shrink-0 text-sm">
              {p.icon}
            </div>
            <span className="text-[11px] auth-text font-semibold leading-[1.25]">{p.text}</span>
          </div>
        ))}
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <a href={`${GOOGLE_URL}&screen_hint=signup`} className="auth-social-btn flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold transition-all duration-150">
          <GoogleSvg /> Google
        </a>
        <a href={`${TWITTER_URL}&screen_hint=signup`} className="auth-social-btn flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold transition-all duration-150">
          <XSvg /> X / Twitter
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px auth-divider-line" />
        <span className="text-[10px] font-bold text-[#555] uppercase tracking-[2px] font-[family-name:var(--font-data)]">or sign up with email</span>
        <div className="flex-1 h-px auth-divider-line" />
      </div>

      {/* Auth0 signup CTA */}
      <a
        href={SIGNUP_URL}
        className="w-full flex items-center justify-center gap-2 py-[15px] px-5 rounded-[13px] text-[14px] font-extrabold text-black font-[family-name:var(--font-display)] transition-all duration-150 hover:-translate-y-0.5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 24px rgba(255,106,0,0.3),0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.3)" }}
      >
        <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
        Create free account <ArrowRight size={12} strokeWidth={3} />
      </a>

      <div className="text-center mt-4 pt-4 auth-bottom-border text-[12px] auth-sub-text font-medium">
        Already have an account?
        <button onClick={onSwitch} className="text-[var(--color-brand)] font-bold ml-1 cursor-pointer">Sign in</button>
      </div>
    </div>
  );
}

/* ─── Main modal ─── */
export default function AuthModal() {
  const { open, mode, closeModal, setMode } = useAuthModal();

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
  }, [closeModal]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-3 py-0 sm:py-6">
      {/* Backdrop */}
      <div className="absolute inset-0 auth-modal-backdrop" onClick={closeModal} />

      {/* Panel */}
      <div className="relative w-full max-w-[480px] auth-modal-panel sm:rounded-[24px] rounded-t-[24px] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0 gap-2">
          <BrandLogo height={28} />

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.04)] rounded-[10px] p-1 border border-[rgba(255,255,255,0.06)] flex-shrink-0">
            <button
              onClick={() => setMode("signin")}
              className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                mode === "signin"
                  ? "bg-gradient-to-br from-[#ff6a00] to-[#ff8a30] text-black shadow-[0_0_12px_rgba(255,106,0,0.3)]"
                  : "auth-tab-inactive"
              }`}
            >Sign in</button>
            <button
              onClick={() => setMode("signup")}
              className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                mode === "signup"
                  ? "bg-gradient-to-br from-[#ff6a00] to-[#ff8a30] text-black shadow-[0_0_12px_rgba(255,106,0,0.3)]"
                  : "auth-tab-inactive"
              }`}
            >Sign up</button>
          </div>

          <button onClick={closeModal} className="auth-bio-btn w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer flex-shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Orange shimmer line */}
        <span className="flex-shrink-0 h-px mx-5 bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />

        {/* Welcome headline */}
        <div className="px-5 pt-5 pb-2 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[2px] text-[var(--color-brand)] px-3 py-[5px] rounded-full border border-[rgba(255,106,0,0.3)] bg-[rgba(255,106,0,0.08)] mb-3">
            <span className="w-[5px] h-[5px] bg-[var(--color-positive)] rounded-full shadow-[0_0_8px_var(--color-positive)] pls-anim" />
            {mode === "signin" ? "Welcome back" : "Free forever · No card required"}
          </div>
          <h2 className="text-[26px] font-black tracking-[-1.1px] leading-[1.05] auth-heading font-[family-name:var(--font-display)]">
            {mode === "signin"
              ? <>Sign in to<br /><span className="gradient-text-alt">your account</span></>
              : <>Your <span className="gradient-text-alt">crypto edge</span><br />starts here</>}
          </h2>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pb-5 pt-3">
          {mode === "signin"
            ? <SignInPanel onSwitch={() => setMode("signup")} />
            : <SignUpPanel onSwitch={() => setMode("signin")} />}

          {/* Security bar */}
          <div className="flex items-center justify-center gap-4 flex-wrap pt-4 mt-2">
            {(mode === "signin"
              ? ["Encrypted login", "2FA ready", "GDPR compliant"]
              : ["No credit card", "Bank-level security", "Cancel anytime"]
            ).map((label) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-[#666] font-semibold">
                <Shield size={10} className="text-[#555]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

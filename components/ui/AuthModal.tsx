"use client";
import { useEffect, useCallback, useState } from "react";
import { ArrowRight, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import BrandLogo from "@/components/ui/BrandLogo";

function openGooglePopup(onComplete: () => void) {
  const w = 480, h = 640;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top  = Math.round(window.screenY + (window.outerHeight - h) / 2);
  const popup = window.open(
    `/api/auth/social?provider=google&popup=1`,
    "auth_popup",
    `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
  );
  function onMessage(e: MessageEvent) {
    if (e.origin !== window.location.origin) return;
    if (e.data === "auth:complete") { cleanup(); onComplete(); }
  }
  const poll = setInterval(() => { if (popup?.closed) cleanup(); }, 500);
  function cleanup() { clearInterval(poll); window.removeEventListener("message", onMessage); }
  window.addEventListener("message", onMessage);
  popup?.focus();
}

const inputCls = "auth-input-field w-full px-4 py-3 rounded-[11px] text-[13px] font-medium transition-all duration-150";

const btnCls = "w-full flex items-center justify-center gap-2 py-[14px] px-5 rounded-[13px] text-[14px] font-extrabold text-black font-[family-name:var(--font-display)] transition-all duration-150 hover:-translate-y-0.5 relative overflow-hidden disabled:opacity-60";
const btnStyle = { background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 24px rgba(255,106,0,0.3),0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.3)" };

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

/* --- Forgot Password panel --- */
function ForgotPanel({ onBack }: { onBack: () => void }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");
  const [err, setErr]         = useState("");

  async function handleReset() {
    if (!email) { setErr("Enter your email"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Failed to send reset email"); setLoading(false); return; }
      setMsg("Check your email for a password reset link.");
      setLoading(false);
    } catch {
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-0">
      <p className="text-[13px] auth-sub-text mb-5 leading-[1.5]">
        Enter your email and we&apos;ll send a reset link.
      </p>
      <div className="flex flex-col gap-2.5 mb-3">
        <input
          type="email" placeholder="Email address" value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          className={inputCls}
          onKeyDown={e => e.key === "Enter" && handleReset()}
          disabled={!!msg}
        />
        {err && <p className="text-[11px] text-[#ff3b4f] font-semibold">{err}</p>}
        {msg && <p className="text-[11px] text-[#22c55e] font-semibold">{msg}</p>}
      </div>
      {!msg && (
        <button onClick={handleReset} disabled={loading} className={btnCls} style={btnStyle}>
          <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send reset link <ArrowRight size={12} strokeWidth={3} /></>}
        </button>
      )}
      <div className="text-center mt-4 pt-4 auth-bottom-border text-[12px] auth-sub-text font-medium">
        <button onClick={onBack} className="text-[var(--color-brand)] font-bold cursor-pointer">Back to sign in</button>
      </div>
    </div>
  );
}

/* --- Sign In panel --- */
function SignInPanel({ onSwitch, onAuthComplete, onForgot, successMessage }: { onSwitch: () => void; onAuthComplete: () => void; onForgot: () => void; successMessage?: string }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  async function handleSignIn() {
    if (!email || !password) { setErr("Email and password are required"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Sign in failed"); setLoading(false); return; }
      onAuthComplete();
    } catch {
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {successMessage && (
        <div className="mb-4 px-4 py-3 rounded-[11px] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] text-[12px] text-[#22c55e] font-semibold text-center">
          {successMessage}
        </div>
      )}
      <div className="grid grid-cols-3 gap-1.5 mb-5">
        {[
          { icon: "🗞️", label: "Latest News"    },
          { icon: "🦾", label: "Best Indicators" },
          { icon: "👀", label: "Live Prices"     },
        ].map((s) => (
          <div key={s.label} className="auth-stat-card rounded-[12px] py-3 px-2 text-center relative overflow-hidden">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="text-lg mb-1.5">{s.icon}</div>
            <div className="text-[11px] font-semibold auth-text leading-[1.2] font-[family-name:var(--font-display)]">{s.label}</div>
          </div>
        ))}
      </div>

      <button onClick={() => openGooglePopup(onAuthComplete)}
        className="auth-social-btn w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold transition-all duration-150 cursor-pointer mb-4">
        <GoogleSvg /> Continue with Google
      </button>

      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px auth-divider-line" />
        <span className="text-[10px] font-bold text-[#555] uppercase tracking-[2px] font-[family-name:var(--font-data)]">or email</span>
        <div className="flex-1 h-px auth-divider-line" />
      </div>

      <div className="flex flex-col gap-2.5 mb-3">
        <input type="email" placeholder="Email address" value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          className={inputCls} onKeyDown={e => e.key === "Enter" && handleSignIn()} />
        <div className="relative">
          <input type={show ? "text" : "password"} placeholder="Password" value={password}
            onChange={e => { setPassword(e.target.value); setErr(""); }}
            className={inputCls + " pr-11"} onKeyDown={e => e.key === "Enter" && handleSignIn()} />
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <button onClick={onForgot} className="text-[11px] text-[var(--color-brand)] font-semibold text-right w-full cursor-pointer">
          Forgot password?
        </button>
        {err && <p className="text-[11px] text-[#ff3b4f] font-semibold">{err}</p>}
      </div>

      <button onClick={handleSignIn} disabled={loading} className={btnCls} style={btnStyle}>
        <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign in to Blockto <ArrowRight size={12} strokeWidth={3} /></>}
      </button>

      <div className="text-center mt-4 pt-4 auth-bottom-border text-[12px] auth-sub-text font-medium">
        Don&apos;t have an account?
        <button onClick={onSwitch} className="text-[var(--color-brand)] font-bold ml-1 cursor-pointer">Sign up for free</button>
      </div>
    </div>
  );
}

/* --- Sign Up panel --- */
function SignUpPanel({ onSwitch, onAuthComplete }: { onSwitch: (email?: string) => void; onAuthComplete: () => void }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  async function handleSignUp() {
    setErr("");
    if (!email || !password) { setErr("Email and password are required"); return; }
    if (password.length < 8)  { setErr("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Registration failed"); setLoading(false); return; }
      // Switch to sign-in with success message
      setLoading(false);
      onSwitch(email);
    } catch {
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  }

  const VALUE_PROPS = [
    { icon: "🗞️", text: "Follow the latest news" },
    { icon: "🏅", text: "Use the best indicators" },
    { icon: "👀", text: "See all the upcoming events" },
    { icon: "🔍", text: "The best market insights" },
  ];

  return (
    <div className="flex flex-col gap-0">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {VALUE_PROPS.map((p) => (
          <div key={p.text} className="auth-stat-card rounded-[12px] p-3 flex items-center gap-2.5 relative overflow-hidden">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[rgba(255,106,0,0.15)] to-[rgba(255,106,0,0.05)] border border-[rgba(255,106,0,0.25)] flex items-center justify-center flex-shrink-0 text-sm">{p.icon}</div>
            <span className="text-[11px] auth-text font-semibold leading-[1.25]">{p.text}</span>
          </div>
        ))}
      </div>

      <button onClick={() => openGooglePopup(onAuthComplete)}
        className="auth-social-btn w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold transition-all duration-150 cursor-pointer mb-3" type="button">
        <GoogleSvg /> Sign up with Google
      </button>

      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px auth-divider-line" />
        <span className="text-[10px] font-bold text-[#555] uppercase tracking-[2px] font-[family-name:var(--font-data)]">or email</span>
        <div className="flex-1 h-px auth-divider-line" />
      </div>

      <div className="flex flex-col gap-2.5 mb-3">
        <input type="text" placeholder="Display name (optional)" value={name}
          onChange={e => setName(e.target.value)} className={inputCls} />
        <input type="email" placeholder="Email address" value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }} className={inputCls} />
        <div className="relative">
          <input type={show ? "text" : "password"} placeholder="Password (min 8 chars)" value={password}
            onChange={e => { setPassword(e.target.value); setErr(""); }}
            className={inputCls + " pr-11"} onKeyDown={e => e.key === "Enter" && handleSignUp()} />
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {err && <p className="text-[11px] text-[#ff3b4f] font-semibold">{err}</p>}
      </div>

      <button onClick={handleSignUp} disabled={loading} className={btnCls} style={btnStyle}>
        <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create free account <ArrowRight size={12} strokeWidth={3} /></>}
      </button>

      <div className="text-center mt-4 pt-4 auth-bottom-border text-[12px] auth-sub-text font-medium">
        Already have an account?
        <button onClick={() => onSwitch()} className="text-[var(--color-brand)] font-bold ml-1 cursor-pointer">Sign in</button>
      </div>
    </div>
  );
}

/* --- Main modal --- */
export default function AuthModal() {
  const { open, mode, onSuccess, closeModal, setMode } = useAuthModal();
  const [showForgot, setShowForgot]         = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | undefined>(undefined);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
  }, [closeModal]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    } else {
      setShowForgot(false);
      setRegisteredEmail(undefined);
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  function onLoginComplete() {
    const cb = onSuccess.current;
    onSuccess.current = null;
    closeModal();
    if (cb) { cb(); } else { window.location.reload(); }
  }

  function onSignUpComplete() {
    const cb = onSuccess.current;
    onSuccess.current = null;
    closeModal();
    if (cb) { cb(); } else { window.location.reload(); }
  }

  function switchToSignIn(email?: string) {
    setRegisteredEmail(email);
    setMode("signin");
  }

  if (!open) return null;

  const isForgot = showForgot && mode === "signin";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-3 py-0 sm:py-6">
      <div className="absolute inset-0 auth-modal-backdrop" onClick={closeModal} />

      <div className="relative w-full max-w-[480px] auth-modal-panel sm:rounded-[24px] rounded-t-[24px] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0 gap-2">
          <BrandLogo height={28} />
          {!isForgot && (
            <div className="auth-tab-wrap flex items-center gap-1 rounded-[10px] p-1 flex-shrink-0">
              <button onClick={() => { setMode("signin"); setShowForgot(false); }}
                className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  mode === "signin" ? "bg-gradient-to-br from-[#ff6a00] to-[#ff8a30] text-black shadow-[0_0_12px_rgba(255,106,0,0.3)]" : "auth-tab-inactive"
                }`}>Sign in</button>
              <button onClick={() => { setMode("signup"); setShowForgot(false); }}
                className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  mode === "signup" ? "bg-gradient-to-br from-[#ff6a00] to-[#ff8a30] text-black shadow-[0_0_12px_rgba(255,106,0,0.3)]" : "auth-tab-inactive"
                }`}>Sign up</button>
            </div>
          )}
          <button onClick={closeModal} className="auth-bio-btn w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer flex-shrink-0">
            <X size={14} />
          </button>
        </div>

        <span className="flex-shrink-0 h-px mx-5 bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />

        <div className="px-5 pt-4 pb-1 flex-shrink-0">
          <h2 className="text-[22px] font-black tracking-[-0.8px] leading-[1.1] auth-heading font-[family-name:var(--font-display)]">
            {isForgot
              ? <>Reset your <span className="gradient-text-alt">password</span></>
              : mode === "signin"
                ? <>Sign in to <span className="gradient-text-alt">your account</span></>
                : <>Your <span className="gradient-text-alt">crypto edge</span> starts here</>}
          </h2>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-5 pt-3">
          {isForgot
            ? <ForgotPanel onBack={() => setShowForgot(false)} />
            : mode === "signin"
              ? <SignInPanel onSwitch={() => setMode("signup")} onAuthComplete={onLoginComplete} onForgot={() => setShowForgot(true)} successMessage={registeredEmail ? `Account created! Sign in to continue.` : undefined} />
              : <SignUpPanel onSwitch={switchToSignIn} onAuthComplete={onSignUpComplete} />}

        </div>
      </div>
    </div>
  );
}

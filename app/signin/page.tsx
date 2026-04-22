"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Check } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

export default function SignInPage() {
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <div className="min-h-screen relative z-[2] flex items-start justify-center px-3 pb-10">
      <div className="w-full max-w-[480px]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <BrandLogo height={34} />
          </div>
          <p className="text-[11px] auth-sub-text font-medium">
            New here?
            <Link href="/signup" className="text-[var(--color-brand)] font-bold ml-1">Create account</Link>
          </p>
        </div>

        {/* ── Welcome ── */}
        <div className="text-center pt-9 pb-7">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[2px] text-[var(--color-brand)] px-3 py-[5px] rounded-full border border-[rgba(255,106,0,0.3)] bg-[rgba(255,106,0,0.08)] mb-[18px]">
            <span className="w-[5px] h-[5px] bg-[var(--color-positive)] rounded-full shadow-[0_0_8px_var(--color-positive)] pls-anim" />
            Welcome back
          </div>
          <h1 className="text-[34px] font-black tracking-[-1.4px] leading-[1.05] mb-2.5 font-[family-name:var(--font-display)] auth-heading">
            Sign in to<br /><span className="gradient-text-alt">your account</span>
          </h1>
          <p className="text-[13px] auth-sub-text leading-[1.55] font-medium max-w-[320px] mx-auto">
            Your watchlist, saved articles, and AI briefs are waiting.
          </p>
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-3 gap-1.5 mb-5">
          {[
            { icon: "📈", value: "+4.2%", label: "watchlist 24h" },
            { icon: "🔖", value: "18",    label: "unread saved" },
            { icon: "📋", value: "3",     label: "new AI briefs" },
          ].map((s) => (
            <div key={s.label} className="auth-stat-card rounded-[12px] py-3 px-2 text-center relative overflow-hidden">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-[13px] font-extrabold font-[family-name:var(--font-data)] auth-heading">{s.value}</div>
              <div className="text-[9px] auth-sub-text font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Form card ── */}
        <div className="auth-form-card rounded-[20px] p-5 mb-4 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent pointer-events-none" />

          {/* Social */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button className="auth-social-btn flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold cursor-pointer transition-all duration-150">
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="auth-social-btn flex items-center justify-center gap-2 py-3 rounded-[12px] text-[12px] font-bold auth-text cursor-pointer transition-all duration-150">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px auth-divider-line" />
            <span className="text-[10px] font-bold text-[#555] uppercase tracking-[2px] font-[family-name:var(--font-data)]">or with email</span>
            <div className="flex-1 h-px auth-divider-line" />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-[10px] font-extrabold auth-label uppercase tracking-[1.2px] mb-[7px] px-0.5">Email or username</label>
            <div className="auth-field-wrap rounded-[12px] p-px transition-all duration-200">
              <div className="auth-field-inner flex items-center rounded-[11px] px-3.5">
                <Mail size={13} className="text-[#555] mr-2.5 flex-shrink-0" />
                <input type="text" defaultValue="tristan@blockto.io" placeholder="you@example.com"
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium py-3.5 min-w-0 auth-input" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-[7px] px-0.5">
              <label className="text-[10px] font-extrabold auth-label uppercase tracking-[1.2px]">Password</label>
              <a href="#" className="text-[10px] font-bold text-[var(--color-brand)]">Forgot password?</a>
            </div>
            <div className="auth-field-wrap rounded-[12px] p-px transition-all duration-200">
              <div className="auth-field-inner flex items-center rounded-[11px] px-3.5">
                <Lock size={13} className="text-[#555] mr-2.5 flex-shrink-0" />
                <input type={showPass ? "text" : "password"} defaultValue="••••••••••" placeholder="Enter your password"
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium py-3.5 min-w-0 auth-input" />
                <button onClick={() => setShowPass(v => !v)} className="text-[#555] hover:text-[#aaa] p-1 cursor-pointer flex-shrink-0">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Remember */}
          <div className="flex items-center gap-2.5 my-4 px-0.5 cursor-pointer" onClick={() => setRemember(v => !v)}>
            <div className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
              remember ? "bg-gradient-to-br from-[#ff6a00] to-[#ff8a30] shadow-[0_0_12px_rgba(255,106,0,0.3)]" : "auth-check-empty"
            }`}>
              {remember && <Check size={10} strokeWidth={3} className="text-black" />}
            </div>
            <div>
              <div className="text-[12px] auth-text font-semibold">Keep me signed in</div>
              <div className="text-[10px] auth-sub-text font-medium mt-0.5">Recommended on personal devices</div>
            </div>
          </div>

          {/* Submit */}
          <button className="w-full flex items-center justify-center gap-2 py-[15px] px-5 rounded-[13px] text-[14px] font-extrabold text-black cursor-pointer font-[family-name:var(--font-display)] transition-all duration-150 hover:-translate-y-0.5 relative overflow-hidden mb-2.5"
            style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 24px rgba(255,106,0,0.3),0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.3)" }}>
            <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
            Sign in to Blockto
            <ArrowRight size={12} strokeWidth={3} />
          </button>

          {/* Biometric */}
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[12px] text-[12px] font-bold auth-bio-btn cursor-pointer transition-all duration-150">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1a6 6 0 00-6 6v2M14 9V7a6 6 0 00-3-5.2M5 13v1M8 13v2M11 13v1M8 5a2 2 0 00-2 2v3a2 2 0 004 0V7a2 2 0 00-2-2z"/>
            </svg>
            Sign in with Face ID
          </button>

          {/* Sign up link */}
          <div className="text-center mt-4 pt-4 auth-bottom-border text-[12px] auth-sub-text font-medium">
            Don&apos;t have an account yet?
            <Link href="/signup" className="text-[var(--color-brand)] font-bold ml-1">Sign up for free</Link>
          </div>
        </div>

        {/* ── Help card ── */}
        <div className="auth-help-card rounded-[12px] p-3.5 flex items-center gap-2.5 mb-3 relative overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          <div className="w-7 h-7 rounded-full bg-[rgba(255,106,0,0.1)] border border-[rgba(255,106,0,0.2)] flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#ff6a00" strokeWidth="2.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M6.5 6a1.5 1.5 0 013 0c0 1-1.5 1.5-1.5 2.5M8 11v0.5"/></svg>
          </div>
          <p className="text-[11px] auth-sub-text leading-[1.4] font-medium">
            Having trouble? <a href="#" className="text-[var(--color-brand)] font-bold">Contact support</a> or check our <a href="#" className="text-[var(--color-brand)] font-bold">help center</a>.
          </p>
        </div>

        {/* ── Security ── */}
        <div className="flex items-center justify-center gap-4 flex-wrap py-3.5 px-2">
          {["Encrypted login", "2FA ready", "GDPR compliant"].map((label) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] text-[#666] font-semibold">
              <Shield size={10} className="text-[#555]" />
              {label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

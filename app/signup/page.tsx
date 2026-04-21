"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, Check } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

const VALUE_PROPS = [
  { icon: "📈", text: "Track unlimited\ncrypto prices" },
  { icon: "⭐", text: "Follow top\ncrypto KOLs" },
  { icon: "🤖", text: "Daily AI\nmarket briefs" },
  { icon: "🔔", text: "Custom\nprice alerts" },
];

function pwStrength(pw: string) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) s++;
  if (pw.length >= 12 && /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const PW_COLORS = ["", "#ff3b4f", "#ffaa44", "#00d47b"];
const PW_LABELS = ["", "Weak", "Fair", "Strong"];

export default function SignUpPage() {
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("••••••••••");
  const [agreed, setAgreed] = useState(true);
  const strength = pwStrength(password);

  return (
    <div className="min-h-screen relative z-[2] flex items-start justify-center px-3 pb-10">
      <div className="w-full max-w-[480px]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={34} />
            <span className="text-[21px] font-black tracking-[-1px] font-[family-name:var(--font-display)] header-brand-text">
              block<span className="gradient-text-alt">to</span>
            </span>
          </div>
          <p className="text-[11px] auth-sub-text font-medium">
            Already a member?
            <Link href="/signin" className="text-[var(--color-brand)] font-bold ml-1">Sign in</Link>
          </p>
        </div>

        {/* ── Welcome ── */}
        <div className="text-center pt-7 pb-6">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[2px] text-[var(--color-brand)] px-3 py-[5px] rounded-full border border-[rgba(255,106,0,0.3)] bg-[rgba(255,106,0,0.08)] mb-4">
            <span className="w-[5px] h-[5px] bg-[var(--color-positive)] rounded-full shadow-[0_0_8px_var(--color-positive)] pls-anim" />
            Free forever · No card required
          </div>
          <h1 className="text-[32px] font-black tracking-[-1.3px] leading-[1.05] mb-2.5 font-[family-name:var(--font-display)] auth-heading">
            Your <span className="gradient-text-alt">crypto edge</span><br />starts here
          </h1>
          <p className="text-[13px] auth-sub-text leading-[1.55] font-medium max-w-[340px] mx-auto">
            Join thousands of crypto holders using Blockto to track prices, follow KOLs, and get AI-powered insights.
          </p>
        </div>

        {/* ── Value props ── */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {VALUE_PROPS.map((p) => (
            <div key={p.text} className="auth-stat-card rounded-[12px] p-3 flex items-center gap-2.5 relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[rgba(255,106,0,0.15)] to-[rgba(255,106,0,0.05)] border border-[rgba(255,106,0,0.25)] flex items-center justify-center flex-shrink-0 text-sm">
                {p.icon}
              </div>
              <span className="text-[11px] auth-text font-semibold leading-[1.25] whitespace-pre-line">{p.text}</span>
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
            <label className="block text-[10px] font-extrabold auth-label uppercase tracking-[1.2px] mb-[7px] px-0.5">Email address</label>
            <div className="auth-field-wrap rounded-[12px] p-px">
              <div className="auth-field-inner flex items-center rounded-[11px] px-3.5">
                <Mail size={13} className="text-[#555] mr-2.5 flex-shrink-0" />
                <input type="email" placeholder="you@example.com"
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium py-3.5 min-w-0 auth-input" />
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="mb-3">
            <label className="block text-[10px] font-extrabold auth-label uppercase tracking-[1.2px] mb-[7px] px-0.5">Username</label>
            <div className="auth-field-wrap rounded-[12px] p-px">
              <div className="auth-field-inner flex items-center rounded-[11px] px-3.5">
                <User size={13} className="text-[#555] mr-2.5 flex-shrink-0" />
                <input type="text" placeholder="your_handle"
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium py-3.5 min-w-0 auth-input" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-[10px] font-extrabold auth-label uppercase tracking-[1.2px] mb-[7px] px-0.5">Password</label>
            <div className="auth-field-wrap rounded-[12px] p-px">
              <div className="auth-field-inner flex items-center rounded-[11px] px-3.5">
                <Lock size={13} className="text-[#555] mr-2.5 flex-shrink-0" />
                <input type={showPass ? "text" : "password"} placeholder="Create a strong password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium py-3.5 min-w-0 auth-input" />
                <button onClick={() => setShowPass(v => !v)} className="text-[#555] hover:text-[#aaa] p-1 cursor-pointer flex-shrink-0">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {/* Strength bars */}
            <div className="flex gap-1.5 mt-1.5 px-0.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden auth-pw-bar-bg">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: strength >= i ? "100%" : "0%", background: PW_COLORS[strength] }} />
                </div>
              ))}
            </div>
            {password && (
              <p className="text-[10px] auth-sub-text mt-1.5 px-0.5 font-medium">
                <span style={{ color: PW_COLORS[strength], fontWeight: 700 }}>{PW_LABELS[strength]}</span>
                {strength < 3 && " · Add uppercase, numbers and symbols"}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5 my-4 px-0.5 cursor-pointer" onClick={() => setAgreed(v => !v)}>
            <div className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150 ${
              agreed ? "bg-gradient-to-br from-[#ff6a00] to-[#ff8a30] shadow-[0_0_12px_rgba(255,106,0,0.3)]" : "auth-check-empty"
            }`}>
              {agreed && <Check size={10} strokeWidth={3} className="text-black" />}
            </div>
            <p className="text-[11px] auth-sub-text leading-[1.5] font-medium">
              I agree to the <a href="#" className="text-[var(--color-brand)] font-semibold" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and{" "}
              <a href="#" className="text-[var(--color-brand)] font-semibold" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>, and I want to receive the weekly market digest.
            </p>
          </div>

          {/* Submit */}
          <button className="w-full flex items-center justify-center gap-2 py-[15px] px-5 rounded-[13px] text-[14px] font-extrabold text-black cursor-pointer font-[family-name:var(--font-display)] transition-all duration-150 hover:-translate-y-0.5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 24px rgba(255,106,0,0.3),0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.3)" }}>
            <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
            Create free account
            <ArrowRight size={12} strokeWidth={3} />
          </button>

          {/* Sign in link */}
          <div className="text-center mt-4 pt-4 auth-bottom-border text-[12px] auth-sub-text font-medium">
            Already have an account?
            <Link href="/signin" className="text-[var(--color-brand)] font-bold ml-1">Sign in</Link>
          </div>
        </div>

        {/* ── Member count ── */}
        <div className="text-center my-5 text-[11px] auth-sub-text font-medium">
          <span className="inline-flex items-center mr-2">
            {["#ff6a00","#4a9eff","#00d47b","#b16aff"].map((bg, i) => (
              <span key={i} className="w-[22px] h-[22px] rounded-full border-2 border-black -ml-2 first:ml-0 inline-block" style={{ background: `linear-gradient(135deg,${bg},${bg}aa)`, zIndex: 4 - i }} />
            ))}
          </span>
          Joined by <span className="text-[var(--color-brand)] font-extrabold font-[family-name:var(--font-data)]">14,280+</span> crypto holders worldwide
        </div>

        {/* ── Trust ── */}
        <div className="flex items-center justify-center gap-5 flex-wrap py-3 px-2">
          {["No credit card", "Bank-level security", "Cancel anytime"].map((label) => (
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

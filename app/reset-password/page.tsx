"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const inputCls = [
  "w-full px-4 py-3 rounded-[11px] text-[13px] font-medium outline-none transition-all duration-150",
  "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]",
  "text-[var(--color-text)] placeholder-[#555]",
  "focus:border-[rgba(255,106,0,0.5)] focus:bg-[rgba(255,106,0,0.03)]",
].join(" ");

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");
  const [done, setDone]         = useState(false);

  async function handleReset() {
    setErr("");
    if (!password) { setErr("Password required"); return; }
    if (password.length < 8) { setErr("Minimum 8 characters"); return; }
    if (password !== confirm) { setErr("Passwords don't match"); return; }
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setErr(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => { window.location.replace("/"); }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] auth-modal-panel rounded-[24px] p-8">
        <h1 className="text-[24px] font-black tracking-[-0.8px] auth-heading mb-2">
          Set new password
        </h1>
        <p className="text-[13px] auth-sub-text mb-6">Choose a strong password for your account.</p>

        {done ? (
          <p className="text-[13px] text-[#22c55e] font-semibold text-center">Password updated! Redirecting…</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="New password (min 8 chars)" value={password}
                onChange={e => { setPassword(e.target.value); setErr(""); }}
                className={inputCls + " pr-11"} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <input type={show ? "text" : "password"} placeholder="Confirm password" value={confirm}
              onChange={e => { setConfirm(e.target.value); setErr(""); }}
              className={inputCls}
              onKeyDown={e => e.key === "Enter" && handleReset()} />
            {err && <p className="text-[11px] text-[#ff3b4f] font-semibold">{err}</p>}
            <button onClick={handleReset} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-[14px] px-5 rounded-[13px] text-[14px] font-extrabold text-black font-[family-name:var(--font-display)] transition-all duration-150 hover:-translate-y-0.5 relative overflow-hidden disabled:opacity-60 mt-1"
              style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 24px rgba(255,106,0,0.3),0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.3)" }}>
              <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[13px] pointer-events-none" />
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Update password <ArrowRight size={12} strokeWidth={3} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

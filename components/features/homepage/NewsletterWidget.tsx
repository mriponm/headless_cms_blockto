"use client";
import { useRef, useState } from "react";

export default function NewsletterWidget() {
  const inputRef            = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit() {
    const trimmed = (inputRef.current?.value ?? "").trim();
    if (!trimmed || status === "loading") return;
    setStatus("loading");
    try {
      const res  = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
      } else {
        setErrMsg(data.error ?? "Subscription failed");
        setStatus("error");
      }
    } catch {
      setErrMsg("Network error — try again");
      setStatus("error");
    }
  }

  return (
    <div
      className="relative p-5 rounded-[18px] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,106,0,0.1), rgba(255,106,0,0.02))",
        border: "0.5px solid rgba(255,106,0,0.2)",
      }}
    >
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.4)] to-transparent pointer-events-none" />
      <span className="absolute top-[-30%] right-[-20%] w-[70%] h-[80%] bg-[radial-gradient(circle,rgba(255,106,0,0.15),transparent_70%)] blur-[30px] pointer-events-none" />

      <div className="relative z-10">
        <h3 className="text-[17px] font-extrabold tracking-[-0.3px] mb-1.5 font-[family-name:var(--font-display)]">
          Get the daily brief
        </h3>
        <p className="text-[12px] text-[#aaa] font-medium leading-[1.5] mb-3.5 font-[family-name:var(--font-display)]">
          Market moves, breaking news &amp; signals delivered every morning.
        </p>

        {status === "ok" ? (
          <p className="text-[13px] font-bold text-[#00d47b] font-[family-name:var(--font-display)]">
            ✓ You&apos;re subscribed!
          </p>
        ) : (
          <>
            <input
              ref={inputRef}
              type="email"
              onChange={() => { if (status === "error") setStatus("idle"); }}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full bg-black/40 border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[#f5f5f5] placeholder:text-[#555] outline-none mb-2 focus:border-[rgba(255,106,0,0.4)] transition-all font-[family-name:var(--font-display)]"
            />
            <button
              type="button"
              onClick={submit}
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "0 4px 14px rgba(255,106,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                opacity: status === "loading" ? 0.6 : 1,
              }}
              className="w-full py-[11px] rounded-[10px] text-[13px] font-extrabold text-black cursor-pointer font-[family-name:var(--font-display)] transition-opacity"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
            {status === "error" && (
              <p className="text-[11px] mt-1.5 font-semibold text-[#ff3b4f] font-[family-name:var(--font-display)]">
                {errMsg}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

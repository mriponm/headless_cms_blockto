"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit() {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
      } else {
        setErrMsg(data.error ?? "Failed");
        setStatus("error");
      }
    } catch {
      setErrMsg("Network error");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="text-[12px] font-bold font-[family-name:var(--font-display)]" style={{ color: "#00d47b" }}>
        ✓ You&apos;re subscribed!
      </p>
    );
  }

  return (
    <div suppressHydrationWarning>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus("idle"); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="you@example.com"
          data-lpignore="true"
          data-form-type="other"
          autoComplete="off"
          className="flex-1 min-w-0 rounded-[8px] px-3 py-2 text-[12px] outline-none transition-colors font-[family-name:var(--font-display)] footer-input"

        />
        <button
          onClick={submit}
          disabled={status === "loading"}
          className="px-3 py-2 rounded-[8px] text-[11px] font-extrabold text-black cursor-pointer flex-shrink-0 font-[family-name:var(--font-display)] transition-all duration-150 hover:brightness-110 disabled:opacity-60"
          style={{ background: "var(--gradient-brand)", boxShadow: "0 2px 8px rgba(255,106,0,0.2)" }}
        >
          {status === "loading" ? "…" : "Join"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-[10px] mt-1 font-semibold font-[family-name:var(--font-display)]" style={{ color: "#ff3b4f" }}>{errMsg}</p>
      )}
    </div>
  );
}

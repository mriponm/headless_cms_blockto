"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

interface Me { name?: string; email?: string; picture?: string; }

export default function UserButton() {
  const { openModal } = useAuthModal();
  const [user, setUser] = useState<Me | null | "loading">("loading");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => setUser(null));
  }, []);

  if (user === "loading") {
    return <div className="w-10 h-10 rounded-[10px] theme-btn animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        className="px-[18px] py-2.5 rounded-[10px] text-[13px] font-extrabold text-black cursor-pointer font-[family-name:var(--font-display)] transition-all duration-150 hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,106,0,0.4)]"
        style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        onClick={() => openModal("signin")}
      >
        Sign in
      </button>
    );
  }

  const initials = (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-[10px] theme-btn hover:border-[rgba(255,106,0,0.3)] transition-all duration-150 cursor-pointer">
        {user.picture
          ? <img src={user.picture} alt={user.name ?? ""} width={24} height={24} className="rounded-full w-6 h-6 object-cover" />
          : <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold text-black" style={{ background: "var(--gradient-brand)" }}>{initials}</div>}
        <span className="text-[12px] font-bold header-brand-text hidden lg:block max-w-[100px] truncate">{user.name ?? user.email}</span>
      </Link>
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.reload();
        }}
        className="px-3 py-2.5 rounded-[10px] text-[12px] font-bold cursor-pointer theme-btn hover:border-[rgba(255,59,79,0.3)] hover:text-[#ff3b4f] transition-all duration-150"
      >
        Logout
      </button>
    </div>
  );
}

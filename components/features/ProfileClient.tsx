"use client";
import { useState, useRef } from "react";
import { Camera, Save, LogOut, Loader2, User, Mail, Lock, Shield, Star, Bookmark } from "lucide-react";

interface Me { id?: string; name?: string; email?: string; picture?: string | null; }

export default function ProfileClient({ initialUser }: { initialUser: Me }) {
  const [user]         = useState<Me>(initialUser);
  const [editName, setEditName]   = useState(initialUser.name ?? "");
  const [editEmail, setEditEmail] = useState(initialUser.email ?? "");
  const [saving, setSaving]       = useState(false);
  const [savedMsg, setSavedMsg]   = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUser.picture ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic local preview
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError(null);
    setAvatarUploading(true);

    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/auth/upload-avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setAvatarError(data.error ?? "Upload failed");
        setAvatarUploading(false);
        return;
      }
      setAvatarPreview(data.url);
    } catch {
      setAvatarError("Network error. Try again.");
    } finally {
      setAvatarUploading(false);
      // reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const initials    = (user.name ?? user.email ?? "U").slice(0, 2).toUpperCase();
  const displayName = user.name ?? user.email?.split("@")[0] ?? "Blockto User";

  async function handleSaveProfile() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false); setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  return (
    <div className="relative z-[2] max-w-[680px] mx-auto px-4 md:px-6 pt-6 pb-28">

      {/* ── Hero banner card ── */}
      <div className="profile-card rounded-[24px] overflow-hidden mb-5 relative">
        {/* Banner gradient */}
        <div className="h-[100px] relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,106,0,0.35) 0%, rgba(255,80,0,0.15) 40%, rgba(0,0,0,0) 100%)" }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 100% at 0% 50%, rgba(255,106,0,0.25) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.5)] to-transparent" />
        </div>

        <div className="px-6 pb-6 relative">
          {/* Avatar — overlaps banner */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-[3px] border-black flex items-center justify-center shadow-[0_0_0_2px_rgba(255,106,0,0.4),0_8px_32px_rgba(0,0,0,0.6)]"
                style={{ background: avatarPreview ? "transparent" : "var(--gradient-brand)" }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-extrabold text-black">{initials}</span>}
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.55)" }}>
                    <Loader2 size={22} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <button onClick={() => !avatarUploading && fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-black hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-60"
                style={{ background: "var(--gradient-brand)" }}>
                <Camera size={12} className="text-black" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={handleAvatarChange} />
            </div>

            <button
              onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-bold border transition-all hover:border-[rgba(255,59,79,0.4)] hover:text-[#ff3b4f] hover:bg-[rgba(255,59,79,0.06)] cursor-pointer font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-muted)", borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <LogOut size={12} /> Logout
            </button>
          </div>

          {/* Name + badge */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-black tracking-[-0.5px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
                {displayName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-[rgba(255,106,0,0.25)] text-[var(--color-brand)] font-[family-name:var(--font-display)]"
                style={{ background: "rgba(255,106,0,0.08)" }}>
                <Star size={9} strokeWidth={3} /> Pro Member
              </span>
            </div>
            <p className="text-[13px] mt-0.5 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
              {user.email}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Saved articles", value: "—", icon: <Bookmark size={13} /> },
              { label: "Watchlist coins", value: "—", icon: <Star size={13} /> },
              { label: "Member since", value: "2025", icon: <Shield size={13} /> },
            ].map(s => (
              <div key={s.label} className="rounded-[14px] px-3 py-3 flex flex-col gap-1.5 relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.15)] to-transparent" />
                <div className="flex items-center gap-1.5" style={{ color: "var(--color-brand)" }}>{s.icon}
                  <span className="text-[18px] font-black font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>{s.value}</span>
                </div>
                <span className="text-[10px] font-semibold font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Account Settings ── */}
      <div className="profile-card rounded-[24px] overflow-hidden relative">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />

        <div className="px-6 pt-5 pb-1">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[2px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
            Account Settings
          </h2>
        </div>

        <div className="px-6 pt-4 pb-6 flex flex-col gap-5">

          {/* Photo row */}
          <div className="flex items-center gap-4 pb-5 border-b border-[rgba(255,255,255,0.05)]">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[rgba(255,106,0,0.3)] flex items-center justify-center flex-shrink-0"
              style={{ background: avatarPreview ? "transparent" : "var(--gradient-brand)" }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                : <span className="text-base font-extrabold text-black">{initials}</span>}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12px] font-bold border transition-all hover:border-[rgba(255,106,0,0.4)] hover:bg-[rgba(255,106,0,0.05)] cursor-pointer font-[family-name:var(--font-display)]"
                style={{ color: "var(--color-text)", borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <Camera size={13} /> Change photo
              </button>
              <p className="text-[10px] mt-1.5 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>JPG, PNG or GIF · Max 2 MB</p>
              {avatarError && <p className="text-[10px] mt-1 text-[#ff3b4f] font-semibold font-[family-name:var(--font-display)]">{avatarError}</p>}
              {avatarUploading && <p className="text-[10px] mt-1 text-[var(--color-brand)] font-semibold font-[family-name:var(--font-display)]">Uploading…</p>}
            </div>
          </div>

          {/* Fields */}
          {[
            { label: "Display name", value: editName, set: setEditName, placeholder: "Your name", type: "text", icon: <User size={14} /> },
            { label: "Email address", value: editEmail, set: setEditEmail, placeholder: "your@email.com", type: "email", icon: <Mail size={14} /> },
          ].map(f => (
            <div key={f.label}>
              <label className="flex items-center gap-1.5 text-[10px] font-bold mb-2 uppercase tracking-[1px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
                {f.icon} {f.label}
              </label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-[12px] text-[13px] font-medium outline-none transition-all font-[family-name:var(--font-display)] focus:border-[rgba(255,106,0,0.45)] focus:bg-[rgba(255,106,0,0.03)]"
                style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", color: "var(--color-text)" }} />
            </div>
          ))}

          {/* Password */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold mb-2 uppercase tracking-[1px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
              <Lock size={14} /> New password
            </label>
            <input type="password" placeholder="Leave blank to keep current"
              className="w-full px-4 py-3 rounded-[12px] text-[13px] font-medium outline-none transition-all font-[family-name:var(--font-display)] focus:border-[rgba(255,106,0,0.45)] focus:bg-[rgba(255,106,0,0.03)]"
              style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", color: "var(--color-text)" }} />
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1 border-t border-[rgba(255,255,255,0.05)]">
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[12px] text-[13px] font-extrabold text-black transition-all hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,106,0,0.4)] disabled:opacity-60 cursor-pointer font-[family-name:var(--font-display)]"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : "Save changes"}
            </button>
            {savedMsg && (
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#22c55e] font-[family-name:var(--font-display)]">
                <span className="w-4 h-4 rounded-full bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center text-[9px]">✓</span>
                Saved!
              </span>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-[16px] p-4 border border-[rgba(255,59,79,0.1)]" style={{ background: "rgba(255,59,79,0.03)" }}>
            <h3 className="text-[10px] font-extrabold text-[#ff3b4f] mb-3 uppercase tracking-[1.5px] font-[family-name:var(--font-display)]">Danger Zone</h3>
            <p className="text-[11px] mb-3 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
              Permanently delete your account and all associated data.
            </p>
            <button className="px-4 py-2 rounded-[10px] text-[11px] font-bold border border-[rgba(255,59,79,0.25)] text-[#ff3b4f] hover:bg-[rgba(255,59,79,0.08)] hover:border-[rgba(255,59,79,0.4)] transition-all cursor-pointer font-[family-name:var(--font-display)]">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

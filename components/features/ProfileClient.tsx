"use client";
import { useState, useRef } from "react";
import { Camera, Save, LogOut, Loader2 } from "lucide-react";

interface Me { id?: string; name?: string; email?: string; picture?: string | null; }

export default function ProfileClient({ initialUser }: { initialUser: Me }) {
  const [user]         = useState<Me>(initialUser);
  const [editName, setEditName]   = useState(initialUser.name ?? "");
  const [editEmail, setEditEmail] = useState(initialUser.email ?? "");
  const [saving, setSaving]       = useState(false);
  const [savedMsg, setSavedMsg]   = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials  = (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase();
  const avatarSrc = avatarPreview ?? user.picture;

  async function handleSaveProfile() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false); setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  return (
    <div className="relative z-[2] max-w-[600px] mx-auto px-4 md:px-8 pt-5 pb-24">

      {/* ── Hero card ── */}
      <div className="profile-card rounded-[20px] p-5 md:p-6 mb-5 relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.35)] to-transparent pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden border-2 border-[rgba(255,106,0,0.35)] flex items-center justify-center"
              style={{ background: avatarSrc ? "transparent" : "var(--gradient-brand)" }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                : <span className="text-2xl font-extrabold text-black">{initials}</span>}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border border-[rgba(255,106,0,0.4)] hover:brightness-110 transition-all cursor-pointer"
              style={{ background: "var(--gradient-brand)" }}>
              <Camera size={10} className="text-black" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-extrabold tracking-[-0.3px] truncate font-[family-name:var(--font-display)]" style={{ color: "var(--color-text)" }}>
              {user.name ?? user.email ?? "Blockto User"}
            </h1>
            <p className="text-[12px] truncate mt-0.5 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
              {user.email}
            </p>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border border-[rgba(255,106,0,0.2)] text-[var(--color-brand)] font-[family-name:var(--font-display)]"
              style={{ background: "rgba(255,106,0,0.06)" }}>
              Pro Member
            </span>
          </div>

          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold border transition-all hover:border-[rgba(255,59,79,0.4)] hover:text-[#ff3b4f] cursor-pointer flex-shrink-0 font-[family-name:var(--font-display)]"
            style={{ color: "var(--color-muted)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>

      {/* ── Account Settings ── */}
      <div className="profile-card rounded-[20px] p-5 relative overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />
        <h2 className="text-[12px] font-extrabold uppercase tracking-[1.5px] mb-5 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
          Account Settings
        </h2>

        {/* Photo */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[rgba(255,106,0,0.3)] flex items-center justify-center flex-shrink-0"
            style={{ background: avatarSrc ? "transparent" : "var(--gradient-brand)" }}>
            {avatarSrc
              ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              : <span className="text-lg font-extrabold text-black">{initials}</span>}
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[11px] font-bold border transition-all hover:border-[rgba(255,106,0,0.4)] cursor-pointer font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-text)", borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
              <Camera size={12} /> Change photo
            </button>
            <p className="text-[9px] mt-1.5 font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>JPG, PNG or GIF · Max 2MB</p>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {[
            { label: "Display name", value: editName, set: setEditName, placeholder: "Your name", type: "text" },
            { label: "Email address", value: editEmail, set: setEditEmail, placeholder: "your@email.com", type: "email" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-[1px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
                {f.label}
              </label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-[10px] text-[13px] font-medium outline-none transition-all font-[family-name:var(--font-display)]"
                style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", color: "var(--color-text)" }} />
            </div>
          ))}

          {/* Password placeholder */}
          <div>
            <label className="block text-[9px] font-bold mb-1.5 uppercase tracking-[1px] font-[family-name:var(--font-display)]" style={{ color: "var(--color-muted)" }}>
              New password
            </label>
            <input type="password" placeholder="Leave blank to keep current"
              className="w-full px-4 py-2.5 rounded-[10px] text-[13px] font-medium outline-none transition-all font-[family-name:var(--font-display)]"
              style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", color: "var(--color-text)" }} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[rgba(255,255,255,0.05)]">
          <button onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[12px] font-extrabold text-black transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer font-[family-name:var(--font-display)]"
            style={{ background: "var(--gradient-brand)" }}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? "Saving…" : "Save changes"}
          </button>
          {savedMsg && <span className="text-[12px] font-semibold text-[#22c55e] font-[family-name:var(--font-display)]">Saved!</span>}
        </div>

        {/* Danger zone */}
        <div className="mt-7 pt-5 border-t border-[rgba(255,59,79,0.08)]">
          <h3 className="text-[10px] font-bold text-[#ff3b4f] mb-3 uppercase tracking-[1px] font-[family-name:var(--font-display)]">Danger Zone</h3>
          <button className="px-4 py-2 rounded-[10px] text-[11px] font-bold border border-[rgba(255,59,79,0.2)] text-[#ff3b4f] hover:bg-[rgba(255,59,79,0.06)] transition-all cursor-pointer font-[family-name:var(--font-display)]">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

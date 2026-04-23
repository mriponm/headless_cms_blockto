"use client";
import { useState, useEffect } from "react";
import { Check, ExternalLink } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#888">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function TgIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#888">
      <path d="M22.05 2.14L2.8 9.86c-1.32.53-1.3 1.27-.24 1.6l4.94 1.54 11.42-7.2c.54-.33 1.03-.15.63.21L10.3 14.35l-.36 5.1c.52 0 .75-.24 1.04-.52l2.5-2.43 5.2 3.85c.96.53 1.65.26 1.89-.89L23.9 3.4c.35-1.44-.56-2.1-1.85-1.26z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
      <path d="M22 4l-10 9L2 4M2 4h20v16H2z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>
    </svg>
  );
}

interface Tag { name: string; slug: string; }

interface Props {
  tags: Tag[];
  postTitle: string;
  postUrl: string;
  authorName: string;
}

export default function ArticleFooter({ tags, postTitle, postUrl, authorName }: Props) {
  const [followed, setFollowed]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [following, setFollowing] = useState(false);
  const { t }          = useI18n();
  const { openModal }  = useAuthModal();
  const authorSlug     = authorName.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    fetch("/api/following")
      .then(r => r.ok ? r.json() : [])
      .then((list: { author_slug: string }[]) => {
        if (Array.isArray(list)) setFollowed(list.some(f => f.author_slug === authorSlug));
      })
      .catch(() => {});
  }, [authorSlug]);

  async function toggleFollow() {
    if (following) return;
    setFollowing(true);
    try {
      if (followed) {
        const res = await fetch(`/api/following?slug=${encodeURIComponent(authorSlug)}`, { method: "DELETE" });
        if (res.status === 401) { openModal("signin"); setFollowing(false); return; }
        if (res.ok) setFollowed(false);
      } else {
        const res = await fetch("/api/following", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author_name: authorName, author_slug: authorSlug }),
        });
        if (res.status === 401) { openModal("signin"); setFollowing(false); return; }
        if (res.ok) setFollowed(true);
      }
    } catch { /* noop */ }
    setFollowing(false);
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const shareX  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`, "_blank");
  const shareTg = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`, "_blank");
  const shareEmail = () => window.open(`mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(postUrl)}`);

  return (
    <div className="mt-6 flex flex-col gap-5">

      {/* 1. Disclaimer */}
      <div className="art-disclaimer rounded-[12px] p-4 flex gap-2.5 items-start">
        <div className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(255,106,0,0.12)", border: "0.5px solid rgba(255,106,0,0.2)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[1.3px] text-[var(--color-brand)] mb-1 font-[family-name:var(--font-display)]">
            {t("footer.disclaimer")}
          </p>
          <p className="text-[11px] text-[#888] leading-[1.55] font-medium font-[family-name:var(--font-display)]">
            {t("footer.disclaimerText")}
          </p>
        </div>
      </div>

      {/* 2. Buy crypto CTA */}
      <div className="rounded-[20px] p-[26px_20px] relative overflow-hidden text-center"
        style={{ background: "linear-gradient(135deg,rgba(255,106,0,0.1),rgba(255,106,0,0.02))", border: "0.5px solid rgba(255,106,0,0.22)" }}>
        <span className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[140%] h-[150%] pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(255,106,0,0.12),transparent 60%)", filter: "blur(30px)" }} />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[1.2px] text-[var(--color-brand)] px-[10px] py-1 rounded-full mb-3.5 font-[family-name:var(--font-data)]"
            style={{ border: "0.5px solid rgba(255,106,0,0.3)", background: "rgba(255,106,0,0.05)" }}>
            <span className="w-[4px] h-[4px] bg-[#ff6a00] rounded-full shadow-[0_0_6px_#ff6a00]" />
            {t("footer.exclusiveOffer")}
          </span>
          <h3 className="text-[20px] font-black tracking-[-0.6px] leading-[1.15] mb-2 font-[family-name:var(--font-display)]">
            {t("footer.startTrading")}<br />
            <span style={{ background: "linear-gradient(135deg,#ff6a00,#ffaa44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("footer.blofin")}
            </span>
          </h3>
          <p className="text-[12px] text-[#999] font-medium mb-4 leading-[1.5] font-[family-name:var(--font-display)]">
            Up to $500 sign-up bonus and zero-fee trading on your first 30 days.
          </p>
          <a href="https://blofin.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-[14px] font-extrabold text-black cursor-pointer transition-all hover:brightness-110 font-[family-name:var(--font-display)]"
            style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 8px 22px rgba(255,106,0,0.3),inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            {t("footer.buyCrypto")}
            <ExternalLink size={13} />
          </a>
          <p className="flex items-center justify-center gap-1 text-[10px] text-[#666] mt-2.5 font-[family-name:var(--font-display)]">
            ⓘ {t("footer.redirectNote")} <span className="text-[var(--color-brand)] font-bold">BloFin</span>
          </p>
        </div>
      </div>

      {/* 3. Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <a key={t.slug} href={`/category/${t.slug}`}
              className="art-tag-big text-[11px] font-semibold px-3.5 py-[7px] rounded-[20px] cursor-pointer transition-all duration-150 font-[family-name:var(--font-display)]">
              <span className="text-[var(--color-brand)] font-bold mr-0.5">#</span>{t.name}
            </a>
          ))}
        </div>
      )}

      {/* 4. Share bar */}
      <div className="art-share-bar flex items-center gap-2.5 px-4 py-3.5 rounded-[12px]">
        <span className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-[#666] mr-auto font-[family-name:var(--font-display)]">
          {t("footer.shareArticle")}
        </span>
        <button onClick={shareX} className="art-share-btn w-[34px] h-[34px] rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200">
          <XIcon />
        </button>
        <button onClick={shareTg} className="art-share-btn w-[34px] h-[34px] rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200">
          <TgIcon />
        </button>
        <button onClick={shareEmail} className="art-share-btn w-[34px] h-[34px] rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200">
          <MailIcon />
        </button>
        <button onClick={handleCopy}
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200"
          style={{
            background: copied ? "rgba(255,106,0,0.1)" : undefined,
            border: copied ? "0.5px solid rgba(255,106,0,0.3)" : undefined,
          }}>
          {copied ? <Check size={13} className="text-[var(--color-brand)]" /> : <LinkIcon />}
        </button>
      </div>

      {/* 5. Author bio card */}
      <div className="art-bio-card rounded-[18px] p-5 relative overflow-hidden">
        <span className="absolute top-[-30%] right-[-20%] w-[50%] h-[80%] pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,106,0,0.08),transparent 70%)", filter: "blur(30px)" }} />
        <p className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[var(--color-brand)] mb-3 relative z-10 font-[family-name:var(--font-display)]">
          {t("footer.aboutAuthor")}
        </p>
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="w-[56px] h-[56px] rounded-full overflow-hidden flex-shrink-0"
            style={{ boxShadow: "0 0 16px rgba(255,106,0,0.3)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Tristan.jpeg" alt={authorName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[15px] font-extrabold art-heading font-[family-name:var(--font-display)]">{authorName}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <circle cx="12" cy="12" r="12" fill="#1d9bf0"/>
                <path d="M9.5 16.5l-3-3 1.4-1.4 1.6 1.6 5.1-5.1 1.4 1.4z" fill="#fff"/>
              </svg>
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-[1px] text-[var(--color-brand)] font-[family-name:var(--font-data)]">
              {t("footer.seniorMarketAnalyst")}
            </p>
          </div>
          <button
            onClick={toggleFollow}
            disabled={following}
            className="flex-shrink-0 px-4 py-2 rounded-[10px] text-[11px] font-extrabold cursor-pointer transition-all duration-200 font-[family-name:var(--font-display)] disabled:opacity-60"
            style={followed
              ? { color: "#ff6a00", background: "rgba(255,106,0,0.08)", border: "0.5px solid rgba(255,106,0,0.2)" }
              : { color: "#000", background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 12px rgba(255,106,0,0.2),inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            {followed ? t("footer.following") : t("footer.follow")}
          </button>
        </div>
        <p className="text-[12px] text-[#999] leading-[1.55] font-medium mb-3 relative z-10 font-[family-name:var(--font-display)]">
          {t("footer.authorBio")}
        </p>
        <div className="flex items-center gap-[14px] pt-3 border-t border-[rgba(255,255,255,0.04)] relative z-10">
          {[["142", t("footer.articles")], ["4.2K", t("footer.followers")], ["186K", t("footer.reads")]].map(([val, label]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[14px] font-extrabold art-heading font-[family-name:var(--font-data)] leading-none">{val}</span>
              <span className="text-[9px] font-extrabold text-[#666] uppercase tracking-[0.8px] font-[family-name:var(--font-display)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

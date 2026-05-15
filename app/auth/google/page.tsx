"use client";
import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Popup page: browser-side OAuth initiation so PKCE verifier is stored
// in document.cookie (accessible to the server-side callback route).
export default function GoogleAuthPage() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?popup=1`,
      },
    });
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#0a0a0a", color: "#888",
      fontFamily: "sans-serif", fontSize: 14,
    }}>
      Redirecting to Google…
    </div>
  );
}

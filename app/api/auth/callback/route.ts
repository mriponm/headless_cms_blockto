import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function popupHtml(origin: string, success: boolean) {
  const script = success
    ? `(function(){
        try{var bc=new BroadcastChannel("blockto_auth");bc.postMessage("auth:complete");bc.close();}catch(e){}
        try{if(window.opener&&!window.opener.closed){window.opener.postMessage("auth:complete","${origin}");}}catch(e){}
        setTimeout(function(){try{window.close();}catch(e){}window.location.replace("${origin}/");},200);
      })()`
    : `window.location.replace("${origin}/");`;

  return `<!DOCTYPE html><html><head><title>Signing in…</title></head><body>
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#888;font-family:sans-serif;font-size:14px">
      ${success ? "Completing sign in…" : "Redirecting…"}
    </div>
    <script>${script}</script></body></html>`;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const isPopup = searchParams.get("popup") === "1";

  if (!code) {
    return isPopup
      ? new NextResponse(popupHtml(origin, false), { headers: { "Content-Type": "text/html" } })
      : NextResponse.redirect(`${origin}${next}`);
  }

  // Create response first so Supabase writes session cookies directly onto it
  const response = isPopup
    ? new NextResponse(popupHtml(origin, true), { headers: { "Content-Type": "text/html" } })
    : NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    // Still try to close popup gracefully
    return isPopup
      ? new NextResponse(popupHtml(origin, false), { headers: { "Content-Type": "text/html" } })
      : NextResponse.redirect(`${origin}/`);
  }

  return response;
}

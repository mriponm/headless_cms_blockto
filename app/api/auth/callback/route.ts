import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const isPopup = searchParams.get("popup") === "1";

  if (!code) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Build the response object first so Supabase can write session cookies directly onto it
  const response = isPopup
    ? new NextResponse(
        `<!DOCTYPE html><html><body><script>
          (function(){
            // Broadcast to all same-origin tabs (handles popup-blocked → tab case)
            try{var bc=new BroadcastChannel("blockto_auth");bc.postMessage("auth:complete");bc.close();}catch(e){}
            // Also try direct postMessage if opened as a proper popup
            try{if(window.opener&&!window.opener.closed){window.opener.postMessage("auth:complete","${origin}");}}catch(e){}
            // Close self if possible (popup), else redirect back to site (tab)
            setTimeout(function(){
              try{window.close();}catch(e){}
              window.location.replace("${origin}/");
            },150);
          })();
        </script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      )
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
    return NextResponse.redirect(`${origin}/`);
  }

  return response;
}

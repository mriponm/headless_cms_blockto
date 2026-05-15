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
          if(window.opener){window.opener.postMessage("auth:complete","${origin}");window.close();}
          else{window.location.replace("${encodeURIComponent(next)}");}
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

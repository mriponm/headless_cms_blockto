import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If opened in a popup, close it and notify opener
  const isPopup = searchParams.get("popup") === "1";
  if (isPopup) {
    return new NextResponse(
      `<!DOCTYPE html><html><body><script>
        if(window.opener){window.opener.postMessage("auth:complete","${origin}");window.close();}
        else{window.location.replace("${next}");}
      </script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const provider = searchParams.get("provider") as "google" | "twitter";
  const popup = searchParams.get("popup") === "1";

  if (!provider) return NextResponse.json({ error: "provider required" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback?popup=${popup ? "1" : "0"}`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "OAuth error" }, { status: 500 });
  }

  return NextResponse.redirect(data.url);
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const provider = searchParams.get("provider") as "google" | "twitter";
  const popup = searchParams.get("popup") === "1";

  if (!provider) return NextResponse.json({ error: "provider required" }, { status: 400 });

  // Placeholder response — cookies will be written directly onto it
  const response = NextResponse.redirect(new URL("/", origin));

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

  // Replace the placeholder redirect with the real OAuth URL (cookies already set)
  response.headers.set("location", data.url);
  return response;
}

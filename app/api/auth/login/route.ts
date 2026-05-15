import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return rateLimitResponse();
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true }); // placeholder; replaced on success/error

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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] Supabase error:", error.status, error.message, error.code);
    const msg = error.message.includes("Invalid login")
      ? "Incorrect email or password"
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Reuse response object (session cookies already set on it)
  const body = { user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name, picture: data.user.user_metadata?.avatar_url } };
  return NextResponse.json(body, {
    headers: response.headers,
  });
}

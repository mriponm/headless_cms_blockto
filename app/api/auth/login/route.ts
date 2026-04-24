import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  // 5 attempts per IP per 15 minutes
  const ip = getIP(req);
  if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return rateLimitResponse();
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] Supabase error:", error.status, error.message, error.code);
    const msg = error.message.includes("Invalid login")
      ? "Incorrect email or password"
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name, picture: data.user.user_metadata?.avatar_url } });
}

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
  // 10 registrations per IP per hour
  const ip = getIP(req);
  if (!rateLimit(`register:${ip}`, 10, 60 * 60 * 1000)) {
    return rateLimitResponse();
  }

  const { name, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name || email.split("@")[0] } },
  });

  if (error) {
    console.error("[register] Supabase error:", error.status, error.message, error.code);
    const msg = error.message.includes("already registered")
      ? "An account with this email already exists. Sign in instead."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    user: { id: data.user?.id, email: data.user?.email },
    sessionSet: !!data.session,
  });
}

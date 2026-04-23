import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

export async function POST(req: NextRequest) {
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
  console.log("[register] ok, sessionSet:", !!data.session, "user:", data.user?.id);

  return NextResponse.json({
    ok: true,
    user: { id: data.user?.id, email: data.user?.email },
    // If email confirmation is disabled, session is set immediately
    sessionSet: !!data.session,
  });
}

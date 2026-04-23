import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json(null, { status: 401 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0],
    picture: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
  });
}

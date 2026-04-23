import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import { supabase } from "@/lib/supabase/server";

async function getProfileId(userId: string, email?: string) {
  const { data: existing } = await supabase.from("profiles").select("id").eq("auth0_id", userId).single();
  if (existing) return existing.id as string;
  const { data: created } = await supabase
    .from("profiles")
    .insert({ auth0_id: userId, email: email ?? "", name: email?.split("@")[0] ?? "User", updated_at: new Date().toISOString() })
    .select("id").single();
  return created?.id ?? null;
}

export async function POST(req: NextRequest) {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, percent } = await req.json();
  if (!slug || percent === undefined) return NextResponse.json({ error: "slug and percent required" }, { status: 400 });

  const profileId = await getProfileId(user.id, user.email);
  if (!profileId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { error } = await supabase
    .from("saved_articles")
    .update({ read_percent: Math.round(percent) })
    .eq("user_id", profileId)
    .eq("article_slug", slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

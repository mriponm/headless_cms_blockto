import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import { supabase } from "@/lib/supabase/server";

async function getProfileId(userId: string, email?: string) {
  const { data: existing } = await supabase.from("profiles").select("id").eq("auth0_id", userId).single();
  if (existing) return existing.id as string;
  // Auto-create profile on first use
  const { data: created } = await supabase
    .from("profiles")
    .insert({ auth0_id: userId, email: email ?? "", name: email?.split("@")[0] ?? "User", updated_at: new Date().toISOString() })
    .select("id")
    .single();
  return created?.id ?? null;
}

async function getUser() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileId = await getProfileId(user.id, user.email);
  if (!profileId) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("saved_articles")
    .select("*")
    .eq("user_id", profileId)
    .order("saved_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileId = await getProfileId(user.id, user.email);
  if (!profileId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json();
  const { article_slug, article_title, article_excerpt, article_category, article_image, article_date } = body;
  if (!article_slug) return NextResponse.json({ error: "article_slug required" }, { status: 400 });

  const { data, error } = await supabase
    .from("saved_articles")
    .upsert({ user_id: profileId, article_slug, article_title, article_excerpt, article_category, article_image, article_date }, { onConflict: "user_id,article_slug" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileId = await getProfileId(user.id, user.email);
  if (!profileId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { error } = await supabase.from("saved_articles").delete().eq("user_id", profileId).eq("article_slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}

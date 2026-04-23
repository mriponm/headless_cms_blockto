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
  const { data } = await supabase.from("following").select("*").eq("user_id", profileId).order("followed_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profileId = await getProfileId(user.id, user.email);
  if (!profileId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const { author_name, author_slug } = await req.json();
  const { data, error } = await supabase
    .from("following")
    .upsert({ user_id: profileId, author_name, author_slug }, { onConflict: "user_id,author_slug" })
    .select().single();
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
  await supabase.from("following").delete().eq("user_id", profileId).eq("author_slug", slug);
  return NextResponse.json({ deleted: true });
}

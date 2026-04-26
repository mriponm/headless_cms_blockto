// Supabase table required:
// CREATE TABLE alerts (
//   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
//   coin_id    TEXT NOT NULL,
//   coin_symbol TEXT NOT NULL,
//   coin_name  TEXT NOT NULL,
//   target_price NUMERIC NOT NULL,
//   condition  TEXT NOT NULL CHECK (condition IN ('above','below')),
//   triggered  BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// CREATE INDEX ON alerts(user_id);

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

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", profileId)
    .eq("triggered", false)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileId = await getProfileId(user.id, user.email);
  if (!profileId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { coin_id, coin_symbol, coin_name, target_price, condition } = await req.json();
  if (!coin_id || !coin_symbol || !target_price || !condition) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("alerts")
    .insert({
      user_id: profileId,
      coin_id,
      coin_symbol: coin_symbol.toUpperCase(),
      coin_name,
      target_price,
      condition,
    })
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
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("alerts").delete().eq("id", id).eq("user_id", profileId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profileId = await getProfileId(user.id, user.email);
  if (!profileId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("alerts").update({ triggered: true }).eq("id", id).eq("user_id", profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ triggered: true });
}

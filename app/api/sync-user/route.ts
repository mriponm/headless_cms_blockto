import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import { supabase } from "@/lib/supabase/server";

export async function POST() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, email, user_metadata } = user;
  if (!email) return NextResponse.json({ error: "Incomplete user data" }, { status: 400 });

  const name = user_metadata?.name ?? user_metadata?.full_name ?? email.split("@")[0];
  const picture = user_metadata?.avatar_url ?? user_metadata?.picture ?? null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        { auth0_id: id, email, name, picture, updated_at: new Date().toISOString() },
        { onConflict: "auth0_id" }
      )
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ synced: true, profileId: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import WatchlistClient from "@/components/features/WatchlistClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Watchlist — Blockto" };

export default async function WatchlistPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  return <WatchlistClient />;
}

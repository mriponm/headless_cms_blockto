import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import SavedPostsClient from "@/components/features/SavedPostsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Saved Posts — Blockto" };

export default async function SavedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  return <SavedPostsClient />;
}

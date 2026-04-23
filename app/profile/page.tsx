import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import ProfileClient from "@/components/features/ProfileClient";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <ProfileClient
      initialUser={{
        id:      user.id,
        email:   user.email ?? "",
        name:    user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
        picture: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      }}
    />
  );
}

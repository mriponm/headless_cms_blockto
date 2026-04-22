import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";

export default async function SignInPage() {
  const session = await auth0.getSession();
  if (session) redirect("/");
  redirect("/auth/login");
}

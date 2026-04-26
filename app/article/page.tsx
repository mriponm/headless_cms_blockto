export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getPosts } from "@/lib/wordpress/queries";

export default async function ArticleRedirect() {
  const posts = await getPosts(1);
  const latest = posts[0];
  if (latest) redirect(`/news/${latest.slug}`);
  redirect("/");
}

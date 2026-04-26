export const dynamic = "force-dynamic";

import { getPosts, getCategories } from "@/lib/wordpress/queries";
import CategoryContent from "@/components/features/CategoryContent";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [posts, allCategories] = await Promise.all([
    getPosts(20, slug),
    getCategories(),
  ]);

  return <CategoryContent slug={slug} posts={posts} allCategories={allCategories} />;
}

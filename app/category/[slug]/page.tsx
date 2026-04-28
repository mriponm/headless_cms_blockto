export const revalidate = 60;

import { getPostsPage, getCategories } from "@/lib/wordpress/queries";
import CategoryContent from "@/components/features/CategoryContent";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [page, allCategories] = await Promise.all([
    getPostsPage(100, slug),
    getCategories(),
  ]);

  return (
    <CategoryContent
      slug={slug}
      posts={page.posts}
      allCategories={allCategories}
      initialHasNextPage={page.hasNextPage}
      initialEndCursor={page.endCursor}
    />
  );
}

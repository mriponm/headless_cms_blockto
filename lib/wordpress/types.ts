export interface WPPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content?: string;
  featuredImage: { node: { sourceUrl: string } } | null;
  author: { node: { name: string; avatar?: { url: string } } };
  categories: { nodes: WPCategory[] };
}

export interface WPCategory {
  name: string;
  slug: string;
  count?: number;
}

export interface PostsData {
  posts: { nodes: WPPost[] };
}

export interface CategoriesData {
  categories: { nodes: WPCategory[] };
}

export interface SinglePostData {
  post: WPPost | null;
}

import { pickAuthor } from "@/lib/authors";

interface Props {
  slug: string;
  size?: number;
}

export default function AuthorAvatar({ slug, size = 18 }: Props) {
  const author = pickAuthor(slug);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={author.image}
      alt={author.name}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

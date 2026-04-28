import Image from "next/image";
import { pickAuthor } from "@/lib/authors";

interface Props {
  slug: string;
  size?: number;
}

export default function AuthorAvatar({ slug, size = 18 }: Props) {
  const author = pickAuthor(slug);
  return (
    <Image
      src={author.image}
      alt={author.name}
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0"
    />
  );
}

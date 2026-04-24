interface Props {
  name: string;
  avatarUrl?: string;
  size?: number;
}

export default function AuthorAvatar({ name, size = 18 }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/Tristan.jpeg"
      alt={name}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

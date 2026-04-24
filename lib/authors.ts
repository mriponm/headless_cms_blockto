export interface Author {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export const AUTHORS: Author[] = [
  {
    name: "Tristan R.",
    role: "Senior Author",
    image: "/Tristan.jpeg",
    bio: "8+ years covering crypto markets, macro, and geopolitics. Previously at Decrypt and CoinDesk. Focused on the intersection of digital assets and traditional finance.",
  },
  {
    name: "Laurisa",
    role: "Junior Author",
    image: "/Laurisa (Junior Author).jpeg",
    bio: "Emerging voice in crypto journalism with a background in fintech and digital economics. Covers DeFi, NFTs, and the evolving regulatory landscape.",
  },
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function pickAuthor(slug: string): Author {
  return AUTHORS[hashSlug(slug) % AUTHORS.length];
}

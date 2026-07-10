/**
 * /blogg — v2. POSTS + META gjenbrukt 1:1 fra (mlegacy)/blogg/page.tsx.
 * posts.ts er en uendret hjelpefil, beholdt i (mlegacy)/blogg/.
 */
import type { Metadata } from "next";
import { POSTS } from "@/app/(marketing)/(mlegacy)/blogg/posts";
import { MarkedBloggListeV2, type BloggPostMeta } from "@/components/marketing/v2/MarkedBloggListeV2";

export const metadata: Metadata = {
  title: "Blogg fra AK Golf Academy",
  description: "Tanker, metoder og lærdom fra coaching-hverdagen i AK Golf Academy.",
};

type PostMeta = { category: string; readMinutes: number; featured: boolean };

const META: Record<string, PostMeta> = {
  "hvorfor-struktur-slar-talent": { category: "Coaching", readMinutes: 7, featured: true },
  "naerspill-er-hvor-runden-vinnes": { category: "Coaching", readMinutes: 6, featured: false },
  "datadrevet-coaching-uten-overload": { category: "Utstyr", readMinutes: 8, featured: false },
};

function metaFor(slug: string): PostMeta {
  return META[slug] ?? { category: "Coaching", readMinutes: 6, featured: false };
}

export default function BloggSideV2() {
  const posts: BloggPostMeta[] = [...POSTS]
    .sort((a, b) => b.dato.localeCompare(a.dato))
    .map((p) => ({ ...p, ...metaFor(p.slug) }));

  return <MarkedBloggListeV2 posts={posts} />;
}

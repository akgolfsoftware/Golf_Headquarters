/**
 * /blogg/[slug] — v2. POSTS gjenbrukt 1:1 fra (mlegacy)/blogg/[slug]/page.tsx.
 * posts.ts er en uendret hjelpefil, beholdt i (mlegacy)/blogg/.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POSTS } from "@/app/(marketing)/(mlegacy)/blogg/posts";
import { MarkedBloggDetaljV2 } from "@/components/marketing/v2/MarkedBloggDetaljV2";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Innlegg ikke funnet" };
  return {
    title: `${post.tittel} | AK Golf Academy`,
    description: post.ingress,
  };
}

export default async function BloggPostSideV2({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return <MarkedBloggDetaljV2 post={post} />;
}

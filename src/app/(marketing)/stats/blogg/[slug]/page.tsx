/**
 * /stats/blogg/[slug] — v2. Swap av (mlegacy)-motparten. Data + MDX-lasting
 * videreført 1:1 (getPostBySlug/getRelaterte fra @/lib/blogg/posts, dynamic
 * import av content/blogg/{slug}.mdx). Relativ dybde til content/ oppdatert
 * for ny filplassering (6 nivåer, mot 7 i mlegacy).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getRelaterte } from "@/lib/blogg/posts";
import { BloggDetaljV2 } from "@/components/marketing/v2/MarkedStatsBloggV2";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artikkel ikke funnet | AK Golf Stats" };
  return {
    title: `${post.tittel} | AK Golf Stats`,
    description: post.undertittel,
    alternates: { canonical: `https://akgolf.no/stats/blogg/${slug}` },
    openGraph: {
      title: post.tittel,
      description: post.undertittel,
      url: `https://akgolf.no/stats/blogg/${slug}`,
      type: "article",
      authors: [post.forfatter],
      publishedTime: post.publisert,
    },
  };
}

export default async function BloggDetaljPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relaterte = getRelaterte(slug, post.kategori).slice(0, 3);

  // Dynamic import av MDX-modulen — kompilert av Next.js via @next/mdx
  let MDXContent: React.ComponentType | null = null;
  try {
    const mod = (await import(
      /* webpackMode: "eager" */
      `../../../../../../content/blogg/${slug}.mdx`
    )) as { default: React.ComponentType };
    MDXContent = mod.default;
  } catch {
    MDXContent = null;
  }

  return <BloggDetaljV2 post={post} relaterte={relaterte} MDXContent={MDXContent} />;
}

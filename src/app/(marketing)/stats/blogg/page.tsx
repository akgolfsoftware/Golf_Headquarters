/**
 * /stats/blogg — v2. Swap av (mlegacy)/stats/blogg/page.tsx. Data-lag
 * (getAllPosts/getFeaturedPost/getNonFeaturedPosts fra @/lib/blogg/posts,
 * MDX i content/blogg/) videreført 1:1 — kun presentasjonen er byttet.
 */
import type { Metadata } from "next";
import { getAllPosts, getFeaturedPost, getNonFeaturedPosts } from "@/lib/blogg/posts";
import { BloggListeV2 } from "@/components/marketing/v2/MarkedStatsBloggV2";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Analyse & statistikk | AK Golf Stats",
  description:
    "Datadrevne artikler om norsk og internasjonal golf. Skrevet av folk som faktisk forstår SG.",
  alternates: { canonical: "https://akgolf.no/stats/blogg" },
  openGraph: {
    title: "Analyse: AK Golf Stats",
    description: "SG-analyse, juniordata, PGA Tour-tall. Gratis fra AK Golf.",
    url: "https://akgolf.no/stats/blogg",
    type: "website",
  },
};

export default function BloggListePage() {
  const alle = getAllPosts();
  const featured = getFeaturedPost();
  const rest = getNonFeaturedPosts();

  return <BloggListeV2 alle={alle} featured={featured} rest={rest} />;
}

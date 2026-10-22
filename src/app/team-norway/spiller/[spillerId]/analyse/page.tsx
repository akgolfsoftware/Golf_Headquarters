import { redirect } from "next/navigation";

/** Gammel adresse for Analyse. Den er visningen «Utvikling» i Tester (wireframes §3). */
export default async function SpillerAnalyseVideresending({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  redirect(`/team-norway/spiller/${spillerId}/tester?visning=utvikling`);
}

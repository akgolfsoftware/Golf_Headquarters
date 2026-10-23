import { redirect } from "next/navigation";

/** Gammel adresse for IUP › Oversikt. Oversikt er nå /team-norway/spiller/[id] (wireframes §3). */
export default async function SpillerOversiktVideresending({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  redirect(`/team-norway/spiller/${spillerId}`);
}

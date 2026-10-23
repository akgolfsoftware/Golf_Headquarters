import { redirect } from "next/navigation";

/** Gammel adresse for Profil. Innholdet er slått inn i Oversikt og Turneringer (wireframes §3). */
export default async function SpillerProfilVideresending({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  redirect(`/team-norway/spiller/${spillerId}`);
}

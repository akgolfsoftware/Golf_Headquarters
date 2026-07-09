/**
 * Kalender uke — /admin/kalender/uke
 *
 * Videresender til /admin/kalender (som er den fasit-alignede uke-visningen).
 * Denne ruten eksisterer som navigasjonspunkt fra gjennomfore-hub og
 * måned-toggle, men innholdet er identisk med /admin/kalender.
 * ?uke=YYYY-MM-DD sendes videre for riktig uke-kontekst.
 */

import { redirect } from "next/navigation";

type SearchParams = Promise<{ uke?: string }>;

export default async function KalenderUkePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { uke } = await searchParams;
  const destination = uke ? `/admin/kalender?uke=${uke}` : "/admin/kalender";
  redirect(destination);
}

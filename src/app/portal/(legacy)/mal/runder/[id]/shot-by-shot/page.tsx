/**
 * Foreldet rute — ingen lenke i appen peker hit lenger (verifisert 2026-07-11,
 * fase 2 friksjonsopprydding). "Avansert redigering" (/slag) er nå den ekte
 * visningen/redigeringen av slag for en runde.
 */
import { redirect } from "next/navigation";

export default async function RundeShotByShotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/portal/mal/runder/${id}/slag`);
}

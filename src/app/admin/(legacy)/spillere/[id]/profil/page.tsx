import { redirect } from "next/navigation";

/**
 * `/admin/(legacy)/spillere/[id]/profil` → `/admin/spillere/[id]` (T4, 26.08.2026).
 *
 * Konsolidert inn i Spiller 360 (samme URL som stallens rad-lenke og
 * søkeresultatet peker til). All PII denne siden viste (personalia,
 * forelder-kontakt, art. 9-skade/permisjonsdata, spiller-DNA, mål,
 * coach-vurdering) hentes nå av `/admin/spillere/[id]/page.tsx` — samme
 * loader, samme coach-scoping, samme samtykke-gating. Ingen duplisert
 * datahenting, ingen PII eksponert bredere enn før.
 */
export default async function LegacySpillerProfilRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/admin/spillere/${id}`);
}

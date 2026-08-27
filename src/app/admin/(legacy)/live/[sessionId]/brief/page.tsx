import { redirect } from "next/navigation";

type Props = { params: Promise<{ sessionId: string }> };

/**
 * Pensjonert (T9, §5T rad 12 — D-LYS-OG-5T-BESLUTNING.md): økt-forberedelse
 * eies av Workbench/AG-09-flaten fremover. «Legg til fokuspunkt før økt»
 * (denne sidens egne skriv-funksjon) er IKKE videreført — se
 * docs/natt/T9-DONE.md.
 */
export default async function LegacyLiveBriefRedirect({ params }: Props) {
  const { sessionId } = await params;
  redirect(`/admin/agencyos/live/${sessionId}`);
}

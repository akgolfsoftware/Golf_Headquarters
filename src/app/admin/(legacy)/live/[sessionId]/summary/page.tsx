import { redirect } from "next/navigation";

type Props = { params: Promise<{ sessionId: string }> };

/**
 * Pensjonert (T9 — LAUNCH-PLAN-FULL §T9 «`summary` følger legacy-live-
 * utfasingen», D-LYS-OG-5T-BESLUTNING.md rad 32): AG-09-flaten viser samme
 * øktdata uansett status. Post-økt-vurdering med lagring til spillerprofil
 * (denne sidens egen skriv-funksjon) er IKKE videreført — se
 * docs/natt/T9-DONE.md.
 */
export default async function LegacyLiveSummaryRedirect({ params }: Props) {
  const { sessionId } = await params;
  redirect(`/admin/agencyos/live/${sessionId}`);
}

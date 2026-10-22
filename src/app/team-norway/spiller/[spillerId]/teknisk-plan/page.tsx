import { medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { hentTnWorkbenchKontekst } from "@/lib/domain/tn-workbench";
import { hentTnTekniskPlaner, krevFullForEgenTekniskPlan } from "@/lib/domain/tn-teknisk-plan";
import { TnTekniskPlanerVisning } from "@/components/team-norway/skjermer/tn-teknisk-plan-visning";

export const dynamic = "force-dynamic";

/**
 * TN-23 Teknisk plan — planoversikt for én TN-spiller, i retning «Skrå» (godkjent av Anders 20.10.2026,
 * canvaset «Team Norway nøkkelskjermer», tavle C1).
 * Tilgang: spilleren selv, eller en trener med PERSONLIG coach-tilgang til
 * akkurat denne spilleren OG som faktisk er et aktivt TN-medlem (samme
 * rolle-/roster-port som Workbench) — TN-medlemskap alene gir IKKE dette.
 */
export default async function TeamNorwaySpillerTekniskPlanPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
  if (!(await hentTnSpillerTilgang(bruker, spillerId))) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="teknisk-plan" />;
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();
  if (bruker.role === "PLAYER" && bruker.id !== spillerId) notFound();

  const spillerNavn = kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? (bruker.id === spillerId ? bruker.name : null);
  if (!spillerNavn) notFound();
  krevFullForEgenTekniskPlan(bruker, spillerId);

  const planer = await medTnSpillerData(bruker, spillerId, (tx) => hentTnTekniskPlaner(tx, spillerId));
  if (!planer) notFound();
  return <TnTekniskPlanerVisning brukerNavn={bruker.name ?? "Ukjent"} kontekst={{ erSpiller: kontekst.erSpiller, erTrener: kontekst.erTrener, kanAdministrere: kontekst.kanAdministrere, gruppeId: kontekst.gruppeId }} spillerId={spillerId} spillerNavn={spillerNavn} planer={planer} />;
}

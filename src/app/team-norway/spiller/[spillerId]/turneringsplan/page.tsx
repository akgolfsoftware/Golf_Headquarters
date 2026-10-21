import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { byggPlanvisning } from "@/lib/turneringsplan/data";
import { TnIupTopp } from "@/components/team-norway/tn-iup-topp";
import { TnShell, tnRolleNavn } from "@/components/team-norway/tn-shell";
import { Turneringsplanlegger } from "@/components/turneringsplan/Turneringsplanlegger";

export const dynamic = "force-dynamic";

/**
 * Turneringsplan i Team Norway. Treneren ser planen spilleren har delt og sender forslag;
 * planen endres først når spilleren godtar. Lesingen skjer under delingslåsen (`medTnSpillerData`).
 */
export default async function TurneringsplanPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const data = await medTnSpillerData(bruker, spillerId, async (tx, tilgang) => ({ tilgang, visning: await byggPlanvisning(tx, spillerId) }));
  if (!data?.visning) notFound();
  const { tilgang, visning } = data;

  return (
    <TnShell aktiv="spillere" brukerNavn={bruker.name ?? "Ukjent"} rolle={tnRolleNavn(tilgang.kontekst.rolle)} groupId={tilgang.kontekst.gruppe.id} visTrenerflater={!tilgang.kontekst.erSpiller} kanAdministrere={tilgang.kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnIupTopp spillerId={spillerId} spillerNavn={tilgang.spillerNavn} aktiv="turneringsplan" kanAdministrere={!tilgang.kontekst.erSpiller} overlinje={`IUP · ${tilgang.spillerNavn}`} tittel="Turneringsplan">
      <Turneringsplanlegger visning={visning} rolle={tilgang.kontekst.erSpiller ? "spiller" : "tn"} />
    </TnIupTopp>
    </TnShell>
  );
}

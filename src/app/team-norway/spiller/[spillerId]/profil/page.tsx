import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { byggKomplettProfil } from "@/lib/profil-kobling/komplett";
import { TnShell, TnSidehode, TnSpillerFaner, tnRolleNavn } from "@/components/team-norway/tn-shell";
import { KomplettProfilTn } from "@/components/profil/KomplettProfilTn";
import { byggProfilVisning } from "@/lib/profil-kobling/visning";

export const dynamic = "force-dynamic";

/**
 * Komplett spillerprofil i Team Norway: identitet, offisielle resultater, tester og IUP. Samme data
 * som AgencyOS og WANG, uten kopi. Tilgang går gjennom `medTnSpillerData` (navngitt deling for
 * trenere, egeninnsyn for spilleren), og lesingen skjer under delingslåsen. Golf-ID bare for trenere.
 */
export default async function SpillerProfilPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const data = await medTnSpillerData(bruker, spillerId, async (tx, tilgang) => ({
    tilgang,
    profil: await byggKomplettProfil(tx, spillerId, { kanSeGolfId: !tilgang.kontekst.erSpiller && bruker.id !== spillerId }),
  }));
  if (!data) notFound();
  const { tilgang, profil } = data;

  return (
    <TnShell aktiv="spillere" brukerNavn={bruker.name ?? "Ukjent"} rolle={tnRolleNavn(tilgang.kontekst.rolle)} groupId={tilgang.kontekst.gruppe.id} visTrenerflater={!tilgang.kontekst.erSpiller} kanAdministrere={tilgang.kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnSidehode overlinje={`Komplett profil · ${tilgang.spillerNavn}`} tittel="Spillerprofil" ingress="Offisielle resultater, tester og IUP. Brutto score. Samme data som AgencyOS og WANG ser." />
      <TnSpillerFaner spillerId={spillerId} spillerNavn={tilgang.spillerNavn} aktiv="profil" kanAdministrere={!tilgang.kontekst.erSpiller} kompakt />
      <KomplettProfilTn v={byggProfilVisning({ relasjon: tilgang.kontekst.erSpiller ? "SELV" : "ORG_TRENER", ...profil })} testerHref={`/team-norway/spiller/${spillerId}/tester`} />
    </TnShell>
  );
}

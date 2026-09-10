/**
 * TN-18 Trenere og tilgang, valgt Claw-pakke 10.09.2026.
 * Fasit: designsystem/team-norway/templates/tn-trenere-tilgang/TnTrenereTilgang.dc.html
 * Avvik:
 *   - Én kanonisk TN-gruppe; designets eksempelgrupper opprettes ikke.
 *   - Trenerkatalog og invitasjon er fortsatt egne, uferdige reiser.
 * Tilgang og lagring avgjøres på serveren; radvalget følger URL-en.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erSportssjef, hentTeamNorwayTilganger, tnTilgangStatus } from "@/lib/domain/tn-tilgang";
import { TnTilgangVisning } from "@/components/team-norway/tn-tilgang-visning";
import { TnTilgangSkjema } from "@/components/team-norway/tn-tilgang-skjema";
import { avsluttTilgangAction, settTilgangAction } from "./tn-tilgang-actions";

function tilInputIso(dato: Date): string {
  return dato.toISOString().slice(0, 10);
}

export default async function TilgangPage({ searchParams }: { searchParams: Promise<{ valgt?: string }> }) {
  const { valgt } = await searchParams;
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!await erSportssjef({ id: bruker.id, role: bruker.role })) notFound();

  const data = await hentTeamNorwayTilganger();
  if (!data) notFound();
  const { gruppe, rader } = data;
  const valgtRad = rader.find((rad) => rad.userId === valgt);

  return (
    <TnTilgangVisning
      brukerNavn={bruker.name ?? "Ukjent"}
      gruppeNavn={gruppe.name}
      rader={rader.map((rad) => ({ ...rad, status: tnTilgangStatus(rad) }))}
      valgtId={valgtRad?.userId}
      skjema={valgtRad ? (
        <TnTilgangSkjema
          key={valgtRad.userId}
          groupId={gruppe.id}
          targetUserId={valgtRad.userId}
          gruppeNavn={gruppe.name}
          rolleInitial={valgtRad.rolle}
          fraInitialIso={tilInputIso(valgtRad.joinedAt)}
          tilInitialIso={valgtRad.endedAt ? tilInputIso(valgtRad.endedAt) : null}
          settTilgang={settTilgangAction}
          avsluttTilgang={avsluttTilgangAction}
        />
      ) : undefined}
    />
  );
}

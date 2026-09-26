import { notFound } from "next/navigation";
import { TnShell, tnRolleNavn } from "@/components/team-norway/tn-shell";
import { TnKnapp, TnKnapperad, TnNotis, TnSeksjonDS, TnSidehodeDS, TnTallrad } from "@/components/team-norway/tn-skjerm";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnOversiktForBruker } from "@/lib/domain/tn-tilgang";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-02 Oversikt — inngang til den kanoniske Team Norway-gruppen.
 *
 * Bruker felles `TnShell` som alle andre TN-skjermer (Anders 22.09.2026).
 * Tidligere bygget denne siden skinnen selv, med eget organisasjonsnavn og
 * egen innholdsbredde — det var én av fem skjermer som sprikte.
 *
 * Avvik fra designet:
 *   - Viser bare verifiserbare medlemstall; dekningsgrad, samlinger og
 *     handlingskø mangler egne ferdige datakilder og fabrikkeres ikke.
 *   - Testlenken er spillerens eksisterende registrering i PlayerHQ, ikke en
 *     komplett Team Norway-trenerreise eller en ny fellestestingsflate.
 */
export default async function TeamNorwayOversiktPage() {
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const side = await hentTnOversiktForBruker({ id: bruker.id, role: bruker.role });
  if (!side) notFound();

  const gruppeHref = `/team-norway/${side.gruppe.id}`;
  const erSpillerIGruppe = side.rolle === "PLAYER";

  return (
    <TnShell
      aktiv="oversikt"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={tnRolleNavn(side.rolle)}
      groupId={side.erAktivtMedlem ? side.gruppe.id : undefined}
      visTrenerflater={!erSpillerIGruppe}
      kanAdministrere={bruker.role === "ADMIN" || side.rolle === "COACH"}
    >
      <TnSidehodeDS
        overlinje="Team Norway · TN-02"
        tittel={side.gruppe.name}
        ingress="Oversikten viser aktive medlemskap i den konkrete Team Norway-gruppen."
      />

      <TnTallrad tall={[{ verdi: side.antallSpillere, etikett: "Aktive spillere" }, { verdi: side.antallTrenere, etikett: "Aktive trenere" }]} />

      <TnNotis tittel="Datagrunnlag.">
        Dekningsgrad og kommende samlinger vises når egne, verifiserte datakilder er koblet til. Til da står feltene tomme framfor å gjette.
      </TnNotis>

      {side.erAktivtMedlem ? (
        <TnSeksjonDS tittel="Grupperessurser">
          <TnKnapperad>
            <TnKnapp href={gruppeHref}>Gruppeposter</TnKnapp>
            <TnKnapp href={`${gruppeHref}/dokumenter`}>Dokumenter</TnKnapp>
            {erSpillerIGruppe ? <TnKnapp href="/portal/tren/tester/team-norway">Før egne Team Norway-tester i PlayerHQ</TnKnapp> : null}
          </TnKnapperad>
        </TnSeksjonDS>
      ) : (
        <TnNotis>
          Du ser aggregatet som administrator. Gruppeposter, dokumenter og testføring krever egne
          tilganger og åpnes derfor ikke herfra.
        </TnNotis>
      )}

      {erSpillerIGruppe ? (
        <p style={{ margin: 0, maxWidth: 680, color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
          Testlenken åpner din eksisterende registrering i PlayerHQ. Den er ikke en komplett
          trenerreise for Team Norway.
        </p>
      ) : null}
    </TnShell>
  );
}

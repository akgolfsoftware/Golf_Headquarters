import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTester, hentTnSpillerOvrigeTester } from "@/lib/domain/tn-arbeidsflate";
import { tnFormat } from "@/lib/portal-tester/tn-scoring";
import { TnShell, TnSidehode, TnSpillerFaner, TnSeksjon, TnTomtilstand } from "@/components/team-norway/tn-shell";
import { TnDataTable } from "@/components/team-norway/tn-data-table";
import { TN } from "@/lib/v2/team-norway";

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });

function rolleNavn(rolle: string) {
  if (rolle === "COACH") return "Trener";
  if (rolle === "ASSISTANT") return "Hjelpetrener";
  if (rolle === "PLAYER") return "Spiller";
  return rolle;
}

/**
 * TN-utvidelse 14.09.2026: testoversikt — ÉN rad per protokoll, ALDRI summert
 * mellom protokoller. Team Norway-protokoller først (egen validering, se
 * `hentTnSpillerTester`); øvrige PlayerHQ-tester (utenfor TN-katalogen) i
 * egen seksjon under, fra den eksisterende generelle testoversikten.
 * `kreverTilgang: "TALENT"` — samme eksisterende regel som portalens
 * testlesing, ingen ny tilgangsregel.
 */
export default async function SpillerTesterPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ kreverTilgang: "TALENT" });
  const [data, ovrige] = await Promise.all([
    hentTnSpillerTester(bruker, spillerId),
    hentTnSpillerOvrigeTester(bruker, spillerId),
  ]);
  if (!data) notFound();

  return (
    <TnShell aktiv="spillere" brukerNavn={bruker.name ?? "Ukjent"} rolle={rolleNavn(data.tilgang.kontekst.rolle)} groupId={data.tilgang.kontekst.gruppe.id} visTrenerflater={!data.tilgang.kontekst.erSpiller} kanAdministrere={data.tilgang.kontekst.kanAdministrere}>
      <TnSpillerFaner spillerId={spillerId} spillerNavn={data.tilgang.spillerNavn} aktiv="tester" kanAdministrere={!data.tilgang.kontekst.erSpiller} />
      <TnSidehode overlinje="Testoversikt" tittel="Tester" ingress="Team Norway-protokoller først, øvrige PlayerHQ-tester under." />

      <TnSeksjon tittel="Team Norway-protokoller" forklaring="Én rad per protokoll. Retningen på «best» beregnes ut fra testprotokollen, ikke antatt fra en lagret verdi.">
        {data.rader.length === 0 ? (
          <TnTomtilstand tittel="Ingen testresultater ennå" tekst="Ingen Team Norway-protokoll er fullført av denne spilleren ennå." />
        ) : (
          <TnDataTable
            caption="Team Norway-protokoller"
            kolonner={[
              { key: "protokoll", label: "Protokoll" },
              { key: "siste", label: "Siste", align: "right" },
              { key: "forrige", label: "Forrige", align: "right" },
              { key: "beste", label: "Beste", align: "right" },
              { key: "dato", label: "Dato" },
              { key: "antall", label: "Antall", align: "right" },
            ]}
            rader={data.rader.map((rad) => ({
              protokoll: <Link href={`/team-norway/spiller/${spillerId}/tester/${rad.testId}`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{rad.protokollNavn}</Link>,
              siste: rad.sisteFormatert ?? (rad.antallUtelatt > 0 ? "Uforenlig data" : "—"),
              forrige: rad.forrigeScore === null || rad.sisteEnhet === null ? "—" : tnFormat({ value: rad.forrigeScore, unit: rad.sisteEnhet }),
              beste: rad.besteFormatert ?? "—",
              dato: dato.format(rad.sisteDato),
              antall: rad.antallUtelatt > 0 ? `${rad.antall} (${rad.antallUtelatt} utelatt)` : rad.antall,
            }))}
            empty="Ingen testresultater ennå."
          />
        )}
      </TnSeksjon>

      {ovrige && ovrige.planlagt.length > 0 && (
        <TnSeksjon tittel="Planlagt / åpent" forklaring="Tester spilleren har fått i oppgave, eller allerede har startet på.">
          <TnDataTable
            caption="Planlagt / åpent"
            kolonner={[{ key: "test", label: "Test" }, { key: "status", label: "Status" }, { key: "nar", label: "Når" }]}
            rader={ovrige.planlagt.map((p) => ({
              test: <Link href={p.href} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{p.navn}</Link>,
              status: p.status === "PÅGÅR" ? "Pågår" : p.status === "ÅPEN TILDELING" ? "Tildelt" : "Planlagt",
              nar: p.status === "ÅPEN TILDELING" ? (p.frist ? `Frist ${dato.format(p.frist)}` : "Ingen frist") : (p.nar ?? "—"),
            }))}
            empty="Ingen planlagte tester."
          />
        </TnSeksjon>
      )}

      {ovrige && ovrige.grupper.length > 0 && (
        <TnSeksjon tittel="Øvrige PlayerHQ-tester" forklaring="Tester utenfor Team Norway-katalogen, fra spillerens generelle PlayerHQ-testhistorikk.">
          {ovrige.grupper.map((gruppe) => (
            <TnDataTable
              key={gruppe.axis}
              caption={gruppe.label}
              kolonner={[{ key: "test", label: gruppe.label }, { key: "siste", label: "Siste", align: "right" }, { key: "dato", label: "Dato" }]}
              rader={gruppe.rows.map((row) => ({
                test: <Link href={row.href} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{row.name}</Link>,
                siste: row.latest ?? "Ingen resultat",
                dato: row.latestDate ?? "—",
              }))}
              empty="Ingen tester i denne gruppen."
            />
          ))}
        </TnSeksjon>
      )}
    </TnShell>
  );
}

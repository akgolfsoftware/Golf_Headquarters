import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTester, hentTnSpillerAnalyseHub } from "@/lib/domain/tn-arbeidsflate";
import { TnShell, TnSidehode, TnSpillerFaner, TnSeksjon, TnTomtilstand, TnMetrikk, TnMetrikkRutenett } from "@/components/team-norway/tn-shell";
import { TnKort, TnPille } from "@/components/team-norway/core";
import { TN } from "@/lib/v2/team-norway";

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });

function rolleNavn(rolle: string) {
  if (rolle === "COACH") return "Trener";
  if (rolle === "ASSISTANT") return "Hjelpetrener";
  if (rolle === "PLAYER") return "Spiller";
  return rolle;
}

function trend(rad: { sisteScore: number | null; forrigeScore: number | null; lowerIsBetter: boolean | null }): { tekst: string; tone: "green" | "amber" | "nøytral" } {
  if (rad.sisteScore === null || rad.lowerIsBetter === null) return { tekst: "Uforenlig data", tone: "amber" };
  if (rad.forrigeScore === null) return { tekst: "Første resultat", tone: "nøytral" };
  const diff = rad.sisteScore - rad.forrigeScore;
  if (diff === 0) return { tekst: "Uendret", tone: "nøytral" };
  const bedre = rad.lowerIsBetter ? diff < 0 : diff > 0;
  return { tekst: bedre ? "Forbedret siden forrige" : "Svakere siden forrige", tone: bedre ? "green" : "amber" };
}

/**
 * TN-utvidelse 14.09.2026: spillerens EGEN analyse — ett kort per protokoll
 * med trend mot spillerens eget forrige resultat, ALDRI en sammenslått
 * "totalscore" på tvers av protokoller. Kohort-/rangeringssammenligning
 * er et coach-verktøy (/team-norway/analyse), ikke vist her. SG/TrackMan-
 * sammendraget under gjenbruker eksisterende `hentAnalyseHub` — lovlig
 * innsyn er allerede bevist av tilgangssjekken over.
 */
export default async function SpillerAnalysePage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ kreverTilgang: "TALENT" });
  const data = await hentTnSpillerTester(bruker, spillerId);
  if (!data) notFound();
  const hub = await hentTnSpillerAnalyseHub(data.tilgang);

  return (
    <TnShell aktiv="spillere" brukerNavn={bruker.name ?? "Ukjent"} rolle={rolleNavn(data.tilgang.kontekst.rolle)} groupId={data.tilgang.kontekst.gruppe.id} visTrenerflater={!data.tilgang.kontekst.erSpiller} kanAdministrere={data.tilgang.kontekst.kanAdministrere}>
      <TnSpillerFaner spillerId={spillerId} spillerNavn={data.tilgang.spillerNavn} aktiv="analyse" kanAdministrere={!data.tilgang.kontekst.erSpiller} />
      <TnSidehode overlinje="Analyse" tittel="Utvikling per protokoll" ingress="Hver protokoll vises for seg — ingen sammenslått totalscore på tvers av ulike måleenheter." />

      {(hub.sgAkser.some((a) => a.verdi !== null) || hub.trackman) && (
        <TnSeksjon tittel="Strokes Gained / TrackMan">
          <TnMetrikkRutenett>
            {hub.sgAkser.filter((a) => a.verdi !== null).map((a) => (
              <TnMetrikk key={a.id} etikett={a.etikett} verdi={a.tekst} />
            ))}
          </TnMetrikkRutenett>
          {hub.trackman && (
            <TnKort>
              <p style={{ margin: 0, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{hub.trackman.klubb} · {hub.trackman.datoKort}</p>
              <p style={{ margin: "6px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>{hub.trackman.setning} — {hub.trackman.meta}</p>
            </TnKort>
          )}
        </TnSeksjon>
      )}

      {data.rader.length === 0 ? (
        <TnTomtilstand tittel="Ingen data å analysere ennå" tekst="Spilleren må ha minst ett fullført testresultat før utvikling kan vises." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 14 }}>
          {data.rader.map((rad) => {
            const t = trend(rad);
            return (
              <TnKort key={rad.testId}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: TN.text.h3, color: TN.navy900 }}>{rad.protokollNavn}</h3>
                  <TnPille tone={t.tone}>{t.tekst}</TnPille>
                </div>
                <p style={{ margin: "10px 0 0", fontFamily: TN.font.mono, fontSize: TN.text.h2, fontWeight: TN.weight.bold, color: TN.navy900 }}>{rad.sisteFormatert ?? "—"}</p>
                <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>
                  {rad.besteFormatert ? `Beste: ${rad.besteFormatert} · ` : `${rad.antallUtelatt} resultat(er) kunne ikke valideres · `}{dato.format(rad.sisteDato)}
                </p>
                <Link href={`/team-norway/spiller/${spillerId}/tester/${rad.testId}`} style={{ display: "inline-block", marginTop: 10, color: TN.navy700, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Se full historikk →</Link>
              </TnKort>
            );
          })}
        </div>
      )}
    </TnShell>
  );
}

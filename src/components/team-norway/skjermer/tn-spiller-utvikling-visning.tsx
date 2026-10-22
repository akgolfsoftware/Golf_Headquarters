import Link from "next/link";
import type { TnSpillerAnalyseHub, TnSpillerTestRad, TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TnIupTopp } from "../tn-iup-topp";
import { TnShell, TnSeksjon, TnTomtilstand, TnMetrikk, TnMetrikkRutenett, tnRolleNavn } from "../tn-shell";
import { TnKort, TnPille } from "../core";
import { TN } from "@/lib/v2/team-norway";
import { TnTekstlenke } from "../tn-flate";

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });

function trend(rad: { sisteScore: number | null; forrigeScore: number | null; lowerIsBetter: boolean | null }): { tekst: string; tone: "green" | "amber" | "nøytral" } {
  if (rad.sisteScore === null || rad.lowerIsBetter === null) return { tekst: "Uforenlig data", tone: "amber" };
  if (rad.forrigeScore === null) return { tekst: "Første resultat", tone: "nøytral" };
  const diff = rad.sisteScore - rad.forrigeScore;
  if (diff === 0) return { tekst: "Uendret", tone: "nøytral" };
  const bedre = rad.lowerIsBetter ? diff < 0 : diff > 0;
  return { tekst: bedre ? "Forbedret siden forrige" : "Svakere siden forrige", tone: bedre ? "green" : "amber" };
}

/**
 * IUP › Tester › Utvikling (`?visning=utvikling`, wireframes §2: «Analyse» blir visningen «Utvikling» i Tester).
 * TN-utvidelse 14.09.2026: spillerens EGEN analyse — ett kort per protokoll
 * med trend mot spillerens eget forrige resultat, ALDRI en sammenslått
 * "totalscore" på tvers av protokoller. Kohort-/rangeringssammenligning
 * er et coach-verktøy (/team-norway/analyse), ikke vist her. SG/TrackMan-
 * sammendraget under gjenbruker eksisterende `hentAnalyseHub` — lovlig
 * innsyn kontrolleres på nytt gjennom hele oppslaget.
 */
export function TnSpillerUtviklingVisning({ brukerNavn, spillerId, data, hub }: { brukerNavn: string | null; spillerId: string; data: { tilgang: TnSpillerTilgang; rader: TnSpillerTestRad[] }; hub: TnSpillerAnalyseHub }) {
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(data.tilgang.kontekst.rolle)} groupId={data.tilgang.kontekst.gruppe.id} visTrenerflater={!data.tilgang.kontekst.erSpiller} kanAdministrere={data.tilgang.kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnIupTopp spillerId={spillerId} spillerNavn={data.tilgang.spillerNavn} aktiv="tester" kanAdministrere={!data.tilgang.kontekst.erSpiller} overlinje={`IUP · ${data.tilgang.spillerNavn} · Tester`} tittel="Utvikling per protokoll" ingress="Hver protokoll vises for seg. Ingen sammenslått totalscore på tvers av ulike måleenheter.">

      <TnTekstlenke href={`/team-norway/spiller/${spillerId}/tester`}>Tilbake til resultatene</TnTekstlenke>

      {(hub.sgAkser.some((a) => a.verdi !== null) || hub.trackman) && (
        <TnSeksjon tittel="Strokes Gained / TrackMan">
          <TnMetrikkRutenett>
            {hub.sgAkser.filter((a) => a.verdi !== null).map((a) => (
              <TnMetrikk key={a.id} etikett={a.etikett} verdi={a.tekst} />
            ))}
          </TnMetrikkRutenett>
          {hub.trackman && (
            <TnKort>
              <p style={{ margin: 0, fontWeight: 700, color: TN.ink900 }}>{hub.trackman.klubb} · {hub.trackman.datoKort}</p>
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
                  <h3 style={{ margin: 0, fontFamily: TN.font.body, fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: TN.ink900 }}>{rad.protokollNavn}</h3>
                  <TnPille tone={t.tone}>{t.tekst}</TnPille>
                </div>
                <p style={{ margin: "10px 0 0", fontFamily: TN.font.mono, fontSize: 30, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.02em", color: TN.navy900 }}>{rad.sisteFormatert ?? "—"}</p>
                <p style={{ margin: "4px 0 0", color: TN.ink500, fontSize: 12.5 }}>
                  {rad.besteFormatert ? `Beste: ${rad.besteFormatert} · ` : `${rad.antallUtelatt} resultat(er) kunne ikke valideres · `}{dato.format(rad.sisteDato)}
                </p>
                <Link href={`/team-norway/spiller/${spillerId}/tester/${rad.testId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy600, fontWeight: 700, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>Se full historikk</Link>
              </TnKort>
            );
          })}
        </div>
      )}
    </TnIupTopp>
    </TnShell>
  );
}

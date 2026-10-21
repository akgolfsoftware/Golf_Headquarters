import Link from "next/link";
import type { ReactNode } from "react";

import { TnShell, TnSpillerFaner, TnSeksjon, TnTomtilstand, tnRolleNavn } from "@/components/team-norway/tn-shell";
import { TnDataTable } from "@/components/team-norway/tn-data-table";
import { TnKort, TnPille } from "@/components/team-norway/core";
import { TnFlate } from "@/components/team-norway/tn-flate";
import { TnSkraKort, TnSkraTopp } from "@/components/team-norway/tn-skra-topp";
import { TnHeltTall, TnHeltTekst, TnHeltTellere } from "@/components/team-norway/tn-stall";
import { TnUtviklingskurve } from "@/components/team-norway/tn-utviklingskurve";
import { TN } from "@/lib/v2/team-norway";
import type { TnSpillerTestDetalj, TnSpillerOvrigTestDetalj, TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { formaterTall } from "@/lib/format-tall";

/**
 * IUP › Tester › én test, i retning «Skrå» (godkjent av Anders 20.10.2026, canvaset
 * «Team Norway nøkkelskjermer», tavle B2): bildetopp med testen som tittel, beste resultat som
 * hovedtall, IUP-fanene i et kort over kanten, og utviklingskurven der opp alltid er bedre.
 *
 * Rene presentasjonskomponenter for testdetaljskjermen — ingen server-only-
 * import her (kun typer, via `import type`, som TypeScript fjerner helt ved
 * kompilering). Skilt ut fra `page.tsx` slik at `tests/komponenter/` kan
 * rendertest disse direkte uten å trekke inn `requirePortalUser`/prisma.
 * Skjermprøve: tests/visual/team-norway/skjermer/TN-15.tsx.
 */

const datoTid = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
const datoKort = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });

/** `null` betyr «retningen er ikke kjent» — ALDRI tolket som «høyere er bedre». */
function retningIngress(lowerIsBetter: boolean | null, emne: string): string {
  if (lowerIsBetter === null) return `Retningen (lavere/høyere er bedre) er ikke kjent for ${emne} — vises uten sammenligning.`;
  return lowerIsBetter ? `Lavere tall er bedre for ${emne}.` : `Høyere tall er bedre for ${emne}.`;
}

function Ramme({ spillerId, tilgang, brukerNavn, overlinje, tittel, ingress, venstre, hoyre, children }: { spillerId: string; tilgang: TnSpillerTilgang; brukerNavn: string; overlinje: string; tittel: string; ingress: string; venstre?: ReactNode; hoyre?: ReactNode; children: ReactNode }) {
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn} rolle={tnRolleNavn(tilgang.kontekst.rolle)} groupId={tilgang.kontekst.gruppe.id} visTrenerflater={!tilgang.kontekst.erSpiller} kanAdministrere={tilgang.kontekst.kanAdministrere} tilbake={{ href: `/team-norway/spiller/${spillerId}/tester`, label: "Tester" }}>
      <TnSkraTopp bilde="spiller-ved-vannet" etikett={tittel} overlinje={overlinje} tittel={tittel} ingress={ingress} venstre={venstre} hoyre={hoyre} />
      <TnSkraKort>
        <TnFlate>
          <TnSpillerFaner spillerId={spillerId} spillerNavn={tilgang.spillerNavn} aktiv="tester" kanAdministrere={!tilgang.kontekst.erSpiller} />
        </TnFlate>
        {children}
      </TnSkraKort>
    </TnShell>
  );
}

export function TnVisning({ spillerId, data, brukerNavn }: { spillerId: string; data: TnSpillerTestDetalj; brukerNavn: string }) {
  const harGyldigeResultater = data.historikk.length > 0;
  const kronologisk = [...data.historikk].sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime());
  const kontrollert = data.historikk.filter((r) => r.recordedByCoach).length;
  return (
    <Ramme
      spillerId={spillerId}
      tilgang={data.tilgang}
      brukerNavn={brukerNavn}
      overlinje={`IUP · ${data.tilgang.spillerNavn} · Tester`}
      tittel={data.protokollNavn}
      ingress={retningIngress(data.lowerIsBetter, "denne protokollen")}
      venstre={
        <>
          <TnHeltTall verdi={data.besteFormatert ?? "—"}>beste resultat</TnHeltTall>
          <TnHeltTekst>{harGyldigeResultater ? `Siste gjennomføring ${datoTid.format(data.historikk[0]!.takenAt)}.` : "Ingen gyldige resultater ennå."}</TnHeltTekst>
        </>
      }
      hoyre={<TnHeltTellere tall={[{ verdi: data.historikk.length, tekst: "gyldige forsøk" }, { verdi: kontrollert, tekst: "kontrollert" }, { verdi: data.historikk.length - kontrollert, tekst: "egenført" }]} />}
    >
      {data.antallUtelatt > 0 && (
        <TnTomtilstand
          tittel={harGyldigeResultater ? "Noen rader er utelatt" : "Ingen av de lagrede radene kunne valideres"}
          tekst={`${data.antallUtelatt} lagret(e) rad(er) var fra en annen protokollversjon eller uforenlige med denne protokollen, og er ikke tatt med i sammenligningen${harGyldigeResultater ? " under" : ""}.`}
        />
      )}

      {!harGyldigeResultater ? (
        <TnTomtilstand tittel="Ingen gyldige resultater ennå" tekst="Ingen registrering på denne protokollen kunne vises. Fullfør testen på nytt for å få et gyldig resultat." />
      ) : (
        <>
          {kronologisk.length > 1 ? (
            <TnSeksjon tittel="Utvikling" forklaring={data.lowerIsBetter === null ? "Retningen er ikke kjent, så kurven viser bare verdiene." : "Kurven peker opp når spilleren blir bedre. Fylt prikk er kontrollert av trener, åpen er egenført."}>
              <TnKort>
                <TnUtviklingskurve
                  etikett={`${data.protokollNavn} over tid for ${data.tilgang.spillerNavn}`}
                  lavereErBedre={data.lowerIsBetter}
                  aksetall={(v) => (kronologisk[0]?.unit === "pei" ? `${formaterTall(v * 100, 1)} %` : formaterTall(v, 1))}
                  punkter={kronologisk.map((r) => ({ id: r.id, dato: datoKort.format(r.takenAt), verdi: r.score, tekst: r.formatert, kontrollert: r.recordedByCoach }))}
                />
              </TnKort>
            </TnSeksjon>
          ) : null}

          <TnSeksjon tittel="Siste gjennomføring — forsøk">
            <TnKort style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {data.sisteForsok.map((f) => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", minHeight: 40, alignItems: "center", borderTop: `1px solid ${TN.ink100}`, fontSize: TN.text.sm }}>
                  <span style={{ color: TN.textSecondary }}>{f.label}</span>
                  <span style={{ fontFamily: TN.font.mono, color: TN.navy900 }}>{f.verdi}</span>
                </div>
              ))}
            </TnKort>
          </TnSeksjon>

          <TnSeksjon tittel="Alle gjennomføringer">
            <TnDataTable
              caption="Historikk"
              kolonner={[
                { key: "dato", label: "Dato" },
                { key: "score", label: "Resultat", align: "right" },
                { key: "kilde", label: "Ført av" },
                { key: "testdag", label: "Testdag" },
              ]}
              rader={data.historikk.map((rad) => ({
                dato: datoTid.format(rad.takenAt),
                score: rad.formatert,
                kilde: rad.recordedByCoach ? <TnPille tone="green">Kontrollert</TnPille> : <TnPille tone="info">Egenført</TnPille>,
                testdag: rad.testdagDeltakerId ? <Link href={`/team-norway/fellestesting/${rad.testdagDeltakerId}`} style={{ color: TN.navy600, fontWeight: 700, textUnderlineOffset: 4, minHeight: 44, display: "inline-flex", alignItems: "center" }}>Se testdag</Link> : "—",
              }))}
              empty="Ingen historikk."
            />
          </TnSeksjon>
        </>
      )}
    </Ramme>
  );
}

export function TnOvrigVisning({ spillerId, data, brukerNavn }: { spillerId: string; data: TnSpillerOvrigTestDetalj; brukerNavn: string }) {
  const harResultater = data.historikk.length > 0;
  const sisteMedForsok = data.sisteForsok.length > 0;
  const enhet = (n: number) => `${formaterTall(n, 2)}${data.enhet ? ` ${data.enhet}` : ""}`;
  const kronologisk = [...data.historikk].sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime());
  const siste = data.historikk[0];
  return (
    <Ramme
      spillerId={spillerId}
      tilgang={data.tilgang}
      brukerNavn={brukerNavn}
      overlinje={`IUP · ${data.tilgang.spillerNavn} · PlayerHQ-test`}
      tittel={data.navn}
      ingress={retningIngress(data.lowerIsBetter, "denne testen")}
      venstre={
        <>
          <TnHeltTall verdi={siste ? enhet(siste.score) : "—"}>siste resultat</TnHeltTall>
          <TnHeltTekst>{siste ? `Tatt ${datoTid.format(siste.takenAt)}.` : "Spilleren har ikke tatt testen ennå."}</TnHeltTekst>
        </>
      }
      hoyre={<TnHeltTellere tall={[{ verdi: data.historikk.length, tekst: "resultater" }, { verdi: data.steg.length, tekst: "steg" }, { verdi: data.sisteForsok.length, tekst: "forsøk sist" }]} />}
    >
      <TnSeksjon tittel="Protokoll" forklaring={data.regel}>
        {data.steg.length === 0 ? (
          <TnTomtilstand tittel="Ingen steg-protokoll i systemet ennå" tekst="Scoringsregelen over gjelder — testen har ingen registrert steg-for-steg-instruksjon." />
        ) : (
          <TnKort style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.steg.map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: TN.text.sm }}>
                <span style={{ color: TN.navy900 }}>{s.label}</span>
                <span style={{ fontFamily: TN.font.mono, color: TN.textSecondary }}>× {s.antall}{s.target != null ? ` · mål ${s.target}` : ""}</span>
              </div>
            ))}
          </TnKort>
        )}
      </TnSeksjon>

      {kronologisk.length > 1 ? (
        <TnSeksjon tittel="Utvikling" forklaring={data.lowerIsBetter === null ? "Retningen er ikke kjent, så kurven viser bare verdiene." : "Kurven peker opp når spilleren blir bedre."}>
          <TnKort>
            <TnUtviklingskurve
              etikett={`${data.navn} over tid for ${data.tilgang.spillerNavn}`}
              lavereErBedre={data.lowerIsBetter}
              aksetall={(v) => formaterTall(v, 1)}
              punkter={kronologisk.map((r) => ({ id: r.id, dato: datoKort.format(r.takenAt), verdi: r.score, tekst: enhet(r.score), kontrollert: false }))}
            />
          </TnKort>
        </TnSeksjon>
      ) : null}

      {sisteMedForsok && (
        <TnSeksjon tittel="Siste gjennomføring — forsøk">
          <TnKort style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.sisteForsok.map((f) => (
              <div key={f.nr} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: TN.text.sm }}>
                <span style={{ color: TN.textSecondary }}>Forsøk {f.nr}</span>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {f.side && <span style={{ fontFamily: TN.font.mono, color: TN.textSecondary }}>{f.side}</span>}
                  <TnPille tone={f.ok === true ? "green" : f.ok === false ? "red" : "nøytral"}>{f.ok === true ? "OK" : f.ok === false ? "Bom" : "Ukjent"}</TnPille>
                </span>
              </div>
            ))}
          </TnKort>
        </TnSeksjon>
      )}

      <TnSeksjon tittel="Historikk / trend">
        {!harResultater ? (
          <TnTomtilstand tittel="Ingen resultater ennå" tekst="Spilleren har ikke fullført denne testen ennå. Protokollen over gjelder når testen tas." />
        ) : (
          <TnDataTable
            caption="Historikk"
            kolonner={[{ key: "dato", label: "Dato" }, { key: "score", label: "Resultat", align: "right" }]}
            rader={data.historikk.map((rad) => ({ dato: datoTid.format(rad.takenAt), score: enhet(rad.score) }))}
            empty="Ingen historikk."
          />
        )}
      </TnSeksjon>
    </Ramme>
  );
}

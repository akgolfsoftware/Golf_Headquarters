import Link from "next/link";

import { TnShell, TnSidehode, TnSpillerFaner, TnSeksjon, TnMetrikk, TnMetrikkRutenett, TnTomtilstand, tnRolleNavn } from "@/components/team-norway/tn-shell";
import { TnDataTable } from "@/components/team-norway/tn-data-table";
import { TnKort, TnPille } from "@/components/team-norway/core";
import { TN } from "@/lib/v2/team-norway";
import type { TnSpillerTestDetalj, TnSpillerOvrigTestDetalj } from "@/lib/domain/tn-arbeidsflate";
import { formaterTall } from "@/lib/format-tall";

/**
 * Rene presentasjonskomponenter for testdetaljskjermen — ingen server-only-
 * import her (kun typer, via `import type`, som TypeScript fjerner helt ved
 * kompilering). Skilt ut fra `page.tsx` slik at `tests/komponenter/` kan
 * rendertest disse direkte uten å trekke inn `requirePortalUser`/prisma.
 */

const datoTid = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

/** `null` betyr «retningen er ikke kjent» — ALDRI tolket som «høyere er bedre». */
function retningIngress(lowerIsBetter: boolean | null, emne: string): string {
  if (lowerIsBetter === null) return `Retningen (lavere/høyere er bedre) er ikke kjent for ${emne} — vises uten sammenligning.`;
  return lowerIsBetter ? `Lavere tall er bedre for ${emne}.` : `Høyere tall er bedre for ${emne}.`;
}

export function TnVisning({ spillerId, data, brukerNavn }: { spillerId: string; data: TnSpillerTestDetalj; brukerNavn: string }) {
  const harGyldigeResultater = data.historikk.length > 0;
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn} rolle={tnRolleNavn(data.tilgang.kontekst.rolle)} groupId={data.tilgang.kontekst.gruppe.id} visTrenerflater={!data.tilgang.kontekst.erSpiller} kanAdministrere={data.tilgang.kontekst.kanAdministrere} tilbake={{ href: `/team-norway/spiller/${spillerId}/tester`, label: "Tester" }}>
      <TnSidehode overlinje={`IUP · ${data.tilgang.spillerNavn}`} tittel={data.protokollNavn} ingress={retningIngress(data.lowerIsBetter, "denne protokollen")} />
      <TnSpillerFaner spillerId={spillerId} spillerNavn={data.tilgang.spillerNavn} aktiv="tester" kanAdministrere={!data.tilgang.kontekst.erSpiller} kompakt />

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
          <TnMetrikkRutenett>
            <TnMetrikk etikett="Beste resultat" verdi={data.besteFormatert ?? "—"} tone="green" />
            <TnMetrikk etikett="Antall gyldige forsøk" verdi={data.historikk.length} />
            <TnMetrikk etikett="Siste dato" verdi={datoTid.format(data.historikk[0].takenAt)} />
          </TnMetrikkRutenett>

          <TnSeksjon tittel="Siste gjennomføring — forsøk">
            <TnKort style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.sisteForsok.map((f) => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: TN.text.sm }}>
                  <span style={{ color: TN.textSecondary }}>{f.label}</span>
                  <span style={{ fontFamily: TN.font.mono, color: TN.navy900 }}>{f.verdi}</span>
                </div>
              ))}
            </TnKort>
          </TnSeksjon>

          <TnSeksjon tittel="Historikk / trend">
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
                testdag: rad.testdagDeltakerId ? <Link href={`/team-norway/fellestesting/${rad.testdagDeltakerId}`} style={{ color: TN.navy600, fontWeight: 700, textUnderlineOffset: 4 }}>Se testdag</Link> : "—",
              }))}
              empty="Ingen historikk."
            />
          </TnSeksjon>
        </>
      )}
    </TnShell>
  );
}

export function TnOvrigVisning({ spillerId, data, brukerNavn }: { spillerId: string; data: TnSpillerOvrigTestDetalj; brukerNavn: string }) {
  const harResultater = data.historikk.length > 0;
  const sisteMedForsok = data.sisteForsok.length > 0;
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn} rolle={tnRolleNavn(data.tilgang.kontekst.rolle)} groupId={data.tilgang.kontekst.gruppe.id} visTrenerflater={!data.tilgang.kontekst.erSpiller} kanAdministrere={data.tilgang.kontekst.kanAdministrere} tilbake={{ href: `/team-norway/spiller/${spillerId}/tester`, label: "Tester" }}>
      <TnSidehode overlinje={`IUP · ${data.tilgang.spillerNavn} · PlayerHQ-test`} tittel={data.navn} ingress={retningIngress(data.lowerIsBetter, "denne testen")} />
      <TnSpillerFaner spillerId={spillerId} spillerNavn={data.tilgang.spillerNavn} aktiv="tester" kanAdministrere={!data.tilgang.kontekst.erSpiller} kompakt />

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
            rader={data.historikk.map((rad) => ({ dato: datoTid.format(rad.takenAt), score: `${formaterTall(rad.score, 2)}${data.enhet ? ` ${data.enhet}` : ""}` }))}
            empty="Ingen historikk."
          />
        )}
      </TnSeksjon>
    </TnShell>
  );
}

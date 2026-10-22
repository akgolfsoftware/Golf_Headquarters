import Link from "next/link";

import type { TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import type { TestoktUtvalg, TestoktValg } from "@/lib/portal-tester/tn-testokt";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnRutenett } from "../tn-flate";
import { TnShell, TnSpillerFaner, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTekst } from "../tn-stall";

/**
 * Testøkt uten testdag (utkast 3, skjermene «Start test» og «Ferdig med løpet», godkjent av Anders 22.10.2026).
 * Fasit: docs/design-system/utkast-tn/trenerflate/utkast-3.html. Ren visning; siden henter data og lager løpet.
 *
 * Avvik:
 *   - Velgeren er et vanlig skjema med avkryssing. Rekkefølgen i løpet er rekkefølgen i lista, ikke dra-og-slipp.
 *   - «Del av samling» står ikke: testøkta knyttes ikke til en samling ennå (ingen kobling i basen).
 *   - Tidsanslaget («ca. 35 min») står ikke; det finnes ikke en målt tid per test.
 */

const knapp = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "0 20px", borderRadius: 999, background: TN.navy900, color: TN.white, fontWeight: 700, fontSize: 15, border: 0, textDecoration: "none", cursor: "pointer" } as const;

function Valgrad({ v }: { v: TestoktValg }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: 12, alignItems: "center", minHeight: 52, padding: "6px 0", borderTop: `1px solid ${TN.ink100}`, cursor: "pointer" }}>
      <input type="checkbox" name="p" value={v.protokollId} style={{ width: 22, height: 22, accentColor: TN.navy900 }} />
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <b style={{ fontSize: 15, color: TN.ink900, overflowWrap: "anywhere" }}>{v.navn}</b>
        <span style={{ fontSize: 12.5, color: TN.ink500 }}>{v.slag} slag</span>
      </span>
      {v.merknad ? <TnPille tone="amber">{v.merknad}</TnPille> : <span />}
    </label>
  );
}

function Del({ tittel, valg }: { tittel: string; valg: TestoktValg[] }) {
  if (!valg.length) return null;
  return (
    <div style={{ display: "grid" }}>
      <p style={{ margin: "14px 0 2px", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: TN.ink500 }}>{tittel}</p>
      {valg.map((v) => <Valgrad key={v.protokollId} v={v} />)}
    </div>
  );
}

function Skall({ brukerNavn, tilgang, spillerId, children }: { brukerNavn: string; tilgang: TnSpillerTilgang; spillerId: string; children: React.ReactNode }) {
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn} rolle={tnRolleNavn(tilgang.kontekst.rolle)} groupId={tilgang.kontekst.gruppe.id} visTrenerflater={!tilgang.kontekst.erSpiller} kanAdministrere={tilgang.kontekst.kanAdministrere} tilbake={{ href: `/team-norway/spiller/${spillerId}/tester`, label: "Tester" }}>
      {children}
    </TnShell>
  );
}

export function TnTestoktStartVisning({ brukerNavn, spillerId, tilgang, utvalg, feil }: { brukerNavn: string; spillerId: string; tilgang: TnSpillerTilgang; utvalg: TestoktUtvalg; feil?: string }) {
  const fornavn = tilgang.spillerNavn.split(" ")[0] ?? tilgang.spillerNavn;
  return (
    <Skall brukerNavn={brukerNavn} tilgang={tilgang} spillerId={spillerId}>
      <TnSkraTopp bilde="spiller-ved-vannet" lav etikett={`Start test for ${tilgang.spillerNavn}`} overlinje={`IUP · ${tilgang.spillerNavn} · Tester`} tittel="Start test"
        venstre={<TnHeltTekst>Velg testene og kjør dem i ett løp, ett slag om gangen. Testdag trengs bare når hele gruppa tester.</TnHeltTekst>} />
      <TnSkraKort lav>
        <TnFlate>
          <TnSpillerFaner spillerId={spillerId} spillerNavn={tilgang.spillerNavn} aktiv="tester" kanAdministrere />
        </TnFlate>
        <form method="get" style={{ display: "contents" }}>
          <TnRutenett min={320}>
            <TnFlate>
              <TnFlatehode tittel={`Velg tester for ${fornavn}`} />
              {feil ? <p role="alert" style={{ margin: "0 0 8px", color: TN.status.redText, fontWeight: 700 }}>{feil}</p> : null}
              <Del tittel="Mangler forsøk (prioritert)" valg={utvalg.mangler} />
              <Del tittel="Teknikk" valg={utvalg.teknikk} />
              <Del tittel="Golfslag" valg={utvalg.golfslag} />
              {utvalg.spillerForer.length ? (
                <p style={{ margin: "14px 0 0", fontSize: 13.5, color: TN.ink500, lineHeight: 1.45 }}>
                  Spilleren fører selv i PlayerHQ: {utvalg.spillerForer.join(", ")}.
                </p>
              ) : null}
            </TnFlate>
            <TnFlate style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <TnFlatehode tittel="Løpet" />
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: TN.ink700 }}>Testene kjøres i rekkefølgen i lista. Hvert slag lagres på telefonen med en gang, også uten nett. En test teller bare når alle slag er ført.</p>
              <button type="submit" style={knapp}>Start testøkta</button>
              <TnFotnote>Alt treneren fører blir «Kontrollert» med en gang.</TnFotnote>
            </TnFlate>
          </TnRutenett>
        </form>
      </TnSkraKort>
    </Skall>
  );
}

export type TestoktOppsummering = { navn: string; status: "COMPLETED" | "IN_PROGRESS" | "ABORTED" | "IKKE_STARTET"; resultat: string | null; href: string };

const STATUS: Record<TestoktOppsummering["status"], string> = { COMPLETED: "Kontrollert", IN_PROGRESS: "Ikke ferdig", ABORTED: "Avbrutt", IKKE_STARTET: "Ikke startet" };

export function TnTestoktFerdigVisning({ brukerNavn, spillerId, tilgang, tester }: { brukerNavn: string; spillerId: string; tilgang: TnSpillerTilgang; tester: TestoktOppsummering[] }) {
  const fullfort = tester.filter((t) => t.status === "COMPLETED").length;
  return (
    <Skall brukerNavn={brukerNavn} tilgang={tilgang} spillerId={spillerId}>
      <TnSkraTopp bilde="spiller-ved-vannet" lav etikett="Testøkt ferdig" overlinje={`Testøkt · ${tilgang.spillerNavn}`} tittel={`${fullfort} av ${tester.length} tester fullført`} />
      <TnSkraKort lav>
        <TnFlate>
          <TnFlatehode tittel="Resultater" />
          {tester.map((t) => (
            <Link key={t.href} href={t.href} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "4px 12px", alignItems: "center", minHeight: 52, padding: "6px 0", borderTop: `1px solid ${TN.ink100}`, textDecoration: "none", color: TN.ink900 }}>
              <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <b style={{ fontSize: 15, overflowWrap: "anywhere" }}>{t.navn}</b>
                <span style={{ fontSize: 12.5, color: TN.ink500 }}>{STATUS[t.status]}</span>
              </span>
              <b style={{ fontFamily: TN.font.mono, fontWeight: 600, fontSize: 16, color: t.resultat ? TN.navy900 : TN.ink500, whiteSpace: "nowrap" }}>{t.resultat ?? "—"}</b>
            </Link>
          ))}
          <div style={{ marginTop: 14 }}><Link href={`/team-norway/spiller/${spillerId}/tester`} style={knapp}>Ferdig</Link></div>
          <TnFotnote>Lagret i IUP-en og i spillerens PlayerHQ. En test som ikke er ferdig, kan åpnes igjen og fortsette der den stoppet.</TnFotnote>
        </TnFlate>
      </TnSkraKort>
    </Skall>
  );
}

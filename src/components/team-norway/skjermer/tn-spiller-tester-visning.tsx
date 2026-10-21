import Link from "next/link";

import type { TnSpillerOvrigeTester, TnSpillerTestRad, TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { BATTERI_DELER, PRIORITERTE, TESTBATTERI, batteritestFor, fremdrift, type Batteritest } from "@/lib/portal-tester/testbatteri";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnDataTable } from "../tn-data-table";
import { TnFlate, TnFlatehode, TnFotnote } from "../tn-flate";
import { TnShell, TnSeksjon, TnSpillerFaner, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";

/**
 * T4 Resultat per spiller (IUP › Tester) i retning «Skrå» (godkjent av Anders 20.10.2026, canvaset
 * «Team Norway nøkkelskjermer», tavle T4). Alle 19 testene i batteriet i tre deler (Golfslag,
 * Teknikk, Fysisk), fra den felles lista i src/lib/portal-tester/testbatteri.ts.
 * Ren visning: siden henter data. Skjermprøve: tests/visual/team-norway/skjermer/TN-T4.tsx.
 *
 * Regler:
 *   - Varianter av samme test (Driver Basic 220/270 m, Inspill Basic gutter/jenter) teller som én test.
 *     Siste resultat er det nyeste på tvers av variantene; antall er summen.
 *   - Prioriterte tester viser fremdrift som «1 av 2» mot minsteantallet.
 *   - «Bedre» og «svakere» følger testens egen retning. Er retningen ukjent, står det ingen endring.
 *   - Tester utenfor batteriet står i egen del under, så ingen lagrede resultater forsvinner.
 *
 * Avvik:
 *   - Persentil i gruppa og landslagsnivå finnes ikke for én spiller her. Landslagsnivå står som «—».
 */

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });

type Rad = {
  test: Batteritest;
  href: string | null;
  siste: string | null;
  beste: string | null;
  dato: Date | null;
  antall: number;
  endring: "bedre" | "svakere" | "lik" | null;
};

function endring(r: TnSpillerTestRad): Rad["endring"] {
  if (r.sisteScore === null || r.forrigeScore === null || r.lowerIsBetter === null) return null;
  if (r.sisteScore === r.forrigeScore) return "lik";
  const bedre = r.lowerIsBetter ? r.sisteScore < r.forrigeScore : r.sisteScore > r.forrigeScore;
  return bedre ? "bedre" : "svakere";
}

export function byggBatterirader(spillerId: string, tnRader: TnSpillerTestRad[], ovrige: TnSpillerOvrigeTester | null): { rader: Rad[]; utenfor: { navn: string; href: string; siste: string | null }[] } {
  const perTest = new Map<string, TnSpillerTestRad[]>();
  const utenfor: { navn: string; href: string; siste: string | null }[] = [];
  for (const r of tnRader) {
    const b = batteritestFor({ id: r.testId, name: r.protokollNavn });
    if (!b) { utenfor.push({ navn: r.protokollNavn, href: `/team-norway/spiller/${spillerId}/tester/${r.testId}`, siste: r.sisteFormatert }); continue; }
    perTest.set(b.id, [...(perTest.get(b.id) ?? []), r]);
  }
  const ovrigPerTest = new Map<string, { href: string; siste: string | null; dato: string | null }>();
  for (const g of ovrige?.grupper ?? []) {
    for (const row of g.rows) {
      const b = batteritestFor({ id: "", name: row.name });
      if (!b) { utenfor.push({ navn: row.name, href: row.href, siste: row.latest ?? null }); continue; }
      if (!ovrigPerTest.has(b.id)) ovrigPerTest.set(b.id, { href: row.href, siste: row.latest ?? null, dato: row.latestDate ?? null });
    }
  }
  const rader: Rad[] = TESTBATTERI.map((test) => {
    const liste = (perTest.get(test.id) ?? []).sort((a, b) => b.sisteDato.getTime() - a.sisteDato.getTime());
    const nyeste = liste[0];
    if (nyeste) {
      return { test, href: `/team-norway/spiller/${spillerId}/tester/${nyeste.testId}`, siste: nyeste.sisteFormatert, beste: nyeste.besteFormatert, dato: nyeste.sisteDato, antall: liste.reduce((n, r) => n + r.antall, 0), endring: endring(nyeste) };
    }
    const o = ovrigPerTest.get(test.id);
    if (o) return { test, href: o.href, siste: o.siste, beste: null, dato: null, antall: 1, endring: null };
    return { test, href: null, siste: null, beste: null, dato: null, antall: 0, endring: null };
  });
  return { rader, utenfor };
}

const ENDRING: Record<NonNullable<Rad["endring"]>, { tekst: string; farge: string }> = {
  bedre: { tekst: "Bedre", farge: "#076530" },
  svakere: { tekst: "Svakere", farge: "#96241C" },
  lik: { tekst: "Uendret", farge: TN.ink700 },
};

export function TnSpillerTesterVisning({ brukerNavn, spillerId, tilgang, tnRader, ovrige }: { brukerNavn: string; spillerId: string; tilgang: TnSpillerTilgang; tnRader: TnSpillerTestRad[]; ovrige: TnSpillerOvrigeTester | null }) {
  const { rader, utenfor } = byggBatterirader(spillerId, tnRader, ovrige);
  const tatt = rader.filter((r) => r.antall > 0).length;
  const prioritertNaadd = PRIORITERTE.filter((p) => (rader.find((r) => r.test.id === p.id)?.antall ?? 0) >= (p.minst ?? 0)).length;
  const bedre = rader.filter((r) => r.endring === "bedre").length;
  const medEndring = rader.filter((r) => r.endring !== null).length;

  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn} rolle={tnRolleNavn(tilgang.kontekst.rolle)} groupId={tilgang.kontekst.gruppe.id} visTrenerflater={!tilgang.kontekst.erSpiller} kanAdministrere={tilgang.kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett={`Tester for ${tilgang.spillerNavn}`}
        overlinje={`IUP · ${tilgang.spillerNavn} · Tester`}
        tittel="Tester"
        ingress="Testbatteriet: Golfslag, Teknikk og Fysisk. Ett batteri for AK Golf, WANG og Team Norway."
        venstre={
          <>
            <TnHeltTall verdi={prioritertNaadd} enhet={`av ${PRIORITERTE.length}`}>prioriterte tester har nådd minstekravet</TnHeltTall>
            <TnHeltTekst>{tatt ? `${tatt} av ${TESTBATTERI.length} tester er tatt minst én gang.` : "Ingen tester i batteriet er tatt ennå."}</TnHeltTekst>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: tatt, tekst: `av ${TESTBATTERI.length} tatt` }, { verdi: medEndring ? `${bedre} av ${medEndring}` : "—", tekst: "bedre enn sist" }, { verdi: "—", tekst: "landslagsnivå" }]} />}
      />
      <TnSkraKort>
        <TnFlate>
          <TnSpillerFaner spillerId={spillerId} spillerNavn={tilgang.spillerNavn} aktiv="tester" kanAdministrere={!tilgang.kontekst.erSpiller} />
        </TnFlate>

        {BATTERI_DELER.map((del) => (
          <TnFlate key={del} style={{ display: "grid", gap: 4 }}>
            <TnFlatehode tittel={del} merknad={del === "Fysisk" ? "Hver sjette uke i grunnperioden" : `${rader.filter((r) => r.test.del === del && r.antall > 0).length} av ${rader.filter((r) => r.test.del === del).length} tatt`} />
            {rader.filter((r) => r.test.del === del).map((r) => {
              const fr = fremdrift(r.test, r.antall);
              const naadd = r.test.minst != null && r.antall >= r.test.minst;
              const navn = <b style={{ fontSize: 15, color: TN.ink900 }}>{r.test.navn}</b>;
              return (
                <div key={r.test.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "4px 16px", alignItems: "center", minHeight: 56, padding: "8px 0", borderTop: `1px solid ${TN.ink100}` }}>
                  <span style={{ display: "grid", gap: 4, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {r.href ? <Link href={r.href} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>{navn}</Link> : navn}
                      {fr ? <TnPille tone={naadd ? "navy" : "amber"}>{fr}</TnPille> : null}
                    </span>
                    <span style={{ fontSize: 12.5, color: TN.ink500 }}>
                      {r.dato ? `Siste ${dato.format(r.dato)}` : r.antall ? "Fra PlayerHQ" : "Ikke tatt"}
                      {r.beste ? ` · beste ${r.beste}` : ""}
                      {r.endring ? <> · <span style={{ fontWeight: 700, color: ENDRING[r.endring].farge }}>{ENDRING[r.endring].tekst}</span></> : null}
                    </span>
                  </span>
                  <b style={{ fontFamily: TN.font.mono, fontWeight: 600, fontSize: 16, color: r.siste ? TN.navy900 : TN.ink500, textAlign: "right", whiteSpace: "nowrap" }}>{r.siste ?? "—"}</b>
                </div>
              );
            })}
          </TnFlate>
        ))}

        {ovrige && ovrige.planlagt.length > 0 ? (
          <TnSeksjon tittel="Planlagt / åpent" forklaring="Tester spilleren har fått i oppgave, eller allerede har startet på.">
            <TnDataTable
              caption="Planlagt / åpent"
              kolonner={[{ key: "test", label: "Test" }, { key: "status", label: "Status" }, { key: "nar", label: "Når" }]}
              rader={ovrige.planlagt.map((p) => ({
                test: <Link href={p.href} style={{ color: TN.navy900, fontWeight: TN.weight.bold }}>{p.navn}</Link>,
                status: p.status === "PÅGÅR" ? "Pågår" : p.status === "ÅPEN TILDELING" ? "Tildelt" : "Planlagt",
                nar: p.status === "ÅPEN TILDELING" ? (p.frist ? `Frist ${dato.format(p.frist)}` : "Ingen frist") : (p.nar ?? "—"),
              }))}
              empty="Ingen planlagte tester."
            />
          </TnSeksjon>
        ) : null}

        {utenfor.length > 0 ? (
          <TnFlate style={{ display: "grid", gap: 4 }}>
            <TnFlatehode tittel="Utenfor batteriet" merknad="Lagrede resultater beholdes" />
            {utenfor.map((u) => (
              <Link key={u.href + u.navn} href={u.href} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", minHeight: 48, borderTop: `1px solid ${TN.ink100}`, textDecoration: "none", color: TN.ink900 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, overflowWrap: "anywhere" }}>{u.navn}</span>
                <span style={{ fontFamily: TN.font.mono, fontSize: 14, color: TN.ink700, whiteSpace: "nowrap" }}>{u.siste ?? "—"}</span>
              </Link>
            ))}
          </TnFlate>
        ) : null}
        <TnFotnote>En test teller bare når alle slag er ført. Landslagsnivå per klasse er ikke satt av Team Norway ennå.</TnFotnote>
      </TnSkraKort>
    </TnShell>
  );
}

import Link from "next/link";

import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { BATTERI_DELER, type Batteritest } from "@/lib/portal-tester/testbatteri";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote } from "../tn-flate";
import { TnReferanseFaner } from "../tn-referanse-faner";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";

/**
 * TN-18 / T5 Referansenivåer i retning «Skrå» (godkjent av Anders 20.10.2026, canvaset
 * «Team Norway nøkkelskjermer», tavle T5). Alle 19 testene i batteriet (testbatteri.ts) med
 * gruppas median og beste resultat, som er det appen har tall for i dag.
 * Ren visning: tn-referansenivaer-skjerm.tsx henter gruppetallene. Skjermprøve: TN-T5.tsx.
 *
 * Avvik:
 *   - Landslagsnivå per klasse og kjønn står som «— ikke satt» til Team Norway har gitt tallene.
 *   - Nivå for kategori A–K står som «Referanse ikke satt» til tallene er vedtatt.
 *   - Klasse- og kjønnsvalget fra tegningen er ikke med: uten nivåtall er det ingenting å skille på.
 *   - Fysisk har ingen protokoll i katalogen; median og beste vises ikke der ennå.
 */

export type TnReferanseRad = { test: Batteritest; protokollId: string | null; median: string | null; beste: string | null; antall: number };

const KOLONNER = "minmax(0, 1fr) repeat(2, minmax(56px, 100px))";

export function TnReferansenivaerVisning({ brukerNavn, visDataGolf, kontekst, rader }: { brukerNavn: string | null; visDataGolf: boolean; kontekst: TnArbeidskontekst; rader: TnReferanseRad[] }) {
  const medTall = rader.filter((r) => r.median !== null).length;
  return (
    <TnShell aktiv="referansenivaer" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={!kontekst.erSpiller && visDataGolf}>
      <TnSkraTopp
        bilde="putting-green"
        etikett="Referansenivåer"
        overlinje="Plan og fag · testbatteriet 2026"
        tittel="Referansenivåer"
        ingress="Hva som er godt nok, test for test. Gruppas median og beste resultat står ved siden av, til nivåtallene er satt."
        venstre={
          <>
            <TnHeltTall verdi={0} enhet={`av ${rader.length}`}>landslagsnivåer er satt</TnHeltTall>
            <TnHeltTekst>Tallene kommer fra Team Norway. Til de er satt, viser skjermene «—».</TnHeltTekst>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: medTall, tekst: `av ${rader.length} med gruppetall` }, { verdi: "—", tekst: "kategori A–K" }, { verdi: rader.filter((r) => r.test.minst != null).length, tekst: "prioriterte" }]} />}
      />
      <TnSkraKort>
        <TnFlate>
          <TnReferanseFaner aktiv="tester" />
        </TnFlate>
        {BATTERI_DELER.map((del) => (
          <TnFlate key={del} style={{ display: "grid", gap: 4 }}>
            <TnFlatehode tittel={del} merknad={del === "Fysisk" ? "Ingen protokoll i katalogen ennå" : "Median og beste i gruppa"} />
            <div role="table" aria-label={`Referansenivåer, ${del}`}>
              <div role="row" style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 12, padding: "6px 0", fontSize: 12, color: TN.ink500 }}>
                <span role="columnheader">Test</span>
                <span role="columnheader" style={{ textAlign: "right" }}>Median</span>
                <span role="columnheader" style={{ textAlign: "right" }}>Beste</span>
              </div>
              {rader.filter((r) => r.test.del === del).map((r) => {
                const navn = <span style={{ fontSize: 14.5, fontWeight: 700, color: TN.ink900 }}>{r.test.navn}</span>;
                return (
                  <div role="row" key={r.test.id} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 12, alignItems: "center", minHeight: 52, borderTop: `1px solid ${TN.ink100}` }}>
                    <span role="cell" style={{ display: "grid", gap: 2, minWidth: 0, padding: "4px 0" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
                        {r.protokollId ? <Link href={`/team-norway/protokoller/${r.protokollId}`} style={{ minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", textDecoration: "none", overflowWrap: "anywhere" }}>{navn}</Link> : navn}
                        {r.test.minst != null ? <TnPille tone="navy">Prioritert</TnPille> : null}
                      </span>
                      <span style={{ fontSize: 12.5, color: TN.ink500 }}>Landslagsnivå: — ikke satt</span>
                    </span>
                    <span role="cell" style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14, color: r.median ? TN.ink900 : TN.ink500 }}>{r.median ?? "—"}</span>
                    <span role="cell" style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14, fontWeight: 600, color: r.beste ? TN.navy900 : TN.ink500 }}>{r.beste ?? "—"}</span>
                  </div>
                );
              })}
            </div>
          </TnFlate>
        ))}
        <TnFotnote>Median og beste er spillernes beste gyldige resultat per protokoll i {kontekst.gruppe.name}. A–K-nivåtallene er ikke vedtatt, og landslagsnivået må komme fra Team Norway. Ingen tall lages på antakelse.</TnFotnote>
      </TnSkraKort>
    </TnShell>
  );
}

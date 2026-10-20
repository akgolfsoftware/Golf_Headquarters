import Link from "next/link";

import { BATTERI_DELER, type Batteritest } from "@/lib/portal-tester/testbatteri";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote } from "../tn-flate";

/**
 * T1 Testoversikt øverst på Fellestesting (Anders 20.10.2026: én inngang, ingen ny rute). Canvaset
 * «Team Norway nøkkelskjermer», tavle T1. Alle 19 testene i batteriet (testbatteri.ts) i tre deler,
 * med hvor mange i gruppa som har resultat, gruppas median, og hver skole som rute: mørk = alle,
 * lys = noen, strek = ingen. Skoler med færre enn tre spillere står samlet som «Andre skoler»,
 * så ingen mindreårig kan pekes ut av skolen alene.
 */

export type TnTestoversiktRad = {
  test: Batteritest;
  protokollId: string | null;
  medResultat: number;
  median: string | null;
  perSkole: Record<string, "alle" | "noen" | "ingen">;
};

const RUTE = {
  alle: { bak: TN.navy900, tekst: TN.white, ord: "alle" },
  noen: { bak: TN.navy100, tekst: TN.navy900, ord: "noen" },
  ingen: { bak: TN.ink50, tekst: TN.ink500, ord: "ingen" },
} as const;

export function TnTestoversikt({ rader, skoler, spillere }: { rader: TnTestoversiktRad[]; skoler: string[]; spillere: number }) {
  return (
    <TnFlate style={{ display: "grid", gap: 8 }}>
      <TnFlatehode tittel="Testoversikt" merknad={`${rader.length} tester · ${spillere} spillere`} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: 12.5, color: TN.ink700 }}>
        {(Object.keys(RUTE) as (keyof typeof RUTE)[]).map((k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: RUTE[k].bak, boxShadow: `inset 0 0 0 1px ${TN.ink200}` }} />{k === "alle" ? "Alle på skolen har resultat" : k === "noen" ? "Noen" : "Ingen"}</span>
        ))}
      </div>
      {BATTERI_DELER.map((del) => (
        <section key={del} aria-label={del} style={{ display: "grid" }}>
          <h3 style={{ margin: "12px 0 4px", fontSize: 13, fontWeight: 700, color: TN.ink700 }}>{del}{del === "Fysisk" ? " · hver sjette uke i grunnperioden" : ""}</h3>
          {rader.filter((r) => r.test.del === del).map((r) => {
            const navn = <b style={{ fontSize: 14.5, color: TN.ink900 }}>{r.test.navn}</b>;
            return (
              <div key={r.test.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "6px 16px", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${TN.ink100}` }}>
                <span style={{ display: "grid", gap: 6, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {r.protokollId ? <Link href={`/team-norway/protokoller/${r.protokollId}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>{navn}</Link> : navn}
                    {r.test.minst != null ? <TnPille tone="navy">{`Minst ${r.test.minst}×`}</TnPille> : null}
                  </span>
                  {skoler.length > 0 ? (
                    <span role="list" aria-label={`${r.test.navn} per skole`} style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {skoler.map((skole) => {
                        const tilstand = r.perSkole[skole] ?? "ingen";
                        return (
                          <span role="listitem" key={skole} aria-label={`${skole}: ${RUTE[tilstand].ord}`} title={`${skole}: ${RUTE[tilstand].ord}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 6, background: RUTE[tilstand].bak, color: RUTE[tilstand].tekst, fontSize: 11.5, fontWeight: 600 }}>
                            {skole}
                          </span>
                        );
                      })}
                    </span>
                  ) : null}
                </span>
                <span style={{ display: "grid", justifyItems: "end", gap: 2 }}>
                  <b style={{ fontFamily: TN.font.mono, fontWeight: 600, fontSize: 15, color: r.median ? TN.navy900 : TN.ink500 }}>{r.median ?? "—"}</b>
                  <span style={{ fontSize: 11.5, color: TN.ink500, whiteSpace: "nowrap" }}>{r.medResultat} av {spillere} har resultat</span>
                </span>
              </div>
            );
          })}
        </section>
      ))}
      <TnFotnote>Tallet til høyre er gruppas median. En test teller bare når alle slag er ført. WANG-elevenes resultater kommer automatisk når eleven deler. Fysisk har ingen protokoll i katalogen ennå.</TnFotnote>
    </TnFlate>
  );
}

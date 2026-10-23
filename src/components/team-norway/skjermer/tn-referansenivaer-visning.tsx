import Link from "next/link";

import type { TnReferanseTesterData } from "@/lib/domain/tn-arbeidsflate";
import { REFERANSE_MINSTE_ANTALL } from "@/lib/domain/tn-referanse-tester-regler";
import { BATTERI_DELER } from "@/lib/portal-tester/testbatteri";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnMangler, TnRutenett } from "../tn-flate";
import { TnReferanseFaner } from "../tn-referanse-faner";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTellere } from "../tn-stall";

/**
 * Referanse › Tester (wireframes utkast-tn/trenerflate utkast 2, «Tester»; Anders 22.10.2026: «Komplett
 * testoversikt med navn for alle som har delt. Spillere som ikke har delt teller bare i median og antall,
 * uten navn.»). Øverst median og antall per test for hele gruppa, ingen «beste». Under: én rad per spiller
 * som har delt, med siste resultat per test; trykk åpner alle forsøk på testen.
 *
 * Avvik: tabellen spiller × test fra wireframen er ett kort per spiller med testene som rader, så den aldri
 * ruller sidelengs med 19 tester. Klassevalget er ikke med: klasse finnes ikke i spillerdataene.
 */

const KOLONNER = "minmax(0, 1fr) minmax(56px, 100px) minmax(48px, 72px)";
const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });

export function TnReferansenivaerVisning({ brukerNavn, visDataGolf, data }: { brukerNavn: string | null; visDataGolf: boolean; data: TnReferanseTesterData }) {
  const { kontekst, tester, spillere, iGruppa } = data;
  const medMedian = tester.filter((t) => t.median !== null).length;
  const ikkeDelt = Math.max(0, iGruppa - spillere.length);
  return (
    <TnShell aktiv="referansenivaer" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater kanAdministrere={kontekst.kanAdministrere} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="putting-green"
        etikett="Referanse › Tester"
        overlinje="Referanse · testbatteriet"
        tittel="Tester"
        ingress={`Alle testene i ${kontekst.gruppe.name}: median og antall for gruppa, og resultatene til spillerne som har delt med deg.`}
        hoyre={<TnHeltTellere tall={[
          { verdi: medMedian, tekst: `av ${tester.length} tester med median` },
          { verdi: spillere.length, tekst: "spillere har delt" },
          { verdi: ikkeDelt, tekst: "har ikke delt" },
        ]} />}
      />
      <TnSkraKort>
        <TnFlate>
          <TnReferanseFaner aktiv="tester" />
        </TnFlate>

        <TnRutenett min={360}>
          {BATTERI_DELER.map((del) => (
            <TnFlate key={del} style={{ display: "grid", gap: 4, alignContent: "start" }}>
              <TnFlatehode tittel={del} merknad="Median og antall i gruppa" />
              <div role="table" aria-label={`Median og antall, ${del}`}>
                <div role="row" style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 12, padding: "6px 0", fontSize: 12, color: TN.ink500 }}>
                  <span role="columnheader">Test</span>
                  <span role="columnheader" style={{ textAlign: "right" }}>Median</span>
                  <span role="columnheader" style={{ textAlign: "right" }}>Antall</span>
                </div>
                {tester.filter((t) => t.test.del === del).map((t) => (
                  <div role="row" key={t.test.id} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 12, alignItems: "center", minHeight: 48, borderTop: `1px solid ${TN.ink100}` }}>
                    <span role="cell" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0, padding: "4px 0" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: TN.ink900, overflowWrap: "anywhere" }}>{t.test.navn}</span>
                      {t.test.minst != null ? <TnPille tone="navy">Prioritert</TnPille> : null}
                    </span>
                    <span role="cell" style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14, color: t.median ? TN.ink900 : TN.ink500 }}>{t.median ?? "—"}</span>
                    <span role="cell" style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14, color: TN.ink700 }}>{t.antall}</span>
                  </div>
                ))}
              </div>
            </TnFlate>
          ))}
        </TnRutenett>
        <TnFotnote>
          Median av hver spillers siste gyldige resultat siste 12 måneder, for alle aktive spillere i {kontekst.gruppe.name}. Med færre enn {REFERANSE_MINSTE_ANTALL} spillere vises «—». Spillere som ikke har delt, teller bare her, uten navn. WANG-elever står under WANG-tester.
        </TnFotnote>

        <section style={{ display: "grid", gap: 12 }}>
          <TnFlatehode tittel="Spillere som har delt" merknad={`${spillere.length} av ${iGruppa} spillere`} />
          {spillere.length === 0 ? (
            <TnFlate><TnMangler>Ingen spillere har delt med deg ennå. Spillerne deler fra PlayerHQ.</TnMangler></TnFlate>
          ) : (
            <TnRutenett min={320}>
              {spillere.map((s) => {
                const tatt = tester.filter((t) => s.celler[t.test.id]);
                return (
                  <TnFlate key={s.spillerId} style={{ display: "grid", gap: 4, alignContent: "start" }}>
                    <TnFlatehode tittel={s.navn} merknad={`${tatt.length} av ${tester.length} tester`}>
                      <Link href={`/team-norway/spiller/${s.spillerId}/tester`} style={{ fontSize: 14, fontWeight: 700, color: TN.navy600, minHeight: 44, display: "inline-flex", alignItems: "center" }}>IUP › Tester</Link>
                    </TnFlatehode>
                    {tatt.length === 0 ? <TnMangler>Ingen tester i batteriet ennå.</TnMangler> : null}
                    {tatt.map((t) => {
                      const c = s.celler[t.test.id]!;
                      return (
                        <Link key={t.test.id} href={`/team-norway/spiller/${s.spillerId}/tester/${c.testId}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "center", minHeight: 48, borderTop: `1px solid ${TN.ink100}`, color: "inherit", textDecoration: "none" }}>
                          <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 700, color: TN.ink900, overflowWrap: "anywhere" }}>{t.test.navn}</span>
                            <span style={{ fontSize: 12.5, color: TN.ink500 }}>{dato.format(c.dato)} · {c.antall} forsøk</span>
                          </span>
                          <span style={{ fontFamily: TN.font.mono, fontSize: 15, fontWeight: 500, color: TN.navy900, whiteSpace: "nowrap" }}>{c.formatert}</span>
                        </Link>
                      );
                    })}
                  </TnFlate>
                );
              })}
            </TnRutenett>
          )}
        </section>
      </TnSkraKort>
    </TnShell>
  );
}

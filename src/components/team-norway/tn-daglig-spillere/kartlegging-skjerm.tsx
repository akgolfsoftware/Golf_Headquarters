import Link from "next/link";

import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { hentTnRangliste, hentTnSpillere } from "@/lib/domain/tn-arbeidsflate";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";
import { tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { TN } from "@/lib/v2/team-norway";
import { SkjermRamme, datoKort, osloDag } from "../skjermer/felles";
import { TnFlate, TnFlatehode, TnMangler, TnSkjermhode } from "../tn-flate";
import { TN_RUTER, tnSpillerHref } from "../tn-ruter";
import { hentTestmatrise } from "./data";
import { halvarNavn, iPerioden, lesPeriode, periodeStart, sorterElever, type KartleggingElev } from "./kartlegging";
import { Infoboks, KpiRad, Nedtrekk, Resultatbrikke, Sendknapp, TomTilstand, mono } from "./ui";

/**
 * Kartlegging (tegningens «kartlegging», ingen TN-kode). Fasit: «Team Norway
 * App.dc.html», kaOn-blokken: infoboks, fire filtre, nøkkeltall, «Levert per
 * skole» og resultatlisten.
 *
 * Avvik:
 *   - WANG-elevenes resultater deles ikke med Team Norway: det finnes ingen
 *     delingsavtale eller samtykke for det i systemet, og elevene er mindreårige.
 *     Listen viser derfor bare spillerne i Team Norway-gruppen, med skole og
 *     klasse fra profilen. Infoboksen sier det.
 *   - Testene er protokollkatalogen i koden (klare protokoller), ikke tegningens liste.
 *   - Periodene er inneværende halvår, i år, siste 12 måneder og alle. Tidligere
 *     halvår kan ikke velges, fordi spilleroversikten bare har siste resultat per
 *     protokoll.
 *   - Filtrene er et vanlig skjema med valget i adressen, så de virker uten JavaScript.
 */

type Sok = { skole?: string; klasse?: string; test?: string; periode?: string };

const UTEN_SKOLE = "Skole ikke registrert";

export async function KartleggingSkjerm({ sok }: { sok: Sok }) {
  const { bruker, kontekst } = await krevTnTrenerflate();
  const naa = new Date();
  const { aar, maned } = osloDag(naa);
  const spillerside = await hentTnSpillere(bruker);
  const spillere = spillerside?.rader ?? [];
  const [matrise, rangliste] = await Promise.all([hentTestmatrise(bruker, spillere.map((s) => s.id)), hentTnRangliste(bruker, aar)]);
  const brutto = new Map((rangliste?.rader ?? []).map((r) => [r.id, r.bruttoSnitt]));

  const klare = TN_CATALOG.filter((p) => !p.blocked).map((p) => ({ id: tnDefinitionId(p), navn: p.name }));
  const navnPerTest = new Map(klare.map((k) => [k.id, k.navn]));

  const elever: KartleggingElev[] = spillere.map((s) => ({
    id: s.id,
    navn: s.navn,
    skole: s.skole,
    klasse: s.skolear,
    resultater: (matrise.get(s.id) ?? []).filter((r) => r.antall > 0).map((r) => ({ testId: r.testId, dato: r.sisteDato, score: r.sisteScore, formatert: r.sisteFormatert, lavereErBedre: r.lowerIsBetter })),
  }));

  const skoler = [...new Set(elever.map((e) => e.skole ?? UTEN_SKOLE))].sort((a, b) => a.localeCompare(b, "nb"));
  const klasser = [...new Set(elever.map((e) => e.klasse).filter((k): k is string => !!k))].sort((a, b) => a.localeCompare(b, "nb"));

  const skole = sok.skole && skoler.includes(sok.skole) ? sok.skole : "alle";
  const klasse = sok.klasse && klasser.includes(sok.klasse) ? sok.klasse : "alle";
  const testId = sok.test && navnPerTest.has(sok.test) ? sok.test : null;
  const periode = lesPeriode(sok.periode);
  const fra = periodeStart(periode, aar, maned, naa);
  const periodeNavn = { halvar: halvarNavn(aar, maned), aar: `I år (${aar})`, "12mnd": "Siste 12 måneder", alle: "Alle" }[periode];

  const iKlasse = elever.filter((e) => klasse === "alle" || e.klasse === klasse);
  const filtrert = iKlasse.filter((e) => skole === "alle" || (e.skole ?? UTEN_SKOLE) === skole);
  const harLevert = (e: KartleggingElev) => iPerioden(e, fra, testId).length > 0;
  const levert = filtrert.filter(harLevert).length;
  const antallResultater = filtrert.reduce((sum, e) => sum + iPerioden(e, fra, testId).length, 0);
  const sortert = sorterElever(filtrert, fra, testId);

  const perSkole = skoler
    .map((navn) => {
      const liste = iKlasse.filter((e) => (e.skole ?? UTEN_SKOLE) === navn);
      return { navn, antall: liste.length, levert: liste.filter(harLevert).length };
    })
    .filter((r) => r.antall > 0);

  return (
    <SkjermRamme aktiv="kartlegging" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute={TN_RUTER.kartlegging} tittel="Kartlegging" ingress="Testdata for spillerne: hvem som har levert, og alle resultater. Filtrer på skole, klasse, test og periode." />

      <Infoboks>
        Testresultatene til WANG-elevene deles ikke med Team Norway ennå. Det finnes ingen delingsavtale i systemet, så listen viser bare spillerne i {kontekst.gruppe.name}, med skole og klasse fra profilen.
      </Infoboks>

      <form method="get" action={TN_RUTER.kartlegging} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 14, alignItems: "end" }}>
        <Nedtrekk navn="skole" etikett="Skole" verdi={skole} valg={[{ verdi: "alle", tekst: "Alle skoler" }, ...skoler.map((s) => ({ verdi: s, tekst: s }))]} />
        <Nedtrekk navn="klasse" etikett="Klasse" verdi={klasse} valg={[{ verdi: "alle", tekst: "Alle klasser" }, ...klasser.map((k) => ({ verdi: k, tekst: k }))]} />
        <Nedtrekk navn="test" etikett="Test" verdi={testId ?? "alle"} valg={[{ verdi: "alle", tekst: "Alle tester" }, ...klare.map((k) => ({ verdi: k.id, tekst: k.navn }))]} />
        <Nedtrekk navn="periode" etikett="Periode" verdi={periode} valg={[{ verdi: "halvar", tekst: halvarNavn(aar, maned) }, { verdi: "aar", tekst: `I år (${aar})` }, { verdi: "12mnd", tekst: "Siste 12 måneder" }, { verdi: "alle", tekst: "Alle" }]} />
        <Sendknapp>Vis</Sendknapp>
      </form>

      <KpiRad tall={[
        { verdi: String(filtrert.length), etikett: "Spillere" },
        { verdi: String(levert), etikett: "Har levert" },
        { verdi: String(filtrert.length - levert), etikett: "Ikke levert", farge: periode === "halvar" && filtrert.length - levert > 0 ? TN.red600 : undefined },
        { verdi: String(antallResultater), etikett: "Resultater" },
      ]} />

      {elever.length === 0 ? (
        <TnFlate>
          <TomTilstand tittel="Ingen testdata ennå">Ingen spillere i gruppen har levert tester. Resultatene vises her når første testdag er ført.</TomTilstand>
          <Link href={TN_RUTER.test} style={{ color: TN.navy900, minHeight: 44, display: "inline-flex", alignItems: "center" }}>Se fellestesting</Link>
        </TnFlate>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <TnFlate style={{ flex: "1 1 300px" }}>
            <TnFlatehode tittel="Levert per skole" merknad={periodeNavn.toUpperCase()} />
            {perSkole.map((r) => (
              <div key={r.navn} style={{ padding: "12px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, minWidth: 0, overflowWrap: "anywhere" }}>{r.navn}</span>
                  <span style={{ ...mono(12.5), whiteSpace: "nowrap" }}>{r.levert} / {r.antall}</span>
                </div>
                <div style={{ height: 6, background: TN.navy100, borderRadius: TN.radius.sm, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${r.antall ? (r.levert / r.antall) * 100 : 0}%`, height: "100%", background: TN.navy900 }} />
                </div>
              </div>
            ))}
            {perSkole.length === 0 ? <TnMangler>Ingen spillere passer klassefilteret.</TnMangler> : null}
          </TnFlate>

          <TnFlate style={{ flex: "999 1 560px" }}>
            <TnFlatehode tittel={`${testId ? navnPerTest.get(testId) : "Alle tester"} · ${periodeNavn}`} merknad={testId ? "SORTERT ETTER RESULTAT" : "SORTERT ETTER NAVN"} />
            {sortert.map((e, i) => {
              const res = iPerioden(e, fra, testId);
              const har = res.length > 0;
              const b = brutto.get(e.id) ?? null;
              return (
                <div key={e.id} style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", padding: "13px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "flex-start" }}>
                  <span style={{ ...mono(12, TN.textSecondary), width: 24, flex: "none", paddingTop: 2 }}>{har ? (testId ? String(i + 1) : "") : "—"}</span>
                  <Link href={`${tnSpillerHref(e.id)}?fane=test`} style={{ flex: "1 1 200px", minWidth: 0, color: har ? TN.ink900 : TN.textSecondary, textDecoration: "none" }}>
                    <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{e.navn}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>
                      {e.skole ?? UTEN_SKOLE} · {e.klasse ?? "—"} · {har ? `siste ${datoKort(res[0].dato)}` : "ikke levert"} · AK {b !== null ? kategoriFraSnittscore(b).kategori : "—"}
                    </span>
                  </Link>
                  <div style={{ flex: "2 1 300px", minWidth: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {har
                      ? res.map((r) => <Resultatbrikke key={r.testId} kort={testId ? "" : navnPerTest.get(r.testId) ?? ""} verdi={r.formatert ?? "—"} />)
                      : <Resultatbrikke kort="" verdi="Ikke levert" />}
                  </div>
                </div>
              );
            })}
            {sortert.length === 0 ? <TnMangler>Ingen spillere passer filteret.</TnMangler> : null}
          </TnFlate>
        </div>
      )}
    </SkjermRamme>
  );
}

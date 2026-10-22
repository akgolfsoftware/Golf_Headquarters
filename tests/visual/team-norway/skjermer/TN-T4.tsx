/** Prøvefil for T4 Resultat per spiller (IUP › Tester) og Referanse › Tester (utkast 2). Syntetiske data. */
import { TnReferansenivaerVisning } from "@/components/team-norway/skjermer/tn-referansenivaer-visning";
import { TnSpillerTesterVisning } from "@/components/team-norway/skjermer/tn-spiller-tester-visning";
import type { TnArbeidskontekst, TnReferanseTesterData, TnSpillerOvrigeTester, TnSpillerTestRad, TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TESTBATTERI } from "@/lib/portal-tester/testbatteri";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnDefinitionId } from "@/lib/portal-tester/tn-integration";

export const sti = "/team-norway/spiller/b/tester";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const tilgang: TnSpillerTilgang = { kontekst, spillerId: "b", spillerNavn: "Jørn Johnsen" };
const d = (m: number, dag: number) => new Date(Date.UTC(2026, m - 1, dag, 9));

const rad = (protokoll: string, navn: string, antall: number, siste: number, forrige: number | null, beste: number, tekst: (v: number) => string, lavere: boolean, dato: Date): TnSpillerTestRad => ({
  testId: tnDefinitionId(tnProtocol(protokoll)!), protokollNavn: navn, antall, antallUtelatt: 0, sisteScore: siste, sisteEnhet: "x", sisteFormatert: tekst(siste), sisteDato: dato,
  forrigeScore: forrige, besteScore: beste, besteFormatert: tekst(beste), lowerIsBetter: lavere, sisteTestdagDeltakerId: null,
});
const pei = (v: number) => `${String(Math.round(v * 1000) / 10).replace(".", ",")} %`;
const poeng = (v: number) => `${v} / 36 p`;
const tnRader: TnSpillerTestRad[] = [
  rad("driver-270", "Driver basic · 270 m", 2, 0.052, 0.058, 0.049, pei, true, d(10, 19)),
  rad("inspill-gutter-145", "Innspill Basis · gutter 145 m", 1, 0.046, 0.049, 0.046, pei, true, d(10, 19)),
  rad("wedge-variation", "Wedge Variation", 2, 0.061, 0.057, 0.055, pei, true, d(10, 12)),
  rad("8-ball-variation", "8-ball variation", 2, 0.058, 0.064, 0.058, pei, true, d(10, 12)),
  rad("putt-1-3m", "Putt 1–3 m", 3, 29, 31, 28, (v) => `${v} slag`, true, d(10, 2)),
  rad("wedge-gate", "Wedge Gate", 2, 31, 27, 31, poeng, false, d(10, 19)),
  rad("naerspill-gate", "Nærspill Gate", 1, 24, null, 24, poeng, false, d(9, 28)),
  rad("pei-test-bane", "PEI Test Bane", 1, 0.071, null, 0.071, pei, true, d(9, 14)),
];
const ovrige = {
  tilgang,
  grupper: [{ axis: "FYS", label: "Fysisk", done: 2, total: 5, rows: [
    { name: "Club Speed", href: "/team-norway/spiller/b/tester/cs", latest: "112 mph", latestDate: "1. okt." },
    { name: "Benkpress", href: "/team-norway/spiller/b/tester/bp", latest: "82 kg", latestDate: "1. okt." },
  ] }],
  planlagt: [],
} as unknown as TnSpillerOvrigeTester;

const MEDIANER = ["6,8 %", "5,9 %", "7,4 %", "6,2 %", "31 slag", "9,6 m", "8,1 %", null, "4 / 6 OK", "27 / 36 p", "7 / 10 OK", "24 / 36 p", "22 / 36 p", "38 cm"];
const referanse: TnReferanseTesterData = {
  kontekst,
  iGruppa: 14,
  tester: TESTBATTERI.map((test, i) => ({ test, antall: test.del === "Fysisk" ? 0 : i === 7 ? 3 : 12, median: test.del === "Fysisk" ? null : MEDIANER[i] ?? null })),
  spillere: [
    { spillerId: "b", navn: "Jørn Johnsen", celler: { "driver-basic": { testId: "tn-v3-driver-220", formatert: "5,2 %", dato: new Date(Date.UTC(2026, 8, 14)), antall: 2 }, "wedge-gate": { testId: "tn-v3-wedge-gate", formatert: "29 / 36 p", dato: new Date(Date.UTC(2026, 8, 14)), antall: 3 } } },
    { spillerId: "c", navn: "Spiller med et ganske langt navn", celler: {} },
  ],
};

export const tilstander = {
  tester: <TnSpillerTesterVisning brukerNavn="Trener 1" spillerId="b" tilgang={tilgang} tnRader={tnRader} ovrige={ovrige} />,
  "tester-tom": <TnSpillerTesterVisning brukerNavn="Trener 1" spillerId="b" tilgang={tilgang} tnRader={[]} ovrige={null} />,
  referanse: <TnReferansenivaerVisning brukerNavn="Trener 1" visDataGolf={false} data={referanse} />,
  "referanse-ingen-delt": <TnReferansenivaerVisning brukerNavn="Trener 1" visDataGolf={false} data={{ ...referanse, spillere: [] }} />,
};

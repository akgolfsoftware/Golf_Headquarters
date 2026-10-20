/** Prøvefil for PH-14 Tester og én test (pakke 6). Syntetiske data: Testspiller, i dag 5. oktober 2026. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14Tester } from "@/components/portal/precision/PH14Tester";
import { PH14Test, type PH14TestData } from "@/components/portal/precision/PH14Test";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { byggBatteri } from "@/lib/portal-tester/ph14-batteri-data";
import type { TestRow } from "@/lib/portal-tester/tester-data";

export const sti = "/portal/tren/tester";

function rad(id: string, name: string, axis: TestRow["axis"], history: number[], vis: string | null, o: Partial<TestRow> = {}): TestRow {
  const n = history.length;
  const lower = o.lowerIsBetter ?? false;
  const d = n > 1 ? history[n - 1]! - history[n - 2]! : null;
  return {
    id, name, axis, rule: "", latest: vis, latestRaw: n ? history[n - 1]! : null, latestDate: null,
    delta: d == null ? null : { text: String(d), tone: d === 0 ? "flat" : (lower ? d < 0 : d > 0) ? "pos" : "neg" },
    attempts: n, history, lowerIsBetter: lower,
    verdict: d == null ? (n ? "signal" : "new") : d === 0 ? "hold" : (lower ? d < 0 : d > 0) ? "gain" : "drop",
    href: `/portal/tren/tester/${id}`, hubGruppe: "andre", scoringKind: "fallback", shotsCount: 0, forfallDato: null,
    latestAt: o.latestAt ?? (n ? "2026-09-28T10:00:00Z" : null), latestKontrollert: n ? (o.latestKontrollert ?? false) : null, forfallAt: null, ...o,
  };
}
const RADER: TestRow[] = [
  rad("tn-v3-8-ball-variation", "8-balls variation", "slag", [52, 55, 58, 61], "61 poeng", { latestKontrollert: true }),
  rad("ib", "Innspill Basis · gutter 145 m", "slag", [], null),
  rad("wv", "Wedge Variation", "slag", [], null),
  rad("wg", "Wedge Gate", "tek", [4], "4 / 9 godkjent", { latestAt: "2026-08-24T10:00:00Z" }),
  rad("ng", "Nærspill Gate", "tek", [5, 6], "6 / 9 godkjent", { latestAt: "2026-08-24T10:00:00Z", forfallAt: "2026-10-19T10:00:00Z" }),
  rad("dg", "Driver Gate", "tek", [4, 4], "4 / 6 godkjent", { latestKontrollert: true }),
  rad("9h", "9 hull lengde", "spill", [], null),
  rad("18", "18 hull", "spill", [], null),
  rad("cs", "Club Speed", "fys", [104.1, 105.2, 106.6, 106.3, 108.4], "108,4 mph", { latestKontrollert: true, latestAt: "2026-09-28T10:00:00Z" }),
  rad("ml", "Markløft trapbar", "fys", [130, 140], "140 kg", { latestAt: "2026-09-21T10:00:00Z" }),
  rad("lh", "Lengdehopp", "fys", [2.42, 2.48], "2,48 m", { latestKontrollert: true, latestAt: "2026-09-21T10:00:00Z" }),
  rad("rk", "Rotasjonskast", "fys", [11.2], "11,2 m", { latestAt: "2026-09-21T10:00:00Z" }),
];

const TEST: PH14TestData = {
  navn: "8-ball blocked", akse: "slag", omraade: "Golfslag",
  maalinger: [
    { id: "a", dato: "8. juni", verdi: 52, vis: "52 poeng", fortAv: null },
    { id: "b", dato: "13. juli", verdi: 55, vis: "55 poeng", fortAv: "Anders Kristiansen" },
    { id: "c", dato: "24. aug.", verdi: 58, vis: "58 poeng", fortAv: null },
    { id: "d", dato: "28. sep.", verdi: 61, vis: "61 poeng", fortAv: "Anders Kristiansen" },
  ],
  lavereErBedre: false, endring: "+3 poeng mot forrige", snitt: "56,5 poeng", beste: "61 poeng",
  regel: "tn-excel-v3-2026-10-14", beskrivelse: "Team Norway · 24 forsøk · Scorekort GolfslagTester!K4:S35",
  protokoll: [],
  perSlagtype: [{ navn: "Chip", vis: "4,6 %" }, { navn: "Wedge", vis: "5,2 %" }, { navn: "Lobb", vis: "6,4 %" }, { navn: "Bunker", vis: "10,1 %" }],
  sisteForsok: [], sperret: null, startHref: "/portal/tren/tester/team-norway?test=8-ball-blocked", lagret: false, talentHref: null,
  forslag: [{ id: "o1", navn: "Bunker fra 20 m", beskrivelse: "Ti slag til hver av tre flagg.", begrunnelse: "Bunker har høyest PEI i testen.", kanLeggesTil: true }],
};
const GATE: PH14TestData = {
  ...TEST, navn: "Teknikk gate (egen)", akse: "tek", omraade: "Teknikk", perSlagtype: [], lagret: true, talentHref: "/portal/talent",
  maalinger: [{ id: "g1", dato: "24. aug.", verdi: 5, vis: "5 av 9", fortAv: null }, { id: "g2", dato: "28. sep.", verdi: 6, vis: "6 av 9", fortAv: null }],
  endring: "+1 mot forrige", snitt: "5,5 av 9", beste: "6 av 9", regel: "Antall OK av 9 · mål 6 av 9",
  protokoll: [{ label: "Wedge 40 m", antall: 3, maal: "40" }, { label: "Wedge 50 m", antall: 3, maal: "50" }, { label: "Wedge 60 m", antall: 3, maal: "60" }],
  sisteForsok: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((nr) => ({ nr, ok: nr % 3 !== 0, side: nr % 3 === 0 ? "H" as const : null })),
  startHref: "/portal/tren/tester/x/gjennomfor", forslag: [],
};

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  tester: skall(<PH14Tester data={byggBatteri(RADER)} />),
  "tester-tom": skall(<PH14Tester data={byggBatteri([])} />),
  "tester-laster": skall(<TmLaster tekst="Henter testene" />),
  "tester-feil": skall(<SdFeil tittel="Testene kunne ikke hentes" tekst="Resultatene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
  test: skall(<PH14Test data={TEST} />),
  "test-gate-lagret": skall(<PH14Test data={GATE} />),
  "test-tom": skall(<PH14Test data={{ ...TEST, maalinger: [], perSlagtype: [], endring: null, snitt: null, beste: null, forslag: [] }} />),
};

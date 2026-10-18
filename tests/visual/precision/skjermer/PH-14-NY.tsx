/** Prøvefil for Tester › Ny test (pakke 13, Stats resten). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14NyTest } from "@/components/portal/precision/PH14NyTest";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { byggNyTestValg, type NyTestDefInn } from "@/lib/portal-tester/ny-test-data";

export const sti = "/portal/tren/tester/ny";

const d = (id: string, name: string, pyramidArea: NyTestDefInn["pyramidArea"], scoringRule: string, unit: string, isCustom = false): NyTestDefInn => ({
  id, name, description: null, pyramidArea, scoringRule, protocol: { unit }, isCustom,
});
const defs: NyTestDefInn[] = [
  d("chs", "Clubhead Speed (CHS)", "FYS", "Maks klubbhodehastighet (mph)", "mph"),
  d("trap", "Trapbar Deadlift", "FYS", "Maks vekt (kg)", "kg"),
  d("benk", "Benkpress", "FYS", "Maks vekt (kg)", "kg"),
  d("slj", "Standing Long Jump", "FYS", "Beste hopp (cm)", "cm"),
  d("ball", "Ball Throw", "FYS", "Beste kast (cm)", "cm"),
  d("8b", "8-ball Variation", "SLAG", "Sum poeng 0-4 per slag (maks 96)", "poeng"),
  d("wg", "TN Wedge Gate", "TEK", "Poeng for treff i riktig launch + carry-sone", "poeng"),
  d("ng", "TN Nærspill Gate", "TEK", "Poeng for treff i carry-sone", "poeng"),
  d("pei", "PEI Test Bane", "TURN", "Snitt PEI over 18 hull", "PEI"),
  { ...d("egen", "Bunker til 3 m", "SLAG", "Antall, høyest er best", ""), description: "10 bunkerslag fra greenside-bunkeren", isCustom: true, protocol: { malverdi: { enhet: "antall" }, retning: "hoyest" } },
];
const r = (testId: string, score: number, dato: string) => ({ testId, score, takenAt: new Date(`${dato}T10:00:00Z`) });
const tester = byggNyTestValg(defs, [r("chs", 104.2, "2026-08-10"), r("chs", 106.5, "2026-09-28"), r("trap", 140, "2026-09-21"), r("slj", 248, "2026-09-21"), r("ball", 1120, "2026-09-21")]);

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
const valgt = { testId: "chs", dato: "2026-10-05", sted: "Performance Studio" };
export const tilstander = {
  data: skall(<PH14NyTest tester={tester} coachNavn="Anders" startUtkast={{ testId: "chs" }} />),
  steg2: skall(<PH14NyTest tester={tester} coachNavn="Anders" startSteg={2} startUtkast={{ ...valgt, trener: true }} />),
  steg3: skall(<PH14NyTest tester={tester} coachNavn="Anders" startSteg={3} startUtkast={{ ...valgt, resultat: "108,4" }} />),
  steg4: skall(<PH14NyTest tester={tester} coachNavn="Anders" startSteg={4} startUtkast={{ ...valgt, resultat: "108.4", utstyr: "Driver, TrackMan" }} />),
  "steg4-forste": skall(<PH14NyTest tester={tester} coachNavn={null} startSteg={4} startUtkast={{ ...valgt, testId: "benk", resultat: "82,5" }} />),
  tom: skall(<PH14NyTest tester={[]} coachNavn={null} />),
  laster: skall(<TmLaster tekst="Henter testbatteriet" />),
  feil: skall(<SdFeil tittel="Testbatteriet kunne ikke hentes" tekst="Resultatene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
};

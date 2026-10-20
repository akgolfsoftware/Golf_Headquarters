/**
 * Testbatteriet: Team Norways 14 tester pluss Fysisk, én felles liste for alle flater
 * (beslutninger.md §TESTBATTERIET ER TEAM NORWAYS 14 TESTER PLUSS FYSISK, Anders 20.10.2026).
 *
 * Tre deler i fast rekkefølge: Golfslag 8 · Teknikk 6 · Fysisk 5. Fem prioriterte tester har
 * minsteantall og vises som «1 av 2». Katalogen har varianter per lengde og kjønn (Driver
 * basic 220/270 m, Innspill Basis gutter/jenter); de teller som samme test her. Tester utenfor
 * batteriet (PEI-variantene, 8-ball blocked, Standard sving) står fortsatt i katalogen og
 * lagrede resultater slettes ikke — de vises bare ikke i batterioversikten.
 *
 * Ren modul: ingen Prisma, ingen React.
 */
import { tnFromDefinitionId } from "./tn-integration";

export type BatteriDel = "Golfslag" | "Teknikk" | "Fysisk";

export type Batteritest = {
  id: string;
  navn: string;
  del: BatteriDel;
  /** Minsteantall for de fem prioriterte testene. null = ikke prioritert. */
  minst: number | null;
  /** TN-protokoller som teller som denne testen (alle regelversjoner). */
  protokoller: readonly string[];
  /** Testdefinisjonsnavn (utenfor TN-katalogen) som teller som denne testen, normalisert. */
  navnTreff: readonly string[];
};

export const BATTERI_DELER: readonly BatteriDel[] = ["Golfslag", "Teknikk", "Fysisk"];

export const TESTBATTERI: readonly Batteritest[] = [
  { id: "driver-basic", navn: "Driver Basic", del: "Golfslag", minst: 1, protokoller: ["driver-220", "driver-270"], navnTreff: ["driver basic"] },
  { id: "inspill-basic", navn: "Inspill Basic", del: "Golfslag", minst: 2, protokoller: ["inspill-gutter-145", "inspill-gutter-160", "inspill-jenter-125", "inspill-jenter-145"], navnTreff: ["inspill basis", "inspill basic", "innspill basis", "innspill basic"] },
  { id: "wedge-variation", navn: "Wedge Variation", del: "Golfslag", minst: 2, protokoller: ["wedge-variation"], navnTreff: ["wedge variation"] },
  { id: "8-ball-variation", navn: "8-balls variation", del: "Golfslag", minst: 2, protokoller: ["8-ball-variation"], navnTreff: ["8-ball variation", "8-balls variation"] },
  { id: "putt-1-3m", navn: "Putt 1–3 m", del: "Golfslag", minst: 4, protokoller: ["putt-1-3m"], navnTreff: ["putt 1-3m", "putt 1-3 m"] },
  { id: "golfslag-bane", navn: "Golfslag på banen", del: "Golfslag", minst: null, protokoller: ["golfslag-bane-gutter", "golfslag-bane-jenter", "golfslag-bane-egen"], navnTreff: ["golfslag pa banen"] },
  { id: "18-hull-inspill", navn: "18 hulls inspill", del: "Golfslag", minst: null, protokoller: ["18-hull-gutter", "18-hull-jenter"], navnTreff: ["18 hulls inspill"] },
  { id: "9-hull-lengde", navn: "9 hull lengde", del: "Golfslag", minst: null, protokoller: ["9-hull-lengde"], navnTreff: ["9 hull lengde"] },
  { id: "driver-gate", navn: "Driver Gate", del: "Teknikk", minst: null, protokoller: ["driver-gate"], navnTreff: ["driver gate"] },
  { id: "wedge-gate", navn: "Wedge Gate", del: "Teknikk", minst: null, protokoller: ["wedge-gate"], navnTreff: ["wedge gate"] },
  { id: "putt-gate", navn: "Putt Gate", del: "Teknikk", minst: null, protokoller: ["putt-gate"], navnTreff: ["tn putt gate", "putt gate"] },
  { id: "naerspill-gate", navn: "Nærspill Gate", del: "Teknikk", minst: null, protokoller: ["naerspill-gate"], navnTreff: ["tn naerspill gate", "naerspill gate"] },
  { id: "visa-express", navn: "VISA Express", del: "Teknikk", minst: null, protokoller: ["visa-express"], navnTreff: ["tn visa express", "visa express"] },
  { id: "putt-speed-1x5", navn: "Putt Speed 1 × 5", del: "Teknikk", minst: null, protokoller: ["putt-speed-1x5"], navnTreff: ["putt speed 1x5", "putt speed 1 x 5"] },
  { id: "benkpress", navn: "Benkpress", del: "Fysisk", minst: null, protokoller: [], navnTreff: ["benkpress"] },
  { id: "markloft-trapbar", navn: "Markløft trapbar", del: "Fysisk", minst: null, protokoller: [], navnTreff: ["markloft trapbar", "trapbar deadlift", "trapbar markloft"] },
  { id: "lengdehopp", navn: "Lengdehopp", del: "Fysisk", minst: null, protokoller: [], navnTreff: ["lengdehopp", "standing long jump", "stille lengde"] },
  { id: "rotasjonskast", navn: "Rotasjonskast", del: "Fysisk", minst: null, protokoller: [], navnTreff: ["rotasjonskast", "ball throw", "ballkast"] },
  { id: "club-speed", navn: "Club Speed", del: "Fysisk", minst: null, protokoller: [], navnTreff: ["club speed", "clubhead speed (chs)", "chs"] },
];

/** De fem prioriterte testene med minsteantall, i batteriets rekkefølge. */
export const PRIORITERTE: readonly Batteritest[] = TESTBATTERI.filter((t) => t.minst != null);

/** Små bokstaver, uten aksenter og med æ/ø/å som ae/o/a, så «Nærspill» og «Naerspill» treffer likt. */
function normaliser(s: string): string {
  return s.toLocaleLowerCase("nb-NO").replace(/[–—]/g, "-").replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a").replace(/\s+/g, " ").trim();
}

/**
 * Batteritesten en lagret test hører til, eller null når den er utenfor batteriet.
 * TN-tester kjennes på definisjons-ID-en (`tn-v3-…`), andre på navnet.
 */
export function batteritestFor(testDefinisjon: { id: string; name: string }): Batteritest | null {
  const tn = tnFromDefinitionId(testDefinisjon.id);
  if (tn) return TESTBATTERI.find((t) => t.protokoller.includes(tn.id)) ?? null;
  const n = normaliser(testDefinisjon.name);
  return TESTBATTERI.find((t) => t.navnTreff.includes(n)) ?? null;
}

/** «1 av 2» for prioriterte tester. null for tester uten minsteantall. */
export function fremdrift(test: Batteritest, antallTatt: number): string | null {
  return test.minst == null ? null : `${Math.min(antallTatt, test.minst)} av ${test.minst}`;
}

/** PEI-målte tester i Golfslag-delen (resultat i PEI %). */
const PEI_I_BATTERIET = new Set(["driver-basic", "inspill-basic", "wedge-variation", "8-ball-variation"]);

/**
 * Kan en trener eller coach føre denne testen? Bare Teknikk og PEI-tester (Anders 20.10.2026):
 * Teknikk-delen, de PEI-målte golfslagtestene og PEI-protokollene utenfor batteriet (`pei-…`).
 * Resten (bl.a. Putt 1–3 m, 9 hull lengde og Fysisk) fører spilleren selv i PlayerHQ.
 */
export function trenerKanFore(test: { batteriId?: string | null; protokollId?: string | null }): boolean {
  if (test.protokollId?.startsWith("pei-")) return true;
  const b = test.batteriId
    ? TESTBATTERI.find((t) => t.id === test.batteriId)
    : test.protokollId ? TESTBATTERI.find((t) => t.protokoller.includes(test.protokollId!)) : undefined;
  if (!b) return false;
  return b.del === "Teknikk" || PEI_I_BATTERIET.has(b.id);
}

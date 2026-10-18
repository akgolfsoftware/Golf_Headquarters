/**
 * Regler for oppstart (AU-04), rene funksjoner uten database.
 * Fasit: Claude Design 7d7c2994, ui_kits/konto/screens/AU-04-spiller.jsx,
 * ui_kits/_shared/data-fas.js og guidelines/ordmaster.md (19 treningsområder).
 */

/* ---------- Steg ---------- */

/** Rekkefølgen i utkast-flater/innlogging.html (utkast 1, 15.10.2026). */
export const OPPSTART_STEG = [
  "Om deg",
  "Strokes Gained",
  "Hva har du tilgang til?",
  "Finn deg i turneringsresultatene",
  "Teknikktest",
  "Samtykker",
  "Velg treningsplan",
] as const;

/** Stegene som kan hoppes over eller fullføres senere. */
export const VALGFRIE_STEG: ReadonlySet<number> = new Set([2, 3, 4, 5]);

/* ---------- Turneringsnivå ---------- */

export const TURNERINGSNIVAA = [
  { value: "", label: "Velg" },
  { value: "INGEN", label: "Ingen turneringer" },
  { value: "KLUBB", label: "Klubb" },
  { value: "REGION", label: "Region · Srixon Tour" },
  { value: "NASJONALT", label: "Nasjonalt" },
  { value: "INTERNASJONALT", label: "Internasjonalt" },
] as const;

/* ---------- Fasiliteter: de 19 områdene ---------- */

export const OMRADER = [
  "Utslag",
  "Innspill ca. 200 m",
  "Innspill ca. 150 m",
  "Innspill ca. 100 m",
  "Innspill ca. 50 m",
  "Chip",
  "Pitch",
  "Lob",
  "Bunker",
  "Putting 0–3 fot",
  "Putting 3–5 fot",
  "Putting 5–10 fot",
  "Putting 10–25 fot",
  "Putting 25–40 fot",
  "Putting 40+ fot",
  "Styrke",
  "Kondisjon",
  "Bevegelighet",
  "Banespill",
] as const;

export type Omrade = (typeof OMRADER)[number];

/** Svar fra fasilitetsskjemaet. Tall er valgfrie; manglende verdi er aldri 0. */
export type FasSvar = {
  id: string;
  name: string;
  range?: boolean;
  rangeLen?: number;
  driver?: boolean;
  bunker?: boolean;
  bMin?: number;
  bMax?: number;
  chip?: boolean;
  chipMax?: number;
  pitch?: boolean;
  pitchMax?: number;
  lob?: boolean;
  green?: boolean;
  puttMax?: number;
  bane?: boolean;
  holes?: number;
  styrke?: boolean;
  kond?: boolean;
  bev?: boolean;
};

type BoolNokkel = "range" | "bunker" | "chip" | "pitch" | "green" | "bane" | "styrke" | "kond" | "bev";
type TallNokkel = "rangeLen" | "bMin" | "bMax" | "chipMax" | "pitchMax" | "puttMax" | "holes";
type JaNeiNokkel = "driver" | "lob";

/** Ett spørsmål om gangen; oppfølging ved «Ja». */
export type Sporsmal = {
  id: BoolNokkel;
  tekst: string;
  oppfolging: ReadonlyArray<{ id: TallNokkel | JaNeiNokkel; label: string; enhet: string; type: "num" | "yn" }>;
};

export const SPORSMAL: readonly Sporsmal[] = [
  { id: "range", tekst: "Har fasiliteten en range?", oppfolging: [{ id: "rangeLen", label: "Lengde på rangen", enhet: "m", type: "num" }, { id: "driver", label: "Er driver lov?", enhet: "", type: "yn" }] },
  { id: "bunker", tekst: "Er det en øvingsbunker?", oppfolging: [{ id: "bMin", label: "Korteste bunkerslag", enhet: "m", type: "num" }, { id: "bMax", label: "Lengste bunkerslag", enhet: "m", type: "num" }] },
  { id: "chip", tekst: "Er det et chippingområde?", oppfolging: [{ id: "chipMax", label: "Lengste chip", enhet: "m", type: "num" }] },
  { id: "pitch", tekst: "Kan du slå pitch og lob?", oppfolging: [{ id: "pitchMax", label: "Lengste pitch", enhet: "m", type: "num" }, { id: "lob", label: "Kan du slå høyt over en hindring?", enhet: "", type: "yn" }] },
  { id: "green", tekst: "Er det en puttinggreen?", oppfolging: [{ id: "puttMax", label: "Lengste putt du kan øve", enhet: "fot", type: "num" }] },
  { id: "bane", tekst: "Kan du spille på banen?", oppfolging: [{ id: "holes", label: "Antall hull", enhet: "", type: "num" }] },
  { id: "styrke", tekst: "Er det styrkerom eller treningsstudio?", oppfolging: [] },
  { id: "kond", tekst: "Kan du trene kondisjon her (løpebane, sykkel, tredemølle)?", oppfolging: [] },
  { id: "bev", tekst: "Er det plass til bevegelighet (matte, gulv)?", oppfolging: [] },
];

const INNSPILL: ReadonlyArray<readonly [Omrade, number]> = [
  ["Innspill ca. 200 m", 200],
  ["Innspill ca. 150 m", 150],
  ["Innspill ca. 100 m", 100],
  ["Innspill ca. 50 m", 50],
];
const PUTTING: ReadonlyArray<readonly [Omrade, number]> = [
  ["Putting 0–3 fot", 0],
  ["Putting 3–5 fot", 3],
  ["Putting 5–10 fot", 5],
  ["Putting 10–25 fot", 10],
  ["Putting 25–40 fot", 25],
  ["Putting 40+ fot", 40],
];

/** Hvilke av de 19 områdene én fasilitet dekker (samme regler som tegningen). */
export function dekkerOmrader(f: FasSvar): Omrade[] {
  const ut = new Set<Omrade>();
  if (f.range) {
    const l = f.rangeLen ?? 0;
    if (f.driver && l >= 200) ut.add("Utslag");
    for (const [n, m] of INNSPILL) if (l >= m) ut.add(n);
  }
  if (f.chip) ut.add("Chip");
  if (f.pitch) {
    ut.add("Pitch");
    if (f.lob) ut.add("Lob");
  }
  if (f.bunker) ut.add("Bunker");
  if (f.green) {
    const l = f.puttMax ?? 0;
    for (const [n, m] of PUTTING) if (l > m || (m === 0 && l > 0)) ut.add(n);
  }
  if (f.bane && (f.holes ?? 0) > 0) ut.add("Banespill");
  if (f.styrke) ut.add("Styrke");
  if (f.kond) ut.add("Kondisjon");
  if (f.bev) ut.add("Bevegelighet");
  return OMRADER.filter((o) => ut.has(o));
}

export function samletDekning(liste: readonly FasSvar[]): Omrade[] {
  const s = new Set<Omrade>();
  for (const f of liste) for (const o of dekkerOmrader(f)) s.add(o);
  return OMRADER.filter((o) => s.has(o));
}

/** «Ja»-svarene omsatt til DrillFasilitet-verdiene appen allerede bruker (PlayerFacility.capabilities). */
export function tilCapabilities(f: FasSvar): string[] {
  const ut: string[] = [];
  if (f.range) ut.push("DRIVING_RANGE");
  if (f.bunker) ut.push("BUNKER");
  if (f.chip || f.pitch) ut.push("SHORT_GAME_AREA");
  if (f.green) ut.push("PUTTING_GREEN_KORT");
  if (f.bane) ut.push("BANE");
  if (f.styrke) ut.push("VEKTSTANG");
  if (f.kond) ut.push("LOPEBANE");
  return ut;
}

/**
 * Fasiliteten regnes som innendørs bare når den ikke har noen utendørs områder
 * (range, bunker, chip, pitch, bane). Skjemaet spør ikke om ute/inne.
 */
export function erInnendors(f: FasSvar): boolean {
  return !(f.range || f.bunker || f.chip || f.pitch || f.bane);
}

/** Bro til FacilityPrefs-id-ene (samme mapping som før runde 23). */
const CAPABILITY_TIL_PREFS: Record<string, string> = {
  BANE: "GRESS_BANE",
  VEKTSTANG: "STUDIO",
  LOPEBANE: "STUDIO",
  PUTTING_GREEN_KORT: "MATTE_PUTTING",
};

export function tilPrefsIder(capabilities: readonly string[]): string[] {
  return [...new Set(capabilities.map((c) => CAPABILITY_TIL_PREFS[c]).filter((x): x is string => Boolean(x)))];
}

/* ---------- Fasiliteter som områder og steder (utkast-flater, natt 17.10) ---------- */

/** Områdene gruppert slik utkastet viser dem. Navnene er de samme som OMRADER. */
export const OMRADE_FAMILIER: ReadonlyArray<{ navn: string; omrader: ReadonlyArray<{ id: Omrade; kort: string }> }> = [
  { navn: "Utslag", omrader: [{ id: "Utslag", kort: "Utslag" }] },
  { navn: "Innspill", omrader: [{ id: "Innspill ca. 200 m", kort: "200 m og lengre" }, { id: "Innspill ca. 150 m", kort: "150–200 m" }, { id: "Innspill ca. 100 m", kort: "100–150 m" }, { id: "Innspill ca. 50 m", kort: "50–100 m" }] },
  { navn: "Nærspill", omrader: [{ id: "Chip", kort: "Chip" }, { id: "Pitch", kort: "Pitch" }, { id: "Lob", kort: "Lob" }, { id: "Bunker", kort: "Bunker" }] },
  { navn: "Putting", omrader: [{ id: "Putting 0–3 fot", kort: "0–3 fot" }, { id: "Putting 3–5 fot", kort: "3–5 fot" }, { id: "Putting 5–10 fot", kort: "5–10 fot" }, { id: "Putting 10–25 fot", kort: "10–25 fot" }, { id: "Putting 25–40 fot", kort: "25–40 fot" }, { id: "Putting 40+ fot", kort: "40+ fot" }] },
  { navn: "Fysisk", omrader: [{ id: "Styrke", kort: "Styrke" }, { id: "Kondisjon", kort: "Kondisjon" }, { id: "Bevegelighet", kort: "Bevegelighet" }] },
  { navn: "Spill", omrader: [{ id: "Banespill", kort: "Banespill" }] },
];

const OMRADE_CAP: Partial<Record<Omrade, string>> = {
  Utslag: "DRIVING_RANGE",
  "Innspill ca. 200 m": "DRIVING_RANGE",
  "Innspill ca. 150 m": "DRIVING_RANGE",
  "Innspill ca. 100 m": "DRIVING_RANGE",
  "Innspill ca. 50 m": "DRIVING_RANGE",
  Chip: "SHORT_GAME_AREA",
  Pitch: "SHORT_GAME_AREA",
  Lob: "SHORT_GAME_AREA",
  Bunker: "BUNKER",
  "Putting 0–3 fot": "PUTTING_GREEN_KORT",
  "Putting 3–5 fot": "PUTTING_GREEN_KORT",
  "Putting 5–10 fot": "PUTTING_GREEN_KORT",
  "Putting 10–25 fot": "PUTTING_GREEN_LANG",
  "Putting 25–40 fot": "PUTTING_GREEN_LANG",
  "Putting 40+ fot": "PUTTING_GREEN_LANG",
  Styrke: "VEKTSTANG",
  Kondisjon: "LOPEBANE",
  Banespill: "BANE",
};

export const STEDER = ["Driving range", "Puttinggreen", "Golfbane", "Simulator", "Treningsrom", "Hjemme"] as const;
export type Sted = (typeof STEDER)[number];

const STED_CAP: Record<Sted, { inne: boolean; cap: string[] }> = {
  "Driving range": { inne: false, cap: ["DRIVING_RANGE"] },
  Puttinggreen: { inne: false, cap: ["PUTTING_GREEN_KORT", "PUTTING_GREEN_LANG"] },
  Golfbane: { inne: false, cap: ["BANE", "SHORT_GAME_AREA", "BUNKER", "PUTTING_GREEN_KORT", "PUTTING_GREEN_LANG"] },
  Simulator: { inne: true, cap: ["SIMULATOR", "RADAR"] },
  Treningsrom: { inne: true, cap: ["VEKTSTANG", "TRAPBAR", "MED_BALL", "LOPEBANE"] },
  Hjemme: { inne: true, cap: ["MAT_NET"] },
};

/** Utstyr som ingen av de 19 områdene sier noe om; beholdes alltid når stedet er valgt. */
const UTEN_OMRADE = new Set(["SIMULATOR", "RADAR", "TRAPBAR", "MED_BALL", "MAT_NET"]);

/**
 * Stedene spilleren bruker, med de DrillFasilitet-verdiene stedet har OG som spilleren har sagt
 * at hen kan trene på (områdene). Uten valgte områder gjelder stedets fulle liste.
 */
export function stederMedCapabilities(steder: readonly string[], omrader: readonly string[]): Array<{ name: string; isIndoor: boolean; capabilities: string[] }> {
  const fraOmrader = new Set(omrader.map((o) => OMRADE_CAP[o as Omrade]).filter((c): c is string => Boolean(c)));
  return STEDER.filter((s) => steder.includes(s)).map((s) => ({
    name: s,
    isIndoor: STED_CAP[s].inne,
    capabilities: STED_CAP[s].cap.filter((c) => fraOmrader.size === 0 || UTEN_OMRADE.has(c) || fraOmrader.has(c)),
  }));
}

/** Anbefalt standardplan etter turneringsnivå (vedtak 28.09): region og høyere gir Konkurransespilleren. */
export function anbefaltPlan(nivaa: string): "Konkurransespilleren" | "Klubbspilleren" {
  return ["REGION", "NASJONALT", "INTERNASJONALT"].includes(nivaa) ? "Konkurransespilleren" : "Klubbspilleren";
}

/* ---------- Teknikktest ---------- */

export const TEST_KLUBBER = [
  { id: "sw", navn: "Sandwedge", avstand: 70 },
  { id: "i7", navn: "7-jern", avstand: 140 },
  { id: "dr", navn: "Driver", avstand: 220 },
] as const;
export type TestKlubbId = (typeof TEST_KLUBBER)[number]["id"];

export const TEST_VERKTOY = ["TrackMan", "TrackMan Range", "Banen"] as const;
export type TestVerktoy = (typeof TEST_VERKTOY)[number];

/** Fem slag per kølle: [carry, avstand fra mål], begge i meter. */
export type TestSlag = [number | null, number | null];
export type TestSlagPerKlubb = Partial<Record<TestKlubbId, TestSlag[]>>;

export type TestResultatRad = { id: TestKlubbId; navn: string; avstand: number; snittFeil: number | null; relativ: number | null };

/** Snitt avstand fra mål per kølle, og hvor stor den er i prosent av spillerens avstand. Ingen slag gir null, aldri 0. */
export function testResultat(slag: TestSlagPerKlubb, avstander: Record<TestKlubbId, number>): { rader: TestResultatRad[]; storste: TestResultatRad | null } {
  const rader = TEST_KLUBBER.map((k) => {
    const gyldige = (slag[k.id] ?? []).map((s) => s[1]).filter((v): v is number => v != null);
    const snittFeil = gyldige.length ? gyldige.reduce((a, b) => a + b, 0) / gyldige.length : null;
    const avstand = avstander[k.id] || 0;
    return { id: k.id, navn: k.navn, avstand, snittFeil, relativ: snittFeil != null && avstand ? snittFeil / avstand : null };
  });
  const storste = rader.filter((r) => r.relativ != null).sort((a, b) => (b.relativ ?? 0) - (a.relativ ?? 0))[0] ?? null;
  return { rader, storste };
}

/** Norsk tall med ett desimal og ekte minus. Manglende verdi er «—». */
export function d1(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return (v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");
}

/* ---------- Treningsplan ---------- */

/** Fem standardplaner (Anders 28.09.2026, grillingen §8.11). Innholdet tilpasses kategori A–K; alder begrenser aldri. */
export const TRENINGSPLANER = [
  { navn: "Weekend Warrior", timer: "3–4 t per uke" },
  { navn: "Klubbspilleren", timer: "5–7 t per uke" },
  { navn: "Junior-aspirant", timer: "8–12 t per uke" },
  { navn: "Konkurransespilleren", timer: "12–16 t per uke" },
  { navn: "Practice like the pros", timer: "18–24 t per uke" },
] as const;

/* ---------- Alder ---------- */

/** Alder i hele år fra «ÅÅÅÅ-MM-DD». Ugyldig eller fremtidig dato gir null. */
export function alderFraDato(iso: string, naa: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [, y, mo, d] = m;
  const fodt = new Date(Date.UTC(+y, +mo - 1, +d));
  if (Number.isNaN(fodt.getTime()) || fodt.getUTCMonth() !== +mo - 1) return null;
  let alder = naa.getUTCFullYear() - +y;
  if (naa.getUTCMonth() + 1 < +mo || (naa.getUTCMonth() + 1 === +mo && naa.getUTCDate() < +d)) alder--;
  return alder >= 0 && alder < 120 ? alder : null;
}

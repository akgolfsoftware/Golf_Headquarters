/**
 * Rene hjelpefunksjoner — fasitens utility-metoder (durLabel, omr-array,
 * buildDimensions). Holdt utenfor komponentene så de kan deles og testes.
 */

import type { DimField } from "./taxonomy";
import { dimLabel } from "./taxonomy";
import type { Recur, WbSession, PaletteItem, WeekKey } from "./types";

/** Minutter → "1t 30m" / "1t" / "30m" (fasitens durLabel). */
export function durLabel(min: number): string {
  const h = Math.floor(min / 60);
  const mm = min % 60;
  if (h && mm) return `${h}t ${mm}m`;
  if (h) return `${h}t`;
  return `${mm}m`;
}

type Editable = WbSession | PaletteItem;

/** omr som array (fasit omrArr). */
export function omrArr(s: Editable): string[] {
  const v = s.omr;
  if (Array.isArray(v)) return v.length ? v : ["TEE"];
  return v ? [v] : ["TEE"];
}

export function omrLabelOf(s: Editable): string {
  return omrArr(s)
    .map((x) => dimLabel("omr", x))
    .join(", ");
}

/** P-posisjoner som array (default tom — P-posisjon er valgfri, ikke som omr). */
export function pposArr(s: Editable): string[] {
  const v = s.ppos;
  return Array.isArray(v) ? v : [];
}

/** En dimensjon-rad i inspektøren. */
export type DimRow = {
  field: DimField;
  label: string;
  /** vist verdi (single) */
  value: string;
  single: boolean;
  multi: boolean;
  /** chips for multi (omr) */
  chips: { label: string; value: string }[];
};

function v<T extends Editable>(s: T, f: keyof T, d: string): string {
  const val = s[f];
  return val != null ? String(val) : d;
}

/**
 * Bygg AK-formel-radene for inspektøren — speiler fasitens buildDimensions.
 * FYS har eget sett (FYS-type [+ sone hvis KONDISJON]); øvrige har fullt sett.
 */
export function buildDimensions(s: Editable): DimRow[] {
  const pyr: DimRow = {
    field: "cat",
    label: "Pyramide",
    value: s.cat,
    single: true,
    multi: false,
    chips: [],
  };

  if (s.cat === "FYS") {
    const ft = v(s, "fysType", "STYRKE");
    const dims: DimRow[] = [
      pyr,
      { field: "fysType", label: "FYS-type", value: dimLabel("fysType", ft), single: true, multi: false, chips: [] },
    ];
    if (ft === "KONDISJON") {
      dims.push({
        field: "sone",
        label: "Intensitet",
        value: dimLabel("sone", v(s, "sone", "SONE_3")),
        single: true,
        multi: false,
        chips: [],
      });
    }
    return dims;
  }

  const omrChips = omrArr(s).map((val) => ({ label: dimLabel("omr", val), value: val }));
  return [
    pyr,
    { field: "omr", label: "Område", value: "", single: false, multi: true, chips: omrChips },
    { field: "m", label: "Miljø", value: dimLabel("m", v(s, "m", "M2")), single: true, multi: false, chips: [] },
    { field: "pr", label: "Press", value: dimLabel("pr", v(s, "pr", "PR2")), single: true, multi: false, chips: [] },
    { field: "cs", label: "Hastighet", value: dimLabel("cs", v(s, "cs", "CS80")), single: true, multi: false, chips: [] },
    { field: "lfase", label: "L-fase", value: dimLabel("lfase", v(s, "lfase", "L_BALL")), single: true, multi: false, chips: [] },
    {
      field: "ppos",
      label: "P-posisjon",
      value: "",
      single: false,
      multi: true,
      chips: pposArr(s).map((val) => ({ label: dimLabel("ppos", val), value: val })),
    },
    { field: "praksis", label: "Praksis", value: dimLabel("praksis", v(s, "praksis", "BLOKK")), single: true, multi: false, chips: [] },
  ];
}

// ───────── Ukedag-rekkefølge og ekte datoer (Dag-fanen) ─────────

/** Ukedag-rekkefølge, mandag først — samme rekkefølge som DAY_INDEX i WorkbenchHybrid. */
export const WEEK_KEYS: WeekKey[] = ["man", "tir", "ons", "tor", "fre", "lor", "son"];

const WEEKDAY_SHORT: Record<WeekKey, string> = {
  man: "Man", tir: "Tir", ons: "Ons", tor: "Tor", fre: "Fre", lor: "Lør", son: "Søn",
};

function dateOfWeekKey(weekStartISO: string | undefined, key: WeekKey): Date | null {
  if (!weekStartISO) return null;
  const d = new Date(weekStartISO);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + WEEK_KEYS.indexOf(key));
  return d;
}

/** Ekte dato-etikett ("Man 9. jun") for en ukedag, gitt mandagen i uka (ISO). Fallback: kun ukedagsnavn. */
export function dayDateLabel(weekStartISO: string | undefined, key: WeekKey): string {
  const d = dateOfWeekKey(weekStartISO, key);
  if (!d) return WEEKDAY_SHORT[key];
  const month = d.toLocaleDateString("nb-NO", { month: "short" }).replace(".", "");
  return `${WEEKDAY_SHORT[key]} ${d.getDate()}. ${month}`;
}

/** Er denne ukedagen (i den viste uka) faktisk i dag? */
export function isDayToday(weekStartISO: string | undefined, key: WeekKey): boolean {
  const d = dateOfWeekKey(weekStartISO, key);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ───────── Gjentakelse (fasit recurSummary) ─────────

const RECUR_DAY_SHORT: Record<WeekKey, string> = {
  man: "man", tir: "tir", ons: "ons", tor: "tor", fre: "fre", lor: "lør", son: "søn",
};

/** Lesbar oppsummering av en gjentakelse (fasit `recurSummary`). */
export function recurSummary(r: Recur | null | undefined): string {
  if (!r || !r.freq || r.freq === "none") return "Av · gjelder kun denne uka";
  let base: string;
  if (r.freq === "daily") {
    base = r.interval > 1 ? `Hver ${r.interval}. dag` : "Hver dag";
  } else if (r.freq === "weekly") {
    const ds = (r.days ?? []).map((x) => RECUR_DAY_SHORT[x]).join(", ");
    base = (r.interval > 1 ? `Hver ${r.interval}. uke` : "Hver uke") + (ds ? ` på ${ds}` : "");
  } else if (r.freq === "monthly") {
    base = r.interval > 1 ? `Hver ${r.interval}. måned` : "Hver måned";
  } else {
    base = "Gjentas";
  }
  if (r.endType === "count") base += ` · ${r.endCount} ganger`;
  else if (r.endType === "date") base += ` · til ${r.endDate}`;
  return base;
}

// ───────── Øktplan-blokker (fasit mainSteps / fysExercises / buildPlan) ─────────

/** Ett steg i en øktplan-blokk. */
export type PlanStep = { n: string; title: string; detail: string; tag: string };

/** Hoveddel-stegene for en golf-økt (fasit `mainSteps`). */
export function mainSteps(s: Editable): PlanStep[] {
  const arr = omrArr(s);
  const omr = arr[0] || "TEE";
  const omrLbl = omrLabelOf(s);
  if (s.cat === "SPILL" || omr === "SPILL")
    return [{ n: "2", title: "Banespill 9 hull — tell SG per hull", detail: `${dimLabel("m", s.m || "M3")} · ${dimLabel("pr", s.pr || "PR3")}`, tag: "SPILL" }];
  if (s.cat === "SLAG")
    return [{ n: "2", title: "Shot-link / banespill", detail: `${omrLbl} · ${dimLabel("m", s.m || "M3")}`, tag: omr }];
  if (s.cat === "TURN")
    return [
      { n: "2", title: "Banegjennomgang + strategi", detail: "Hull-for-hull plan", tag: "M5" },
      { n: "3", title: "Komparativ/konkurranse-runde", detail: dimLabel("pr", s.pr || "PR4"), tag: s.pr || "PR4" },
    ];
  if (omr.indexOf("PUTT") === 0)
    return [
      { n: "2", title: `Avstandskontroll — ${omrLbl}`, detail: `20 putt · ${dimLabel("pr", s.pr || "PR3")}`, tag: omr },
      { n: "3", title: "Press-putting", detail: dimLabel("pr", s.pr || "PR3"), tag: s.pr || "PR3" },
    ];
  return [{ n: "2", title: `Teknisk blokk — ${omrLbl}`, detail: `${dimLabel("cs", s.cs || "CS80")} · video hver 5. slag`, tag: s.cs || "CS80" }];
}

/** FYS-øvelseslista for en FYS-økt (fasit `fysExercises`). */
export function fysExercises(s: Editable): { name: string; meta: string }[] {
  const t = s.fysType || "STYRKE";
  if (t === "KONDISJON")
    return [
      { name: "Oppvarming – løp", meta: "10 min · Sone 2" },
      { name: "Intervaller 4 × 4 min", meta: "Sone 4 · 3 min pause" },
      { name: "Nedjogg", meta: "8 min · Sone 1" },
    ];
  if (t === "MOBILITET" || t === "BEVEGELIGHET")
    return [
      { name: "Hofteåpner", meta: "3 × 60 sek" },
      { name: "Thoracic rotasjon", meta: "3 × 10 / side" },
      { name: "Skulder-mobilitet", meta: "3 × 12" },
      { name: "Ankel-mobilitet", meta: "3 × 10 / side" },
    ];
  if (t === "AKTIVERING")
    return [
      { name: "Bånd – glute bridge", meta: "3 × 12" },
      { name: "Core-aktivering", meta: "3 × 30 sek" },
      { name: "Hopp-aktivering", meta: "3 × 5" },
    ];
  return [
    { name: "Knebøy", meta: "3 × 8 · RPE 7" },
    { name: "Markløft", meta: "3 × 6 · RPE 8" },
    { name: "Utfall m/ rotasjon", meta: "3 × 10 / side" },
    { name: "Core anti-rotasjon", meta: "3 × 30 sek" },
    { name: "Medisinball-kast", meta: "4 × 5 · eksplosivt" },
  ];
}

/** En blokk i øktplanen (oppvarming/hoveddel/avslutning). */
export type PlanBlock = { label: string; color: string; hasRepeat: boolean; repeatLabel: string; steps: PlanStep[] };

/** AK-formel-linja for en økt (fasit `formulaLine`). */
export function formulaLine(s: Editable): string {
  const isFys = s.cat === "FYS";
  const parts = isFys
    ? [s.cat, dimLabel("fysType", s.fysType || "STYRKE"), dimLabel("sone", s.sone || "SONE_3"), dimLabel("pr", s.pr || "PR2"), dimLabel("praksis", s.praksis || "BLOKK")]
    : [s.cat, omrLabelOf(s), dimLabel("m", s.m || "M2"), dimLabel("pr", s.pr || "PR2"), dimLabel("cs", s.cs || "CS80"), dimLabel("lfase", s.lfase || "L_BALL"), dimLabel("praksis", s.praksis || "BLOKK")];
  return parts.join("  ·  ");
}

/** Bygg de tre golf-blokkene for øktplanen (fasit `buildPlan.rawBlocks`). */
export function planBlocks(s: Editable, catColor: string): PlanBlock[] {
  const main = mainSteps(s);
  return [
    {
      label: "1 · Oppvarming",
      color: "var(--axis-fys)",
      hasRepeat: false,
      repeatLabel: "",
      steps: [{ n: "1", title: "Mobilitet + dynamisk aktivering", detail: "10 min · puls opp", tag: "M2" }],
    },
    { label: "2 · Hoveddel", color: catColor, hasRepeat: true, repeatLabel: "×3 runder", steps: main },
    {
      label: "3 · Avslutning",
      color: "var(--axis-slag)",
      hasRepeat: false,
      repeatLabel: "",
      steps: [{ n: String(2 + main.length), title: "Putt 1–3 m til 5 napp", detail: "Avslutt positivt", tag: "PUTT0_3" }],
    },
  ];
}

// ───────── Øvelsesbank (fasit bankVals.lib) ─────────

/** Kategori-faner for øvelsesbanken (golf vs FYS). */
export function bankCats(isFys: boolean): { value: string; label: string }[] {
  return isFys
    ? [
        { value: "STYRKE", label: "Styrke" },
        { value: "KONDISJON", label: "Kondisjon" },
        { value: "BEVEGELIGHET", label: "Bevegelighet" },
        { value: "POWER", label: "Power" },
      ]
    : [
        { value: "TEE", label: "Driver/utslag" },
        { value: "INN", label: "Innspill" },
        { value: "CHIP", label: "Nærspill" },
        { value: "PUTT", label: "Putting" },
        { value: "SPILL", label: "Spill" },
      ];
}

const BANK_LIB: Record<string, [string, string][]> = {
  STYRKE: [["Knebøy", "3×8 · progressiv vekt"], ["Markløft", "3×5"], ["Utfall", "3×10 per ben"], ["Hoftehengsel", "3×12"]],
  KONDISJON: [["Intervall 4×4", "sone 4 · 4 min på"], ["Rolig økt", "sone 2 · 40 min"], ["Tempoløp", "sone 3 · 20 min"]],
  BEVEGELIGHET: [["Hofterotasjon", "2×15 per side"], ["Thorax-rotasjon", "2×12"], ["Ankel-mobilitet", "2×10"]],
  POWER: [["Kast medisinball", "4×5 eksplosivt"], ["Hopp box", "4×4"], ["Sving-acc.", "speed sticks 3×6"]],
  TEE: [["Tee-shot rutine", "9 slag · full pre-shot"], ["Draw/fade-kontroll", "skift form hvert 3."], ["Maks ballhastighet", "TrackMan-mål"]],
  INN: [["Approach 50–100 m", "stige 10 m"], ["Flagg-jakt", "mål: < 6 m"], ["Trajectory-kontroll", "høy/lav"]],
  CHIP: [["Chip-stige", "3 lengder"], ["Bunker-rutine", "9 slag"], ["Lob over hinder", "presisjon"]],
  PUTT: [["Klokka 0–3 m", "8 retninger"], ["Distansekontroll", "lag-putting"], ["Press-putt", "konkurranse"]],
  SPILL: [["Banespill 9 hull", "scorekort"], ["Worst-ball", "press"], ["Par-18 nærspill", "9 stasjoner"]],
};

/** Øvelser i en bank-kategori (fasit `lib`). */
export function bankItems(cat: string): { title: string; meta: string }[] {
  return (BANK_LIB[cat] ?? []).map(([title, meta]) => ({ title, meta }));
}

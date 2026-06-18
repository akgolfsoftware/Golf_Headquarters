/**
 * Fasit-demo-data — fallback når ekte WorkbenchData mangler (preview/tom DB).
 * Tatt 1:1 fra fasitens initial-state (week / palette / tournaments / goals).
 */

import type { Cat } from "./theme";
import type { PaletteItem, SeasonPhase, WbGoal, WbTournament, WeekState } from "./types";

export const DEMO_PALETTE: PaletteItem[] = [
  { pid: "p1", title: "Putting-grunntrening", dur: 30, cat: "SPILL", omr: "PUTT0_3", m: "M2", pr: "PR2", cs: "CS80", lfase: "L_BALL", praksis: "BLOKK" },
  { pid: "p2", title: "Teknisk — driver", dur: 60, cat: "TEK", omr: "TEE", m: "M1", pr: "PR1", cs: "CS70", lfase: "L_KOLLE", praksis: "BLOKK" },
  { pid: "p3", title: "Fysisk styrke", dur: 45, cat: "FYS", fysType: "STYRKE", sone: "SONE_3", pr: "PR2", praksis: "BLOKK" },
  { pid: "p4", title: "Banespill 9 hull", dur: 120, cat: "SLAG", omr: "SPILL", m: "M3", pr: "PR3", cs: "CS90", lfase: "L_AUTO", praksis: "RANDOM" },
  { pid: "p5", title: "Approach 50–100 m", dur: 60, cat: "TEK", omr: "INN100", m: "M2", pr: "PR2", cs: "CS80", lfase: "L_BALL", praksis: "RANDOM" },
  { pid: "p6", title: "Restitusjon", dur: 30, cat: "FYS", fysType: "MOBILITET", sone: "SONE_1", pr: "PR1", praksis: "BLOKK" },
];

export const DEMO_WEEK: WeekState = {
  man: [{ id: "s1", title: "Putting 30m", dur: 30, cat: "SPILL", time: "16:00" }],
  tir: [
    { id: "s2", title: "Fysisk styrke", dur: 45, cat: "FYS", time: "07:00" },
    { id: "s3", title: "Teknisk — driver", dur: 60, cat: "TEK", time: "16:00" },
  ],
  ons: [
    { id: "s4", title: "Banespill 9 hull", dur: 120, cat: "SLAG", time: "15:00", omr: "SPILL", m: "M3", pr: "PR3", cs: "CS90", lfase: "L_AUTO", praksis: "RANDOM" },
    { id: "s8", title: "Teknisk — driver", dur: 60, cat: "TEK", time: "19:00", omr: "TEE", m: "M1", pr: "PR1", cs: "CS70", lfase: "L_KOLLE", praksis: "BLOKK" },
  ],
  tor: [{ id: "s5", title: "Restitusjon", dur: 30, cat: "FYS", time: "18:00" }],
  fre: [{ id: "s6", title: "Approach 50–100m", dur: 60, cat: "TEK", time: "16:00" }],
  lor: [{ id: "s7", title: "Turneringsforb.", dur: 180, cat: "TURN", time: "10:00" }],
  son: [],
};

export const DEMO_TOURNAMENTS: WbTournament[] = [
  { title: "Klubbmesterskap", date: "06.06.2026", type: "TRENING" },
  { title: "Srixon Tour #3", date: "13.06.2026", type: "UTVIKLING" },
  { title: "Region-Cup", date: "21.06.2026", type: "UTVIKLING" },
  { title: "NM Junior", date: "29.06.2026", type: "PRESTASJON" },
];

export const DEMO_GOALS: WbGoal[] = [
  { gn: "SG innspill +0,30", gm: "RESULTATMÅL · SESONG", ax: "SPILL" },
  { gn: "8 t styrke / uke", gm: "PROSESSMÅL · UKE", ax: "FYS" },
  { gn: "Daglig 10 min putting", gm: "VANE · 28 D", ax: "TEK" },
];

export const DEMO_SIDE_TESTS = [
  "Putt 1.5 m × 20",
  "Driver ballhastighet",
  "Yo-Yo IR1",
  "Wedge 50 m presisjon",
];

/** Fasit-banner: NM Junior om 18 dager. */
export const DEMO_WARNING_BANNER = {
  title: "NM Junior — Losby GK",
  meta: "om 18 dager · redusert volum neste uke",
};

/** Fasit uke-header (uke 24 · 9.–15. juni). */
export const DEMO_WEEK_HEAD = {
  weekLabel: "Uke 24",
  range: "9.–15. juni 2026",
};

/**
 * Sesong-perioder (fasit `seasonPhases`, linje 1198–1204). Ingen Prisma-kilde
 * ennå — disse er demo-verdier for Årsplan/periodisering, mirror av fasiten.
 */
export const DEMO_SEASON_PHASES: SeasonPhase[] = [
  { type: "GRUNN", months: 2, span: "Jan–Feb", weekly: { TEK: 3, FYS: 4, SLAG: 2, SPILL: 1, TURN: 0 }, samlinger: [] },
  { type: "SPESIALISERING", months: 2, span: "Mar–Apr", weekly: { TEK: 2, FYS: 3, SLAG: 3, SPILL: 2, TURN: 1 }, samlinger: [{ title: "Klubbsamling påske", date: "14.04.2026", time: "10:00", org: "Klubb" }] },
  { type: "TURNERING", months: 4, span: "Mai–Aug", weekly: { TEK: 1, FYS: 2, SLAG: 2, SPILL: 2, TURN: 2 }, samlinger: [{ title: "NM Junior-leir", date: "20.06.2026", time: "09:00", org: "Team Norway" }] },
  { type: "EVALUERING", months: 1, span: "Sep", weekly: { TEK: 1, FYS: 1, SLAG: 1, SPILL: 3, TURN: 2 }, samlinger: [] },
  { type: "FERIE", months: 1, span: "Okt", weekly: { TEK: 0, FYS: 3, SLAG: 0, SPILL: 0, TURN: 0 }, samlinger: [] },
  { type: "GRUNN", months: 2, span: "Nov–Des", weekly: { TEK: 3, FYS: 4, SLAG: 2, SPILL: 1, TURN: 0 }, samlinger: [] },
];

/** Planlagt belastning per måned (fasit `loadVals`, prosent-høyder). Demo. */
export const DEMO_YEAR_LOAD: number[] = [40, 48, 58, 66, 72, 90, 82, 86, 28, 44, 56, 64];

/**
 * Turnerings/test-markører per måned-index (fasit `markerDefs`). [label, farge].
 * Fargene er fasit-rådata; mappes ikke til CAT-tokens. Demo.
 */
export const DEMO_YEAR_MARKERS: Record<number, [string, string]> = {
  5: ["NM Junior", "#D1F843"],
  7: ["Norgescup", "#84A9FF"],
  8: ["Sesongtopp", "#D1F843"],
  10: ["Vintertest", "#56C59A"],
};

/** Antall økter per måned (fasit `counts`). Demo. */
export const DEMO_MONTH_COUNTS: number[] = [16, 15, 18, 20, 19, 22, 14, 21, 9, 17, 18, 16];

/**
 * Måned-kalender prøvedager (fasit `sampleMonth`): dato → kategorier som har
 * planlagte økter. Brukt for dager utenfor den ekte/aktive uka. Demo.
 */
export const DEMO_SAMPLE_MONTH: Record<number, Cat[]> = {
  2: ["FYS"], 3: ["TEK", "SLAG"], 4: ["SPILL"], 5: ["FYS"], 6: ["SLAG"],
  17: ["TEK"], 18: ["FYS", "TEK"], 19: ["SLAG"], 20: ["TURN"], 22: ["FYS"],
  23: ["TEK"], 24: ["SLAG", "SPILL"], 25: ["FYS"], 26: ["TEK"], 27: ["SLAG", "TURN"],
};

/** Måned-statistikk-tiles (fasit `monthStats`, faste demo-tall). */
export const DEMO_MONTH_STATS: { label: string; value: string }[] = [
  { label: "Konkurranser", value: "—" }, // erstattes av faktisk antall turneringer
  { label: "Planlagte økter", value: "38" },
  { label: "Trenerøkter", value: "6" },
  { label: "Samlinger", value: "—" }, // erstattes av faktisk antall samlinger
];

/**
 * Fasit-demo-data — fallback når ekte WorkbenchData mangler (preview/tom DB).
 * Tatt 1:1 fra fasitens initial-state (week / palette / tournaments / goals).
 */

import type { PaletteItem, WbGoal, WbTournament, WeekState } from "./types";

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

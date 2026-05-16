/**
 * Demo-data for treningsanalyse når databasen er tom.
 * Brukes som fallback i page.tsx hvis spilleren ikke har logget aktivitet.
 */

import type {
  OversiktData,
  KrysstabellData,
  DrillUsage,
  PlanVsActual,
  SGCouplingPunkt,
  TrendPunkt,
  FysProgresjonRad,
  CelleSession,
  Dimensjon,
} from "./actions";

export const DEMO_OVERSIKT: OversiktData = {
  totalMinutes: 1830,
  totalSessions: 24,
  totalDrills: 142,
  pyramidFordeling: {
    FYS: 360,
    TEK: 540,
    SLAG: 480,
    SPILL: 330,
    TURN: 120,
  },
  omraadeFordeling: {
    "Tee Total": 420,
    Tilnaerming: 360,
    "Around the Green": 250,
    Putting: 280,
    "Fysisk styrke": 200,
    "Mental trening": 120,
    Konkurransesimulering: 200,
  },
  miljoFordeling: {
    M0: 120,
    M1: 380,
    M2: 460,
    M3: 520,
    M4: 240,
    M5: 110,
  },
  csSnitt: 72,
  praksistypeFordeling: {
    BLOKK: 720,
    RANDOM: 540,
    KONKURRANSE: 350,
    SPILL_TEST: 220,
  },
  fysTreningstypeFordeling: {
    STYRKE: 180,
    BEVEGELIGHET: 90,
    KONDISJON: 50,
    MOBILITET: 30,
    AKTIVERING: 10,
  },
  fysMuskelgruppeFordeling: {
    HOFTEFLEKSORER: 80,
    CORE: 120,
    SKULDRE: 60,
    UNDERKROPP: 70,
    OVERKROPP: 30,
  },
};

export const DEMO_KRYSSTABELL: KrysstabellData = {
  rader: ["Tee Total", "Tilnaerming", "Around the Green", "Putting"],
  kolonner: ["TEK", "SLAG", "SPILL", "TURN"],
  celler: [
    { rad: "Tee Total", kolonne: "TEK", minutter: 180, drillCount: 14 },
    { rad: "Tee Total", kolonne: "SLAG", minutter: 140, drillCount: 9 },
    { rad: "Tee Total", kolonne: "SPILL", minutter: 80, drillCount: 5 },
    { rad: "Tee Total", kolonne: "TURN", minutter: 20, drillCount: 2 },
    { rad: "Tilnaerming", kolonne: "TEK", minutter: 150, drillCount: 12 },
    { rad: "Tilnaerming", kolonne: "SLAG", minutter: 120, drillCount: 8 },
    { rad: "Tilnaerming", kolonne: "SPILL", minutter: 60, drillCount: 4 },
    { rad: "Tilnaerming", kolonne: "TURN", minutter: 30, drillCount: 2 },
    { rad: "Around the Green", kolonne: "TEK", minutter: 100, drillCount: 10 },
    { rad: "Around the Green", kolonne: "SLAG", minutter: 80, drillCount: 6 },
    { rad: "Around the Green", kolonne: "SPILL", minutter: 50, drillCount: 4 },
    { rad: "Around the Green", kolonne: "TURN", minutter: 20, drillCount: 1 },
    { rad: "Putting", kolonne: "TEK", minutter: 110, drillCount: 11 },
    { rad: "Putting", kolonne: "SLAG", minutter: 90, drillCount: 7 },
    { rad: "Putting", kolonne: "SPILL", minutter: 60, drillCount: 5 },
    { rad: "Putting", kolonne: "TURN", minutter: 20, drillCount: 2 },
  ],
  totalMinutter: 1310,
};

export const DEMO_DRILL_USAGE: DrillUsage[] = [
  { navn: "9-shot drill", pyramide: "TEK", count: 22, totalMinutter: 220 },
  { navn: "Par-3 simulator", pyramide: "SPILL", count: 18, totalMinutter: 360 },
  { navn: "Ladder putts", pyramide: "TEK", count: 16, totalMinutter: 80 },
  { navn: "Bunker box drill", pyramide: "TEK", count: 12, totalMinutter: 120 },
  { navn: "100m wedge gauntlet", pyramide: "SLAG", count: 11, totalMinutter: 132 },
  { navn: "Pressure putt 4ft", pyramide: "TURN", count: 9, totalMinutter: 45 },
  { navn: "Trail-arm only drill", pyramide: "TEK", count: 9, totalMinutter: 54 },
  { navn: "Squat 3x5", pyramide: "FYS", count: 8, totalMinutter: 80 },
  { navn: "Hip mobility flow", pyramide: "FYS", count: 8, totalMinutter: 64 },
  { navn: "Driver flighter", pyramide: "SLAG", count: 7, totalMinutter: 84 },
];

export const DEMO_PLAN_VS_ACTUAL: PlanVsActual[] = [
  { pyramide: "FYS", planlagtMin: 400, faktiskMin: 360, adherence: 0.9 },
  { pyramide: "TEK", planlagtMin: 600, faktiskMin: 540, adherence: 0.9 },
  { pyramide: "SLAG", planlagtMin: 480, faktiskMin: 480, adherence: 1.0 },
  { pyramide: "SPILL", planlagtMin: 360, faktiskMin: 330, adherence: 0.92 },
  { pyramide: "TURN", planlagtMin: 150, faktiskMin: 120, adherence: 0.8 },
];

export const DEMO_SG: SGCouplingPunkt[] = Array.from({ length: 8 }).map(
  (_, i) => {
    const dato = new Date();
    dato.setDate(dato.getDate() - (28 - i * 4));
    return {
      dato: dato.toISOString().slice(0, 10),
      sgTotal: 0.2 + Math.sin(i / 2) * 0.4,
      sgOtt: 0.1 + Math.cos(i / 3) * 0.3,
      sgApp: -0.1 + Math.sin(i / 2 + 1) * 0.5,
      sgArg: 0.05 + Math.cos(i / 2) * 0.2,
      sgPutt: -0.2 + Math.sin(i / 1.5) * 0.4,
    };
  },
);

export function lagDemoTrend(dim: Dimensjon): TrendPunkt[] {
  const baseKeys =
    dim === "pyramide"
      ? ["FYS", "TEK", "SLAG", "SPILL", "TURN"]
      : dim === "miljo"
        ? ["M0", "M1", "M2", "M3", "M4", "M5"]
        : dim === "praksistype"
          ? ["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"]
          : ["A", "B", "C"];
  const ukerTilbake = 8;
  return Array.from({ length: ukerTilbake }).map((_, i) => {
    const data: Record<string, number> = {};
    for (const k of baseKeys) {
      data[k] = Math.round(20 + Math.random() * 60);
    }
    const d = new Date();
    d.setDate(d.getDate() - (ukerTilbake - i) * 7);
    const week = Math.ceil(d.getDate() / 7);
    return {
      bucket: `${d.getFullYear()}-W${String(week).padStart(2, "0")}`,
      data,
    };
  });
}

export const DEMO_FYS: FysProgresjonRad[] = [
  {
    ovelse: "Knebøy",
    muskelgruppe: "UNDERKROPP",
    treningstype: "STYRKE",
    punkter: [
      { dato: "2026-04-08", vektKg: 80, reps: 5 },
      { dato: "2026-04-15", vektKg: 85, reps: 5 },
      { dato: "2026-04-22", vektKg: 85, reps: 6 },
      { dato: "2026-04-29", vektKg: 90, reps: 5 },
      { dato: "2026-05-06", vektKg: 92.5, reps: 5 },
    ],
  },
  {
    ovelse: "Markløft",
    muskelgruppe: "UNDERKROPP",
    treningstype: "STYRKE",
    punkter: [
      { dato: "2026-04-10", vektKg: 100, reps: 5 },
      { dato: "2026-04-17", vektKg: 105, reps: 5 },
      { dato: "2026-04-24", vektKg: 110, reps: 4 },
      { dato: "2026-05-01", vektKg: 110, reps: 5 },
    ],
  },
  {
    ovelse: "Benkpress",
    muskelgruppe: "OVERKROPP",
    treningstype: "STYRKE",
    punkter: [
      { dato: "2026-04-09", vektKg: 60, reps: 8 },
      { dato: "2026-04-16", vektKg: 62.5, reps: 8 },
      { dato: "2026-04-23", vektKg: 65, reps: 6 },
      { dato: "2026-05-07", vektKg: 65, reps: 7 },
    ],
  },
];

export const DEMO_CELLE_SESSIONS: CelleSession[] = [
  {
    id: "demo-1",
    title: "Driver-fokus øve på rampe",
    startTime: new Date(Date.now() - 86400000 * 3).toISOString(),
    totalMin: 60,
    drillCount: 4,
  },
  {
    id: "demo-2",
    title: "Range-kveld med 9-shot",
    startTime: new Date(Date.now() - 86400000 * 7).toISOString(),
    totalMin: 75,
    drillCount: 5,
  },
];

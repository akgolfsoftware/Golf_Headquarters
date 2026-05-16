// __demoData.ts — dummy-data for kalender-vyer.
//
// Brukes når databasen er tom eller man vil rendre demo-tilstand. Alle
// datoer beregnes relativt til en referanse-dato slik at vyene ser
// realistiske ut uansett dagens dato.

import { addDays, startOfWeek, startOfYear } from "date-fns";
import type {
  PyramidArea,
  PracticeType,
  PeriodeType,
} from "@/generated/prisma/client";

export type DemoSpiller = { id: string; navn: string };

export type DemoPeriode = {
  id: string;
  type: PeriodeType;
  fra: Date;
  til: Date;
  focus: string;
  spilllerId: string;
};

export type DemoOkt = {
  id: string;
  spilllerId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  pyramide: PyramidArea;
  practiceType: PracticeType;
  notes?: string;
};

export type DemoTurnering = {
  id: string;
  navn: string;
  dato: Date;
  prioritet: "MAJOR" | "NORMAL" | "LOCAL";
  spilllerId: string;
};

export const DEMO_SPILLERE: DemoSpiller[] = [
  { id: "demo-1", navn: "Ada Bergstrøm" },
  { id: "demo-2", navn: "Eivind Lien" },
  { id: "demo-3", navn: "Marte Solheim" },
  { id: "demo-4", navn: "Tobias Aas" },
];

export function lagDemoPerioder(aar: number, spilllerId: string): DemoPeriode[] {
  const start = startOfYear(new Date(aar, 0, 1));
  return [
    {
      id: `${spilllerId}-p1`,
      type: "GRUNN",
      fra: start,
      til: addDays(start, 70),
      focus: "Fysisk basis + tekniske grunnferdigheter",
      spilllerId,
    },
    {
      id: `${spilllerId}-p2`,
      type: "SPESIALISERING",
      fra: addDays(start, 71),
      til: addDays(start, 140),
      focus: "Integrere ferdigheter i slag og spill",
      spilllerId,
    },
    {
      id: `${spilllerId}-p3`,
      type: "TURNERING",
      fra: addDays(start, 141),
      til: addDays(start, 240),
      focus: "Turneringsspesifikk forberedelse",
      spilllerId,
    },
    {
      id: `${spilllerId}-p4`,
      type: "EVALUERING",
      fra: addDays(start, 241),
      til: addDays(start, 280),
      focus: "Test og vurdering",
      spilllerId,
    },
    {
      id: `${spilllerId}-p5`,
      type: "FERIE",
      fra: addDays(start, 281),
      til: addDays(start, 320),
      focus: "Vedlikehold, fysisk fokus",
      spilllerId,
    },
    {
      id: `${spilllerId}-p6`,
      type: "GRUNN",
      fra: addDays(start, 321),
      til: addDays(start, 364),
      focus: "Ny oppbygging mot neste sesong",
      spilllerId,
    },
  ];
}

export function lagDemoTurneringer(aar: number, spilllerId: string): DemoTurnering[] {
  const start = startOfYear(new Date(aar, 0, 1));
  return [
    {
      id: `${spilllerId}-t1`,
      navn: "Bossum Open",
      dato: addDays(start, 165),
      prioritet: "MAJOR",
      spilllerId,
    },
    {
      id: `${spilllerId}-t2`,
      navn: "WANG Cup",
      dato: addDays(start, 200),
      prioritet: "NORMAL",
      spilllerId,
    },
    {
      id: `${spilllerId}-t3`,
      navn: "Lokal klubbmesterskap",
      dato: addDays(start, 220),
      prioritet: "LOCAL",
      spilllerId,
    },
  ];
}

const PYR_VEKT: Array<{ p: PyramidArea; vekt: number }> = [
  { p: "FYS", vekt: 1 },
  { p: "TEK", vekt: 2 },
  { p: "SLAG", vekt: 2 },
  { p: "SPILL", vekt: 2 },
  { p: "TURN", vekt: 1 },
];

const PRAKSIS: PracticeType[] = ["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"];

const TITLER: Record<PyramidArea, string[]> = {
  FYS: ["Styrke u-kropp", "Mobility", "Aerob økt"],
  TEK: ["Posisjon adresse", "Backswing-plan", "Impact-drill"],
  SLAG: ["Wedge 50–100m", "Driver shape", "Iron-distanser"],
  SPILL: ["Banespill 9 hull", "Strategi-runde", "Putting routine"],
  TURN: ["Turneringssimulering", "Pre-shot routine", "Mental rutine"],
};

function tilfeldigPyramide(seed: number): PyramidArea {
  const sum = PYR_VEKT.reduce((s, x) => s + x.vekt, 0);
  let t = ((seed * 9301 + 49297) % 233280) / 233280;
  t *= sum;
  for (const w of PYR_VEKT) {
    if (t < w.vekt) return w.p;
    t -= w.vekt;
  }
  return "TEK";
}

export function lagDemoOkter(uke: Date, spilllerId: string): DemoOkt[] {
  const ukeStart = startOfWeek(uke, { weekStartsOn: 1 });
  const okter: DemoOkt[] = [];
  // 4-6 økter spredt over uken
  const antall = 5;
  const tider = [
    { time: 9, varighet: 90 },
    { time: 14, varighet: 60 },
    { time: 16, varighet: 75 },
    { time: 10, varighet: 90 },
    { time: 15, varighet: 60 },
  ];
  for (let i = 0; i < antall; i++) {
    const dag = i % 6; // mandag–lørdag
    const slot = tider[i % tider.length];
    const start = addDays(ukeStart, dag);
    start.setHours(slot.time, 0, 0, 0);
    const end = new Date(start.getTime() + slot.varighet * 60_000);
    const pyramide = tilfeldigPyramide(
      ukeStart.getTime() / 86_400_000 + i + spilllerId.length,
    );
    const titler = TITLER[pyramide];
    const tittel = titler[i % titler.length];
    okter.push({
      id: `${spilllerId}-okt-${ukeStart.toISOString().slice(0, 10)}-${i}`,
      spilllerId,
      title: tittel,
      startTime: start,
      endTime: end,
      pyramide,
      practiceType: PRAKSIS[i % PRAKSIS.length],
      notes: i === 0 ? "Fokus på rytme og tempo" : undefined,
    });
  }
  return okter;
}

export function lagDemoOkterForMaaned(maaned: Date, spilllerId: string): DemoOkt[] {
  const okter: DemoOkt[] = [];
  // Fyll 5 uker for å dekke en månedsvisning
  const start = startOfWeek(new Date(maaned.getFullYear(), maaned.getMonth(), 1), {
    weekStartsOn: 1,
  });
  for (let u = 0; u < 6; u++) {
    okter.push(...lagDemoOkter(addDays(start, u * 7), spilllerId));
  }
  return okter;
}

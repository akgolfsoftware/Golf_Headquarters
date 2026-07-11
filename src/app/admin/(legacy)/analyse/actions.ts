"use server";

/**
 * Server-aggregering for Treningsanalyse (Masterplan Bølge 4).
 *
 * KJERNEPRINSIPP: Krysstabulering av all logget aktivitet. Samme treningsområde
 * ("Tee Total") kan trenes som TEK (teknikk), SLAG (golfslag) eller SPILL
 * (driving på bane) — tre helt ulike signaturer.
 *
 * Alle funksjoner krever ADMIN/COACH-rolle.
 */

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import type { PyramidArea } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type Periode = { from: Date; to: Date };

export type Dimensjon =
  | "pyramide"
  | "omraade"
  | "lFase"
  | "csNivaa"
  | "miljo"
  | "prPress"
  | "praksistype"
  | "componentFocus";

export type OversiktData = {
  totalMinutes: number;
  totalSessions: number;
  totalDrills: number;
  pyramidFordeling: Record<string, number>; // minutter per PyramidArea
  omraadeFordeling: Record<string, number>;
  miljoFordeling: Record<string, number>;
  csSnitt: number | null;
  praksistypeFordeling: Record<string, number>;
  fysTreningstypeFordeling: Record<string, number>;
  fysMuskelgruppeFordeling: Record<string, number>;
};

export type KrysstabellCelle = {
  rad: string;
  kolonne: string;
  minutter: number;
  drillCount: number;
};

export type KrysstabellData = {
  rader: string[];
  kolonner: string[];
  celler: KrysstabellCelle[];
  totalMinutter: number;
};

export type DrillUsage = {
  navn: string;
  pyramide: string;
  count: number;
  totalMinutter: number;
};

export type PlanVsActual = {
  pyramide: string;
  planlagtMin: number;
  faktiskMin: number;
  adherence: number; // 0-1
};

export type SGCouplingPunkt = {
  dato: string;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

export type TrendPunkt = {
  bucket: string; // "2026-W12" eller "2026-05"
  data: Record<string, number>;
};

export type FysProgresjonRad = {
  ovelse: string;
  muskelgruppe: string | null;
  treningstype: string | null;
  punkter: { dato: string; vektKg: number | null; reps: number | null }[];
};

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

async function guardOgValiderStudent(studentId: string): Promise<void> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!studentId || typeof studentId !== "string") {
    throw new Error("Ugyldig studentId.");
  }
}

function tomDrillsQuery(studentId: string, periode: Periode) {
  return {
    session: {
      studentId,
      startTime: { gte: periode.from, lte: periode.to },
    },
  };
}

function csNivaaTilTall(nivaa: string | null | undefined): number | null {
  if (!nivaa) return null;
  const m = /CS(\d+)/.exec(nivaa);
  return m ? Number(m[1]) : null;
}

function inc(map: Record<string, number>, key: string, value: number): void {
  map[key] = (map[key] ?? 0) + value;
}

function isoUkeNummer(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function maanedNummer(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Oversikt — KPI + alle fordelinger
// ---------------------------------------------------------------------------

export async function getAnalysisOverview(
  studentId: string,
  periode: Periode,
): Promise<OversiktData> {
  await guardOgValiderStudent(studentId);

  const drills = await prisma.trainingDrillV2.findMany({
    where: tomDrillsQuery(studentId, periode),
    select: {
      durationMinutes: true,
      pyramide: true,
      omraade: true,
      miljo: true,
      csNivaa: true,
      sessionId: true,
      fysTreningstype: true,
      fysMuskelgruppe: true,
      session: { select: { practiceType: true, miljo: true } },
    },
  });

  const pyramidFordeling: Record<string, number> = {};
  const omraadeFordeling: Record<string, number> = {};
  const miljoFordeling: Record<string, number> = {};
  const praksistypeFordeling: Record<string, number> = {};
  const fysTreningstypeFordeling: Record<string, number> = {};
  const fysMuskelgruppeFordeling: Record<string, number> = {};
  const csNivaer: number[] = [];
  const sessionIds = new Set<string>();

  for (const d of drills) {
    const min = d.durationMinutes;
    inc(pyramidFordeling, d.pyramide, min);
    if (d.omraade) inc(omraadeFordeling, d.omraade, min);
    const miljo = d.miljo ?? d.session.miljo;
    if (miljo) inc(miljoFordeling, miljo, min);
    inc(praksistypeFordeling, d.session.practiceType, min);
    if (d.fysTreningstype) inc(fysTreningstypeFordeling, d.fysTreningstype, min);
    if (d.fysMuskelgruppe) inc(fysMuskelgruppeFordeling, d.fysMuskelgruppe, min);
    const cs = csNivaaTilTall(d.csNivaa);
    if (cs !== null) csNivaer.push(cs);
    sessionIds.add(d.sessionId);
  }

  const totalMinutes = drills.reduce((s, d) => s + d.durationMinutes, 0);
  const csSnitt =
    csNivaer.length > 0
      ? Math.round(csNivaer.reduce((s, n) => s + n, 0) / csNivaer.length)
      : null;

  return {
    totalMinutes,
    totalSessions: sessionIds.size,
    totalDrills: drills.length,
    pyramidFordeling,
    omraadeFordeling,
    miljoFordeling,
    csSnitt,
    praksistypeFordeling,
    fysTreningstypeFordeling,
    fysMuskelgruppeFordeling,
  };
}

// ---------------------------------------------------------------------------
// Krysstabulering — to dimensjoner × minutter
// ---------------------------------------------------------------------------

function dimensjonsVerdi(
  d: {
    pyramide: PyramidArea;
    omraade: string | null;
    lFase: string | null;
    csNivaa: string | null;
    miljo: string | null;
    prPress: string | null;
    componentFocus: string | null;
    session: { practiceType: string; miljo: string };
  },
  dim: Dimensjon,
): string | null {
  switch (dim) {
    case "pyramide":
      return d.pyramide;
    case "omraade":
      return d.omraade ?? null;
    case "lFase":
      return d.lFase ?? null;
    case "csNivaa":
      return d.csNivaa ?? null;
    case "miljo":
      return d.miljo ?? d.session.miljo;
    case "prPress":
      return d.prPress ?? null;
    case "praksistype":
      return d.session.practiceType;
    case "componentFocus":
      return d.componentFocus ?? null;
  }
}

export async function getKrysstabulering(
  studentId: string,
  periode: Periode,
  dim1: Dimensjon,
  dim2: Dimensjon,
): Promise<KrysstabellData> {
  await guardOgValiderStudent(studentId);

  const drills = await prisma.trainingDrillV2.findMany({
    where: tomDrillsQuery(studentId, periode),
    select: {
      durationMinutes: true,
      pyramide: true,
      omraade: true,
      lFase: true,
      csNivaa: true,
      miljo: true,
      prPress: true,
      componentFocus: true,
      session: { select: { practiceType: true, miljo: true } },
    },
  });

  const cellMap = new Map<string, KrysstabellCelle>();
  const rader = new Set<string>();
  const kolonner = new Set<string>();
  let totalMinutter = 0;

  for (const d of drills) {
    const rad = dimensjonsVerdi(d, dim1);
    const kol = dimensjonsVerdi(d, dim2);
    if (!rad || !kol) continue;
    rader.add(rad);
    kolonner.add(kol);
    const key = `${rad}::${kol}`;
    const eks = cellMap.get(key);
    if (eks) {
      eks.minutter += d.durationMinutes;
      eks.drillCount += 1;
    } else {
      cellMap.set(key, {
        rad,
        kolonne: kol,
        minutter: d.durationMinutes,
        drillCount: 1,
      });
    }
    totalMinutter += d.durationMinutes;
  }

  return {
    rader: Array.from(rader).sort(),
    kolonner: Array.from(kolonner).sort(),
    celler: Array.from(cellMap.values()),
    totalMinutter,
  };
}

// ---------------------------------------------------------------------------
// Drill-bruk
// ---------------------------------------------------------------------------

export async function getDrillUsage(
  studentId: string,
  periode: Periode,
): Promise<DrillUsage[]> {
  await guardOgValiderStudent(studentId);

  const drills = await prisma.trainingDrillV2.findMany({
    where: tomDrillsQuery(studentId, periode),
    select: { name: true, pyramide: true, durationMinutes: true },
  });

  const map = new Map<string, DrillUsage>();
  for (const d of drills) {
    const key = `${d.name}::${d.pyramide}`;
    const eks = map.get(key);
    if (eks) {
      eks.count += 1;
      eks.totalMinutter += d.durationMinutes;
    } else {
      map.set(key, {
        navn: d.name,
        pyramide: d.pyramide,
        count: 1,
        totalMinutter: d.durationMinutes,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

// ---------------------------------------------------------------------------
// Plan vs faktisk
// ---------------------------------------------------------------------------

export async function getPlanVsActual(
  studentId: string,
  periode: Periode,
): Promise<PlanVsActual[]> {
  await guardOgValiderStudent(studentId);

  const planlagteDrills = await prisma.trainingDrillV2.findMany({
    where: {
      ...tomDrillsQuery(studentId, periode),
      session: {
        studentId,
        startTime: { gte: periode.from, lte: periode.to },
        isCoachCreated: true,
      },
    },
    select: { durationMinutes: true, pyramide: true, sessionId: true },
  });

  const faktiskeLogger = await prisma.drillLogV2.findMany({
    where: {
      loggedAt: { gte: periode.from, lte: periode.to },
      drill: {
        session: { studentId },
      },
    },
    select: {
      drill: { select: { pyramide: true, durationMinutes: true } },
    },
  });

  const planlagt: Record<string, number> = {};
  for (const d of planlagteDrills) inc(planlagt, d.pyramide, d.durationMinutes);

  const faktisk: Record<string, number> = {};
  for (const l of faktiskeLogger)
    inc(faktisk, l.drill.pyramide, l.drill.durationMinutes);

  const alle = new Set<string>([
    ...Object.keys(planlagt),
    ...Object.keys(faktisk),
  ]);

  return Array.from(alle).map((p) => ({
    pyramide: p,
    planlagtMin: planlagt[p] ?? 0,
    faktiskMin: faktisk[p] ?? 0,
    adherence:
      (planlagt[p] ?? 0) === 0
        ? 1
        : Math.min(1, (faktisk[p] ?? 0) / (planlagt[p] ?? 1)),
  }));
}

// ---------------------------------------------------------------------------
// SG-kobling (klikk på SG-trend mot trenings-tids-investering)
// ---------------------------------------------------------------------------

export async function getSGCoupling(
  studentId: string,
  periode: Periode,
): Promise<SGCouplingPunkt[]> {
  await guardOgValiderStudent(studentId);

  const runder = await prisma.round.findMany({
    where: {
      userId: studentId,
      playedAt: { gte: periode.from, lte: periode.to },
    },
    select: {
      playedAt: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
    },
    orderBy: { playedAt: "asc" },
  });

  return runder.map((r) => ({
    dato: r.playedAt.toISOString().slice(0, 10),
    sgTotal: r.sgTotal,
    sgOtt: r.sgOtt,
    sgApp: r.sgApp,
    sgArg: r.sgArg,
    sgPutt: r.sgPutt,
  }));
}

// ---------------------------------------------------------------------------
// Trend over tid
// ---------------------------------------------------------------------------

export async function getTrendData(
  studentId: string,
  periode: Periode,
  dim: Dimensjon,
  aggregering: "uke" | "maaned",
): Promise<TrendPunkt[]> {
  await guardOgValiderStudent(studentId);

  const drills = await prisma.trainingDrillV2.findMany({
    where: tomDrillsQuery(studentId, periode),
    select: {
      durationMinutes: true,
      pyramide: true,
      omraade: true,
      lFase: true,
      csNivaa: true,
      miljo: true,
      prPress: true,
      componentFocus: true,
      session: { select: { startTime: true, practiceType: true, miljo: true } },
    },
  });

  const bucketMap = new Map<string, Record<string, number>>();

  for (const d of drills) {
    const bucket =
      aggregering === "uke"
        ? isoUkeNummer(d.session.startTime)
        : maanedNummer(d.session.startTime);
    const verdi = dimensjonsVerdi(d, dim);
    if (!verdi) continue;
    if (!bucketMap.has(bucket)) bucketMap.set(bucket, {});
    inc(bucketMap.get(bucket)!, verdi, d.durationMinutes);
  }

  return Array.from(bucketMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([bucket, data]) => ({ bucket, data }));
}

// ---------------------------------------------------------------------------
// FYS-progresjon — vekt og reps per øvelse over tid
// ---------------------------------------------------------------------------

export async function getFysProgression(
  studentId: string,
  periode: Periode,
): Promise<FysProgresjonRad[]> {
  await guardOgValiderStudent(studentId);

  const drills = await prisma.trainingDrillV2.findMany({
    where: {
      ...tomDrillsQuery(studentId, periode),
      pyramide: "FYS",
      fysOvelse: { not: null },
    },
    select: {
      fysOvelse: true,
      fysMuskelgruppe: true,
      fysTreningstype: true,
      fysVektKg: true,
      fysReps: true,
      session: { select: { startTime: true } },
    },
    orderBy: { session: { startTime: "asc" } },
  });

  const map = new Map<string, FysProgresjonRad>();
  for (const d of drills) {
    if (!d.fysOvelse) continue;
    if (!map.has(d.fysOvelse)) {
      map.set(d.fysOvelse, {
        ovelse: d.fysOvelse,
        muskelgruppe: d.fysMuskelgruppe,
        treningstype: d.fysTreningstype,
        punkter: [],
      });
    }
    map.get(d.fysOvelse)!.punkter.push({
      dato: d.session.startTime.toISOString().slice(0, 10),
      vektKg: d.fysVektKg,
      reps: d.fysReps,
    });
  }

  return Array.from(map.values())
    .sort((a, b) => b.punkter.length - a.punkter.length)
    .slice(0, 10);
}

// ---------------------------------------------------------------------------
// Hent økter knyttet til en celle (for drill-down i krysstabellen)
// ---------------------------------------------------------------------------

export type CelleSession = {
  id: string;
  title: string;
  startTime: string;
  totalMin: number;
  drillCount: number;
};

export async function getCelleSessions(
  studentId: string,
  periode: Periode,
  dim1: Dimensjon,
  rad: string,
  dim2: Dimensjon,
  kolonne: string,
): Promise<CelleSession[]> {
  await guardOgValiderStudent(studentId);

  const drills = await prisma.trainingDrillV2.findMany({
    where: tomDrillsQuery(studentId, periode),
    select: {
      durationMinutes: true,
      pyramide: true,
      omraade: true,
      lFase: true,
      csNivaa: true,
      miljo: true,
      prPress: true,
      componentFocus: true,
      session: {
        select: {
          id: true,
          title: true,
          startTime: true,
          practiceType: true,
          miljo: true,
        },
      },
    },
  });

  const sessionMap = new Map<string, CelleSession>();
  for (const d of drills) {
    if (dimensjonsVerdi(d, dim1) !== rad) continue;
    if (dimensjonsVerdi(d, dim2) !== kolonne) continue;
    const s = d.session;
    const eks = sessionMap.get(s.id);
    if (eks) {
      eks.totalMin += d.durationMinutes;
      eks.drillCount += 1;
    } else {
      sessionMap.set(s.id, {
        id: s.id,
        title: s.title,
        startTime: s.startTime.toISOString(),
        totalMin: d.durationMinutes,
        drillCount: 1,
      });
    }
  }

  return Array.from(sessionMap.values()).sort((a, b) =>
    b.startTime.localeCompare(a.startTime),
  );
}

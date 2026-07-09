"use server";

// Server actions for analyse-siden — KPI-er, krysstabeller og trender.
// Aggregerer TrainingSessionV2 + TrainingDrillV2 i datointervaller.

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import type { PyramidArea, PracticeType, LFase, CSNivaa } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Skjemaer
// ---------------------------------------------------------------------------

const IntervallSchema = z.object({
  spilllerId: z.string().cuid(),
  fra: z.coerce.date(),
  til: z.coerce.date(),
});

const KrysstabellSchema = IntervallSchema.extend({
  dim1: z.enum(["PYRAMIDE", "PRAKSISTYPE", "LFASE", "MILJO", "UKEDAG"]),
  dim2: z.enum(["PYRAMIDE", "PRAKSISTYPE", "LFASE", "MILJO", "UKEDAG"]),
});

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type Dimensjon = "PYRAMIDE" | "PRAKSISTYPE" | "LFASE" | "MILJO" | "UKEDAG";

export type OversiktKpi = {
  antallOkter: number;
  totalMinutter: number;
  snittMinutterPerOkt: number;
  pyramideFordeling: Record<PyramidArea, number>;
  praksisFordeling: Record<PracticeType, number>;
  uniqueDager: number;
};

export type KrysstabellCelle = {
  dim1Verdi: string;
  dim2Verdi: string;
  antall: number;
  minutter: number;
};

export type TrendPunkt = {
  uke: string;          // "2026-W18"
  totalMinutter: number;
  fordeling: Record<PyramidArea, number>;
};

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

function isoUke(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week.toString().padStart(2, "0")}`;
}

function tomPyramide(): Record<PyramidArea, number> {
  return { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
}

function tomPraksis(): Record<PracticeType, number> {
  return { BLOKK: 0, RANDOM: 0, KONKURRANSE: 0, SPILL_TEST: 0 };
}

function ukedagNavn(d: Date): string {
  const navn = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
  return navn[d.getDay()] ?? "Ukjent";
}

function dimVerdi(
  dim: Dimensjon,
  ctx: { pyramide: PyramidArea; practiceType: PracticeType; lFase: LFase | null; csNivaa: CSNivaa | null; miljo: string; startTime: Date },
): string {
  switch (dim) {
    case "PYRAMIDE":
      return ctx.pyramide;
    case "PRAKSISTYPE":
      return ctx.practiceType;
    case "LFASE":
      return ctx.lFase ?? "—";
    case "MILJO":
      return ctx.miljo;
    case "UKEDAG":
      return ukedagNavn(ctx.startTime);
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function hentOversikt(
  spilllerId: string,
  fra: Date,
  til: Date,
): Promise<OversiktKpi> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = IntervallSchema.parse({ spilllerId, fra, til });

  const okter = await prisma.trainingSessionV2.findMany({
    where: {
      studentId: parsed.spilllerId,
      startTime: { gte: parsed.fra, lte: parsed.til },
    },
    include: { drills: true },
  });

  let totalMinutter = 0;
  const pyramideFordeling = tomPyramide();
  const praksisFordeling = tomPraksis();
  const dager = new Set<string>();

  for (const okt of okter) {
    const minutter = okt.drills.reduce((s, d) => s + d.durationMinutes, 0);
    totalMinutter += minutter;
    praksisFordeling[okt.practiceType] += minutter;
    for (const drill of okt.drills) {
      pyramideFordeling[drill.pyramide] += drill.durationMinutes;
    }
    dager.add(okt.startTime.toISOString().slice(0, 10));
  }

  return {
    antallOkter: okter.length,
    totalMinutter,
    snittMinutterPerOkt: okter.length === 0 ? 0 : Math.round(totalMinutter / okter.length),
    pyramideFordeling,
    praksisFordeling,
    uniqueDager: dager.size,
  };
}

export async function hentKrysstabell(
  spilllerId: string,
  fra: Date,
  til: Date,
  dim1: Dimensjon,
  dim2: Dimensjon,
): Promise<KrysstabellCelle[]> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = KrysstabellSchema.parse({ spilllerId, fra, til, dim1, dim2 });

  const okter = await prisma.trainingSessionV2.findMany({
    where: {
      studentId: parsed.spilllerId,
      startTime: { gte: parsed.fra, lte: parsed.til },
    },
    include: { drills: true },
  });

  const bucket = new Map<string, KrysstabellCelle>();

  for (const okt of okter) {
    for (const drill of okt.drills) {
      const ctx = {
        pyramide: drill.pyramide,
        practiceType: okt.practiceType,
        lFase: drill.lFase,
        csNivaa: drill.csNivaa,
        miljo: drill.miljo ?? okt.miljo,
        startTime: okt.startTime,
      };
      const v1 = dimVerdi(parsed.dim1, ctx);
      const v2 = dimVerdi(parsed.dim2, ctx);
      const key = `${v1}|${v2}`;
      const eks = bucket.get(key);
      if (eks) {
        eks.antall += 1;
        eks.minutter += drill.durationMinutes;
      } else {
        bucket.set(key, { dim1Verdi: v1, dim2Verdi: v2, antall: 1, minutter: drill.durationMinutes });
      }
    }
  }

  return Array.from(bucket.values()).sort((a, b) => {
    if (a.dim1Verdi !== b.dim1Verdi) return a.dim1Verdi.localeCompare(b.dim1Verdi);
    return a.dim2Verdi.localeCompare(b.dim2Verdi);
  });
}

export async function hentTrender(
  spilllerId: string,
  fra: Date,
  til: Date,
): Promise<TrendPunkt[]> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = IntervallSchema.parse({ spilllerId, fra, til });

  const okter = await prisma.trainingSessionV2.findMany({
    where: {
      studentId: parsed.spilllerId,
      startTime: { gte: parsed.fra, lte: parsed.til },
    },
    include: { drills: true },
  });

  const ukeBucket = new Map<string, TrendPunkt>();
  for (const okt of okter) {
    const uke = isoUke(okt.startTime);
    let punkt = ukeBucket.get(uke);
    if (!punkt) {
      punkt = { uke, totalMinutter: 0, fordeling: tomPyramide() };
      ukeBucket.set(uke, punkt);
    }
    for (const drill of okt.drills) {
      punkt.totalMinutter += drill.durationMinutes;
      punkt.fordeling[drill.pyramide] += drill.durationMinutes;
    }
  }

  return Array.from(ukeBucket.values()).sort((a, b) => a.uke.localeCompare(b.uke));
}

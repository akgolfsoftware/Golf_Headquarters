"use server";

// Server actions for perioder.
//
// MERK: Domenet modellerer perioder gjennom `PeriodBlock` (FK til SeasonPlan).
// `PeriodBlock` bruker den eldre `LPhase`-enumen (GRUNN/SPESIAL/TURNERING) som
// dekker tre av de fem `PeriodeType`-verdiene v4-taksonomien legger til
// (EVALUERING og FERIE). Vi mapper begge veier og lagrer `PeriodeType` i
// `notes`-feltet inntil schemaet utvides.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PeriodeTypeSchema } from "@/lib/portal/training/ak-taxonomy";
import type { PeriodBlock } from "@/generated/prisma/client";
import {
  TIL_LPHASE,
  leggTilPeriodeMarkor,
  lesPeriodeType,
} from "../lib/periode-helpers";

// ---------------------------------------------------------------------------
// Skjemaer
// ---------------------------------------------------------------------------

const OpprettSchema = z.object({
  planId: z.string().cuid(),
  type: PeriodeTypeSchema,
  fra: z.coerce.date(),
  til: z.coerce.date(),
  focus: z.string().max(200).optional(),
  weeklyVolMin: z.number().int().min(0).optional(),
  weeklyVolMax: z.number().int().min(0).optional(),
  notater: z.string().max(1000).optional(),
});

const OppdaterSchema = OpprettSchema.partial().omit({ planId: true });

// ---------------------------------------------------------------------------
// Returtyper
// ---------------------------------------------------------------------------

export type PeriodeResultat = { ok: true; periode: PeriodBlock } | { ok: false; feil: string };
export type SlettResultat = { ok: true } | { ok: false; feil: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hentEllerOpprettSeasonPlan(userId: string, dato: Date): Promise<string> {
  const aar = dato.getFullYear();
  const eksisterende = await prisma.seasonPlan.findUnique({
    where: { userId_year: { userId, year: aar } },
  });
  if (eksisterende) return eksisterende.id;
  const ny = await prisma.seasonPlan.create({
    data: {
      userId,
      year: aar,
      name: `Sesong ${aar}`,
      startDate: new Date(aar, 0, 1),
      endDate: new Date(aar, 11, 31),
    },
  });
  return ny.id;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function opprettPeriode(input: z.input<typeof OpprettSchema>): Promise<PeriodeResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OpprettSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  // PeriodBlock henger på SeasonPlan; finn SeasonPlan via TrainingPlan.userId og år.
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: data.planId },
    select: { userId: true },
  });
  if (!plan) return { ok: false, feil: "Plan finnes ikke" };

  const seasonPlanId = await hentEllerOpprettSeasonPlan(plan.userId, data.fra);

  const periode = await prisma.periodBlock.create({
    data: {
      seasonPlanId,
      lPhase: TIL_LPHASE[data.type],
      startDate: data.fra,
      endDate: data.til,
      focus: data.focus ?? null,
      weeklyVolMin: data.weeklyVolMin ?? null,
      weeklyVolMax: data.weeklyVolMax ?? null,
      notes: leggTilPeriodeMarkor(data.type, data.notater),
    },
  });

  await audit({
    actorId: bruker.id,
    action: "periode.create",
    target: periode.id,
    metadata: { planId: data.planId, type: data.type },
  });
  revalidatePath("/admin/kalender");
  return { ok: true, periode };
}

export async function oppdaterPeriode(
  id: string,
  input: z.input<typeof OppdaterSchema>,
): Promise<PeriodeResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OppdaterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const eksisterende = await prisma.periodBlock.findUnique({ where: { id } });
  if (!eksisterende) return { ok: false, feil: "Periode finnes ikke" };

  const nyType = data.type ?? lesPeriodeType(eksisterende);

  const periode = await prisma.periodBlock.update({
    where: { id },
    data: {
      ...(data.type && { lPhase: TIL_LPHASE[data.type] }),
      ...(data.fra && { startDate: data.fra }),
      ...(data.til && { endDate: data.til }),
      ...(data.focus !== undefined && { focus: data.focus ?? null }),
      ...(data.weeklyVolMin !== undefined && { weeklyVolMin: data.weeklyVolMin ?? null }),
      ...(data.weeklyVolMax !== undefined && { weeklyVolMax: data.weeklyVolMax ?? null }),
      ...(data.notater !== undefined && { notes: leggTilPeriodeMarkor(nyType, data.notater) }),
    },
  });

  await audit({
    actorId: bruker.id,
    action: "periode.update",
    target: id,
  });
  revalidatePath("/admin/kalender");
  return { ok: true, periode };
}

export async function slettPeriode(id: string): Promise<SlettResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  try {
    await prisma.periodBlock.delete({ where: { id } });
    await audit({
      actorId: bruker.id,
      action: "periode.delete",
      target: id,
    });
    revalidatePath("/admin/kalender");
    return { ok: true };
  } catch (err) {
    console.error("[perioder.slettPeriode]", err);
    return { ok: false, feil: "Kunne ikke slette periode" };
  }
}

export async function hentPerioder(planId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { userId: true },
  });
  if (!plan) return [];
  const seasonPlaner = await prisma.seasonPlan.findMany({
    where: { userId: plan.userId },
    include: { periodBlocks: { orderBy: { startDate: "asc" } } },
  });
  return seasonPlaner.flatMap((sp) =>
    sp.periodBlocks.map((b) => ({
      id: b.id,
      type: lesPeriodeType(b),
      fra: b.startDate,
      til: b.endDate,
      focus: b.focus,
      weeklyVolMin: b.weeklyVolMin,
      weeklyVolMax: b.weeklyVolMax,
    })),
  );
}

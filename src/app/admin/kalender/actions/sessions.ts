"use server";

// Server actions for TrainingSessionV2 (treningsøkter i kalenderen).
// CRUD + bulk-generering via session-generator.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { genererOkter } from "@/lib/portal/training/session-generator";
import type {
  TrainingSessionV2,
  PyramidArea,
  PracticeType,
  MMiljo,
} from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Skjemaer
// ---------------------------------------------------------------------------

const OpprettSchema = z.object({
  title: z.string().min(1).max(120),
  studentId: z.string().cuid().nullable(),
  groupId: z.string().cuid().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  miljo: z.enum(["M0", "M1", "M2", "M3", "M4", "M5"]),
  practiceType: z.enum(["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"]),
  notes: z.string().max(1000).nullable().optional(),
  drillLoggInterval: z.number().int().min(1).max(20).optional(),
});

const OppdaterSchema = OpprettSchema.partial();

const BulkSchema = z.object({
  planId: z.string().cuid(),
  fra: z.coerce.date(),
  til: z.coerce.date(),
});

// ---------------------------------------------------------------------------
// Returtyper
// ---------------------------------------------------------------------------

export type OpprettResultat = { ok: true; okt: TrainingSessionV2 } | { ok: false; feil: string };
export type OppdaterResultat = { ok: true; okt: TrainingSessionV2 } | { ok: false; feil: string };
export type SlettResultat = { ok: true } | { ok: false; feil: string };
export type BulkResultat =
  | { ok: true; antallOpprettet: number; hoppetOver: number }
  | { ok: false; feil: string };

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function opprettOkt(input: z.input<typeof OpprettSchema>): Promise<OpprettResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OpprettSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const okt = await prisma.trainingSessionV2.create({
    data: {
      title: data.title,
      studentId: data.studentId,
      groupId: data.groupId,
      coachId: bruker.id,
      startTime: data.startTime,
      endTime: data.endTime,
      miljo: data.miljo as MMiljo,
      practiceType: data.practiceType as PracticeType,
      notes: data.notes ?? null,
      drillLoggInterval: data.drillLoggInterval ?? 1,
      isCoachCreated: true,
    },
  });

  await audit({
    actorId: bruker.id,
    action: "training_session_v2.create",
    target: okt.id,
    metadata: { studentId: data.studentId, title: data.title },
  });

  revalidatePath("/admin/kalender");
  return { ok: true, okt };
}

export async function oppdaterOkt(
  id: string,
  input: z.input<typeof OppdaterSchema>,
): Promise<OppdaterResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OppdaterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data = parsed.data;

  const okt = await prisma.trainingSessionV2.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.studentId !== undefined && { studentId: data.studentId }),
      ...(data.groupId !== undefined && { groupId: data.groupId }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.miljo !== undefined && { miljo: data.miljo as MMiljo }),
      ...(data.practiceType !== undefined && { practiceType: data.practiceType as PracticeType }),
      ...(data.notes !== undefined && { notes: data.notes ?? null }),
      ...(data.drillLoggInterval !== undefined && { drillLoggInterval: data.drillLoggInterval }),
    },
  });

  await audit({
    actorId: bruker.id,
    action: "training_session_v2.update",
    target: id,
    metadata: JSON.parse(JSON.stringify(data)),
  });

  revalidatePath("/admin/kalender");
  return { ok: true, okt };
}

export async function slettOkt(id: string): Promise<SlettResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  try {
    await prisma.trainingSessionV2.delete({ where: { id } });
    await audit({
      actorId: bruker.id,
      action: "training_session_v2.delete",
      target: id,
    });
    revalidatePath("/admin/kalender");
    return { ok: true };
  } catch (err) {
    console.error("[sessions.slettOkt]", err);
    return { ok: false, feil: "Kunne ikke slette økt" };
  }
}

export async function bulkGenererOkter(
  input: z.input<typeof BulkSchema>,
): Promise<BulkResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = BulkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: parsed.data.planId },
    select: { userId: true },
  });
  if (!plan) return { ok: false, feil: "Plan finnes ikke" };

  const resultat = await genererOkter({
    planId: parsed.data.planId,
    startDato: parsed.data.fra,
    sluttDato: parsed.data.til,
    spilllerId: plan.userId,
  });

  await audit({
    actorId: bruker.id,
    action: "training_session_v2.bulk_generate",
    target: parsed.data.planId,
    metadata: {
      antallOpprettet: resultat.okter.length,
      hoppetOver: resultat.hoppetOver.length,
      fra: parsed.data.fra.toISOString(),
      til: parsed.data.til.toISOString(),
    },
  });

  revalidatePath("/admin/kalender");
  return {
    ok: true,
    antallOpprettet: resultat.okter.length,
    hoppetOver: resultat.hoppetOver.length,
  };
}

// Hjelp for callere som vil hente økter i et intervall (read-helper, ikke action).
export async function hentOkter(spilllerId: string, fra: Date, til: Date) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return prisma.trainingSessionV2.findMany({
    where: { studentId: spilllerId, startTime: { gte: fra, lte: til } },
    include: { drills: true },
    orderBy: { startTime: "asc" },
  });
}

// Eksporter typer for konsumenter
export type { PyramidArea, PracticeType, MMiljo };

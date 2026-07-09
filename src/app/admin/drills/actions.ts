"use server";

// CoachHQ — Drill-redaktør server actions
// CRUD for ExerciseDefinition. Bare COACH/ADMIN. Zod-validert input,
// audit-loggført, og revalidatePath på alle mutasjoner.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import {
  PyramidArea,
  LPhase,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string };

const PyramidAreaEnum = z.enum([
  PyramidArea.FYS,
  PyramidArea.TEK,
  PyramidArea.SLAG,
  PyramidArea.SPILL,
  PyramidArea.TURN,
]);

const LPhaseEnum = z.enum([LPhase.GRUNN, LPhase.SPESIAL, LPhase.TURNERING]);

const SkillAreaEnum = z.enum([
  SkillArea.TEE_TOTAL,
  SkillArea.TILNAERMING,
  SkillArea.AROUND_GREEN,
  SkillArea.PUTTING,
  SkillArea.SPILL,
]);

const NgfKategoriEnum = z.enum([
  NgfKategori.A,
  NgfKategori.B,
  NgfKategori.C,
  NgfKategori.D,
  NgfKategori.E,
  NgfKategori.F,
  NgfKategori.G,
  NgfKategori.H,
  NgfKategori.I,
  NgfKategori.J,
  NgfKategori.K,
  NgfKategori.L,
]);

const SessionEnvironmentEnum = z.enum([
  SessionEnvironment.RANGE,
  SessionEnvironment.BANE,
  SessionEnvironment.STUDIO,
  SessionEnvironment.HJEM,
  SessionEnvironment.SIMULATOR,
  SessionEnvironment.GYM,
]);

// csTargetByKategori: {A: 95, B: 90, ...} — alle kategorier optional
const CsTargetByKategoriSchema = z
  .record(NgfKategoriEnum, z.number().int().min(0).max(100).optional())
  .optional()
  .nullable();

const DrillInputSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(200),
  description: z.string().max(5000).optional().nullable(),
  videoUrl: z.string().url().or(z.literal("")).optional().nullable(),
  pyramidArea: PyramidAreaEnum,
  lPhase: LPhaseEnum.optional().nullable(),
  defaultRepsSets: z.string().max(80).optional().nullable(),
  csMin: z.number().int().min(0).max(100).optional().nullable(),
  csMax: z.number().int().min(0).max(100).optional().nullable(),
  durationMin: z.number().int().min(1).max(600).optional().nullable(),

  skillArea: SkillAreaEnum.optional().nullable(),
  minKategori: NgfKategoriEnum.optional().nullable(),
  maxKategori: NgfKategoriEnum.optional().nullable(),
  minHcp: z.number().min(-10).max(54).optional().nullable(),
  maxHcp: z.number().min(-10).max(54).optional().nullable(),

  environment: z.array(SessionEnvironmentEnum).default([]),
  utstyr: z.array(z.string().min(1).max(80)).default([]),
  intensitet: z.number().int().min(1).max(10).optional().nullable(),
  lPhases: z.array(LPhaseEnum).default([]),
  morad: z.boolean().default(false),

  prerequisites: z.array(z.string().min(1).max(80)).default([]),
  tags: z.array(z.string().min(1).max(40)).default([]),
  coachNotes: z.string().max(5000).optional().nullable(),
  kilde: z.string().max(200).optional().nullable(),

  defaultSets: z.number().int().min(1).max(50).optional().nullable(),
  defaultReps: z.number().int().min(1).max(500).optional().nullable(),
  csTargetByKategori: CsTargetByKategoriSchema,
});

export type DrillInput = z.infer<typeof DrillInputSchema>;

function toPrismaData(parsed: DrillInput) {
  return {
    name: parsed.name.trim(),
    description: parsed.description?.trim() || null,
    videoUrl: parsed.videoUrl ? parsed.videoUrl.trim() : null,
    pyramidArea: parsed.pyramidArea,
    lPhase: parsed.lPhase ?? null,
    defaultRepsSets: parsed.defaultRepsSets?.trim() || null,
    csMin: parsed.csMin ?? null,
    csMax: parsed.csMax ?? null,
    durationMin: parsed.durationMin ?? null,
    skillArea: parsed.skillArea ?? null,
    minKategori: parsed.minKategori ?? null,
    maxKategori: parsed.maxKategori ?? null,
    minHcp: parsed.minHcp ?? null,
    maxHcp: parsed.maxHcp ?? null,
    environment: parsed.environment,
    utstyr: parsed.utstyr,
    intensitet: parsed.intensitet ?? null,
    lPhases: parsed.lPhases,
    morad: parsed.morad,
    prerequisites: parsed.prerequisites,
    tags: parsed.tags,
    coachNotes: parsed.coachNotes?.trim() || null,
    kilde: parsed.kilde?.trim() || null,
    defaultSets: parsed.defaultSets ?? null,
    defaultReps: parsed.defaultReps ?? null,
    csTargetByKategori: parsed.csTargetByKategori
      ? (parsed.csTargetByKategori as Prisma.InputJsonValue)
      : Prisma.JsonNull,
  };
}

/* ─── createDrill ───────────────────────────────────────────────────── */

export async function createDrill(
  input: DrillInput,
): Promise<ActionResult<{ drillId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = DrillInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const ny = await prisma.exerciseDefinition.create({
      data: {
        ...toPrismaData(parsed.data),
        createdBy: user.id,
        source: "COACH",
        visibility: "COACH_PLAYERS",
      },
    });
    await audit({
      actorId: user.id,
      action: "drill.created",
      target: `ExerciseDefinition:${ny.id}`,
    });
    revalidatePath("/admin/drills");
    return { success: true, data: { drillId: ny.id } };
  } catch (err) {
    console.error("createDrill failed", err);
    return { error: "Kunne ikke opprette drill" };
  }
}

/* ─── updateDrill ───────────────────────────────────────────────────── */

export async function updateDrill(
  id: string,
  input: DrillInput,
): Promise<ActionResult<{ drillId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!id) return { error: "Mangler drill-ID" };

  const parsed = DrillInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }

  try {
    const finnes = await prisma.exerciseDefinition.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!finnes) return { error: "Drill ikke funnet" };

    await prisma.exerciseDefinition.update({
      where: { id },
      data: toPrismaData(parsed.data),
    });
    await audit({
      actorId: user.id,
      action: "drill.updated",
      target: `ExerciseDefinition:${id}`,
    });
    revalidatePath("/admin/drills");
    revalidatePath(`/admin/drills/${id}`);
    return { success: true, data: { drillId: id } };
  } catch (err) {
    console.error("updateDrill failed", err);
    return { error: "Kunne ikke lagre endringer" };
  }
}

/* ─── duplicateDrill ────────────────────────────────────────────────── */

export async function duplicateDrill(
  id: string,
): Promise<ActionResult<{ drillId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!id) return { error: "Mangler drill-ID" };

  try {
    const original = await prisma.exerciseDefinition.findUnique({ where: { id } });
    if (!original) return { error: "Drill ikke funnet" };

    const kopi = await prisma.exerciseDefinition.create({
      data: {
        name: `${original.name} (kopi)`,
        description: original.description,
        videoUrl: original.videoUrl,
        pyramidArea: original.pyramidArea,
        lPhase: original.lPhase,
        defaultRepsSets: original.defaultRepsSets,
        csMin: original.csMin,
        csMax: original.csMax,
        durationMin: original.durationMin,
        skillArea: original.skillArea,
        minKategori: original.minKategori,
        maxKategori: original.maxKategori,
        minHcp: original.minHcp,
        maxHcp: original.maxHcp,
        environment: original.environment,
        utstyr: original.utstyr,
        intensitet: original.intensitet,
        lPhases: original.lPhases,
        morad: original.morad,
        prerequisites: original.prerequisites,
        tags: original.tags,
        coachNotes: original.coachNotes,
        kilde: original.kilde,
        defaultSets: original.defaultSets,
        defaultReps: original.defaultReps,
        csTargetByKategori:
          original.csTargetByKategori === null
            ? Prisma.JsonNull
            : (original.csTargetByKategori as Prisma.InputJsonValue),
        parametersJson:
          original.parametersJson === null
            ? Prisma.JsonNull
            : (original.parametersJson as Prisma.InputJsonValue),
        createdBy: user.id,
        source: "COACH",
        visibility: "COACH_PLAYERS",
      },
    });
    await audit({
      actorId: user.id,
      action: "drill.duplicated",
      target: `ExerciseDefinition:${kopi.id}`,
    });
    revalidatePath("/admin/drills");
    return { success: true, data: { drillId: kopi.id } };
  } catch (err) {
    console.error("duplicateDrill failed", err);
    return { error: "Kunne ikke duplisere drill" };
  }
}

/* ─── deleteDrill ───────────────────────────────────────────────────── */

export async function deleteDrill(
  id: string,
): Promise<ActionResult<{ drillId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!id) return { error: "Mangler drill-ID" };

  try {
    const drill = await prisma.exerciseDefinition.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: { select: { sessionDrills: true } },
      },
    });
    if (!drill) return { error: "Drill ikke funnet" };

    if (drill._count.sessionDrills > 0) {
      return {
        error: `«${drill.name}» brukes i ${drill._count.sessionDrills} økt(er). Arkiver i stedet for å slette.`,
      };
    }

    await prisma.exerciseDefinition.delete({ where: { id } });
    await audit({
      actorId: user.id,
      action: "drill.deleted",
      target: `ExerciseDefinition:${id}`,
    });
    revalidatePath("/admin/drills");
    return { success: true, data: { drillId: id } };
  } catch (err) {
    console.error("deleteDrill failed", err);
    return { error: "Kunne ikke slette drill" };
  }
}

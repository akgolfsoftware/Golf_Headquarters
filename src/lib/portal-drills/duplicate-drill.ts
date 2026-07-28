"use server";

/**
 * Spillerens «Dupliser»-knapp i øvelsesbanken (/portal/drills). Lager en egen
 * PLAYER/PRIVATE-kopi av en hvilken som helst synlig øvelse (SYSTEM/COACH/egen)
 * — samme kopi-oppskrift som admin-varianten (duplicateDrill i
 * app/admin/(legacy)/drills/actions.ts), men uten COACH/ADMIN-gate og med alle
 * felt kopiert (inkl. fasilitetKrav, treningstype, imageUrl, muscleGroups som
 * admin-varianten mangler).
 */

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { ExerciseSource, ExerciseVisibility } from "@/generated/prisma/enums";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export type DuplicateDrillResult =
  | { ok: true; drillId: string }
  | { ok: false; error: string };

export async function duplicateDrillForPlayer(id: string): Promise<DuplicateDrillResult> {
  const user = await requirePortalUser();
  if (!id) return { ok: false, error: "Mangler øvelse-ID" };

  const original = await prisma.exerciseDefinition.findUnique({ where: { id } });
  if (!original) return { ok: false, error: "Øvelsen ble ikke funnet" };

  try {
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
        fasilitetKrav: original.fasilitetKrav,
        prerequisites: original.prerequisites,
        tags: original.tags,
        coachNotes: original.coachNotes,
        kilde: original.kilde,
        treningstype: original.treningstype,
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
        imageUrl: original.imageUrl,
        muscleGroups: original.muscleGroups,
        source: ExerciseSource.PLAYER,
        visibility: ExerciseVisibility.PRIVATE,
        createdBy: user.id,
      },
    });
    revalidatePath("/portal/drills");
    return { ok: true, drillId: kopi.id };
  } catch (err) {
    console.error("duplicateDrillForPlayer failed", err);
    return { ok: false, error: "Kunne ikke duplisere øvelsen" };
  }
}

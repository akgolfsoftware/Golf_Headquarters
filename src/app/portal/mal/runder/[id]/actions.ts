"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { ShotLie, ShotType, WindDir } from "@/generated/prisma/client";

export type ShotInput = {
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  club?: string;
  lie: ShotLie;
  distanceToPin?: number;
  distanceHit?: number;
  windDir?: WindDir;
  shotType: ShotType;
  isPenalty?: boolean;
  notes?: string;
};

async function assertRoundOwner(roundId: string, userId: string) {
  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round || round.userId !== userId) throw new Error("forbidden");
  return round;
}

export async function saveShot(roundId: string, input: ShotInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  await assertRoundOwner(roundId, user.id);

  await prisma.shot.upsert({
    where: {
      roundId_holeNumber_shotNumber: {
        roundId,
        holeNumber: input.holeNumber,
        shotNumber: input.shotNumber,
      },
    },
    create: {
      roundId,
      holeNumber: input.holeNumber,
      holePar: input.holePar,
      shotNumber: input.shotNumber,
      club: input.club ?? null,
      lie: input.lie,
      distanceToPin: input.distanceToPin ?? null,
      distanceHit: input.distanceHit ?? null,
      windDir: input.windDir ?? null,
      shotType: input.shotType,
      isPenalty: input.isPenalty ?? false,
      notes: input.notes ?? null,
    },
    update: {
      holePar: input.holePar,
      club: input.club ?? null,
      lie: input.lie,
      distanceToPin: input.distanceToPin ?? null,
      distanceHit: input.distanceHit ?? null,
      windDir: input.windDir ?? null,
      shotType: input.shotType,
      isPenalty: input.isPenalty ?? false,
      notes: input.notes ?? null,
    },
  });

  revalidatePath(`/portal/mal/runder/${roundId}`);
}

export async function deleteShot(roundId: string, shotId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  await assertRoundOwner(roundId, user.id);

  await prisma.shot.delete({ where: { id: shotId } });
  revalidatePath(`/portal/mal/runder/${roundId}`);
}

export async function importUpGameShots(
  roundId: string,
  shots: ShotInput[],
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  await assertRoundOwner(roundId, user.id);

  // Slett eksisterende slag og erstatt med importerte
  await prisma.shot.deleteMany({ where: { roundId } });
  if (shots.length > 0) {
    await prisma.shot.createMany({
      data: shots.map((s) => ({
        roundId,
        holeNumber: s.holeNumber,
        holePar: s.holePar,
        shotNumber: s.shotNumber,
        club: s.club ?? null,
        lie: s.lie,
        distanceToPin: s.distanceToPin ?? null,
        distanceHit: s.distanceHit ?? null,
        windDir: s.windDir ?? null,
        shotType: s.shotType,
        isPenalty: s.isPenalty ?? false,
        notes: s.notes ?? null,
      })),
    });
  }

  revalidatePath(`/portal/mal/runder/${roundId}`);
}

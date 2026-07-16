/**
 * Data-lag for Gameplan (B30, omdøpt fra "Baneguide"). Henter baner, hull og spillerens
 * slag-spredning, og kjører dispersion-motoren server-side.
 */
import { prisma } from "@/lib/prisma";
import { shotToCoords, type LatLng } from "./shot-coords";
import { computeDispersion, projectToAimFrame, type DispersionStats } from "./dispersion";
import type { ShotType } from "@/generated/prisma/client";

export type BaneLibraryItem = {
  id: string;
  slug: string;
  navn: string;
  klubb: string;
  holesMapped: number;
  hasGeometry: boolean;
  playerRounds: number;
};

/** Baner med geometri + om spilleren har spilt dem. */
export async function getBaneLibrary(userId: string): Promise<BaneLibraryItem[]> {
  const baner = await prisma.bane.findMany({
    include: {
      _count: { select: { holes: true } },
      courseDefinitions: { include: { rounds: { where: { userId }, select: { id: true } } } },
    },
    orderBy: { navn: "asc" },
  });
  return baner
    .map((b) => ({
      id: b.id,
      slug: b.slug,
      navn: b.navn,
      klubb: b.klubb,
      holesMapped: b._count.holes,
      hasGeometry: b._count.holes > 0,
      playerRounds: b.courseDefinitions.reduce((s, c) => s + c.rounds.length, 0),
    }))
    .filter((b) => b.hasGeometry || b.playerRounds > 0);
}

export type BaneOverview = Awaited<ReturnType<typeof getBaneOverview>>;

/** Bane + hull + spillerens slag-antall per hull. */
export async function getBaneOverview(baneId: string, userId: string) {
  const bane = await prisma.bane.findUnique({
    where: { id: baneId },
    include: { holes: { orderBy: { holeNumber: "asc" } } },
  });
  if (!bane) return null;

  const shots = await prisma.shot.findMany({
    where: { round: { userId, course: { baneId } }, startX: { not: null } },
    select: { holeNumber: true },
  });
  const perHole = new Map<number, number>();
  for (const s of shots) perHole.set(s.holeNumber, (perHole.get(s.holeNumber) ?? 0) + 1);

  return {
    bane,
    holes: bane.holes.map((h) => ({ ...h, shotCount: perHole.get(h.holeNumber) ?? 0 })),
    parSum: bane.holes.reduce((s, h) => s + (h.par ?? 0), 0),
  };
}

export type HoleDetail = Awaited<ReturnType<typeof getHoleDetail>>;

/** Ett hull + spillerens spredning (valgfritt filtrert på shot-type). */
export async function getHoleDetail(
  baneId: string,
  holeNumber: number,
  userId: string,
  shotType?: ShotType,
) {
  const [bane, hole] = await Promise.all([
    prisma.bane.findUnique({ where: { id: baneId }, select: { id: true, navn: true, slug: true, geojson: true, latitude: true, longitude: true } }),
    prisma.courseHole.findUnique({ where: { baneId_holeNumber: { baneId, holeNumber } } }),
  ]);
  if (!bane || !hole) return null;

  const shots = await prisma.shot.findMany({
    where: {
      round: { userId, course: { baneId } },
      holeNumber,
      endX: { not: null },
      ...(shotType ? { shotType } : {}),
    },
    select: { startX: true, startY: true, endX: true, endY: true },
  });

  const landings: LatLng[] = shots
    .map((s) => shotToCoords(s).end)
    .filter((e): e is LatLng => e != null);

  let stats: DispersionStats | null = null;
  const tee = hole.teeLat != null && hole.teeLng != null ? { lat: hole.teeLat, lng: hole.teeLng } : null;
  const green = hole.greenLat != null && hole.greenLng != null ? { lat: hole.greenLat, lng: hole.greenLng } : null;
  if (tee && green && landings.length > 0) {
    stats = computeDispersion(landings.map((l) => projectToAimFrame(l, tee, green)));
  }

  return { bane, hole, tee, green, landings, stats };
}

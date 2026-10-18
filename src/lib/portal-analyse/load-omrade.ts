import "server-only";
import { prisma } from "@/lib/prisma";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { tilDatoKolonne } from "@/lib/workbench/wb-map";
import { PGA_REFERANSE } from "./ph16-stats-data";
import { SG_GRUPPE_INFO, type HullRadInn, type SgGruppe, type SgRundeInn } from "./omrade-data";

/**
 * Lesing for Ett område, Skill map og Hull (pakke 13). Bare spillerens egne rader; kalleren har
 * allerede sjekket innloggingen. Ingen demodata: feiler lesingen, går feilen til sidens feiltilstand.
 */

/** Rundene med SG per område mot PGA Tour, nyeste først. */
export async function hentSgRunder(userId: string): Promise<SgRundeInn[]> {
  return prisma.round.findMany({
    where: { userId, benchmarkLevelSnapshot: PGA_REFERANSE },
    orderBy: { playedAt: "desc" },
    take: 200,
    select: {
      playedAt: true, benchmarkLevelSnapshot: true, sgTee: true,
      sgApp200: true, sgApp150: true, sgApp100: true, sgApp50: true,
      sgChip: true, sgPitch: true, sgLob: true, sgBunker: true,
      sgPutt0_3: true, sgPutt3_5: true, sgPutt5_10: true, sgPutt10_15: true,
      sgPutt15_25: true, sgPutt25_40: true, sgPutt40plus: true,
    },
  });
}

/**
 * Gjennomført tid per SG-område fra `fra`: Workbench-økter med treningsområde og status gjennomført.
 * Økter uten treningsområde telles ikke.
 */
export async function hentTreningPerSone(userId: string, fra: Date, naa: Date): Promise<Record<SgGruppe, { min: number; okter: number }>> {
  const okter = await prisma.workbenchSession.findMany({
    where: {
      playerId: userId,
      status: "COMPLETED",
      hiddenByPlayer: false,
      isTemplate: false,
      date: { gte: tilDatoKolonne(OSLO_YMD_FMT.format(fra)), lte: tilDatoKolonne(OSLO_YMD_FMT.format(naa)) },
      skillArea: { in: Object.values(SG_GRUPPE_INFO).map((g) => g.skillArea) },
    },
    select: { skillArea: true, durationMinutes: true, actualMinutes: true },
  });
  const ut: Record<SgGruppe, { min: number; okter: number }> = {
    tee: { min: 0, okter: 0 }, innspill: { min: 0, okter: 0 }, naer: { min: 0, okter: 0 }, putt: { min: 0, okter: 0 },
  };
  for (const o of okter) {
    const g = (Object.keys(SG_GRUPPE_INFO) as SgGruppe[]).find((k) => SG_GRUPPE_INFO[k].skillArea === o.skillArea);
    if (!g) continue;
    ut[g].okter += 1;
    ut[g].min += Math.max(0, o.actualMinutes ?? o.durationMinutes);
  }
  return ut;
}

/** Hullscore på tvers av spillerens runder, med bane og dato. */
export async function hentHullRader(userId: string): Promise<HullRadInn[]> {
  const rader = await prisma.holeScore.findMany({
    where: { round: { userId } },
    select: { holeNumber: true, par: true, strokes: true, roundId: true, round: { select: { playedAt: true, course: { select: { name: true } } } } },
  });
  return rader.map((r) => ({
    holeNumber: r.holeNumber, par: r.par, strokes: r.strokes, roundId: r.roundId,
    courseName: r.round.course.name, playedAt: r.round.playedAt,
  }));
}

/**
 * Synk tak-pakken fra DataGolf skill-ratings + approach-skill + rankings.
 * Bare navnene i TAK_ROSTER. Idempotent upsert.
 */
import { prisma } from "@/lib/prisma";
import {
  getApproachSkill,
  getDgRankings,
  getSkillRatings,
  type DGApproachSkillRow,
  type DGRankingRow,
  type DGSkillRatingRow,
} from "@/lib/datagolf/client";
import { bandFraApproachRad, visningsnavnFraDataGolf } from "@/lib/datagolf/tak";
import { TAK_ROSTER, TAK_ROSTER_IDS } from "@/lib/datagolf/tak-roster";

function num(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

function int(v: unknown): number | null {
  const n = num(v);
  return n === null ? null : Math.round(n);
}

function asOfFra(iso: string | undefined): Date {
  if (!iso) return new Date();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function syncDatagolfTak(): Promise<{
  roster: number;
  upserted: number;
  manglerSkill: number[];
  manglerApproach: number[];
  asOf: string;
}> {
  const [skills, ranks, approach] = await Promise.all([
    getSkillRatings("pga"),
    getDgRankings(),
    getApproachSkill("l24"),
  ]);

  const skillById = new Map<number, DGSkillRatingRow>();
  for (const p of skills) {
    if (typeof p.dg_id === "number") skillById.set(p.dg_id, p);
  }
  const rankById = new Map<number, DGRankingRow>();
  for (const p of ranks.rankings ?? []) {
    if (typeof p.dg_id === "number") rankById.set(p.dg_id, p);
  }
  const approachRows = approach.players ?? approach.data ?? [];
  const approachById = new Map<number, DGApproachSkillRow>();
  for (const p of approachRows) {
    if (typeof p.dg_id === "number") approachById.set(p.dg_id, p);
  }

  const asOf = asOfFra(approach.meta?.last_updated ?? approach.last_updated ?? ranks.last_updated);
  const manglerSkill: number[] = [];
  const manglerApproach: number[] = [];
  let upserted = 0;

  for (const rad of TAK_ROSTER) {
    const skill = skillById.get(rad.dgId);
    const rank = rankById.get(rad.dgId);
    if (!skill) {
      manglerSkill.push(rad.dgId);
      continue;
    }
    const approachRad = approachById.get(rad.dgId);
    if (!approachRad) manglerApproach.push(rad.dgId);

    const name =
      rad.displayName ??
      visningsnavnFraDataGolf(skill.player_name || rank?.player_name || String(rad.dgId));
    const data = {
      dgPlayerId: rad.dgId,
      name,
      country: rank?.country ?? skill.country ?? null,
      sortOrder: rad.sortOrder,
      formLabel: rad.formLabel,
      isActive: true,
      asOf,
      sgTotal: num(skill.sg_total),
      sgOtt: num(skill.sg_ott),
      sgApp: num(skill.sg_app),
      sgArg: num(skill.sg_arg),
      sgPutt: num(skill.sg_putt),
      drivingDistY: num(skill.driving_dist),
      drivingAcc: num(skill.driving_acc),
      dgRank: int(rank?.datagolf_rank),
      owgrRank: int(rank?.owgr_rank),
      primaryTour: rank?.primary_tour ?? null,
      source: "datagolf",
    };

    const tak = await prisma.datagolfTak.upsert({
      where: { dgPlayerId: rad.dgId },
      create: data,
      update: data,
    });

    if (approachRad) {
      const bands = bandFraApproachRad(approachRad as Record<string, unknown>);
      for (const b of bands) {
        await prisma.datagolfTakBand.upsert({
          where: {
            takId_band_lie: { takId: tak.id, band: b.band, lie: b.lie },
          },
          create: {
            takId: tak.id,
            band: b.band,
            lie: b.lie,
            proximityMeters: b.proximityMeters,
            sgPerShot: b.sgPerShot,
            girRate: b.girRate,
            goodShotRate: b.goodShotRate,
            shotCount: b.shotCount,
          },
          update: {
            proximityMeters: b.proximityMeters,
            sgPerShot: b.sgPerShot,
            girRate: b.girRate,
            goodShotRate: b.goodShotRate,
            shotCount: b.shotCount,
          },
        });
      }
    }
    upserted++;
  }

  await prisma.datagolfTak.updateMany({
    where: { dgPlayerId: { notIn: [...TAK_ROSTER_IDS] } },
    data: { isActive: false },
  });

  return {
    roster: TAK_ROSTER.length,
    upserted,
    manglerSkill,
    manglerApproach,
    asOf: asOf.toISOString(),
  };
}

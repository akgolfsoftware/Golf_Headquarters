/**
 * Synk tak-pakken fra DataGolf skill-ratings + approach-skill + rankings.
 * Alle spillere i skill-ratings. Seks utvalgte navn sorteres først. Idempotent upsert.
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
import { TAK_ROSTER } from "@/lib/datagolf/tak-roster";

function num(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

function int(v: unknown): number | null {
  const n = num(v);
  return n === null ? null : Math.round(n);
}

function asOfFra(iso: string | undefined): Date {
  if (!iso) throw new Error("DataGolf mangler kildedato.");
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error("DataGolf har ugyldig kildedato.");
  return d;
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

  const asOf = asOfFra(approach.meta?.last_updated ?? approach.last_updated);
  const manglerSkill: number[] = [];
  const manglerApproach: number[] = [];
  let upserted = 0;

  if (skillById.size === 0 || approachById.size === 0) {
    throw new Error("DataGolf-svar mangler spillere. Eksisterende referanser er beholdt.");
  }
  const roster = [...skillById.keys()].map((dgId, i) =>
    TAK_ROSTER.find(r => r.dgId === dgId) ?? { dgId, sortOrder: 100 + i, formLabel: null, displayName: undefined });
  for (const rad of roster) {
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

    const bands = approachRad ? bandFraApproachRad(approachRad as Record<string, unknown>) : [];
    // Profil og bånd byttes atomisk. En ny dato får aldri gamle bånd.
    await prisma.datagolfTak.upsert({
      where: { dgPlayerId: rad.dgId },
      create: { ...data, bands: { create: bands } },
      update: { ...data, bands: { deleteMany: {}, create: bands } },
    });
    upserted++;
  }

  await prisma.datagolfTak.updateMany({
    where: { dgPlayerId: { notIn: [...skillById.keys()] } },
    data: { isActive: false },
  });

  return {
    roster: roster.length,
    upserted,
    manglerSkill,
    manglerApproach,
    asOf: asOf.toISOString(),
  };
}

import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { AkFormelSchema } from "@/lib/domain/workbench/schemas";
import { MENGDE_ENHET, OvelseDetaljerLeseSchema, OvelseDetaljerSchema } from "@/lib/domain/workbench/ovelse-detaljer";
import { z } from "zod";
import { parseSessionBudget } from "@/lib/workbench/perioder";

export function anonymisertAkFormel(value: unknown) {
  const raw = z.record(z.string(), z.unknown()).safeParse(value);
  if (!raw.success) return {};
  const parsed = AkFormelSchema.pick({ pyramid: true, area: true }).safeParse(raw.data);
  if (!parsed.success) return {};
  const motorikk = AkFormelSchema.shape.motorikk.safeParse(raw.data.motorikk);
  const belastning = AkFormelSchema.shape.belastning.safeParse(raw.data.belastning);
  const press = AkFormelSchema.shape.press.safeParse(raw.data.press);
  const detaljer = z.record(z.string(), z.unknown()).safeParse(raw.data.detaljer);
  const mengde = OvelseDetaljerLeseSchema.shape.mengde.safeParse(detaljer.success ? detaljer.data.mengde : undefined);
  const segmenter = OvelseDetaljerSchema.shape.kondisjonssegmenter.safeParse(detaljer.success ? detaljer.data.kondisjonssegmenter : undefined);
  const utstyr = OvelseDetaljerSchema.shape.utstyr.safeParse(detaljer.success ? detaljer.data.utstyr : undefined);
  // Hele mal-objektet (inkludert ny malsetning) er fritekst og følger aldri med i anonymisert JSON.
  const tryggeDetaljer = {
    ...(mengde.success && mengde.data ? { mengde: mengde.data } : {}),
    ...(segmenter.success && segmenter.data?.length ? { kondisjonssegmenter: segmenter.data } : {}),
    ...(utstyr.success && utstyr.data?.length ? { utstyr: utstyr.data.map(u => ({ navn: "Anonymisert utstyr", ...(u.antall !== undefined ? { antall: u.antall } : {}) })) } : {}),
  };
  const { pyramid, area } = parsed.data;
  return { pyramid, area,
    ...(motorikk.success && motorikk.data ? { motorikk: motorikk.data } : {}),
    ...(belastning.success && belastning.data ? { belastning: belastning.data } : {}),
    ...(press.success && press.data ? { press: press.data } : {}),
    ...(Object.keys(tryggeDetaljer).length ? { detaljer: tryggeDetaljer } : {}),
    label: "Anonymisert øvelse" };
}

/** Innsyn leser bare subjektets egne rader, aldri andre medlemmer av en gruppe. */
export async function eksporterWorkbenchData(playerId: string) {
  const [sessions, physicalBlocks, physicalLogs, tournamentPlans, conflicts, calendarEvents] = await Promise.all([
    prisma.workbenchSession.findMany({ where: { playerId }, include: { drills: { orderBy: { sortOrder: "asc" } } } }),
    prisma.workbenchPhysicalBlock.findMany({ where: { playerId }, include: { weeks: { include: {
      sessions: { where: { playerId }, include: { exercises: { include: { logs: { where: { playerId } } } } } },
    } } } }),
    prisma.workbenchPhysicalLog.findMany({ where: { playerId } }),
    prisma.workbenchTournamentPlan.findMany({ where: { playerId }, include: {
      preparations: true, rounds: true, goals: true, evaluations: true,
      conflicts: { where: { playerId } },
    } }),
    prisma.workbenchPlanConflict.findMany({ where: { playerId } }),
    prisma.playerBusyBlock.findMany({ where: { userId: playerId } }),
  ]);
  return { sessions, physicalBlocks, physicalLogs, tournamentPlans, conflicts, calendarEvents };
}

/** Vasker fritekst/ugjennomsiktig JSON, men beholder tid, dose, score og tallfelter. */
export async function anonymiserWorkbenchData(playerId: string) {
  const session = { playerId };
  const block = { playerId };
  const plan = { playerId };
  const drills = await prisma.workbenchDrill.findMany({ where: { session }, select: { id: true, akFormel: true } });
  let drillCount = 0;
  for (const drill of drills) {
    const result = await prisma.workbenchDrill.updateMany({ where: { id: drill.id, session }, data: {
      title: "Anonymisert øvelse", description: null, techniqueFocus: null, akFormel: anonymisertAkFormel(drill.akFormel),
    } });
    drillCount += result.count;
  }
  const periods = await prisma.periodBlock.findMany({
    where: { seasonPlan: { userId: playerId } }, select: { id: true, weeklySessionBudget: true },
  });
  let periodCount = 0;
  for (const period of periods) {
    const result = await prisma.periodBlock.updateMany({
      where: { id: period.id, seasonPlan: { userId: playerId } },
      data: { focus: null, notes: null, weeklySessionBudget: parseSessionBudget(period.weeklySessionBudget) ?? Prisma.DbNull },
    });
    periodCount += result.count;
  }
  const goals = await prisma.workbenchTournamentGoal.findMany({ where: { plan }, select: { id: true, unit: true } });
  let goalCount = 0;
  for (const goal of goals) {
    const unit = z.enum(MENGDE_ENHET).safeParse(goal.unit);
    const result = await prisma.workbenchTournamentGoal.updateMany({ where: { id: goal.id, plan }, data: {
      title: "Anonymisert mål", unit: unit.success ? unit.data : null,
    } });
    goalCount += result.count;
  }
  const resultater = await Promise.all([
    prisma.seasonPlan.updateMany({ where: { userId: playerId }, data: { name: "Anonymisert årsplan", notes: null } }),
    prisma.tournamentEntry.updateMany({ where: { userId: playerId }, data: { manualName: null, category: null, notes: null, withdrawnReason: null } }),
    prisma.workbenchSession.updateMany({ where: session, data: {
      title: "Anonymisert økt", notes: null, location: null, rationale: null, maalsetning: null,
      liveSnapshot: Prisma.DbNull,
    } }),
    prisma.workbenchPhysicalBlock.updateMany({ where: block, data: { title: "Anonymisert treningsblokk", focus: null, notes: null } }),
    prisma.workbenchPhysicalWeek.updateMany({ where: { block }, data: { label: "Anonymisert uke", notes: null, readinessSummary: Prisma.DbNull } }),
    prisma.workbenchPhysicalSession.updateMany({ where: session, data: { title: "Anonymisert fysisk økt", location: null, playerNote: null } }),
    prisma.workbenchPhysicalExercise.updateMany({ where: { session }, data: { title: "Anonymisert øvelse", note: null, tempo: null } }),
    prisma.workbenchPhysicalLog.updateMany({ where: { playerId }, data: { note: null } }),
    prisma.workbenchTournamentPlan.updateMany({ where: plan, data: { title: "Anonymisert turneringsplan", notes: null, format: null, tour: null, country: null, location: null, wagrSource: null } }),
    prisma.workbenchTournamentPreparation.updateMany({ where: { plan }, data: { title: "Anonymisert forberedelse", notes: null } }),
    prisma.workbenchTournamentRound.updateMany({ where: { plan }, data: { startHole: null, routine: null, gamePlan: null, notes: null, source: null } }),
    prisma.workbenchTournamentEvaluation.updateMany({ where: { plan }, data: { summary: null, learnings: null, nextAction: null, source: null } }),
    prisma.workbenchPlanConflict.updateMany({ where: { playerId }, data: { title: "Anonymisert plankonflikt", details: null } }),
    prisma.playerBusyBlock.updateMany({ where: { userId: playerId }, data: { title: "Opptatt", note: null, kind: "ANNET" } }),
  ]);
  return drillCount + periodCount + goalCount + resultater.reduce((sum, resultat) => sum + resultat.count, 0);
}

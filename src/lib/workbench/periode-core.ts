/**
 * 8c.2 — periode-kjerne for årsplan-canvaset: opprett/oppdater/slett
 * PeriodBlock for én spiller. SeasonPlan auto-opprettes for startdatoens år
 * ved første periode. Delt av spiller-action (portal) og coach-action
 * (session-actions) — guards bor i wrapperne, kjernen antar autorisert
 * userId (samme mønster som apply-template-actions/duplicate-week).
 */

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PeriodeInputSchema, type PeriodeInput } from "@/lib/workbench/perioder";

/** YYYY-MM-DD → lokal Date (00:00). Aldri new Date("YYYY-MM-DD") (UTC-fella). */
function lokalDag(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function tilData(input: PeriodeInput) {
  const budsjett = input.budsjett && Object.keys(input.budsjett).length > 0 ? input.budsjett : null;
  return {
    lPhase: input.lPhase,
    startDate: lokalDag(input.startDato),
    endDate: lokalDag(input.sluttDato),
    focus: input.fokus || null,
    weeklyVolMin: input.ukevolumMin ?? null,
    weeklyVolMax: input.ukevolumMax ?? null,
    // Prisma.DbNull nullstiller Json?-feltet ved update (undefined = «ikke rør»).
    // Leses tilbake som null — parseSessionBudget håndterer det.
    weeklySessionBudget: budsjett ?? Prisma.DbNull,
  };
}

export async function opprettPeriodeCore(
  userId: string,
  rawInput: unknown,
): Promise<{ ok: boolean; periodeId?: string; error?: string }> {
  const parsed = PeriodeInputSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Ugyldig periode-input" };
  const input = parsed.data;
  const year = lokalDag(input.startDato).getFullYear();

  let plan = await prisma.seasonPlan.findFirst({ where: { userId, year }, select: { id: true } });
  if (!plan) {
    plan = await prisma.seasonPlan.create({
      data: {
        userId,
        year,
        name: `Sesong ${year}`,
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31),
      },
      select: { id: true },
    });
  }

  const blokk = await prisma.periodBlock.create({
    data: { seasonPlanId: plan.id, ...tilData(input) },
    select: { id: true },
  });
  return { ok: true, periodeId: blokk.id };
}

export async function oppdaterPeriodeCore(
  userId: string,
  periodeId: string,
  rawInput: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = PeriodeInputSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Ugyldig periode-input" };

  // Eierskaps-guard: blokken må tilhøre brukerens sesongplan.
  const eier = await prisma.periodBlock.findFirst({
    where: { id: periodeId, seasonPlan: { userId } },
    select: { id: true },
  });
  if (!eier) return { ok: false, error: "Perioden finnes ikke" };

  await prisma.periodBlock.update({ where: { id: periodeId }, data: tilData(parsed.data) });
  return { ok: true };
}

export async function slettPeriodeCore(
  userId: string,
  periodeId: string,
): Promise<{ ok: boolean; error?: string }> {
  const eier = await prisma.periodBlock.findFirst({
    where: { id: periodeId, seasonPlan: { userId } },
    select: { id: true },
  });
  if (!eier) return { ok: false, error: "Perioden finnes ikke" };
  await prisma.periodBlock.delete({ where: { id: periodeId } });
  return { ok: true };
}

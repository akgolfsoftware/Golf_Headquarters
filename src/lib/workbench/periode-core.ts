/**
 * 8c.2 — periode-kjerne for årsplan-canvaset: opprett/oppdater/slett
 * PeriodBlock for én spiller. SeasonPlan auto-opprettes for startdatoens år
 * ved første periode. Delt av spiller-action (portal) og coach-action
 * (session-actions) — guards bor i wrapperne, kjernen antar autorisert
 * userId (samme mønster som apply-template-actions/duplicate-week).
 */

import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PeriodeInputSchema, type PeriodeInput } from "@/lib/workbench/perioder";
import { gyldigPlanDato } from "./plan-kontekst";
import { fordelPeriodeTilUker } from "./periode-ukefordeling";
import type { FordelingKvittering } from "./periode-ukefordeling-regler";

/** YYYY-MM-DD → UTC-midnatt. MÅ være UTC, ikke serverens lokale midnatt:
 * lokal dev (Oslo) skriver ellers 23:00Z/22:00Z dagen FØR til samme DB som
 * prod (UTC) — datoen sklir én dag bakover per lagring (truffet 2026-07-19). */
function lokalDag(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** undefined = ikke rør (gammel kaller); null/tomt = nullstill (Prisma.DbNull). */
function akseData(v: Record<string, number | undefined> | null | undefined) {
  if (v === undefined) return undefined;
  return v && Object.keys(v).length > 0 ? v : Prisma.DbNull;
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
    axisMinutes: akseData(input.axisMinutes),
    axisMinutesLight: akseData(input.axisMinutesLight),
  };
}

export type FordeltPeriodeResultat = {
  /** Hvilke uker som fikk nye timer (fra og med inneværende uke). */
  fordeling?: FordelingKvittering;
  /** Perioden ble lagret, men ukene ble ikke oppdatert. */
  fordelingFeilet?: boolean;
};

/** Perioden er lagret; skriv timene nedover. Feil her angrer ikke lagringen, men meldes. */
async function medFordeling<T extends { ok: boolean }>(res: T, periodeId: string | undefined): Promise<T & FordeltPeriodeResultat> {
  if (!res.ok || !periodeId) return res;
  try {
    return { ...res, fordeling: await fordelPeriodeTilUker(periodeId) };
  } catch {
    return { ...res, fordelingFeilet: true };
  }
}

/** Eksplisitt årsplan styrer også når sesongen krysser kalenderår. */
async function lagreIValgtSesong(userId: string, seasonPlanId: string, input: PeriodeInput, periodeId?: string): Promise<{ ok: boolean; periodeId?: string; error?: string }> {
  const planId = z.string().trim().min(1).max(200).safeParse(seasonPlanId);
  if (!planId.success || !gyldigPlanDato(input.startDato) || !gyldigPlanDato(input.sluttDato))
    return { ok: false, error: "Ugyldig årsplan eller periodedato." };
  try {
    // Samme isolasjon som sesonggrensene: en samtidig grenseendring skal
    // ikke kunne etterlate en ny/oppdatert periode utenfor årsplanen.
    return await prisma.$transaction(async (tx) => {
      const plan = await tx.seasonPlan.findFirst({
        where: { id: planId.data, userId }, select: { id: true, startDate: true, endDate: true },
      });
      if (!plan) return { ok: false, error: "Årsplanen finnes ikke." };
      const data = tilData(input);
      if (data.startDate < plan.startDate || data.endDate > plan.endDate)
        return { ok: false, error: "Perioden må ligge innenfor årsplanens fra- og til-dato." };
      if (periodeId) {
        const eier = await tx.periodBlock.findFirst({ where: { id: periodeId, seasonPlanId: plan.id }, select: { id: true } });
        if (!eier) return { ok: false, error: "Perioden finnes ikke i denne årsplanen." };
        const lagret = await tx.periodBlock.updateMany({ where: { id: periodeId, seasonPlanId: plan.id }, data });
        return lagret.count === 1 ? { ok: true, periodeId } : { ok: false, error: "Perioden ble endret. Prøv igjen." };
      }
      const blokk = await tx.periodBlock.create({ data: { seasonPlanId: plan.id, ...data }, select: { id: true } });
      return { ok: true, periodeId: blokk.id };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch { return { ok: false, error: "Perioden kunne ikke lagres. Prøv igjen." }; }
}

export async function opprettPeriodeCore(
  userId: string,
  rawInput: unknown,
  seasonPlanId?: string,
): Promise<{ ok: boolean; periodeId?: string; error?: string } & FordeltPeriodeResultat> {
  const parsed = PeriodeInputSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Ugyldig periode-input" };
  const input = parsed.data;
  if (seasonPlanId !== undefined) {
    const lagret = await lagreIValgtSesong(userId, seasonPlanId, input);
    return medFordeling(lagret, lagret.periodeId);
  }
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
  return medFordeling({ ok: true, periodeId: blokk.id }, blokk.id);
}

export async function oppdaterPeriodeCore(
  userId: string,
  periodeId: string,
  rawInput: unknown,
  seasonPlanId?: string,
): Promise<{ ok: boolean; error?: string } & FordeltPeriodeResultat> {
  const parsed = PeriodeInputSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Ugyldig periode-input" };
  if (seasonPlanId !== undefined) return medFordeling(await lagreIValgtSesong(userId, seasonPlanId, parsed.data, periodeId), periodeId);

  // Eierskaps-guard: blokken må tilhøre brukerens sesongplan.
  const eier = await prisma.periodBlock.findFirst({
    where: { id: periodeId, seasonPlan: { userId } },
    select: { id: true },
  });
  if (!eier) return { ok: false, error: "Perioden finnes ikke" };

  await prisma.periodBlock.update({ where: { id: periodeId }, data: tilData(parsed.data) });
  return medFordeling({ ok: true }, periodeId);
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

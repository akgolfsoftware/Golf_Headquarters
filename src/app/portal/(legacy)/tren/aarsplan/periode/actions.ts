"use server";

/**
 * Periode-CRUD (PeriodBlock) — delt av spiller (`/portal/tren/aarsplan/periode/*`)
 * og coach-oversikten (`/portal/coach/plans/perioder`). Konsolidert 2026-07-06 fra
 * tre tidligere spredte implementasjoner.
 *
 * Tilgang: spilleren som eier SeasonPlan, eller COACH/ADMIN (samme mønster som
 * `sessionForAccess` i workbench/drill-actions.ts).
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import type { LPhase } from "@/generated/prisma/client";

export type PeriodeInput = {
  seasonPlanId: string;
  lPhase: LPhase;
  startDate: string;
  endDate: string;
  focus?: string | null;
  notes?: string | null;
  weeklyVolMin?: number | null;
  weeklyVolMax?: number | null;
};

export type PeriodeResult = { ok: boolean; error?: string };

async function seasonPlanAccess(seasonPlanId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const plan = await prisma.seasonPlan.findUnique({
    where: { id: seasonPlanId },
    select: { userId: true },
  });
  if (!plan) return { ok: false as const, error: "Sesongplan ikke funnet" };
  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  // Spilleren når kun egen plan. Coach/admin nådde FØR alle planer — rollen
  // kortsluttet sjekken. Nå må spilleren også være innenfor coachens scope.
  if (!isCoach) {
    if (plan.userId !== user.id) return { ok: false as const, error: "Ingen tilgang" };
  } else if (!(await harCoachTilgangTilSpiller(user, plan.userId))) {
    return { ok: false as const, error: "Ingen tilgang" };
  }
  return { ok: true as const, isCoach };
}

async function periodeAccess(periodeId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const periode = await prisma.periodBlock.findUnique({
    where: { id: periodeId },
    include: { seasonPlan: { select: { userId: true } } },
  });
  if (!periode) return { ok: false as const, error: "Periode ikke funnet" };
  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  // Samme som seasonPlanAccess: rollen alene ga coach skrive- og slettetilgang
  // til alle spilleres perioder.
  if (!isCoach) {
    if (periode.seasonPlan.userId !== user.id) {
      return { ok: false as const, error: "Ingen tilgang" };
    }
  } else if (!(await harCoachTilgangTilSpiller(user, periode.seasonPlan.userId))) {
    return { ok: false as const, error: "Ingen tilgang" };
  }
  return { ok: true as const, periode };
}

function revalidatePerioder(): void {
  revalidatePath("/portal/coach/plans/perioder");
  revalidatePath("/portal/tren/aarsplan");
}

/** Opprett en ny periode. */
export async function opprettPeriode(input: PeriodeInput): Promise<PeriodeResult> {
  const access = await seasonPlanAccess(input.seasonPlanId);
  if (!access.ok) return { ok: false, error: access.error };

  await prisma.periodBlock.create({
    data: {
      seasonPlanId: input.seasonPlanId,
      lPhase: input.lPhase,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      focus: input.focus || null,
      notes: input.notes || null,
      weeklyVolMin: input.weeklyVolMin ?? null,
      weeklyVolMax: input.weeklyVolMax ?? null,
    },
  });

  revalidatePerioder();
  return { ok: true };
}

/** Oppdater en eksisterende periode. Kun felt som er med i input endres. */
export async function oppdaterPeriode(
  input: { id: string } & Partial<Omit<PeriodeInput, "seasonPlanId">>,
): Promise<PeriodeResult> {
  const access = await periodeAccess(input.id);
  if (!access.ok) return { ok: false, error: access.error };

  await prisma.periodBlock.update({
    where: { id: input.id },
    data: {
      ...(input.lPhase !== undefined ? { lPhase: input.lPhase } : {}),
      ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
      ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
      ...(input.focus !== undefined ? { focus: input.focus || null } : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      ...(input.weeklyVolMin !== undefined ? { weeklyVolMin: input.weeklyVolMin } : {}),
      ...(input.weeklyVolMax !== undefined ? { weeklyVolMax: input.weeklyVolMax } : {}),
    },
  });

  revalidatePerioder();
  return { ok: true };
}

/** Slett en periode. */
export async function slettPeriode(id: string): Promise<PeriodeResult> {
  const access = await periodeAccess(id);
  if (!access.ok) return { ok: false, error: access.error };
  await prisma.periodBlock.delete({ where: { id } });
  revalidatePerioder();
  return { ok: true };
}

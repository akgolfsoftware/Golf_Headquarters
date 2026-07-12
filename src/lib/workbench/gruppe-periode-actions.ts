"use server";

/**
 * 8c.3 — gruppens EGEN årsplan (group_period_blocks): last + muter.
 * Anders: gruppen har egen periodisering; spillerne beholder individuelle
 * årsplaner. Samme PeriodeInput-kontrakt og popup-UI som spiller-varianten
 * (WorkbenchAarsplan gjenbrukes 1:1 på /admin/grupper/[id]/workbench).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PeriodeInputSchema } from "@/lib/workbench/perioder";

function lokalDag(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function coachLagreGruppePeriode(
  groupId: string,
  input: unknown,
  periodeId?: string,
): Promise<{ ok: boolean; periodeId?: string; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = PeriodeInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig periode-input" };
  const v = parsed.data;
  const budsjett = v.budsjett && Object.keys(v.budsjett).length > 0 ? v.budsjett : null;
  const data = {
    lPhase: v.lPhase,
    startDate: lokalDag(v.startDato),
    endDate: lokalDag(v.sluttDato),
    focus: v.fokus || null,
    weeklyVolMin: v.ukevolumMin ?? null,
    weeklyVolMax: v.ukevolumMax ?? null,
    weeklySessionBudget: budsjett ?? undefined,
  };

  if (periodeId) {
    const eier = await prisma.groupPeriodBlock.findFirst({ where: { id: periodeId, groupId }, select: { id: true } });
    if (!eier) return { ok: false, error: "Perioden finnes ikke" };
    await prisma.groupPeriodBlock.update({ where: { id: periodeId }, data });
    revalidatePath(`/admin/grupper/${groupId}/workbench`);
    return { ok: true, periodeId };
  }
  const blokk = await prisma.groupPeriodBlock.create({ data: { groupId, ...data }, select: { id: true } });
  revalidatePath(`/admin/grupper/${groupId}/workbench`);
  return { ok: true, periodeId: blokk.id };
}

export async function coachSlettGruppePeriode(
  groupId: string,
  periodeId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const eier = await prisma.groupPeriodBlock.findFirst({ where: { id: periodeId, groupId }, select: { id: true } });
  if (!eier) return { ok: false, error: "Perioden finnes ikke" };
  await prisma.groupPeriodBlock.delete({ where: { id: periodeId } });
  revalidatePath(`/admin/grupper/${groupId}/workbench`);
  return { ok: true };
}

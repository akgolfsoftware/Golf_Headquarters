"use server";

/**
 * 8c.3 — gruppens EGEN årsplan (group_period_blocks): last + muter.
 * Anders: gruppen har egen periodisering; spillerne beholder individuelle
 * årsplaner. Samme PeriodeInput-kontrakt og popup-UI som spiller-varianten
 * (WorkbenchAarsplan gjenbrukes 1:1 på /admin/grupper/[id]/workbench).
 */

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PeriodeInputSchema } from "@/lib/workbench/perioder";
import { skalHoppeOverPeriode } from "@/lib/domain/gruppeplan-dedup";

/** YYYY-MM-DD → UTC-midnatt. MÅ være UTC, ikke serverens lokale midnatt:
 * lokal dev (Oslo) skriver ellers 22:00Z dagen FØR til samme DB som prod
 * (UTC) — datoen sklir én dag bakover per lagring (truffet 2026-07-19). */
function lokalDag(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
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
    // Prisma.DbNull nullstiller Json?-feltet ved update (undefined = «ikke rør»).
    // Leses tilbake som null — parseSessionBudget håndterer det.
    weeklySessionBudget: budsjett ?? Prisma.DbNull,
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

/** Rapportrad for «hoppet over» i utrullingen — grunn + kilde (G3). */
export type RullUtHoppet = {
  navn: string;
  grunn: "KRYSSKILDE" | "FEIL";
  /** Perioden som ble hoppet over, f.eks. «GRUNN 01.11–20.12». */
  periode?: string;
};

/**
 * Å1: rull ut gruppens årsplan til medlemmenes individuelle SeasonPlan.
 * Duplikat-vern (G3, to-lags-regelen i domain/gruppeplan-dedup):
 * - IDEMPOTENT: perioden fra SAMME gruppe finnes alt → hopp stille (re-kjøring trygg).
 * - KRYSSKILDE: kolliderer med annen kilde (annen gruppe / spillerens egen)
 *   → hopp KUN perioden + rapporter. Aldri overskriving.
 * Nye rader stemples med sourceGroupId. try/catch per spiller så én feil
 * ikke stopper resten.
 */
export async function coachRullUtGruppeAarsplan(
  groupId: string,
): Promise<{ ok: boolean; spillere?: number; perioderLagt?: number; hoppet?: RullUtHoppet[]; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [blokker, medlemmer] = await Promise.all([
    prisma.groupPeriodBlock.findMany({
      where: { groupId },
      orderBy: { startDate: "asc" },
      select: {
        lPhase: true,
        startDate: true,
        endDate: true,
        focus: true,
        weeklyVolMin: true,
        weeklyVolMax: true,
        weeklySessionBudget: true,
      },
    }),
    prisma.groupMember.findMany({
      where: { groupId, role: "PLAYER", endedAt: null },
      select: { userId: true, user: { select: { name: true } } },
    }),
  ]);
  if (blokker.length === 0) return { ok: false, error: "Gruppen har ingen perioder å rulle ut" };
  if (medlemmer.length === 0) return { ok: false, error: "Gruppen har ingen medlemmer" };

  const hoppet: RullUtHoppet[] = [];
  let perioderLagt = 0;
  let spillereTruffet = 0;

  const fmtDag = (d: Date) =>
    `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  for (const m of medlemmer) {
    try {
      let laLokalt = 0;
      for (const b of blokker) {
        const year = b.startDate.getFullYear();
        let plan = await prisma.seasonPlan.findFirst({ where: { userId: m.userId, year }, select: { id: true } });
        if (!plan) {
          plan = await prisma.seasonPlan.create({
            data: { userId: m.userId, year, name: `Sesong ${year}`, startDate: new Date(year, 0, 1), endDate: new Date(year, 11, 31) },
            select: { id: true },
          });
        }
        // G3 duplikat-vern: hent dato-overlappende kandidater og la
        // domenefunksjonen avgjøre (IDEMPOTENT stille, KRYSSKILDE rapporteres).
        const kandidater = await prisma.periodBlock.findMany({
          where: {
            seasonPlanId: plan.id,
            startDate: { lte: b.endDate },
            endDate: { gte: b.startDate },
          },
          select: { lPhase: true, startDate: true, endDate: true, sourceGroupId: true },
        });
        const vurdering = kandidater
          .map((k) => skalHoppeOverPeriode(k, b, groupId))
          .find((v) => v.hopp);
        if (vurdering) {
          if (vurdering.grunn === "KRYSSKILDE") {
            hoppet.push({
              navn: m.user.name ?? m.userId,
              grunn: "KRYSSKILDE",
              periode: `${b.lPhase} ${fmtDag(b.startDate)}–${fmtDag(b.endDate)}`,
            });
          }
          continue;
        }
        await prisma.periodBlock.create({
          data: {
            seasonPlanId: plan.id,
            lPhase: b.lPhase,
            startDate: b.startDate,
            endDate: b.endDate,
            focus: b.focus,
            weeklyVolMin: b.weeklyVolMin,
            weeklyVolMax: b.weeklyVolMax,
            weeklySessionBudget: b.weeklySessionBudget ?? undefined,
            sourceGroupId: groupId,
          },
        });
        laLokalt++;
      }
      if (laLokalt > 0) spillereTruffet++;
      perioderLagt += laLokalt;
    } catch {
      hoppet.push({ navn: m.user.name ?? m.userId, grunn: "FEIL" });
    }
  }

  revalidatePath(`/admin/grupper/${groupId}/workbench`);
  return { ok: true, spillere: spillereTruffet, perioderLagt, hoppet };
}

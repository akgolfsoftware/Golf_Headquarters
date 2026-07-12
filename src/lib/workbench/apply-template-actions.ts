"use server";

/**
 * Bruk en PlanTemplate i Workbench — oppretter TrainingPlanSession + V2-sync
 * for mal-uke 1 (standard «Bruk»-flyt) i inneværende kalenderuke.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import {
  scheduleTemplateWeek,
  type ScheduledTemplateSession,
} from "@/lib/workbench/map-template-week";
import { hentPlayerSignals } from "@/lib/plan-engine/load-signals";
import { adaptTemplateWeek } from "@/lib/plan-engine/adapt-template";

const PYRAMID_AREAS = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

function mondayOf(d: Date): Date {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - dow);
  return x;
}

function dateForDayIndex(dayIndex: number, hour: number, minute: number, weekOffset = 0): Date {
  const target = mondayOf(new Date());
  target.setDate(target.getDate() + dayIndex + weekOffset * 7);
  target.setHours(hour, minute, 0, 0);
  return target;
}

function revalidateWorkbench(playerId: string) {
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath(`/admin/spillere/${playerId}/workbench`);
}

export type AppliedTemplateSession = ScheduledTemplateSession & { sessionId: string };

async function ensurePlanForPlayer(playerId: string, createdById?: string) {
  let plan = await prisma.trainingPlan.findFirst({
    where: { userId: playerId },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { id: true },
  });
  if (!plan) {
    plan = await prisma.trainingPlan.create({
      data: {
        userId: playerId,
        name: "Treningsplan",
        startDate: new Date(),
        status: "ACTIVE",
        isActive: true,
        ...(createdById ? { createdById } : {}),
      },
      select: { id: true },
    });
  }
  return plan;
}

async function applyTemplateCore(
  templateId: string,
  playerId: string,
  coachId: string | null,
  weekNr = 1,
  weekOffset = 0,
): Promise<{ ok: boolean; sessions?: AppliedTemplateSession[]; error?: string; justeringer?: string[] }> {
  const template = await prisma.planTemplate.findUnique({
    where: { id: templateId },
    select: {
      id: true,
      lPhase: true,
      sessions: {
        where: { ukeNr: weekNr },
        orderBy: [{ dagNr: "asc" }, { title: "asc" }],
        select: {
          title: true,
          varighetMin: true,
          pyramidArea: true,
          skillArea: true,
          environment: true,
          ukeNr: true,
          dagNr: true,
        },
      },
    },
  });

  if (!template) return { ok: false, error: "Mal ikke funnet" };
  if (template.sessions.length === 0) {
    return { ok: false, error: "Malen har ingen økter for denne uka" };
  }

  // Tilpasningsmotoren: legger øktene på spillerens foretrukne dager, tar
  // hensyn til fasiliteter/etterlevelse/turnering — alltid anbefaling,
  // aldri sperre. Feiler signalinnhentingen (f.eks. i test/script-kontekst
  // uten full DB-oppsett), faller vi tilbake til malen uendret.
  let justeringer: string[] = [];
  let tilpassetOkter = template.sessions;
  try {
    const signaler = await hentPlayerSignals(playerId);
    const tilpasset = adaptTemplateWeek(template.sessions, template.lPhase, signaler);
    tilpassetOkter = tilpasset.okter;
    justeringer = tilpasset.justeringer;
  } catch (error) {
    console.error("[workbench] tilpasning av mal feilet, bruker mal uendret", error);
  }

  const scheduled = scheduleTemplateWeek(tilpassetOkter, weekNr);
  if (scheduled.length === 0) return { ok: false, error: "Ingen gyldige økter i malen" };

  const plan = await ensurePlanForPlayer(playerId, coachId ?? undefined);
  const created: AppliedTemplateSession[] = [];

  for (const row of scheduled) {
    const area = PYRAMID_AREAS.includes(row.area as (typeof PYRAMID_AREAS)[number])
      ? row.area
      : "TEK";
    const session = await prisma.trainingPlanSession.create({
      data: {
        planId: plan.id,
        title: row.title.slice(0, 120),
        scheduledAt: dateForDayIndex(row.dayIndex, row.hour, row.minute, weekOffset),
        durationMin: row.durMin,
        pyramidArea: area,
        status: "PLANNED",
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        durationMin: true,
        pyramidArea: true,
      },
    });

    await upsertV2ForPlanSession({
      planSessionId: session.id,
      playerId,
      title: session.title,
      scheduledAt: session.scheduledAt,
      durationMin: session.durationMin,
      pyramidArea: session.pyramidArea,
      coachId: coachId ?? undefined,
    });

    created.push({
      ...row,
      sessionId: session.id,
    });
  }

  await prisma.planTemplate.update({
    where: { id: templateId },
    data: { usageCount: { increment: 1 } },
  });

  revalidateWorkbench(playerId);
  return { ok: true, sessions: created, justeringer };
}

/** Spiller bruker mal på egen plan. */
export async function applyWorkbenchTemplate(
  templateId: string,
  weekNr = 1,
): Promise<{ ok: boolean; sessions?: AppliedTemplateSession[]; error?: string; justeringer?: string[] }> {
  const user = await requirePortalUser();
  return applyTemplateCore(templateId, user.id, null, weekNr);
}

/**
 * Å3 · Rull ut en mal til en HEL gruppe over flere uker i én operasjon
 * (planleggings-pyramiden: aldri taste 40 like uker). Mal-uke w legges i
 * kalenderuke startWeekOffset+(w-1) for hvert medlem. Duplikat-vern per
 * spiller-uke: har spilleren alt plan-økter i måluka hoppes den over
 * (rapporteres — anbefaling, aldri overskriving). try/catch per spiller.
 */
export async function coachApplyTemplateToGroup(
  groupId: string,
  templateId: string,
  opts: { startWeekOffset?: number; uker?: number } = {},
): Promise<{
  ok: boolean;
  error?: string;
  spillere?: number;
  okterOpprettet?: number;
  hoppet?: { navn: string; uke: number }[];
}> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const startWeekOffset = Math.max(0, Math.min(12, Math.trunc(opts.startWeekOffset ?? 0)));

  const [gruppe, mal] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, members: { select: { user: { select: { id: true, name: true } } } } },
    }),
    prisma.planTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, varighetUker: true, sessions: { select: { ukeNr: true }, distinct: ["ukeNr"] } },
    }),
  ]);
  if (!gruppe) return { ok: false, error: "Gruppe ikke funnet" };
  if (!mal) return { ok: false, error: "Mal ikke funnet" };
  const malUker = mal.sessions.map((x) => x.ukeNr).sort((a, b) => a - b);
  const uker = Math.max(1, Math.min(opts.uker ?? mal.varighetUker, malUker.length || mal.varighetUker));

  let okterOpprettet = 0;
  const hoppet: { navn: string; uke: number }[] = [];

  for (const m of gruppe.members) {
    for (let w = 0; w < uker; w++) {
      const malUke = malUker[w] ?? w + 1;
      const offset = startWeekOffset + w;
      try {
        // Duplikat-vern: finnes det alt plan-økter i denne kalenderuka?
        const ukeStart = mondayOf(new Date());
        ukeStart.setDate(ukeStart.getDate() + offset * 7);
        const ukeSlutt = new Date(ukeStart);
        ukeSlutt.setDate(ukeSlutt.getDate() + 7);
        const eksisterende = await prisma.trainingPlanSession.count({
          where: { plan: { userId: m.user.id }, scheduledAt: { gte: ukeStart, lt: ukeSlutt } },
        });
        if (eksisterende > 0) {
          hoppet.push({ navn: m.user.name ?? "Ukjent", uke: offset });
          continue;
        }
        const res = await applyTemplateCore(templateId, m.user.id, coach.id, malUke, offset);
        if (res.ok) okterOpprettet += res.sessions?.length ?? 0;
        else hoppet.push({ navn: m.user.name ?? "Ukjent", uke: offset });
      } catch (error) {
        console.error("[Å3] utrulling feilet for", m.user.id, "uke", offset, error);
        hoppet.push({ navn: m.user.name ?? "Ukjent", uke: offset });
      }
    }
  }

  revalidatePath(`/admin/grupper/${groupId}`);
  return { ok: true, spillere: gruppe.members.length, okterOpprettet, hoppet };
}

/** Coach bruker mal på valgt spiller. */
export async function coachApplyWorkbenchTemplate(
  playerId: string,
  templateId: string,
  weekNr = 1,
): Promise<{ ok: boolean; sessions?: AppliedTemplateSession[]; error?: string; justeringer?: string[] }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return applyTemplateCore(templateId, playerId, coach.id, weekNr);
}
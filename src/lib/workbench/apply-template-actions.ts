"use server";

/**
 * Bruk en PlanTemplate i Workbench — oppretter TrainingPlanSession + V2-sync
 * for mal-uke 1 (standard «Bruk»-flyt) i inneværende kalenderuke.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import { logError } from "@/lib/error-tracking";
import {
  scheduleTemplateWeek,
  type ScheduledTemplateSession,
} from "@/lib/workbench/map-template-week";
import { hentPlayerSignals } from "@/lib/plan-engine/load-signals";
import { adaptTemplateWeek } from "@/lib/plan-engine/adapt-template";
import { overlapper } from "@/lib/domain/gruppeplan-dedup";

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

/** Økt hoppet over av G3-dedupen i en gruppeutrulling (KRYSSKILDE rapporteres, IDEMPOTENT er stille). */
export type HoppetOkt = { title: string; grunn: "KRYSSKILDE" };

async function ensurePlanForPlayer(
  tx: Prisma.TransactionClient,
  playerId: string,
  createdById?: string,
) {
  let plan = await tx.trainingPlan.findFirst({
    where: { userId: playerId },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { id: true },
  });
  if (!plan) {
    plan = await tx.trainingPlan.create({
      data: {
        userId: playerId,
        name: "Treningsplan",
        startDate: new Date(),
        status: "DRAFT",
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
  // G3: satt når kilden er en gruppeutrulling — skrur på per-økt-dedup og
  // stempler radene (TrainingPlanSession.sourceGroupId + TrainingSessionV2.groupId).
  sourceGroupId: string | null = null,
): Promise<{
  ok: boolean;
  sessions?: AppliedTemplateSession[];
  error?: string;
  justeringer?: string[];
  hoppetOkter?: HoppetOkt[];
}> {
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
    await logError({
      context: "workbench.applyTemplate.tilpasning",
      error,
      meta: { playerId },
      severity: "warn",
    });
  }

  const scheduled = scheduleTemplateWeek(tilpassetOkter, weekNr);
  if (scheduled.length === 0) return { ok: false, error: "Ingen gyldige økter i malen" };

  const created: AppliedTemplateSession[] = [];
  const hoppetOkter: HoppetOkt[] = [];

  // Hele utrullingen (plan-opprettelse + per-rad create/upsert + usageCount)
  // kjører i ÉN transaksjon (14.5A) — feiler én rad midt i uka, ruller alt
  // tilbake i stedet for å etterlate en halvferdig uke. Gruppeutrulling var
  // allerede re-kjørbar via G3-dedupen; enkeltspiller-utrulling var det ikke.
  await prisma.$transaction(async (tx) => {
    const plan = await ensurePlanForPlayer(tx, playerId, coachId ?? undefined);

    // G3 per-økt-dedup (kun gruppeutrulling): hent spillerens eksisterende
    // plan-økter i målvinduet ÉN gang, og sjekk EKTE tidsoverlapp per ny økt —
    // aldri «hopp hele uka». Samme dag uten overlapp (WANG morgen + GFGK kveld)
    // er legitimt. 24 t bakover-buffer fanger økter som starter før vinduet men
    // strekker seg inn i det.
    let eksisterende: { scheduledAt: Date; durationMin: number; sourceGroupId: string | null }[] = [];
    if (sourceGroupId && scheduled.length > 0) {
      const starter = scheduled.map((r) =>
        dateForDayIndex(r.dayIndex, r.hour, r.minute, weekOffset).getTime(),
      );
      const slutter = scheduled.map(
        (r, i) => starter[i] + r.durMin * 60_000,
      );
      eksisterende = await tx.trainingPlanSession.findMany({
        where: {
          plan: { userId: playerId },
          scheduledAt: {
            gte: new Date(Math.min(...starter) - 24 * 60 * 60_000),
            lt: new Date(Math.max(...slutter)),
          },
        },
        select: { scheduledAt: true, durationMin: true, sourceGroupId: true },
      });
    }

    for (const row of scheduled) {
      const area = PYRAMID_AREAS.includes(row.area as (typeof PYRAMID_AREAS)[number])
        ? row.area
        : "TEK";
      const scheduledAt = dateForDayIndex(row.dayIndex, row.hour, row.minute, weekOffset);

      if (sourceGroupId) {
        const nyStart = scheduledAt;
        const nySlutt = new Date(scheduledAt.getTime() + row.durMin * 60_000);
        const kollisjon = eksisterende.find((e) =>
          overlapper(
            e.scheduledAt,
            new Date(e.scheduledAt.getTime() + e.durationMin * 60_000),
            nyStart,
            nySlutt,
          ),
        );
        if (kollisjon) {
          // Samme gruppe → stille idempotens (re-kjøring). Annen kilde → rapporter.
          if (kollisjon.sourceGroupId !== sourceGroupId) {
            hoppetOkter.push({ title: row.title, grunn: "KRYSSKILDE" });
          }
          continue;
        }
      }

      const session = await tx.trainingPlanSession.create({
        data: {
          planId: plan.id,
          title: row.title.slice(0, 120),
          scheduledAt,
          durationMin: row.durMin,
          pyramidArea: area,
          status: "PLANNED",
          sourceGroupId,
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
        sourceGroupId,
        db: tx,
      });

      created.push({
        ...row,
        sessionId: session.id,
      });
    }

    await tx.planTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });
  });

  revalidateWorkbench(playerId);
  return {
    ok: true,
    sessions: created,
    justeringer,
    hoppetOkter: hoppetOkter.length > 0 ? hoppetOkter : undefined,
  };
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
 * kalenderuke startWeekOffset+(w-1) for hvert medlem.
 *
 * Duplikat-vern (G3): PER ØKT med ekte tidsoverlapp — aldri «hopp hele uka».
 * Økt fra SAMME gruppe i overlappende tidsrom → hopp stille (re-kjøring trygg).
 * Økt fra annen kilde (annen gruppe / spillerens egen) → hopp KUN den økten
 * + rapporter. Aldri overskriving. try/catch per spiller.
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
  hoppet?: { navn: string; uke: number; okt?: string; grunn?: "KRYSSKILDE" | "FEIL" }[];
}> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  // G6: utrulling av mal til gruppe endrer gruppeplanen → EDIT_GROUP_PLANS.
  await assertCapability(coach, Capability.EDIT_GROUP_PLANS);
  const startWeekOffset = Math.max(0, Math.min(12, Math.trunc(opts.startWeekOffset ?? 0)));

  const [gruppe, mal] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        // Kun aktive SPILLERE — utrulling til trenere/utmeldte ville gitt dem
        // spillerplaner (plan G1/G3).
        members: {
          where: { endedAt: null, role: "PLAYER" },
          select: { user: { select: { id: true, name: true } } },
        },
      },
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
  const hoppet: { navn: string; uke: number; okt?: string; grunn?: "KRYSSKILDE" | "FEIL" }[] = [];

  for (const m of gruppe.members) {
    for (let w = 0; w < uker; w++) {
      const malUke = malUker[w] ?? w + 1;
      const offset = startWeekOffset + w;
      try {
        // G3: per-økt-dedup skjer inne i applyTemplateCore (sourceGroupId satt) —
        // samme gruppe hoppes stille, krysskilde-kollisjoner rapporteres per økt.
        const res = await applyTemplateCore(templateId, m.user.id, coach.id, malUke, offset, groupId);
        if (res.ok) {
          okterOpprettet += res.sessions?.length ?? 0;
          for (const h of res.hoppetOkter ?? []) {
            hoppet.push({ navn: m.user.name ?? "Ukjent", uke: offset, okt: h.title, grunn: h.grunn });
          }
        } else {
          hoppet.push({ navn: m.user.name ?? "Ukjent", uke: offset, grunn: "FEIL" });
        }
      } catch (error) {
        await logError({
          context: "workbench.applyTemplate.utrulling",
          error,
          meta: { userId: m.user.id, uke: offset, templateId, groupId },
          severity: "warn",
        });
        hoppet.push({ navn: m.user.name ?? "Ukjent", uke: offset, grunn: "FEIL" });
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
  if (!(await harCoachTilgangTilSpiller(coach, playerId))) {
    return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
  }
  return applyTemplateCore(templateId, playerId, coach.id, weekNr);
}
"use server";

/**
 * AG-TP-01 Oppgaveskjema — coachens server-handlinger for én oppgave i en
 * spillers tekniske plan. Lagrer det dagens updateTaskBasics ikke gjør:
 * TrackMan-mål, treffprotokoll og rep-mål per miljø (PositionTaskMaal).
 *
 * Tilgang: COACH/ADMIN, og coachen må ha tilgang til nettopp denne spilleren
 * (assertCoachTilgangTilSpiller). Oppgaven må høre til planen. Låst med
 * oppgave-actions.test.ts.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { assertCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { pNavn } from "@/components/teknisk-plan/constants";
import { TpSkjemaSchema, miljoCeller, oppgaveFelt, protokollFelt, type TpSkjema } from "@/lib/teknisk-plan/tp-skjema";
import { utgangspunktFraSisteOkt } from "@/lib/teknisk-plan/tp-utgangspunkt";
import { rekalkulerMaalMatrise } from "@/lib/teknisk-plan/apply-reps";

export type Svar = { ok: true; taskId: string } | { ok: false; feil: string };

async function sikreCoach(planId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Ikke innlogget");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("Ingen tilgang");
  const plan = await prisma.technicalPlan.findUnique({ where: { id: planId }, select: { id: true, userId: true } });
  if (!plan) throw new Error("Plan ikke funnet");
  await assertCoachTilgangTilSpiller(user, plan.userId);
  return { user, plan };
}

function friskOpp(spillerId: string, planId: string) {
  revalidatePath(`/admin/spillere/${spillerId}/plan/${planId}`);
  revalidatePath(`/portal/tren/teknisk-plan/${planId}`);
  revalidatePath("/admin/plan/teknisk");
}

async function posisjonFor(planId: string, pNummer: string) {
  const finnes = await prisma.technicalPlanPosition.findFirst({ where: { planId, pNummer } });
  if (finnes) return finnes;
  const siste = await prisma.technicalPlanPosition.findFirst({ where: { planId }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  return prisma.technicalPlanPosition.create({ data: { planId, pNummer, navn: pNavn(pNummer), sortOrder: (siste?.sortOrder ?? -1) + 1 } });
}

export async function lagreOppgave(planId: string, skjema: TpSkjema): Promise<Svar> {
  z.string().min(1).parse(planId);
  const { user, plan } = await sikreCoach(planId);
  const tolket = TpSkjemaSchema.safeParse(skjema);
  if (!tolket.success) return { ok: false, feil: tolket.error.issues[0]?.message ?? "Skjemaet er ikke gyldig" };
  const s = tolket.data;

  const eksisterende = s.id
    ? await prisma.positionTask.findUnique({
      where: { id: s.id },
      select: { id: true, positionId: true, position: { select: { planId: true, pNummer: true } }, tmGoals: { select: { id: true, metric: true, targetType: true } } },
    })
    : null;
  if (s.id && (!eksisterende || eksisterende.position.planId !== planId)) throw new Error("Oppgaven hører ikke til planen");

  const felt = oppgaveFelt(s);
  const kolle = s.kolle ?? "Alle køller";
  const posisjon = await posisjonFor(planId, s.pNummer);
  const flyttet = !eksisterende || eksisterende.positionId !== posisjon.id;
  const sisteSort = flyttet
    ? (await prisma.positionTask.findFirst({ where: { positionId: posisjon.id }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } }))?.sortOrder ?? -1
    : null;

  const oppgave = eksisterende
    ? await prisma.positionTask.update({
      where: { id: eksisterende.id },
      data: { ...felt, ...(flyttet ? { positionId: posisjon.id, sortOrder: (sisteSort ?? -1) + 1 } : {}) },
    })
    : await prisma.positionTask.create({
      data: { ...felt, pyramide: "TEK", positionId: posisjon.id, sortOrder: (sisteSort ?? -1) + 1 },
    });

  // TrackMan-mål (alt unntatt HIT_RATE): oppdater, lag nye, fjern de som er tatt ut.
  const gamleTm = (eksisterende?.tmGoals ?? []).filter((g) => g.targetType !== "HIT_RATE");
  const beholdes = new Set(s.tm.map((r) => r.id).filter(Boolean));
  const fjernes = gamleTm.filter((g) => !beholdes.has(g.id)).map((g) => g.id);
  if (fjernes.length) await prisma.positionTaskTmGoal.deleteMany({ where: { id: { in: fjernes }, taskId: oppgave.id } });
  for (const r of s.tm) {
    const gammel = r.id ? gamleTm.find((g) => g.id === r.id) : undefined;
    const maal = { metric: r.metric, klubb: kolle, targetValue: r.fra, rangeMax: r.til, comparison: "RANGE" as const };
    if (gammel) {
      const nyttUtgangspunkt = gammel.metric !== r.metric ? await utgangspunktFraSisteOkt(plan.userId, r.metric, s.kolle) : null;
      await prisma.positionTaskTmGoal.update({
        where: { id: gammel.id },
        data: {
          ...maal,
          ...(nyttUtgangspunkt ? {
            baselineValue: nyttUtgangspunkt.verdi, baselineFrom: nyttUtgangspunkt.fra, baselineDate: nyttUtgangspunkt.dato,
            baselineN: nyttUtgangspunkt.n, currentValue: null, progressPct: null, inTarget: false, lastUpdated: null,
          } : {}),
        },
      });
    } else {
      const u = await utgangspunktFraSisteOkt(plan.userId, r.metric, s.kolle);
      await prisma.positionTaskTmGoal.create({
        data: { ...maal, taskId: oppgave.id, targetType: "CAUSAL", baselineValue: u.verdi, baselineFrom: u.fra, baselineDate: u.dato, baselineN: u.n },
      });
    }
  }

  // Treffprotokoll: den første HIT_RATE-raden er protokollen skjemaet viser.
  const gammelProtokoll = (eksisterende?.tmGoals ?? []).find((g) => g.targetType === "HIT_RATE");
  const protokoll = protokollFelt(s, kolle);
  if (!protokoll && gammelProtokoll) {
    await prisma.positionTaskTmGoal.delete({ where: { id: gammelProtokoll.id } });
  } else if (protokoll && gammelProtokoll) {
    await prisma.positionTaskTmGoal.update({ where: { id: gammelProtokoll.id }, data: protokoll });
  } else if (protokoll) {
    await prisma.positionTaskTmGoal.create({
      data: { ...protokoll, taskId: oppgave.id, targetType: "HIT_RATE", comparison: "GREATER_THAN", baselineValue: 0, baselineFrom: "manual", baselineDate: new Date() },
    });
  }

  // Rep-mål per miljø: målmatrisen skrives på nytt, gjort-tallene regnes fra loggene.
  await prisma.$transaction([
    prisma.positionTaskMaal.deleteMany({ where: { taskId: oppgave.id } }),
    prisma.positionTaskMaal.createMany({ data: miljoCeller(s).map((c) => ({ ...c, taskId: oppgave.id })) }),
  ]);
  await rekalkulerMaalMatrise(oppgave.id);

  await prisma.technicalPlanAudit.create({
    data: {
      planId,
      actorId: user.id,
      action: eksisterende ? "TASK_EDIT" : "TASK_ADD",
      target: oppgave.id,
      payload: { tittel: s.tittel, pNummer: s.pNummer },
    },
  });

  friskOpp(plan.userId, planId);
  return { ok: true, taskId: oppgave.id };
}

export async function slettOppgave(planId: string, taskId: string): Promise<{ ok: true }> {
  z.string().min(1).parse(planId);
  z.string().min(1).parse(taskId);
  const { user, plan } = await sikreCoach(planId);
  const t = await prisma.positionTask.findUnique({ where: { id: taskId }, select: { position: { select: { planId: true } } } });
  if (!t || t.position.planId !== planId) throw new Error("Oppgaven hører ikke til planen");
  await prisma.positionTask.delete({ where: { id: taskId } });
  await prisma.technicalPlanAudit.create({ data: { planId, actorId: user.id, action: "TASK_DELETE", target: taskId } });
  friskOpp(plan.userId, planId);
  return { ok: true };
}

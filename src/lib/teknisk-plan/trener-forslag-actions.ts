"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { createTask, deleteTask, logReps, updateTaskBasics } from "@/app/portal/tren/teknisk-plan/actions";
import { TEKNISK_PLAN_FORSLAG_TYPE, TekniskPlanForslagSchema, type TekniskPlanForslag } from "./trener-forslag";

const SvarSchema = z.object({ actionId: z.string().min(1).max(120), beslutning: z.enum(["ACCEPTED", "REJECTED"]) }).strict();

type Svar = { ok: true; status: "ACCEPTED" | "REJECTED" } | { ok: false; feil: string };

/** Oppgaven må fortsatt høre til planen i forslaget og til spilleren. Forslaget er ikke en rettighet. */
async function oppgaveErSpillerens(taskId: string, planId: string, spillerId: string): Promise<boolean> {
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    select: { position: { select: { planId: true, plan: { select: { userId: true } } } } },
  });
  return task !== null && task.position.planId === planId && task.position.plan.userId === spillerId;
}

async function anvend(f: TekniskPlanForslag, spillerId: string): Promise<boolean> {
  const plan = await prisma.technicalPlan.findFirst({ where: { id: f.planId, userId: spillerId }, select: { id: true } });
  if (!plan) return false;
  switch (f.kind) {
    case "REP_LOG":
      if (!(await oppgaveErSpillerens(f.taskId, f.planId, spillerId))) return false;
      await logReps(f.taskId, { [f.felt]: f.antall });
      return true;
    case "TASK_ADD":
      await createTask({
        planId: f.planId, pNummer: f.pNummer, pName: f.pName, tittel: f.oppgave.tittel,
        beskrivelse: f.oppgave.beskrivelse ?? undefined, pyramide: f.oppgave.pyramide, omraade: f.oppgave.omraade,
        koller: f.oppgave.koller, repsMaalDry: f.oppgave.repsMaalDry, repsMaalLav: f.oppgave.repsMaalLav, repsMaalFull: f.oppgave.repsMaalFull,
      });
      return true;
    case "TASK_UPDATE":
      if (!(await oppgaveErSpillerens(f.taskId, f.planId, spillerId))) return false;
      await updateTaskBasics(f.taskId, {
        tittel: f.oppgave.tittel, beskrivelse: f.oppgave.beskrivelse ?? undefined, pyramide: f.oppgave.pyramide, omraade: f.oppgave.omraade,
        koller: f.oppgave.koller, repsMaalDry: f.oppgave.repsMaalDry, repsMaalLav: f.oppgave.repsMaalLav, repsMaalFull: f.oppgave.repsMaalFull,
      });
      return true;
    case "TASK_DELETE":
      if (!(await oppgaveErSpillerens(f.taskId, f.planId, spillerId))) return false;
      await deleteTask(f.taskId);
      return true;
  }
}

/**
 * Spilleren svarer på et trenerforslag i den tekniske planen. Forslaget tas først (PENDING til ACCEPTED/REJECTED
 * i ett steg), så det aldri kan anvendes to ganger. Først ved godkjenning skrives planen; mislykkes det, merkes
 * forslaget CONFLICT og treneren må sende et nytt.
 */
export async function svarPaTekniskPlanForslag(input: unknown): Promise<Svar> {
  const spiller = await requireSpillerActionUser();
  const parsed = SvarSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: "Ugyldig svar." };
  const { actionId, beslutning } = parsed.data;

  const action = await prisma.planAction.findFirst({
    where: { id: actionId, userId: spiller.id, actionType: TEKNISK_PLAN_FORSLAG_TYPE, status: "PENDING" },
    select: { id: true, suggestion: true },
  });
  if (!action) return { ok: false, feil: "Forslaget er allerede besvart eller ikke tilgjengelig." };
  const forslag = TekniskPlanForslagSchema.safeParse(action.suggestion);
  if (!forslag.success) return { ok: false, feil: "Forslaget kan ikke behandles." };

  const tatt = await prisma.planAction.updateMany({
    where: { id: action.id, userId: spiller.id, status: "PENDING" },
    data: { status: beslutning, decidedAt: new Date(), decidedById: spiller.id },
  });
  if (tatt.count !== 1) return { ok: false, feil: "Forslaget er allerede besvart." };

  if (beslutning === "ACCEPTED") {
    let anvendt = false;
    try {
      anvendt = await anvend(forslag.data, spiller.id);
    } catch {
      anvendt = false;
    }
    if (!anvendt) {
      await prisma.planAction.updateMany({ where: { id: action.id, userId: spiller.id }, data: { status: "CONFLICT" } });
      return { ok: false, feil: "Planen er endret siden forslaget ble laget. Be treneren sende et nytt forslag." };
    }
  }
  revalidatePath(`/portal/tren/teknisk-plan/${forslag.data.planId}`);
  revalidatePath("/portal");
  return { ok: true, status: beslutning };
}

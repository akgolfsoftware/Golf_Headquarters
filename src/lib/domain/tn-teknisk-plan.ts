import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import type { TnBruker } from "@/lib/domain/tn-arbeidsflate";
import { logReps, createTask, updateTaskBasics, deleteTask, type TaskInput } from "@/app/portal/tren/teknisk-plan/actions";
import type { TnWorkbenchKontekst } from "@/lib/domain/tn-workbench";

/**
 * TN-23 Teknisk plan (14.09.2026, rettet etter Codex-review samme dag —
 * `root-review-plan.md`). Leser samme `TechnicalPlan`/
 * `TechnicalPlanPosition`/`PositionTask`-modeller som PlayerHQs
 * `/portal/tren/teknisk-plan/[planId]` — ingen ny modell.
 *
 * VIKTIG sikkerhetsmerknad (funnet under bygging, ikke rettet her — utenfor
 * eierskapet i denne oppgaven): den delte `ensurePlanAccess`
 * (`src/lib/teknisk-plan/ensure-plan-access.ts`) gir ENHVER bruker med
 * platform-rolle COACH/ADMIN tilgang til en HVILKEN SOM HELST spillers plan.
 * Denne fila stoler derfor ALDRI på `ensurePlanAccess` alene — `tnLoggRep`
 * under gjør SIN EGEN fulle validering (TN-rolle COACH, roster, personlig
 * coach-scope, OG at oppgaven faktisk tilhører valgt plan/spiller) FØR den
 * kaller den delte `logReps`. Denne valideringen skjer i selve actionen —
 * IKKE bare som en side-vakt før et skjema vises — fordi et forfalsket
 * `taskId` i et innsendt skjema aldri går via siden i utgangspunktet.
 */

/**
 * Egen teknisk plan/evaluering er FULL-funksjoner i PlayerHQ (samme gate som
 * `/portal/tren/teknisk-plan`, som bruker standard `kreverTilgang: "FULL"`).
 * TN-sidene bruker `kreverTilgang: "INGEN"` på sideguarden (siden en trener
 * som bare LESER en annen spillers plan aldri skal rammes av spillerens eget
 * abonnement) — men når viewer ser SIN EGEN plan gjennom TN-veien, skal ikke
 * det være en gratis omvei rundt den eksisterende betalingsregelen (plan
 * A3). Dette er IKKE en ny tilgangsregel — det er den samme regelen som
 * allerede gjelder i PlayerHQ, håndhevet her fordi TN-sideguarden ellers
 * ikke ville sjekket den. Rammer aldri treneren.
 */
export function krevFullForEgenTekniskPlan(bruker: { id: string; role: string; tilgang: { nivaa: string } }, spillerId: string): void {
  if (bruker.role !== "PLAYER" || bruker.id !== spillerId) return;
  if (bruker.tilgang.nivaa === "INGEN") redirect("/portal/oppgrader");
  if (bruker.tilgang.nivaa === "TALENT") redirect("/portal/oppgrader?fra=laast");
}

export type TnTekniskPlanRad = {
  id: string;
  navn: string;
  status: string;
  startDato: Date;
  sluttDato: Date | null;
  antallOppgaver: number;
  antallFullfort: number;
};

/**
 * Kan viewer LESE denne spillerens tekniske plan(er)? Spilleren selv (kun når
 * `kontekst.erSpiller` faktisk bekrefter en gyldig TN-spillerkontekst — samme
 * rettelse som `harTnPersonligPlanLesetilgang` i `tn-workbench.ts`: en blind
 * `bruker.id === spillerId`-snarveie uten rolle-/rosterkontroll er ikke nok),
 * eller TN-ASSISTANT/COACH/ADMIN (`kontekst.erTrener`, som selv krever
 * platform-rolle COACH/ADMIN — se `hentTnWorkbenchKontekst`) med personlig
 * coach-tilgang til et aktivt TN-medlem.
 */
export async function harTnTekniskPlanLesetilgang(bruker: TnBruker, kontekst: TnWorkbenchKontekst, spillerId: string): Promise<boolean> {
  if (kontekst.erSpiller && bruker.id === spillerId) return true;
  if (!kontekst.erTrener) return false;
  if (!kontekst.spillere.some((s) => s.id === spillerId)) return false;
  return harCoachTilgangTilSpiller({ id: bruker.id, role: bruker.role }, spillerId);
}

/** Kan viewer SKRIVE (logge reps, opprette/redigere/slette oppgaver) på denne spillerens plan? Kun TN-COACH/ADMIN (`kontekst.kanAdministrere`, global rolle allerede sjekket der) — ASSISTANT er lesende. */
async function harTnTekniskPlanSkrivetilgang(bruker: TnBruker, kontekst: TnWorkbenchKontekst, spillerId: string): Promise<boolean> {
  if (!kontekst.kanAdministrere) return false;
  if (!kontekst.spillere.some((s) => s.id === spillerId)) return false;
  return harCoachTilgangTilSpiller({ id: bruker.id, role: bruker.role }, spillerId);
}

/** Planoversikt for én spiller — kun rader som faktisk tilhører spillerId. */
export async function hentTnTekniskPlaner(spillerId: string): Promise<TnTekniskPlanRad[]> {
  const planer = await prisma.technicalPlan.findMany({
    where: { userId: spillerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      navn: true,
      status: true,
      startDato: true,
      sluttDato: true,
      positions: { select: { tasks: { select: { status: true } } } },
    },
  });
  return planer.map((p) => {
    const tasks = p.positions.flatMap((pos) => pos.tasks);
    return {
      id: p.id,
      navn: p.navn,
      status: p.status,
      startDato: p.startDato,
      sluttDato: p.sluttDato,
      antallOppgaver: tasks.length,
      antallFullfort: tasks.filter((t) => t.status === "DONE").length,
    };
  });
}

export type TnTekniskOppgaveRad = {
  id: string;
  tittel: string;
  beskrivelse: string | null;
  pyramide: string;
  omraade: string;
  koller: string[];
  status: string;
  trackStatus: string;
  repsMaalDry: number;
  repsMaalLav: number;
  repsMaalFull: number;
  repsGjortDry: number;
  repsGjortLav: number;
  repsGjortFull: number;
  lastRepLoggedAt: Date | null;
};

export type TnTekniskPosisjonRad = {
  id: string;
  pNummer: string;
  navn: string;
  hovedfokus: boolean;
  oppgaver: TnTekniskOppgaveRad[];
};

export type TnTekniskPlanDetalj = {
  id: string;
  navn: string;
  status: string;
  startDato: Date;
  sluttDato: Date | null;
  posisjoner: TnTekniskPosisjonRad[];
  siste: { action: string; createdAt: Date; actorNavn: string }[];
};

/** Plandetalj — `where: { id, userId: spillerId }` (aldri viewerens id). */
export async function hentTnTekniskPlanDetalj(spillerId: string, planId: string): Promise<TnTekniskPlanDetalj | null> {
  const plan = await prisma.technicalPlan.findFirst({
    where: { id: planId, userId: spillerId },
    include: {
      positions: {
        orderBy: { sortOrder: "asc" },
        include: { tasks: { orderBy: { sortOrder: "asc" } } },
      },
      audits: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { actor: { select: { name: true } } },
      },
    },
  });
  if (!plan) return null;
  return {
    id: plan.id,
    navn: plan.navn,
    status: plan.status,
    startDato: plan.startDato,
    sluttDato: plan.sluttDato,
    posisjoner: plan.positions.map((pos) => ({
      id: pos.id,
      pNummer: pos.pNummer,
      navn: pos.navn,
      hovedfokus: pos.hovedfokus,
      oppgaver: pos.tasks.map((t) => ({
        id: t.id,
        tittel: t.tittel,
        beskrivelse: t.beskrivelse,
        pyramide: t.pyramide,
        omraade: t.omraade,
        koller: t.koller,
        status: t.status,
        trackStatus: t.trackStatus,
        repsMaalDry: t.repsMaalDry,
        repsMaalLav: t.repsMaalLav,
        repsMaalFull: t.repsMaalFull,
        repsGjortDry: t.repsGjortDry,
        repsGjortLav: t.repsGjortLav,
        repsGjortFull: t.repsGjortFull,
        lastRepLoggedAt: t.lastRepLoggedAt,
      })),
    })),
    siste: plan.audits.map((a) => ({ action: a.action, createdAt: a.createdAt, actorNavn: a.actor.name ?? "Ukjent" })),
  };
}

export type TnHandlingResultat = { ok: true } | { ok: false; feil: string };

/**
 * Logg reps på én oppgave — FULL validering i selve actionen (ikke bare en
 * side-vakt): TN-rolle COACH/ADMIN, spilleren er et aktivt TN-medlem,
 * personlig coach-tilgang, OG oppgaven tilhører faktisk den planen/spilleren
 * kallet oppgir. Bruker samme `logReps` som PlayerHQ (ingen duplisert
 * skriveserverhandling), men kaller den ALDRI før alt dette er bekreftet her.
 */
export async function tnLoggRep(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  planId: string,
  taskId: string,
  felt: "dry" | "lav" | "full",
  antall: number,
): Promise<TnHandlingResultat> {
  if (!Number.isFinite(antall) || antall <= 0) return { ok: false, feil: "Ugyldig antall." };
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens tekniske plan." };
  }
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    select: { position: { select: { planId: true, plan: { select: { userId: true } } } } },
  });
  if (!task) return { ok: false, feil: "Fant ikke oppgaven." };
  if (task.position.planId !== planId) return { ok: false, feil: "Oppgaven tilhører ikke den valgte planen." };
  if (task.position.plan.userId !== spillerId) return { ok: false, feil: "Oppgaven tilhører ikke valgt spiller." };

  await logReps(taskId, { [felt]: antall });
  return { ok: true };
}

/** Er `planId` faktisk `spillerId`s egen plan? Delt av alle oppgave-mutasjonene under. */
async function planTilhorerSpiller(planId: string, spillerId: string): Promise<boolean> {
  const plan = await prisma.technicalPlan.findFirst({ where: { id: planId, userId: spillerId }, select: { id: true } });
  return plan !== null;
}

/**
 * Opprett en ny oppgave (og evt. ny P-posisjon) i spillerens plan — FULL
 * validering: TN-rolle COACH, roster, personlig coach-scope, OG at
 * `input.planId` faktisk er spillerens plan (den delte `createTask` sjekker
 * kun `ensurePlanAccess`, som ikke er en personlig-scope-sjekk — se
 * merknaden øverst i fila). Bruker samme `createTask` som PlayerHQ.
 */
export async function tnOpprettOppgave(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: TaskInput,
): Promise<TnHandlingResultat> {
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens tekniske plan." };
  }
  if (!(await planTilhorerSpiller(input.planId, spillerId))) {
    return { ok: false, feil: "Planen tilhører ikke valgt spiller." };
  }
  try {
    await createTask(input);
    return { ok: true };
  } catch (e) {
    return { ok: false, feil: e instanceof Error ? e.message : "Kunne ikke opprette oppgaven." };
  }
}

/** Slår opp oppgaven og verifiserer at den tilhører `planId`/`spillerId` (delt av oppdater/slett under). */
async function oppgaveTilhorerPlanOgSpiller(taskId: string, planId: string, spillerId: string): Promise<TnHandlingResultat | null> {
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    select: { position: { select: { planId: true, plan: { select: { userId: true } } } } },
  });
  if (!task) return { ok: false, feil: "Fant ikke oppgaven." };
  if (task.position.planId !== planId) return { ok: false, feil: "Oppgaven tilhører ikke den valgte planen." };
  if (task.position.plan.userId !== spillerId) return { ok: false, feil: "Oppgaven tilhører ikke valgt spiller." };
  return null;
}

/** Rediger en eksisterende oppgave (tittel/mål m.m.) — samme fulle validering som opprettelse. */
export async function tnOppdaterOppgave(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  planId: string,
  taskId: string,
  patch: Parameters<typeof updateTaskBasics>[1],
): Promise<TnHandlingResultat> {
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens tekniske plan." };
  }
  const feil = await oppgaveTilhorerPlanOgSpiller(taskId, planId, spillerId);
  if (feil) return feil;
  try {
    await updateTaskBasics(taskId, patch);
    return { ok: true };
  } catch (e) {
    return { ok: false, feil: e instanceof Error ? e.message : "Kunne ikke oppdatere oppgaven." };
  }
}

/** Slett en oppgave — krever skriftlig SLETT-bekreftelse i tillegg til full validering. */
export async function tnSlettOppgave(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  planId: string,
  taskId: string,
  bekreftelse: string,
): Promise<TnHandlingResultat> {
  if (bekreftelse.trim().toUpperCase() !== "SLETT") {
    return { ok: false, feil: "Skriv SLETT for å bekrefte slettingen." };
  }
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens tekniske plan." };
  }
  const feil = await oppgaveTilhorerPlanOgSpiller(taskId, planId, spillerId);
  if (feil) return feil;
  try {
    await deleteTask(taskId);
    return { ok: true };
  } catch (e) {
    return { ok: false, feil: e instanceof Error ? e.message : "Kunne ikke slette oppgaven." };
  }
}

/** Norske etiketter for `TechnicalPlanAudit.action` — samme historikkverdier som PlayerHQ, aldri rå kodenavn i UI. */
export const TN_AUDIT_ACTION_LABEL: Record<string, string> = {
  TASK_ADD: "Oppgave lagt til",
  TASK_EDIT: "Oppgave redigert",
  TASK_DELETE: "Oppgave slettet",
  PRIO_CHANGE: "Rekkefølge endret",
  STATUS_CHANGE: "Status endret",
};

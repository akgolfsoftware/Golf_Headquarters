import "server-only";

import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { harCoachLesetilgangTilSpiller, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import type { TnBruker } from "@/lib/domain/tn-arbeidsflate";
import { medNavngittProfil } from "@/lib/deling/profil-lesing";
import { TEKNISK_PLAN_FORSLAG_TYPE, TekniskPlanForslagSchema, type OppgaveFeltData, type TekniskPlanForslag } from "@/lib/teknisk-plan/trener-forslag";
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
 * Denne fila stoler derfor ALDRI på `ensurePlanAccess` alene.
 *
 * A2 (beslutninger §KODEGJENNOMGANGEN 06.10): TN-treneren skriver aldri i planen. `tnForeslaa*` under
 * validerer fullt (TN-rolle COACH, roster, personlig coach-scope, delingslås, og at oppgaven faktisk
 * tilhører valgt plan/spiller) og lagrer bare et forslag spilleren godtar i PlayerHQ. Valideringen skjer i
 * selve funksjonen — IKKE bare som en side-vakt — fordi et forfalsket `taskId` i et innsendt skjema aldri
 * går via siden i utgangspunktet.
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
  // Innsyn krever egen coach-relasjon eller uttrykkelig deling (D-04).
  return harCoachLesetilgangTilSpiller({ id: bruker.id, role: bruker.role }, spillerId);
}

/** Kan viewer SKRIVE (logge reps, opprette/redigere/slette oppgaver) på denne spillerens plan? Kun TN-COACH/ADMIN (`kontekst.kanAdministrere`, global rolle allerede sjekket der) — ASSISTANT er lesende. */
async function harTnTekniskPlanSkrivetilgang(bruker: TnBruker, kontekst: TnWorkbenchKontekst, spillerId: string): Promise<boolean> {
  if (!kontekst.kanAdministrere) return false;
  if (!kontekst.spillere.some((s) => s.id === spillerId)) return false;
  return harCoachTilgangTilSpiller({ id: bruker.id, role: bruker.role }, spillerId);
}

/**
 * Planoversikt for én spiller — kun rader som faktisk tilhører spillerId. `db` er transaksjonen fra
 * `medTnSpillerData`, så planen bare leses innenfor delingslåsen.
 */
export async function hentTnTekniskPlaner(db: Prisma.TransactionClient, spillerId: string): Promise<TnTekniskPlanRad[]> {
  const planer = await db.technicalPlan.findMany({
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

/** Plandetalj — `where: { id, userId: spillerId }` (aldri viewerens id). Leses med `db` fra delingslåsen. */
export async function hentTnTekniskPlanDetalj(db: Prisma.TransactionClient, spillerId: string, planId: string): Promise<TnTekniskPlanDetalj | null> {
  const plan = await db.technicalPlan.findFirst({
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
 * A2: Team Norway-treneren FORESLÅR, spilleren bestemmer (§KODEGJENNOMGANGEN 06.10). Ingen funksjon her
 * skriver i `PositionTask` eller `TechnicalPlan`; de lagrer et `PlanAction`-forslag som spilleren godtar eller
 * avviser i PlayerHQ (`svarPaTekniskPlanForslag`). FULL validering skjer i selve funksjonen (ikke bare i en
 * side-vakt): TN-rolle COACH/ADMIN, roster, personlig coach-tilgang, delingslåsen (`medNavngittProfil`), og at
 * planen/oppgaven faktisk tilhører den spilleren kallet oppgir.
 */
async function lagreForslag(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  forslag: TekniskPlanForslag,
): Promise<TnHandlingResultat> {
  const lagret = await medNavngittProfil(bruker.id, spillerId, kontekst.gruppeId, (tx) =>
    tx.planAction.create({
      data: {
        userId: spillerId,
        coachId: bruker.id,
        planId: forslag.planId,
        actionType: TEKNISK_PLAN_FORSLAG_TYPE,
        suggestion: forslag satisfies Prisma.InputJsonObject,
        status: "PENDING",
        agentName: "TEAM_NORWAY_COACH",
      },
      select: { id: true },
    }),
  );
  if (!lagret) return { ok: false, feil: "Spillerens deling er ikke aktiv." };
  return { ok: true };
}

const IKKE_TILGANG = "Du har ikke tilgang til å foreslå endringer i denne spillerens tekniske plan.";

/** Oppgavens tittel, eller en feil hvis den ikke tilhører planen/spilleren. Delt av forslag som peker på en eksisterende oppgave. */
async function slaaOppOppgave(taskId: string, planId: string, spillerId: string): Promise<{ tittel: string } | { feil: string }> {
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    select: { tittel: true, position: { select: { planId: true, plan: { select: { userId: true } } } } },
  });
  if (!task) return { feil: "Fant ikke oppgaven." };
  if (task.position.planId !== planId) return { feil: "Oppgaven tilhører ikke den valgte planen." };
  if (task.position.plan.userId !== spillerId) return { feil: "Oppgaven tilhører ikke valgt spiller." };
  return { tittel: task.tittel };
}

async function planTilhorerSpiller(planId: string, spillerId: string): Promise<boolean> {
  const plan = await prisma.technicalPlan.findFirst({ where: { id: planId, userId: spillerId }, select: { id: true } });
  return plan !== null;
}

/** Foreslå repetisjoner på én oppgave. Spilleren godtar før de telles. */
export async function tnForeslaaRep(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  planId: string,
  taskId: string,
  felt: "dry" | "lav" | "full",
  antall: number,
): Promise<TnHandlingResultat> {
  if (!Number.isInteger(antall) || antall <= 0) return { ok: false, feil: "Ugyldig antall." };
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) return { ok: false, feil: IKKE_TILGANG };
  const oppgave = await slaaOppOppgave(taskId, planId, spillerId);
  if ("feil" in oppgave) return { ok: false, feil: oppgave.feil };
  return lagreForslag(bruker, kontekst, spillerId, { versjon: 1, kind: "REP_LOG", planId, taskId, taskTittel: oppgave.tittel, felt, antall });
}

/** Foreslå en ny oppgave (og evt. ny P-posisjon). Planen endres først når spilleren godtar. */
export async function tnForeslaaNyOppgave(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: { planId: string; pNummer: string; pName: string; oppgave: OppgaveFeltData },
): Promise<TnHandlingResultat> {
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) return { ok: false, feil: IKKE_TILGANG };
  if (!(await planTilhorerSpiller(input.planId, spillerId))) return { ok: false, feil: "Planen tilhører ikke valgt spiller." };
  const forslag = TekniskPlanForslagSchema.safeParse({ versjon: 1, kind: "TASK_ADD", ...input });
  if (!forslag.success) return { ok: false, feil: "Kontroller feltene i oppgaven." };
  return lagreForslag(bruker, kontekst, spillerId, forslag.data);
}

/** Foreslå endring av en eksisterende oppgave. */
export async function tnForeslaaEndreOppgave(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  planId: string,
  taskId: string,
  oppgave: OppgaveFeltData,
): Promise<TnHandlingResultat> {
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) return { ok: false, feil: IKKE_TILGANG };
  const funnet = await slaaOppOppgave(taskId, planId, spillerId);
  if ("feil" in funnet) return { ok: false, feil: funnet.feil };
  const forslag = TekniskPlanForslagSchema.safeParse({ versjon: 1, kind: "TASK_UPDATE", planId, taskId, taskTittel: funnet.tittel, oppgave });
  if (!forslag.success) return { ok: false, feil: "Kontroller feltene i oppgaven." };
  return lagreForslag(bruker, kontekst, spillerId, forslag.data);
}

/** Foreslå å fjerne en oppgave. Ingenting slettes før spilleren godtar. */
export async function tnForeslaaSlettOppgave(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  planId: string,
  taskId: string,
): Promise<TnHandlingResultat> {
  if (!(await harTnTekniskPlanSkrivetilgang(bruker, kontekst, spillerId))) return { ok: false, feil: IKKE_TILGANG };
  const funnet = await slaaOppOppgave(taskId, planId, spillerId);
  if ("feil" in funnet) return { ok: false, feil: funnet.feil };
  return lagreForslag(bruker, kontekst, spillerId, { versjon: 1, kind: "TASK_DELETE", planId, taskId, taskTittel: funnet.tittel });
}

/** Norske etiketter for `TechnicalPlanAudit.action` — samme historikkverdier som PlayerHQ, aldri rå kodenavn i UI. */
export const TN_AUDIT_ACTION_LABEL: Record<string, string> = {
  TASK_ADD: "Oppgave lagt til",
  TASK_EDIT: "Oppgave redigert",
  TASK_DELETE: "Oppgave slettet",
  PRIO_CHANGE: "Rekkefølge endret",
  STATUS_CHANGE: "Status endret",
};

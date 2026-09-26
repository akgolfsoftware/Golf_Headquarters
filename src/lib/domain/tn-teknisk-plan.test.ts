/**
 * TN-23 Teknisk plan (14.09.2026, rettet etter Codex-review samme dag):
 * målrettet test av lesetilgang OG av `tnLoggRep`s fulle validering —
 * TN-rolle COACH (ikke ASSISTANT), roster, personlig coach-tilgang, og at
 * oppgaven faktisk tilhører den oppgitte planen/spilleren. Et forfalsket
 * `taskId` (annen plan, annen spiller) skal ALDRI nå den delte `logReps`.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let harCoachTilgangResultat = true;
let findFirstKall: { id: string; userId: string }[] = [];
let logRepsKall: { taskId: string; reps: Record<string, number> }[] = [];
let createTaskKall: { planId: string }[] = [];
let updateTaskKall: { taskId: string; patch: unknown }[] = [];
let deleteTaskKall: string[] = [];
let taskRad: { id: string; positionId: string; planId: string; planUserId: string } | null = {
  id: "task-1",
  positionId: "pos-1",
  planId: "plan-1",
  planUserId: "spiller-1",
};

mock.module("next/navigation", {
  namedExports: { redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => harCoachTilgangResultat },
});
mock.module("@/app/portal/tren/teknisk-plan/actions", {
  namedExports: {
    logReps: async (taskId: string, reps: Record<string, number>) => {
      logRepsKall.push({ taskId, reps });
      return { ok: true };
    },
    createTask: async (input: { planId: string }) => {
      createTaskKall.push({ planId: input.planId });
      return { ok: true };
    },
    updateTaskBasics: async (taskId: string, patch: unknown) => {
      updateTaskKall.push({ taskId, patch });
      return { ok: true };
    },
    deleteTask: async (taskId: string) => {
      deleteTaskKall.push(taskId);
      return { ok: true };
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      technicalPlan: {
        findFirst: async ({ where }: { where: { id: string; userId: string } }) => {
          findFirstKall.push(where);
          if (where.id !== "plan-1" || where.userId !== "spiller-1") return null;
          return { id: "plan-1", navn: "Vårplan", status: "ACTIVE", startDato: new Date("2026-01-01"), sluttDato: null, positions: [], audits: [] };
        },
        findMany: async () => [],
      },
      positionTask: {
        findUnique: async ({ where }: { where: { id: string } }) =>
          taskRad && taskRad.id === where.id
            ? { position: { planId: taskRad.planId, plan: { userId: taskRad.planUserId } } }
            : null,
      },
    },
  },
});

function reset() {
  harCoachTilgangResultat = true;
  findFirstKall = [];
  logRepsKall = [];
  createTaskKall = [];
  updateTaskKall = [];
  deleteTaskKall = [];
  taskRad = { id: "task-1", positionId: "pos-1", planId: "plan-1", planUserId: "spiller-1" };
}
reset();

async function modul() {
  return import("./tn-teknisk-plan");
}

const tnKontekstBase = { gruppeId: "gruppe-tn", gruppeNavn: "Team Norway", erTrener: true, erSpiller: false, kanAdministrere: true, spillere: [{ id: "spiller-1", navn: "Spiller Én" }] };
const coach = { id: "coach-1", role: "COACH" as const, name: "Coach" };

test("krevFullForEgenTekniskPlan: TALENT/INGEN-spiller som ser SIN EGEN plan sendes til oppgraderingssiden", async () => {
  const { krevFullForEgenTekniskPlan } = await modul();
  assert.throws(() => krevFullForEgenTekniskPlan({ id: "spiller-1", role: "PLAYER", tilgang: { nivaa: "INGEN" } }, "spiller-1"), /REDIRECT:\/portal\/oppgrader/);
  assert.throws(() => krevFullForEgenTekniskPlan({ id: "spiller-1", role: "PLAYER", tilgang: { nivaa: "TALENT" } }, "spiller-1"), /REDIRECT:\/portal\/oppgrader\?fra=laast/);
});

test("krevFullForEgenTekniskPlan: FULL-spiller på egen plan, og en TRENER som ser en ANNEN spillers plan, rammes aldri", async () => {
  const { krevFullForEgenTekniskPlan } = await modul();
  assert.doesNotThrow(() => krevFullForEgenTekniskPlan({ id: "spiller-1", role: "PLAYER", tilgang: { nivaa: "FULL" } }, "spiller-1"));
  // Coach med TALENT-aktig underliggende tilgang (irrelevant for coach) som ser en spillers plan.
  assert.doesNotThrow(() => krevFullForEgenTekniskPlan({ id: "coach-1", role: "COACH", tilgang: { nivaa: "INGEN" } }, "spiller-1"));
});

test("harTnTekniskPlanLesetilgang: spilleren ser alltid egen plan uten å spørre coach-porten", async () => {
  reset();
  harCoachTilgangResultat = false;
  const { harTnTekniskPlanLesetilgang } = await modul();
  const res = await harTnTekniskPlanLesetilgang({ id: "spiller-1", role: "PLAYER", name: null }, { ...tnKontekstBase, erSpiller: true, erTrener: false }, "spiller-1");
  assert.equal(res, true);
});

test("harTnTekniskPlanLesetilgang: TN-ASSISTANT (erTrener men ikke kanAdministrere) LESER likevel med personlig tilgang", async () => {
  reset();
  const { harTnTekniskPlanLesetilgang } = await modul();
  const res = await harTnTekniskPlanLesetilgang(coach, { ...tnKontekstBase, kanAdministrere: false }, "spiller-1");
  assert.equal(res, true);
});

test("harTnTekniskPlanLesetilgang: selv-ID-snarveien krever kontekst.erSpiller — en trener med samme id som spillerId (bør ikke skje) faller videre til trener-sjekken", async () => {
  reset();
  harCoachTilgangResultat = false;
  const { harTnTekniskPlanLesetilgang } = await modul();
  // coach.id brukt som "spillerId" — men kontekst.erSpiller er false (coach er ikke en TN-spiller) og
  // coach.id er heller ikke i rosteret, så dette skal IKKE slippe gjennom selv-ID-snarveien.
  const res = await harTnTekniskPlanLesetilgang(coach, tnKontekstBase, coach.id);
  assert.equal(res, false);
});

test("harTnTekniskPlanLesetilgang: spiller utenfor TN-rosteret avvises selv med personlig coach-tilgang", async () => {
  reset();
  const { harTnTekniskPlanLesetilgang } = await modul();
  const res = await harTnTekniskPlanLesetilgang(coach, tnKontekstBase, "utenfor-tn");
  assert.equal(res, false);
});

test("tnLoggRep: TN-ASSISTANT (kanAdministrere=false) avvises FØR task/plan slås opp", async () => {
  reset();
  const { tnLoggRep } = await modul();
  const svar = await tnLoggRep(coach, { ...tnKontekstBase, kanAdministrere: false }, "spiller-1", "plan-1", "task-1", "dry", 10);
  assert.equal(svar.ok, false);
  assert.equal(logRepsKall.length, 0);
});

test("tnLoggRep: forfalsket taskId som tilhører en ANNEN spiller avvises, logReps kalles aldri", async () => {
  reset();
  taskRad = { id: "task-1", positionId: "pos-1", planId: "plan-1", planUserId: "en-annen-spiller" };
  const { tnLoggRep } = await modul();
  const svar = await tnLoggRep(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "dry", 10);
  assert.equal(svar.ok, false);
  assert.equal(logRepsKall.length, 0);
});

test("tnLoggRep: taskId som tilhører riktig spiller, men FEIL plan-id oppgitt, avvises", async () => {
  reset();
  taskRad = { id: "task-1", positionId: "pos-1", planId: "en-annen-plan", planUserId: "spiller-1" };
  const { tnLoggRep } = await modul();
  const svar = await tnLoggRep(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "dry", 10);
  assert.equal(svar.ok, false);
  assert.equal(logRepsKall.length, 0);
});

test("tnLoggRep: gyldig TN-COACH, riktig spiller/plan/oppgave — kaller delt logReps nøyaktig én gang", async () => {
  reset();
  const { tnLoggRep } = await modul();
  const svar = await tnLoggRep(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "full", 12);
  assert.equal(svar.ok, true);
  assert.deepEqual(logRepsKall, [{ taskId: "task-1", reps: { full: 12 } }]);
});

test("tnOpprettOppgave: TN-ASSISTANT avvises FØR planeierskap sjekkes", async () => {
  reset();
  const { tnOpprettOppgave } = await modul();
  const input = { planId: "plan-1", pNummer: "P1.0", pName: "Adresse", tittel: "Ny oppgave", pyramide: "TEK" as const, omraade: "Adresse", koller: [], repsMaalDry: 0, repsMaalLav: 0, repsMaalFull: 0 };
  const svar = await tnOpprettOppgave(coach, { ...tnKontekstBase, kanAdministrere: false }, "spiller-1", input);
  assert.equal(svar.ok, false);
  assert.equal(createTaskKall.length, 0);
});

test("tnOpprettOppgave: planId som IKKE tilhører valgt spiller avvises", async () => {
  reset();
  const { tnOpprettOppgave } = await modul();
  const input = { planId: "en-annen-plan", pNummer: "P1.0", pName: "Adresse", tittel: "Ny oppgave", pyramide: "TEK" as const, omraade: "Adresse", koller: [], repsMaalDry: 0, repsMaalLav: 0, repsMaalFull: 0 };
  const svar = await tnOpprettOppgave(coach, tnKontekstBase, "spiller-1", input);
  assert.equal(svar.ok, false);
  assert.equal(createTaskKall.length, 0);
});

test("tnOpprettOppgave: gyldig TN-COACH og egen plan lykkes", async () => {
  reset();
  const { tnOpprettOppgave } = await modul();
  const input = { planId: "plan-1", pNummer: "P1.0", pName: "Adresse", tittel: "Ny oppgave", pyramide: "TEK" as const, omraade: "Adresse", koller: [], repsMaalDry: 0, repsMaalLav: 0, repsMaalFull: 0 };
  const svar = await tnOpprettOppgave(coach, tnKontekstBase, "spiller-1", input);
  assert.equal(svar.ok, true);
  assert.deepEqual(createTaskKall, [{ planId: "plan-1" }]);
});

test("tnOppdaterOppgave/tnSlettOppgave: forfalsket taskId for ANNEN spiller avvises, ingen kall til delte actions", async () => {
  reset();
  taskRad = { id: "task-1", positionId: "pos-1", planId: "plan-1", planUserId: "en-annen-spiller" };
  const { tnOppdaterOppgave, tnSlettOppgave } = await modul();
  const oppdater = await tnOppdaterOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", { tittel: "X" });
  assert.equal(oppdater.ok, false);
  assert.equal(updateTaskKall.length, 0);
  const slett = await tnSlettOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "SLETT");
  assert.equal(slett.ok, false);
  assert.equal(deleteTaskKall.length, 0);
});

test("tnSlettOppgave: krever SLETT-bekreftelse selv med gyldig eierskap", async () => {
  reset();
  const { tnSlettOppgave } = await modul();
  const utenBekreftelse = await tnSlettOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "");
  assert.equal(utenBekreftelse.ok, false);
  assert.equal(deleteTaskKall.length, 0);
  const medBekreftelse = await tnSlettOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "slett");
  assert.equal(medBekreftelse.ok, true);
  assert.deepEqual(deleteTaskKall, ["task-1"]);
});

test("tnOppdaterOppgave: gyldig eierskap kaller delt updateTaskBasics nøyaktig én gang", async () => {
  reset();
  const { tnOppdaterOppgave } = await modul();
  const svar = await tnOppdaterOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", { tittel: "Oppdatert tittel" });
  assert.equal(svar.ok, true);
  assert.deepEqual(updateTaskKall, [{ taskId: "task-1", patch: { tittel: "Oppdatert tittel" } }]);
});

test("hentTnTekniskPlanDetalj spør alltid med { id: planId, userId: spillerId } — aldri viewerens id", async () => {
  reset();
  const { hentTnTekniskPlanDetalj } = await modul();
  const treff = await hentTnTekniskPlanDetalj("spiller-1", "plan-1");
  assert.equal(treff?.navn, "Vårplan");
  assert.deepEqual(findFirstKall, [{ id: "plan-1", userId: "spiller-1" }]);

  const feilSpiller = await hentTnTekniskPlanDetalj("en-annen-spiller", "plan-1");
  assert.equal(feilSpiller, null);
});

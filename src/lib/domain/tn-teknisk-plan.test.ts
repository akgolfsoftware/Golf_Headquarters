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
let forslagLagret: { userId: string; coachId: string; status: string; actionType: string; suggestion: unknown }[] = [];
let delingAktiv = true;
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
  namedExports: {
    harCoachTilgangTilSpiller: async () => harCoachTilgangResultat,
    harCoachLesetilgangTilSpiller: async () => harCoachTilgangResultat,
  },
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
mock.module("@/lib/deling/profil-lesing", {
  namedExports: {
    medNavngittProfil: async (_brukerId: string, _spillerId: string, _gruppeId: string, les: (tx: unknown) => Promise<unknown>) => {
      if (!delingAktiv) return null;
      return les({
        planAction: {
          create: async ({ data }: { data: (typeof forslagLagret)[number] }) => {
            forslagLagret.push(data);
            return { id: "forslag-1" };
          },
        },
      });
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
            ? { tittel: "Adresse-drill", position: { planId: taskRad.planId, plan: { userId: taskRad.planUserId } } }
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
  forslagLagret = [];
  delingAktiv = true;
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

const oppgaveInput = { tittel: "Ny oppgave", beskrivelse: null, pyramide: "TEK" as const, omraade: "Adresse", koller: [], repsMaalDry: 0, repsMaalLav: 0, repsMaalFull: 0 };
const nyOppgave = (planId = "plan-1") => ({ planId, pNummer: "P1.0", pName: "Adresse", oppgave: oppgaveInput });

function ingenDirekteSkriving() {
  assert.equal(logRepsKall.length, 0);
  assert.equal(createTaskKall.length, 0);
  assert.equal(updateTaskKall.length, 0);
  assert.equal(deleteTaskKall.length, 0);
}

test("tnForeslaaRep: TN-ASSISTANT (kanAdministrere=false) avvises FØR task/plan slås opp, og ingenting lagres", async () => {
  reset();
  const { tnForeslaaRep } = await modul();
  const svar = await tnForeslaaRep(coach, { ...tnKontekstBase, kanAdministrere: false }, "spiller-1", "plan-1", "task-1", "dry", 10);
  assert.equal(svar.ok, false);
  assert.equal(forslagLagret.length, 0);
  ingenDirekteSkriving();
});

test("tnForeslaaRep: forfalsket taskId som tilhører en ANNEN spiller avvises", async () => {
  reset();
  taskRad = { id: "task-1", positionId: "pos-1", planId: "plan-1", planUserId: "en-annen-spiller" };
  const { tnForeslaaRep } = await modul();
  const svar = await tnForeslaaRep(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "dry", 10);
  assert.equal(svar.ok, false);
  assert.equal(forslagLagret.length, 0);
});

test("tnForeslaaRep: oppgave i FEIL plan avvises", async () => {
  reset();
  taskRad = { id: "task-1", positionId: "pos-1", planId: "en-annen-plan", planUserId: "spiller-1" };
  const { tnForeslaaRep } = await modul();
  const svar = await tnForeslaaRep(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "dry", 10);
  assert.equal(svar.ok, false);
  assert.equal(forslagLagret.length, 0);
});

test("tnForeslaaRep: gyldig TN-COACH lagrer ett PENDING-forslag til spilleren og skriver aldri i planen", async () => {
  reset();
  const { tnForeslaaRep } = await modul();
  const svar = await tnForeslaaRep(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "full", 12);
  assert.equal(svar.ok, true);
  assert.equal(forslagLagret.length, 1);
  const data = forslagLagret[0];
  assert.equal(data.userId, "spiller-1");
  assert.equal(data.coachId, "coach-1");
  assert.equal(data.status, "PENDING");
  assert.equal(data.actionType, "TECH_PLAN_COACH_PROPOSAL");
  assert.deepEqual(data.suggestion, { versjon: 1, kind: "REP_LOG", planId: "plan-1", taskId: "task-1", taskTittel: "Adresse-drill", felt: "full", antall: 12 });
  ingenDirekteSkriving();
});

test("delingslåsen: uten aktiv deling lagres ingenting, for alle fire forslagstyper", async () => {
  reset();
  delingAktiv = false;
  const { tnForeslaaRep, tnForeslaaNyOppgave, tnForeslaaEndreOppgave, tnForeslaaSlettOppgave } = await modul();
  const resultater = [
    await tnForeslaaRep(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", "dry", 5),
    await tnForeslaaNyOppgave(coach, tnKontekstBase, "spiller-1", nyOppgave()),
    await tnForeslaaEndreOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", oppgaveInput),
    await tnForeslaaSlettOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1"),
  ];
  assert.deepEqual(resultater.map((r) => r.ok), [false, false, false, false]);
  assert.equal(forslagLagret.length, 0);
  ingenDirekteSkriving();
});

test("tnForeslaaNyOppgave: TN-ASSISTANT avvises FØR planeierskap sjekkes", async () => {
  reset();
  const { tnForeslaaNyOppgave } = await modul();
  const svar = await tnForeslaaNyOppgave(coach, { ...tnKontekstBase, kanAdministrere: false }, "spiller-1", nyOppgave());
  assert.equal(svar.ok, false);
  assert.equal(forslagLagret.length, 0);
});

test("tnForeslaaNyOppgave: planId som IKKE tilhører valgt spiller avvises", async () => {
  reset();
  const { tnForeslaaNyOppgave } = await modul();
  const svar = await tnForeslaaNyOppgave(coach, tnKontekstBase, "spiller-1", nyOppgave("en-annen-plan"));
  assert.equal(svar.ok, false);
  assert.equal(forslagLagret.length, 0);
});

test("tnForeslaaNyOppgave: gyldig forslag lagres, createTask kalles aldri", async () => {
  reset();
  const { tnForeslaaNyOppgave } = await modul();
  const svar = await tnForeslaaNyOppgave(coach, tnKontekstBase, "spiller-1", nyOppgave());
  assert.equal(svar.ok, true);
  assert.equal((forslagLagret[0].suggestion as { kind: string }).kind, "TASK_ADD");
  ingenDirekteSkriving();
});

test("tnForeslaaEndreOppgave/tnForeslaaSlettOppgave: forfalsket taskId for ANNEN spiller avvises", async () => {
  reset();
  taskRad = { id: "task-1", positionId: "pos-1", planId: "plan-1", planUserId: "en-annen-spiller" };
  const { tnForeslaaEndreOppgave, tnForeslaaSlettOppgave } = await modul();
  assert.equal((await tnForeslaaEndreOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", oppgaveInput)).ok, false);
  assert.equal((await tnForeslaaSlettOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1")).ok, false);
  assert.equal(forslagLagret.length, 0);
});

test("tnForeslaaEndreOppgave og tnForeslaaSlettOppgave: gyldig eierskap lagrer forslag og rører aldri oppgaven", async () => {
  reset();
  const { tnForeslaaEndreOppgave, tnForeslaaSlettOppgave } = await modul();
  assert.equal((await tnForeslaaEndreOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", { ...oppgaveInput, tittel: "Oppdatert tittel" })).ok, true);
  assert.equal((await tnForeslaaSlettOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1")).ok, true);
  assert.deepEqual(forslagLagret.map((f) => (f.suggestion as { kind: string }).kind), ["TASK_UPDATE", "TASK_DELETE"]);
  ingenDirekteSkriving();
});

test("tnForeslaaEndreOppgave: ugyldig innhold (tom tittel) lagres ikke", async () => {
  reset();
  const { tnForeslaaEndreOppgave } = await modul();
  const svar = await tnForeslaaEndreOppgave(coach, tnKontekstBase, "spiller-1", "plan-1", "task-1", { ...oppgaveInput, tittel: "  " });
  assert.equal(svar.ok, false);
  assert.equal(forslagLagret.length, 0);
});

test("de gamle skrivefunksjonene finnes ikke lenger: TN-treneren kan ikke skrive direkte", async () => {
  const m = (await modul()) as Record<string, unknown>;
  for (const navn of ["tnLoggRep", "tnOpprettOppgave", "tnOppdaterOppgave", "tnSlettOppgave"]) assert.equal(m[navn], undefined, navn);
});

test("hentTnTekniskPlanDetalj spør alltid med { id: planId, userId: spillerId } — aldri viewerens id", async () => {
  reset();
  const { hentTnTekniskPlanDetalj } = await modul();
  const { prisma: db } = (await import("@/lib/prisma")) as unknown as { prisma: Parameters<typeof hentTnTekniskPlanDetalj>[0] };
  const treff = await hentTnTekniskPlanDetalj(db, "spiller-1", "plan-1");
  assert.equal(treff?.navn, "Vårplan");
  assert.deepEqual(findFirstKall, [{ id: "plan-1", userId: "spiller-1" }]);

  const feilSpiller = await hentTnTekniskPlanDetalj(db, "en-annen-spiller", "plan-1");
  assert.equal(feilSpiller, null);
});

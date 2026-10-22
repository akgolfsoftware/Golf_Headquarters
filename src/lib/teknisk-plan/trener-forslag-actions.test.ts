/**
 * A2: spilleren bestemmer. Godkjenning skriver planen (én gang), avvisning skriver ingenting,
 * og et forslag til en annen spiller kan aldri besvares.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rad = { id: string; userId: string; status: string; suggestion: unknown };
let rader: Rad[] = [];
let logRepsKall: { taskId: string; reps: Record<string, number> }[] = [];
let deleteKall: string[] = [];
let taskEier = "spiller-1";
let planEier = "spiller-1";
let kastVedAnvendelse = false;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: { requireSpillerActionUser: async () => ({ id: "spiller-1", role: "PLAYER" }) },
});
mock.module("@/app/portal/tren/teknisk-plan/actions", {
  namedExports: {
    logReps: async (taskId: string, reps: Record<string, number>) => {
      if (kastVedAnvendelse) throw new Error("feil");
      logRepsKall.push({ taskId, reps });
    },
    createTask: async () => ({ ok: true }),
    updateTaskBasics: async () => ({ ok: true }),
    deleteTask: async (taskId: string) => { deleteKall.push(taskId); },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      planAction: {
        findFirst: async ({ where }: { where: { id: string; userId: string; status: string } }) =>
          rader.find((r) => r.id === where.id && r.userId === where.userId && r.status === where.status) ?? null,
        updateMany: async ({ where, data }: { where: { id: string; userId?: string; status?: string }; data: { status: string } }) => {
          const rad = rader.find((r) => r.id === where.id && (!where.userId || r.userId === where.userId) && (!where.status || r.status === where.status));
          if (!rad) return { count: 0 };
          rad.status = data.status;
          return { count: 1 };
        },
      },
      technicalPlan: { findFirst: async ({ where }: { where: { userId: string } }) => (where.userId === planEier ? { id: "plan-1" } : null) },
      positionTask: { findUnique: async () => ({ position: { planId: "plan-1", plan: { userId: taskEier } } }) },
    },
  },
});

const repForslag = { versjon: 1, kind: "REP_LOG", planId: "plan-1", taskId: "task-1", taskTittel: "Adresse", felt: "lav", antall: 8 };

function reset() {
  rader = [{ id: "f1", userId: "spiller-1", status: "PENDING", suggestion: repForslag }];
  logRepsKall = [];
  deleteKall = [];
  taskEier = "spiller-1";
  planEier = "spiller-1";
  kastVedAnvendelse = false;
}

async function modul() {
  return import("./trener-forslag-actions");
}

test("godkjenning anvender forslaget nøyaktig én gang og gjør det ACCEPTED", async () => {
  reset();
  const { svarPaTekniskPlanForslag } = await modul();
  const svar = await svarPaTekniskPlanForslag({ actionId: "f1", beslutning: "ACCEPTED" });
  assert.deepEqual(svar, { ok: true, status: "ACCEPTED" });
  assert.deepEqual(logRepsKall, [{ taskId: "task-1", reps: { lav: 8 } }]);
  assert.equal(rader[0].status, "ACCEPTED");
  const igjen = await svarPaTekniskPlanForslag({ actionId: "f1", beslutning: "ACCEPTED" });
  assert.equal(igjen.ok, false);
  assert.equal(logRepsKall.length, 1);
});

test("avvisning skriver ingenting i planen", async () => {
  reset();
  const { svarPaTekniskPlanForslag } = await modul();
  const svar = await svarPaTekniskPlanForslag({ actionId: "f1", beslutning: "REJECTED" });
  assert.deepEqual(svar, { ok: true, status: "REJECTED" });
  assert.equal(logRepsKall.length, 0);
  assert.equal(rader[0].status, "REJECTED");
});

test("forslag til en annen spiller kan ikke besvares", async () => {
  reset();
  rader[0].userId = "en-annen-spiller";
  const { svarPaTekniskPlanForslag } = await modul();
  const svar = await svarPaTekniskPlanForslag({ actionId: "f1", beslutning: "ACCEPTED" });
  assert.equal(svar.ok, false);
  assert.equal(logRepsKall.length, 0);
  assert.equal(rader[0].status, "PENDING");
});

test("oppgave som ikke lenger er spillerens gir CONFLICT og ingen skriving", async () => {
  reset();
  taskEier = "en-annen-spiller";
  const { svarPaTekniskPlanForslag } = await modul();
  const svar = await svarPaTekniskPlanForslag({ actionId: "f1", beslutning: "ACCEPTED" });
  assert.equal(svar.ok, false);
  assert.equal(logRepsKall.length, 0);
  assert.equal(rader[0].status, "CONFLICT");
});

test("feil ved anvendelse gir CONFLICT, ikke et halvt anvendt forslag", async () => {
  reset();
  kastVedAnvendelse = true;
  const { svarPaTekniskPlanForslag } = await modul();
  const svar = await svarPaTekniskPlanForslag({ actionId: "f1", beslutning: "ACCEPTED" });
  assert.equal(svar.ok, false);
  assert.equal(rader[0].status, "CONFLICT");
});

test("sletteforslag fjerner oppgaven bare etter godkjenning", async () => {
  reset();
  rader[0].suggestion = { versjon: 1, kind: "TASK_DELETE", planId: "plan-1", taskId: "task-1", taskTittel: "Adresse" };
  const { svarPaTekniskPlanForslag } = await modul();
  assert.equal(deleteKall.length, 0);
  await svarPaTekniskPlanForslag({ actionId: "f1", beslutning: "ACCEPTED" });
  assert.deepEqual(deleteKall, ["task-1"]);
});

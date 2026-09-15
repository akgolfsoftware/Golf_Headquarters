/**
 * R-I: admin/tournaments/actions.ts. Turneringer er en delt admin-ressurs
 * uten per-coach eierskap, så vernet her er rollegrensen alene — hver av de
 * 12 mutasjonene skal avvise PLAYER (og uinnlogget) uten å skrive noe, og
 * fortsatt slippe COACH gjennom. Testen fanger regresjon der noen glemmer
 * `requireCoachActionUser()`/`getCurrentUser()`-sjekken på en ny handling.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const tournaments: Record<string, { id: string; name: string; startDate: Date; mergedIntoId: string | null }> = {};
const entries: Record<string, { id: string; tournamentId: string; userId: string; priority: string }> = {};

let tournamentCreates: unknown[] = [];
let tournamentUpdates: unknown[] = [];
let tournamentDeletes: string[] = [];
let resultUpserts: unknown[] = [];
let resultDeletes: string[] = [];
let entryCreates: unknown[] = [];
let entryUpdates: unknown[] = [];
let entryDeletes: string[] = [];
let coachingSessionWrites: unknown[] = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  for (const k of Object.keys(tournaments)) delete tournaments[k];
  for (const k of Object.keys(entries)) delete entries[k];
  Object.assign(tournaments, {
    "t-a": { id: "t-a", name: "Turnering A", startDate: new Date("2026-05-01"), mergedIntoId: null },
    "t-b": { id: "t-b", name: "Turnering B", startDate: new Date("2026-06-01"), mergedIntoId: null },
  });
  Object.assign(entries, {
    "entry-a": { id: "entry-a", tournamentId: "t-a", userId: "spiller-a", priority: "NORMAL" },
  });
  tournamentCreates = [];
  tournamentUpdates = [];
  tournamentDeletes = [];
  resultUpserts = [];
  resultDeletes = [];
  entryCreates = [];
  entryUpdates = [];
  entryDeletes = [];
  coachingSessionWrites = [];
  auditWrites = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: () => {
      throw new Error("NEXT_REDIRECT");
    },
  },
});
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: {
    getCurrentUser: async () => bruker,
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push({ action: input.action, target: input.target });
    },
  },
});
mock.module("@/lib/notifications", {
  namedExports: { notify: async () => undefined },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: prismaMock,
  },
});
Object.assign(prismaMock, {
      tournament: {
        create: async ({ data }: { data: { name: string } }) => {
          tournamentCreates.push(data);
          return { id: "ny-turnering", name: data.name };
        },
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          tournamentUpdates.push({ id: where.id, data });
          return { id: where.id };
        },
        delete: async ({ where }: { where: { id: string } }) => {
          tournamentDeletes.push(where.id);
          return { id: where.id };
        },
        findUnique: async ({ where }: { where: { id: string } }) => tournaments[where.id] ?? null,
      },
      tournamentResult: {
        upsert: async ({ create }: { create: unknown }) => {
          resultUpserts.push(create);
          return { id: "resultat-1" };
        },
        delete: async ({ where }: { where: { id: string } }) => {
          resultDeletes.push(where.id);
          return { id: where.id };
        },
        updateMany: async () => ({ count: 0 }),
      },
      tournamentEntry: {
        findFirst: async () => null,
        findUnique: async ({ where }: { where: { id: string } }) => entries[where.id] ?? null,
        findMany: async ({ where }: { where: { tournamentId: string; userId: { in: string[] } } }) =>
          Object.values(entries)
            .filter((e) => e.tournamentId === where.tournamentId && where.userId.in.includes(e.userId))
            .map((e) => ({ userId: e.userId, user: { name: "Spiller" } })),
        create: async ({ data }: { data: unknown }) => {
          entryCreates.push(data);
          return { id: "ny-entry" };
        },
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          entryUpdates.push({ id: where.id, data });
          return { tournamentId: entries[where.id]?.tournamentId ?? "t-a" };
        },
        delete: async ({ where }: { where: { id: string } }) => {
          entryDeletes.push(where.id);
          return { id: where.id };
        },
        updateMany: async () => ({ count: 0 }),
      },
      seasonPlan: {
        findUnique: async () => null,
      },
      publicPlayerEntry: {
        updateMany: async () => ({ count: 0 }),
      },
      coachingSession: {
        findFirst: async () => null,
        create: async ({ data }: { data: unknown }) => {
          coachingSessionWrites.push(data);
          return { id: "traad-1" };
        },
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          coachingSessionWrites.push({ id: where.id, data });
          return { id: where.id };
        },
      },
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(prismaMock),
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("createTournament avviser PLAYER uten å opprette turnering", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createTournament } = await actions();
  await assert.rejects(() =>
    createTournament({ name: "Ny turnering", startDate: "2026-07-01", format: "STROKE" }),
  );
  assert.equal(tournamentCreates.length, 0);
});

test("createTournament avviser uinnlogget uten å opprette turnering", async () => {
  bruker = null;
  const { createTournament } = await actions();
  await assert.rejects(() =>
    createTournament({ name: "Ny turnering", startDate: "2026-07-01", format: "STROKE" }),
  );
  assert.equal(tournamentCreates.length, 0);
});

test("createTournament oppretter turnering for COACH", async () => {
  const { createTournament } = await actions();
  const id = await createTournament({ name: "Ny turnering", startDate: "2026-07-01", format: "STROKE" });
  assert.equal(id, "ny-turnering");
  assert.equal(tournamentCreates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "tournament.created");
});

test("updateTournament avviser PLAYER uten å oppdatere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateTournament } = await actions();
  await assert.rejects(() =>
    updateTournament("t-a", { name: "Endret", startDate: "2026-07-01", format: "STROKE" }),
  );
  assert.equal(tournamentUpdates.length, 0);
});

test("deleteTournament avviser PLAYER uten å slette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deleteTournament } = await actions();
  await assert.rejects(() => deleteTournament("t-a"));
  assert.equal(tournamentDeletes.length, 0);
});

test("addResult avviser PLAYER uten å skrive resultat", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { addResult } = await actions();
  await assert.rejects(() => addResult("t-a", { userId: "spiller-a", position: 1, score: 70 }));
  assert.equal(resultUpserts.length, 0);
});

test("deleteResult avviser PLAYER uten å slette resultat", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deleteResult } = await actions();
  await assert.rejects(() => deleteResult("t-a", "resultat-1"));
  assert.equal(resultDeletes.length, 0);
});

test("meldPaSpillere avviser PLAYER uten å melde på noen", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { meldPaSpillere } = await actions();
  await assert.rejects(() => meldPaSpillere("t-a", [{ userId: "spiller-a" }]));
  assert.equal(entryCreates.length, 0);
});

test("fjernPamelding avviser PLAYER uten å fjerne påmelding", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { fjernPamelding } = await actions();
  await assert.rejects(() => fjernPamelding("entry-a"));
  assert.equal(entryDeletes.length, 0);
});

test("oppdaterPrioritet avviser PLAYER uten å endre prioritet", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { oppdaterPrioritet } = await actions();
  await assert.rejects(() => oppdaterPrioritet("entry-a", "MAJOR"));
  assert.equal(entryUpdates.length, 0);
});

test("mergeTurneringer avviser PLAYER uten å flytte noe", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { mergeTurneringer } = await actions();
  await assert.rejects(() => mergeTurneringer({ sourceId: "t-a", targetId: "t-b" }));
});

test("mergeTurneringer flytter for COACH", async () => {
  const { mergeTurneringer } = await actions();
  const svar = await mergeTurneringer({ sourceId: "t-a", targetId: "t-b" });
  assert.equal(svar.ok, true);
  assert.equal(auditWrites.at(-1)?.action, "tournament.merged");
});

test("unmergeTurnering avviser PLAYER uten å reversere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { unmergeTurnering } = await actions();
  await assert.rejects(() => unmergeTurnering("t-a"));
});

test("exportTournamentsReport avviser PLAYER med eksplisitt feil, ikke unntak", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { exportTournamentsReport } = await actions();
  const svar = await exportTournamentsReport({
    format: "csv",
    type: "resultater",
    period: "kommende",
    sortBy: "dato",
    tournamentIds: [],
  });
  assert.equal(svar.success, false);
  assert.equal(auditWrites.length, 0);
});

test("exportTournamentsReport avviser uinnlogget med eksplisitt feil", async () => {
  bruker = null;
  const { exportTournamentsReport } = await actions();
  const svar = await exportTournamentsReport({
    format: "csv",
    type: "resultater",
    period: "kommende",
    sortBy: "dato",
    tournamentIds: [],
  });
  assert.equal(svar.success, false);
});

test("sendFellesmelding avviser PLAYER uten å levere melding", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { sendFellesmelding } = await actions();
  await assert.rejects(() =>
    sendFellesmelding({ turneringId: "t-a", spillerIds: ["spiller-a"], tekst: "Hei" }),
  );
  assert.equal(coachingSessionWrites.length, 0);
});

test("sendFellesmelding leverer for COACH til faktisk deltaker", async () => {
  const { sendFellesmelding } = await actions();
  const svar = await sendFellesmelding({ turneringId: "t-a", spillerIds: ["spiller-a"], tekst: "Hei" });
  assert.equal(svar.ok, true);
  assert.equal(svar.sendt, 1);
  assert.equal(coachingSessionWrites.length, 1);
});

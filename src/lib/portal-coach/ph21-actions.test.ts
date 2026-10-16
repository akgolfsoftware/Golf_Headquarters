import { before, beforeEach, describe, mock, test } from "node:test";
import assert from "node:assert/strict";

type Bruker = { id: string; role: string } | null;

let bruker: Bruker;
let valgtCoach: string | null;
let standardCoach: string | null;
let coachet: boolean;
const skrevet: Array<{ op: string; data: Record<string, unknown> }> = [];

const fil = (rel: string) => new URL(rel, import.meta.url).pathname;

mock.module(fil("../auth/getCurrentUser.ts"), {
  namedExports: { getCurrentUser: async () => bruker, getCurrentUserRaw: async () => bruker },
});
mock.module(fil("../domain/valgt-coach.ts"), {
  namedExports: { resolveValgtCoachId: async () => valgtCoach },
});
mock.module(fil("../auth/coached.ts"), {
  namedExports: { erCoachetSpiller: async () => coachet },
});
mock.module(fil("../prisma.ts"), {
  namedExports: {
    prisma: {
      user: { findFirst: async () => (standardCoach ? { id: standardCoach } : null) },
      coachingSession: {
        findFirst: async () => null,
        create: async (arg: { data: Record<string, unknown> }) => {
          skrevet.push({ op: "create", data: arg.data });
          return { id: "s1" };
        },
        update: async (arg: { data: Record<string, unknown> }) => {
          skrevet.push({ op: "update", data: arg.data });
          return { id: "s1" };
        },
      },
    },
  },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });

let actions: typeof import("./ph21-actions");
before(async () => {
  actions = await import("./ph21-actions");
});

describe("sendPH21MeldingAction — mottaker låst til spillerens coach", () => {
  beforeEach(() => {
    bruker = { id: "spiller-1", role: "PLAYER" };
    valgtCoach = "coach-egen";
    standardCoach = "coach-standard";
    coachet = true;
    skrevet.length = 0;
  });

  test("godtar melding til egen coach", async () => {
    const res = await actions.sendPH21MeldingAction("coach-egen", "  Hei  ");
    assert.deepEqual(res, { ok: true });
    assert.equal(skrevet.length, 1);
    assert.equal(skrevet[0].data.userId, "spiller-1");
    assert.equal(skrevet[0].data.coachId, "coach-egen");
    const msgs = skrevet[0].data.messages as Array<{ content: string }>;
    assert.equal(msgs[0].content, "Hei");
  });

  test("avviser fremmed coachId uten å skrive noe", async () => {
    const res = await actions.sendPH21MeldingAction("coach-fremmed", "Hei");
    assert.equal(res.ok, false);
    assert.equal(skrevet.length, 0);
  });

  test("avviser spiller uten coach-tilknytning", async () => {
    coachet = false;
    const res = await actions.sendPH21MeldingAction("coach-egen", "Hei");
    assert.equal(res.ok, false);
    assert.equal(skrevet.length, 0);
  });

  test("avviser uinnlogget, tom melding og tom coachId", async () => {
    bruker = null;
    assert.equal((await actions.sendPH21MeldingAction("coach-egen", "Hei")).ok, false);
    bruker = { id: "spiller-1", role: "PLAYER" };
    assert.equal((await actions.sendPH21MeldingAction("coach-egen", "   ")).ok, false);
    assert.equal((await actions.sendPH21MeldingAction("", "Hei")).ok, false);
    assert.equal(skrevet.length, 0);
  });

  test("uten valgt coach er bare standardcoachen (samme som skjermen viser) gyldig", async () => {
    valgtCoach = null;
    assert.equal((await actions.sendPH21MeldingAction("coach-egen", "Hei")).ok, false);
    assert.equal((await actions.sendPH21MeldingAction("coach-standard", "Hei")).ok, true);
    assert.equal(skrevet.length, 1);
  });
});

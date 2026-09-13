import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let me = { id: "spiller", role: "PLAYER" as string };
let stall = false;
let writes = 0;
let rad: {
  id: string;
  playerId: string;
  coachId: string;
  status: string;
  date: Date;
  startMinute: number;
  durationMinutes: number;
  title: string;
  pyramid: string;
  blockType: string;
  origin: string;
  createdAt: Date;
  updatedAt: Date;
  drills: unknown[];
} | null;

function baseRad(playerId: string) {
  return {
    id: "wb-1",
    playerId,
    coachId: "coach",
    status: "DRAFT",
    date: new Date("2026-06-22"),
    startMinute: 540,
    durationMinutes: 60,
    title: "Workbench-økt",
    pyramid: "TEK",
    blockType: "OEKT",
    origin: "PLAYER",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    drills: [],
  };
}

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => me },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => stall },
});
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      workbenchSession: {
        findUnique: async () => rad,
        create: async ({ data }: { data: { playerId: string; title: string } }) => {
          writes += 1;
          rad = { ...baseRad(data.playerId), title: data.title };
          return rad;
        },
        update: async ({ data }: { data: { date?: Date; startMinute?: number; durationMinutes?: number } }) => {
          writes += 1;
          if (!rad) return null;
          Object.assign(rad, data);
          return rad;
        },
      },
    },
  },
});

let actions: typeof import("./wb-actions");

before(async () => {
  actions = await import("./wb-actions");
});

beforeEach(() => {
  me = { id: "spiller", role: "PLAYER" };
  stall = false;
  writes = 0;
  rad = baseRad("spiller");
});

test("spilleren kan opprette og flytte egen Workbench-økt", async () => {
  const ny = await actions.createSession({
    playerId: "spiller",
    date: "2026-06-22",
    startMinute: 600,
    durationMinutes: 60,
    title: "Egen økt",
    pyramid: "SLAG",
  });
  assert.equal(ny.ok, true);

  const flytt = await actions.moveSession({
    sessionId: "wb-1",
    newDate: "2026-06-24",
    newStartMinute: 630,
  });
  assert.equal(flytt.ok, true);
  assert.equal(rad?.startMinute, 630);
  assert.ok(writes >= 2);
});

test("uvedkommende spiller og coach uten stall avvises", async () => {
  me = { id: "fremmed", role: "PLAYER" };
  assert.equal(
    (await actions.createSession({
      playerId: "spiller",
      date: "2026-06-22",
      startMinute: 600,
      durationMinutes: 60,
      title: "Ulovlig",
      pyramid: "SLAG",
    })).ok,
    false,
  );
  assert.equal((await actions.moveSession({ sessionId: "wb-1", newDate: "2026-06-25", newStartMinute: 700 })).ok, false);

  me = { id: "annen-coach", role: "COACH" };
  stall = false;
  assert.equal((await actions.moveSession({ sessionId: "wb-1", newDate: "2026-06-25", newStartMinute: 700 })).ok, false);
  assert.equal(writes, 0);
});

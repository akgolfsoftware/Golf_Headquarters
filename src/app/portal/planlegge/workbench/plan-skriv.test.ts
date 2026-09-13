import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { dateForDayIndex, weekRefDate } from "@/lib/workbench/session-move-math";

let me = { id: "spiller", role: "PLAYER" as const };
let planEier = "spiller";
let okt: {
  id: string;
  scheduledAt: Date;
  title: string;
  durationMin: number;
  pyramidArea: "TEK";
  miljo: "M2";
  location: string | null;
  maalsetning: string | null;
};
let writes = 0;
let v2Kall = 0;
let opprettet: { planId: string; title: string; scheduledAt: Date } | null = null;

function snapshot() {
  return {
    planEier,
    okt: { ...okt, scheduledAt: new Date(okt.scheduledAt) },
    writes,
    v2Kall,
    opprettet,
  };
}

let tilbake: ReturnType<typeof snapshot> | null = null;

const sessionApi = {
  findUnique: async ({ where }: { where: { id: string } }) =>
    where.id === okt.id
      ? {
          id: okt.id,
          scheduledAt: okt.scheduledAt,
          title: okt.title,
          durationMin: okt.durationMin,
          pyramidArea: okt.pyramidArea,
          miljo: okt.miljo,
          location: okt.location,
          maalsetning: okt.maalsetning,
          plan: { userId: planEier },
        }
      : null,
  update: async ({ data }: { data: { title?: string; scheduledAt?: Date } }) => {
    writes += 1;
    if (data.title != null) okt.title = data.title;
    if (data.scheduledAt) okt.scheduledAt = data.scheduledAt;
    return { ...okt, plan: { userId: planEier } };
  },
  create: async ({ data }: { data: { planId: string; title: string; scheduledAt: Date } }) => {
    writes += 1;
    opprettet = { planId: data.planId, title: data.title, scheduledAt: data.scheduledAt };
    return {
      id: "ny-okt",
      title: data.title,
      scheduledAt: data.scheduledAt,
      durationMin: 60,
      pyramidArea: "TEK",
      location: null,
      maalsetning: null,
    };
  },
  delete: async () => {
    writes += 1;
  },
};

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => me },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: { redirect: () => undefined, notFound: () => undefined },
});
mock.module("@/lib/notifications/plan-endring", {
  namedExports: { varsleCoachOmPlanendring: async () => undefined },
});
mock.module("@/lib/workbench/v2-sync", {
  namedExports: {
    upsertV2ForPlanSession: async () => {
      v2Kall += 1;
    },
    deleteV2ForPlanSession: async () => undefined,
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingPlan: {
        findFirst: async () => ({ id: "plan-1" }),
        create: async () => ({ id: "plan-1" }),
      },
      trainingPlanSession: sessionApi,
      $transaction: async (fn: (tx: { trainingPlanSession: typeof sessionApi }) => Promise<unknown>) => {
        tilbake = snapshot();
        try {
          return await fn({ trainingPlanSession: sessionApi });
        } catch (feil) {
          planEier = tilbake.planEier;
          okt = tilbake.okt;
          writes = tilbake.writes;
          v2Kall = tilbake.v2Kall;
          opprettet = tilbake.opprettet;
          throw feil;
        }
      },
    },
  },
});

let actions: typeof import("./actions");

before(async () => {
  actions = await import("./actions");
});

beforeEach(() => {
  me = { id: "spiller", role: "PLAYER" };
  planEier = "spiller";
  writes = 0;
  v2Kall = 0;
  opprettet = null;
  okt = {
    id: "okt-1",
    scheduledAt: new Date("2026-06-22T09:00:00.000Z"),
    title: "Driver",
    durationMin: 60,
    pyramidArea: "TEK",
    miljo: "M2",
    location: "Range",
    maalsetning: "Treff",
  };
});

test("spilleren kan opprette, flytte og redigere egen økt", async () => {
  const ny = await actions.addWorkbenchSession({
    dayIndex: 0,
    title: "Ny økt",
    durMin: 60,
    area: "TEK",
    hour: 10,
    minute: 0,
    weekOffset: 0,
  });
  assert.equal(ny.ok, true);
  assert.equal(opprettet?.title, "Ny økt");

  const flytt = await actions.moveWorkbenchSession("okt-1", 2, 1);
  assert.equal(flytt.ok, true);
  const original = new Date("2026-06-22T09:00:00.000Z");
  const forventet = dateForDayIndex(
    2,
    original.getHours(),
    original.getMinutes(),
    weekRefDate(1),
  );
  assert.equal(okt.scheduledAt.getTime(), forventet.getTime());
  assert.ok(v2Kall >= 1);

  const rediger = await actions.updateWorkbenchSession("okt-1", { title: "Ny tittel" });
  assert.equal(rediger.ok, true);
  assert.equal(okt.title, "Ny tittel");
});

test("uvedkommende avvises uten skriving", async () => {
  me = { id: "fremmed", role: "PLAYER" };
  assert.equal((await actions.moveWorkbenchSession("okt-1", 3)).ok, false);
  assert.equal((await actions.updateWorkbenchSession("okt-1", { title: "Hacket" })).ok, false);
  assert.equal(writes, 0);
  assert.equal(okt.title, "Driver");
});

test("ugyldig endring skriver ikke, og tittel står", async () => {
  assert.equal((await actions.updateWorkbenchSession("okt-1", { title: "" })).ok, false);
  assert.equal(okt.title, "Driver");
  assert.equal(writes, 0);
});

/**
 * OW-3 fase 3 (2026-09-17): actions.ts skriver nå mot WorkbenchSession, ikke
 * TrainingPlanSession — mocken her er flyttet tilsvarende. Testene selv
 * (kontrakten: spilleren kan opprette/flytte/redigere sin egen økt,
 * uvedkommende avvises, ugyldig endring skriver ikke) er uendret.
 */
import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { computeMoveTarget, dateForDayIndex, weekRefDate } from "@/lib/workbench/session-move-math";
import { lokalDatoTilKolonne } from "@/lib/workbench/wb-map";

let me = { id: "spiller", role: "PLAYER" as const };
let okt: {
  id: string;
  playerId: string;
  date: Date;
  startMinute: number;
  durationMinutes: number;
  title: string;
  pyramid: "TEK";
  location: string | null;
  maalsetning: string | null;
  groupId: string | null;
};
let writes = 0;
let v2Kall = 0;
let opprettet: { title: string; date: Date; startMinute: number } | null = null;

function snapshot() {
  return {
    okt: { ...okt, date: new Date(okt.date) },
    writes,
    v2Kall,
    opprettet,
  };
}

let tilbake: ReturnType<typeof snapshot> | null = null;

const sessionApi = {
  findUnique: async ({ where }: { where: { id: string } }) =>
    where.id === okt.id ? { ...okt } : null,
  update: async ({ data }: { data: { title?: string; date?: Date; startMinute?: number; location?: string | null; maalsetning?: string | null } }) => {
    writes += 1;
    if (data.title != null) okt.title = data.title;
    if (data.date) okt.date = data.date;
    if (data.startMinute != null) okt.startMinute = data.startMinute;
    if (data.location !== undefined) okt.location = data.location;
    if (data.maalsetning !== undefined) okt.maalsetning = data.maalsetning;
    return { ...okt };
  },
  create: async ({ data }: { data: { title: string; date: Date; startMinute: number; durationMinutes: number; pyramid: string; location: string | null; maalsetning: string | null; playerId: string } }) => {
    writes += 1;
    opprettet = { title: data.title, date: data.date, startMinute: data.startMinute };
    return {
      id: "ny-okt",
      playerId: data.playerId,
      date: data.date,
      startMinute: data.startMinute,
      durationMinutes: data.durationMinutes,
      pyramid: data.pyramid,
      title: data.title,
      location: data.location ?? null,
      maalsetning: data.maalsetning ?? null,
      groupId: null,
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
    resolveCoachIdForPlayer: async () => "coach-1",
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      workbenchSession: sessionApi,
      $transaction: async (fn: (tx: { workbenchSession: typeof sessionApi }) => Promise<unknown>) => {
        tilbake = snapshot();
        try {
          return await fn({ workbenchSession: sessionApi });
        } catch (feil) {
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
  writes = 0;
  v2Kall = 0;
  opprettet = null;
  okt = {
    id: "okt-1",
    playerId: "spiller",
    date: lokalDatoTilKolonne(dateForDayIndex(0, 0, 0, weekRefDate(0))), // mandag inneværende uke
    startMinute: 540, // 09:00
    durationMinutes: 60,
    title: "Driver",
    pyramid: "TEK",
    location: "Range",
    maalsetning: "Treff",
    groupId: null,
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
  const forventetDato = computeMoveTarget(dateForDayIndex(0, 9, 0), 2, weekRefDate(1));
  assert.equal(okt.date.getTime(), lokalDatoTilKolonne(forventetDato).getTime());
  assert.equal(okt.startMinute, 540); // klokkeslett uendret — kun dag flyttet
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

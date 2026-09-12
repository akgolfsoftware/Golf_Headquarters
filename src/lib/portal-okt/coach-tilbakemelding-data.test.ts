import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let access = false;
let videoWhere: unknown = null;
const session = {
  id: "okt-1",
  title: "Teknisk økt",
  startTime: new Date("2026-09-14T07:00Z"),
  endTime: new Date("2026-09-14T08:00Z"),
  location: "Mulligan",
  miljo: null as string | null,
  notes: "Hold finish.",
  completedSummary: {
    coachRatedAt: "2026-09-14T08:10:00.000Z",
    coachRatedById: "tildelt",
    dineOrd: { tekst: "Takk", loggedAt: "2026-09-14T08:20:00.000Z" },
  } as Record<string, unknown>,
  coachId: "tildelt" as string | null,
  studentId: "spiller" as string | null,
  hostId: null as string | null,
  participants: [] as Array<{ userId: string; status: string }>,
};

mock.module("@/lib/auth/own-or-coached", {
  namedExports: { canAccessPlayer: async () => access },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingSessionV2: {
        findUnique: async () => structuredClone(session),
        findMany: async ({ where }: { where: { studentId: string } }) =>
          where.studentId === session.studentId
            ? [{
                id: session.id,
                title: session.title,
                startTime: session.startTime,
                notes: session.notes,
                completedSummary: session.completedSummary,
              }]
            : [],
      },
      user: { findUnique: async () => ({ name: "Syn coach" }) },
      playerSwingVideo: {
        findMany: async ({ where }: { where: unknown }) => {
          videoWhere = where;
          return [];
        },
      },
      sessionDrillNote: { findMany: async () => [] },
    },
  },
});

let getCoachTilbakemeldingData: typeof import("./coach-tilbakemelding-data").getCoachTilbakemeldingData;
let getTilbakemeldingerListe: typeof import("./coach-tilbakemelding-data").getTilbakemeldingerListe;

before(async () => {
  ({ getCoachTilbakemeldingData, getTilbakemeldingerListe } = await import("./coach-tilbakemelding-data"));
});

beforeEach(() => {
  access = false;
  videoWhere = null;
  session.coachId = "tildelt";
  session.studentId = "spiller";
  session.hostId = null;
  session.participants = [];
});

test("uvedkommende coach får ikke tilbakemelding fra en annen spillers økt", async () => {
  const data = await getCoachTilbakemeldingData({ id: "fremmed-coach", role: "COACH" }, "okt-1");
  assert.deepEqual(data, { found: false });
  assert.equal(videoWhere, null);
});

test("fremmed spiller får ikke tilbakemelding", async () => {
  const data = await getCoachTilbakemeldingData({ id: "annen-spiller", role: "PLAYER" }, "okt-1");
  assert.deepEqual(data, { found: false });
});

test("avvist deltaker får ikke tilbakemelding", async () => {
  session.participants = [{ userId: "invitert", status: "DECLINED" }];
  const data = await getCoachTilbakemeldingData({ id: "invitert", role: "PLAYER" }, "okt-1");
  assert.deepEqual(data, { found: false });
});

test("spilleren og tildelt coach ser samme økt-id, og bare spilleren kan svare", async () => {
  const egen = await getCoachTilbakemeldingData({ id: "spiller", role: "PLAYER" }, "okt-1");
  assert.equal(egen.found, true);
  if (!egen.found) return;
  assert.equal(egen.oktId, "okt-1");
  assert.equal(egen.kanSvare, true);
  assert.equal(egen.dittSvar?.tekst, "Takk");
  assert.deepEqual(videoWhere, {
    userId: "spiller",
    liveSessionId: "okt-1",
    liveSessionKind: "session-v2",
    status: "READY",
  });

  const coach = await getCoachTilbakemeldingData({ id: "tildelt", role: "COACH" }, "okt-1");
  assert.equal(coach.found, true);
  if (!coach.found) return;
  assert.equal(coach.oktId, "okt-1");
  assert.equal(coach.kanSvare, false);
});

test("coach med bekreftet spiller-tilgang ser økta; listen er bare den spilleren", async () => {
  access = true;
  const data = await getCoachTilbakemeldingData({ id: "lovlig-coach", role: "COACH" }, "okt-1");
  assert.equal(data.found, true);
  if (!data.found) return;
  assert.equal(data.oktId, "okt-1");
  const liste = await getTilbakemeldingerListe("spiller");
  assert.deepEqual(liste.map((rad) => rad.oktId), ["okt-1"]);
  assert.deepEqual(await getTilbakemeldingerListe("annen-spiller"), []);
});

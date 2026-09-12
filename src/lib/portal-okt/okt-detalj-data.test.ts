import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let access = false;
mock.module("@/lib/auth/own-or-coached", {
  namedExports: { canAccessPlayer: async () => access },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingSessionV2: {
        findUnique: async () => ({
          id: "v2-1",
          title: "Hemmelig økt",
          startTime: new Date("2026-09-14T07:00Z"),
          endTime: new Date("2026-09-14T08:00Z"),
          status: "PLANNED",
          miljo: null,
          practiceType: "BLOKK",
          notes: "ikke lek ut",
          completedSummary: null,
          location: null,
          maalsetning: null,
          isCoachCreated: true,
          coachId: "tildelt",
          createdAt: new Date(0),
          studentId: "spiller",
          hostId: null,
          isShared: false,
          maxParticipants: null,
          participants: [],
          drills: [],
        }),
      },
    },
  },
});

let getOktDetaljData: typeof import("./okt-detalj-data").getOktDetaljData;
before(async () => {
  ({ getOktDetaljData } = await import("./okt-detalj-data"));
});

test("uvedkommende coach får ikke øktinnhold fra V2-øktarket", async () => {
  access = false;
  const data = await getOktDetaljData({ id: "fremmed-coach", role: "COACH" }, "v2-1");
  assert.deepEqual(data, { found: false });
});

test("fremmed spiller får ikke øktinnhold", async () => {
  access = false;
  const data = await getOktDetaljData({ id: "annen-spiller", role: "PLAYER" }, "v2-1");
  assert.deepEqual(data, { found: false });
});

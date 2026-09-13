import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = { id: "tildelt-coach", role: "COACH" };
let harTilgang = true;
let coachUserId: string | null = "tildelt-coach";
let writes = 0;

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => viewer },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => harTilgang },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      question: {
        findUnique: async () => ({
          coachUserId,
          askerUserId: "spiller",
        }),
        update: async () => {
          writes += 1;
        },
      },
    },
  },
});

let svarPaSporsmal: typeof import("@/app/portal/(legacy)/coach/sporsmal/actions").svarPaSporsmal;

before(async () => {
  ({ svarPaSporsmal } = await import("@/app/portal/(legacy)/coach/sporsmal/actions"));
});

beforeEach(() => {
  viewer = { id: "tildelt-coach", role: "COACH" };
  harTilgang = true;
  coachUserId = "tildelt-coach";
  writes = 0;
});

test("tildelt coach kan svare på spørsmålet", async () => {
  await svarPaSporsmal("q-1", "Hold venstre håndledd.");
  assert.equal(writes, 1);
});

test("uvedkommende coach kan ikke svare i åpen kø uten spiller-tilgang", async () => {
  viewer = { id: "fremmed-coach", role: "COACH" };
  coachUserId = null;
  harTilgang = false;
  await assert.rejects(() => svarPaSporsmal("q-1", "Hold venstre håndledd."), /forbidden/);
  assert.equal(writes, 0);
});

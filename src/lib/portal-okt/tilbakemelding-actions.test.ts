import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let me: { id: string } | null = { id: "spiller" };
let lagretOkt: string | null = null;
let kvittertOkt: string | null = null;
let lagreKall = 0;

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => me },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/app/portal/(fullscreen)/live/[sessionId]/actions", {
  namedExports: {
    lagreDineOrd: async (oktId: string) => {
      lagreKall += 1;
      lagretOkt = oktId;
      return { ok: true };
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingSessionV2: {
        findFirst: async ({ where }: { where: { id: string; studentId: string } }) =>
          where.id === "okt-1" && where.studentId === "spiller"
            ? { id: "okt-1", completedSummary: {} }
            : null,
        update: async ({ where }: { where: { id: string } }) => {
          kvittertOkt = where.id;
        },
      },
    },
  },
});

let sendTilbakemeldingSvar: typeof import("@/app/portal/coach/tilbakemelding/[oktId]/actions").sendTilbakemeldingSvar;
let kvitterTilbakemelding: typeof import("@/app/portal/coach/tilbakemelding/[oktId]/actions").kvitterTilbakemelding;

before(async () => {
  ({ sendTilbakemeldingSvar, kvitterTilbakemelding } = await import(
    "@/app/portal/coach/tilbakemelding/[oktId]/actions"
  ));
});

beforeEach(() => {
  me = { id: "spiller" };
  lagretOkt = null;
  kvittertOkt = null;
  lagreKall = 0;
});

test("spillerens svar og kvittering skrives bare på den økta hen eier", async () => {
  assert.equal((await sendTilbakemeldingSvar({ oktId: "okt-1", tekst: "Takk for økta." })).ok, true);
  assert.equal(lagretOkt, "okt-1");
  assert.equal((await kvitterTilbakemelding({ oktId: "okt-1" })).ok, true);
  assert.equal(kvittertOkt, "okt-1");
});

test("coach og annen spiller kan ikke svare eller kvittere på økta", async () => {
  me = { id: "fremmed-coach" };
  assert.equal((await sendTilbakemeldingSvar({ oktId: "okt-1", tekst: "Takk for økta." })).ok, false);
  assert.equal((await kvitterTilbakemelding({ oktId: "okt-1" })).ok, false);
  me = { id: "annen-spiller" };
  assert.equal((await sendTilbakemeldingSvar({ oktId: "okt-1", tekst: "Takk for økta." })).ok, false);
  assert.equal((await kvitterTilbakemelding({ oktId: "okt-1" })).ok, false);
  assert.equal((await sendTilbakemeldingSvar({ oktId: "okt-annen", tekst: "Takk for økta." })).ok, false);
  assert.equal(lagreKall, 0);
  assert.equal(kvittertOkt, null);
});

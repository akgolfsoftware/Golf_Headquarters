/**
 * R-I: createSpiller. Spiller og forelder skal ikke opprette brukere.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle } | null = { id: "coach-a", role: "COACH" };
let opprettet = 0;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => null,
      },
      $transaction: async () => {
        opprettet += 1;
        return { id: "ny-spiller" };
      },
    },
  },
});

const gyldig = {
  navn: "Oyvind Rohjan",
  epost: "oyvind.rohjan@example.test",
  program: "AK_ACADEMY" as const,
  programCoachId: "coach-a",
  fodselsdato: "1998-03-12",
  hcp: 2.4,
  kategori: "A1" as const,
  hjemmeklubb: "GFGK",
  tier: "GRATIS" as const,
  sendInvitasjon: false,
};

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  opprettet = 0;
});

test("createSpiller avviser spiller uten å opprette bruker", async () => {
  bruker = { id: "spiller-x", role: "PLAYER" };
  const { createSpiller } = await actions();
  const svar = await createSpiller(gyldig);
  assert.deepEqual(svar, { ok: false, error: "forbidden" });
  assert.equal(opprettet, 0);
});

test("createSpiller avviser forelder uten å opprette bruker", async () => {
  bruker = { id: "forelder-a", role: "PARENT" };
  const { createSpiller } = await actions();
  const svar = await createSpiller(gyldig);
  assert.deepEqual(svar, { ok: false, error: "forbidden" });
  assert.equal(opprettet, 0);
});

test("createSpiller avviser uinnlogget uten å opprette bruker", async () => {
  bruker = null;
  const { createSpiller } = await actions();
  const svar = await createSpiller(gyldig);
  assert.deepEqual(svar, { ok: false, error: "unauthenticated" });
  assert.equal(opprettet, 0);
});

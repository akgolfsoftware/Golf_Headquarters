/**
 * O05: spillerens egen tilbakekalling av deling. Feil rolle og gruppe
 * uten medlemskap skriver ingenting.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = {
  id: "spiller-a",
  role: "PLAYER" as string,
  requiresGuardianConsent: false,
  guardianConsentGivenAt: null as Date | null,
};
let medlem = true;
let registrert: Array<Record<string, unknown>> = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireSpillerActionUser: async () => {
      if (bruker.role !== "PLAYER" && bruker.role !== "COACH" && bruker.role !== "ADMIN") {
        throw new Error("forbidden");
      }
      return bruker;
    },
  },
});
mock.module("@/lib/deling/samtykke", {
  namedExports: {
    registrerDelingsSamtykke: async (input: Record<string, unknown>) => {
      registrert.push(input);
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupMember: {
        findFirst: async () => (medlem ? { id: "medlem-1" } : null),
      },
    },
  },
});

async function actions() {
  return import("./deling-samtykke-actions");
}

test.beforeEach(() => {
  bruker = {
    id: "spiller-a",
    role: "PLAYER",
    requiresGuardianConsent: false,
    guardianConsentGivenAt: null,
  };
  medlem = true;
  registrert = [];
});

test("trekkDelingsSamtykke avviser gruppe uten medlemskap", async () => {
  medlem = false;
  const { trekkDelingsSamtykke } = await actions();
  const svar = await trekkDelingsSamtykke("TEST_RESULTATER", "gruppe-fremmed");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.feil, /ikke medlem/);
  assert.equal(registrert.length, 0);
});

test("trekkDelingsSamtykke avviser forelder-rolle på spillerhandlingen", async () => {
  bruker = {
    id: "forelder-a",
    role: "PARENT",
    requiresGuardianConsent: false,
    guardianConsentGivenAt: null,
  };
  const { trekkDelingsSamtykke } = await actions();
  await assert.rejects(
    () => trekkDelingsSamtykke("TEST_RESULTATER", "gruppe-1"),
    /forbidden/,
  );
  assert.equal(registrert.length, 0);
});

test("trekkDelingsSamtykke skriver gitt=false for egen spiller", async () => {
  const { trekkDelingsSamtykke } = await actions();
  const svar = await trekkDelingsSamtykke("TEST_RESULTATER", "gruppe-1");
  assert.equal(svar.ok, true);
  assert.equal(registrert.length, 1);
  assert.equal(registrert[0]?.gitt, false);
  assert.equal(registrert[0]?.userId, "spiller-a");
  assert.equal(registrert[0]?.gittAvUserId, "spiller-a");
  assert.equal(registrert[0]?.gittAvRolle, "SELV");
});

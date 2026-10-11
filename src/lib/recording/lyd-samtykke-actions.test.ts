/**
 * D-63/TA-04: coachen kan aldri registrere lydsamtykke for en spiller under 16
 * eller uten fødselsdato, verken som «SELV» eller som manuelt foresatt-samtykke.
 * Bare forelderen gir det, via lenken.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let spiller: {
  role: string;
  dateOfBirth: Date | null;
  requiresGuardianConsent: boolean;
} | null = null;
let skrevet = 0;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: { requireCoachActionUser: async () => ({ id: "coach-a", role: "COACH" }) },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => true },
});
mock.module("@/lib/security/same-origin", {
  namedExports: { isSameOriginAction: async () => true },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/email", {
  namedExports: { resendKlient: () => ({ emails: { send: async () => undefined } }), FRA_EPOST: "x@y.no" },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async ({ select }: { select: Record<string, boolean> }) => {
          if (!spiller) return null;
          // guardCoachSpiller spør bare om id og rolle.
          if (select.dateOfBirth) return spiller;
          return { id: "spiller-a", role: spiller.role };
        },
      },
      lydSamtykke: {
        upsert: async () => {
          skrevet += 1;
          return {};
        },
      },
    },
  },
});

async function registrer() {
  return (await import("./lyd-samtykke-actions")).registrerLydSamtykkeGitt;
}

test.beforeEach(() => {
  skrevet = 0;
  spiller = null;
});

test("coach kan ikke registrere SELV-samtykke for en 14-åring", async () => {
  spiller = { role: "PLAYER", dateOfBirth: new Date("2012-05-05T00:00:00Z"), requiresGuardianConsent: true };
  const svar = await (await registrer())({ playerId: "spiller-a", gittAv: "SELV" });
  assert.equal(svar.ok, false);
  assert.equal(skrevet, 0);
});

test("coach kan ikke registrere manuelt foresatt-samtykke for et barn", async () => {
  spiller = { role: "PLAYER", dateOfBirth: new Date("2012-05-05T00:00:00Z"), requiresGuardianConsent: false };
  const svar = await (await registrer())({
    playerId: "spiller-a",
    gittAv: "FORESATT",
    foresattEpost: "noen@example.com",
  });
  assert.equal(svar.ok, false);
  assert.equal(skrevet, 0);
});

test("spiller uten fødselsdato regnes ikke som voksen", async () => {
  spiller = { role: "PLAYER", dateOfBirth: null, requiresGuardianConsent: false };
  const svar = await (await registrer())({ playerId: "spiller-a", gittAv: "SELV" });
  assert.equal(svar.ok, false);
  assert.equal(skrevet, 0);
});

test("myndig spiller kan fortsatt registreres med SELV", async () => {
  spiller = { role: "PLAYER", dateOfBirth: new Date("1995-05-05T00:00:00Z"), requiresGuardianConsent: false };
  const svar = await (await registrer())({ playerId: "spiller-a", gittAv: "SELV" });
  assert.equal(svar.ok, true);
  assert.equal(skrevet, 1);
});

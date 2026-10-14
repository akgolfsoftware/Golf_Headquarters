/**
 * D-63/TA-03/TP-02: fødselsdato kreves for å fullføre oppstarten, og spilleren
 * kan ikke skrive om en fødselsdato som er satt. Flagget for foreldresamtykke
 * nullstilles aldri.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Bruker = {
  id: string;
  name: string;
  role: string;
  dateOfBirth: Date | null;
  requiresGuardianConsent: boolean;
  preferences: Record<string, unknown> | null;
};

let bruker: Bruker;
let oppdateringer: Array<Record<string, unknown>> = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUserRaw: async () => bruker },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/email", {
  namedExports: { resendKlient: () => ({ emails: { send: async () => undefined } }), FRA_EPOST: "x@y.no" },
});
mock.module("@/lib/turneringer/link-public-players", {
  namedExports: { linkAndSyncUserTournamentResults: async () => undefined },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        update: async ({ data }: { data: Record<string, unknown> }) => {
          oppdateringer.push(data);
          return {};
        },
      },
      parentInvitation: {
        create: async () => ({ id: "inv-1", token: "tok" }),
        updateMany: async () => ({ count: 0 }),
      },
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  oppdateringer = [];
  bruker = {
    id: "spiller-a",
    name: "Spiller",
    role: "PLAYER",
    dateOfBirth: null,
    requiresGuardianConsent: false,
    preferences: null,
  };
});

test("completeOnboarding fullfører ikke uten fødselsdato", async () => {
  const { completeOnboarding } = await actions();
  const svar = await completeOnboarding();
  assert.ok(svar && svar.ok === false);
  assert.equal(oppdateringer.length, 0);
});

test("completeOnboarding fullfører med fødselsdato", async () => {
  bruker.dateOfBirth = new Date("1995-01-01T00:00:00Z");
  const { completeOnboarding } = await actions();
  await assert.rejects(() => completeOnboarding(), /REDIRECT:\/portal/);
  assert.equal(oppdateringer.length, 1);
});

test("markStepComplete kan ikke merke siste steg uten fødselsdato", async () => {
  const { markStepComplete } = await actions();
  await assert.rejects(() => markStepComplete(7), /Fødselsdato mangler/);
  assert.equal(oppdateringer.length, 0);
});

test("setDateOfBirthAndCheckMinor avviser ny dato når datoen er satt", async () => {
  bruker.dateOfBirth = new Date("2012-03-04T00:00:00Z");
  bruker.requiresGuardianConsent = true;
  const { setDateOfBirthAndCheckMinor } = await actions();
  const svar = await setDateOfBirthAndCheckMinor({ dateOfBirth: "1990-03-04" });
  assert.equal(svar.ok, false);
  assert.equal(svar.isMinor, true);
  assert.equal(oppdateringer.length, 0);
});

test("setDateOfBirthAndCheckMinor godtar samme dato (ny invitasjon) og beholder flagget", async () => {
  bruker.dateOfBirth = new Date("2012-03-04T00:00:00Z");
  bruker.requiresGuardianConsent = true;
  const { setDateOfBirthAndCheckMinor } = await actions();
  const svar = await setDateOfBirthAndCheckMinor({
    dateOfBirth: "2012-03-04",
    guardianEmail: "forelder@example.com",
  });
  assert.equal(svar.ok, true);
  assert.equal(oppdateringer[0]?.requiresGuardianConsent, true);
});

test("setDateOfBirthAndCheckMinor setter datoen første gang", async () => {
  const { setDateOfBirthAndCheckMinor } = await actions();
  const svar = await setDateOfBirthAndCheckMinor({ dateOfBirth: "1995-06-07" });
  assert.equal(svar.ok, true);
  assert.equal(svar.isMinor, false);
  assert.equal(oppdateringer[0]?.requiresGuardianConsent, false);
});

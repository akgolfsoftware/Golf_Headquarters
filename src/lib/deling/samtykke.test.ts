/**
 * R-J: delingssamtykke bruker samme 16-årsregel som helse (flagg eller fødselsdato).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker: {
  requiresGuardianConsent: boolean;
  dateOfBirth: Date | null;
} | null = {
  requiresGuardianConsent: false,
  dateOfBirth: null,
};
let skrevet: unknown[] = [];

mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => bruker,
      },
      delingsSamtykke: {
        create: async ({ data }: { data: unknown }) => {
          skrevet.push(data);
          return {};
        },
      },
    },
  },
});

async function modul() {
  return import("./samtykke");
}

test.beforeEach(() => {
  bruker = { requiresGuardianConsent: false, dateOfBirth: null };
  skrevet = [];
});

test("registrerDelingsSamtykke avviser SELV-gi når fødselsdato er under 16 uten flagg", async () => {
  bruker = {
    requiresGuardianConsent: false,
    dateOfBirth: new Date("2012-01-01"),
  };
  const { registrerDelingsSamtykke } = await modul();
  await assert.rejects(
    () =>
      registrerDelingsSamtykke({
        userId: "spiller-a",
        scope: "TEST_RESULTATER",
        mottakerGruppeId: "gruppe-1",
        gitt: true,
        gittAvUserId: "spiller-a",
        gittAvRolle: "SELV",
      }),
    /under 16/,
  );
  assert.equal(skrevet.length, 0);
});

test("registrerDelingsSamtykke lar mindreårig TREKKE selv", async () => {
  bruker = {
    requiresGuardianConsent: false,
    dateOfBirth: new Date("2012-01-01"),
  };
  const { registrerDelingsSamtykke } = await modul();
  await registrerDelingsSamtykke({
    userId: "spiller-a",
    scope: "TEST_RESULTATER",
    mottakerGruppeId: "gruppe-1",
    gitt: false,
    gittAvUserId: "spiller-a",
    gittAvRolle: "SELV",
  });
  assert.equal(skrevet.length, 1);
  assert.equal((skrevet[0] as { gitt: boolean }).gitt, false);
});

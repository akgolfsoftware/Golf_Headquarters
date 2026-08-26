/**
 * N5 · Ekstern-leser-scope for Team Norway. Bekrefter at
 * src/lib/auth/ekstern-leser-scope.ts virker GENERISK for en ny organisasjon
 * (ingen hardkodet allow-liste over gruppe-slugs/navn) — og at begge
 * retningene i GDPR-standpunktet holder: gyldig samtykke gir tilgang,
 * fravær av samtykke nekter tilgang (spilleren usynlig for treneren), selv
 * om spilleren er aktivt PLAYER-medlem i Team Norway-gruppen.
 *
 * Mønster: t.mock.module + dynamisk import, som
 * src/lib/gdpr/slett-eksterne-data.dryrun.test.ts.
 */
import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";

const TEAM_NORWAY_GROUP_ID = "grp-team-norway";
const LESER_ID = "leser-tn-1";
const SPILLER_MED_SAMTYKKE = "spiller-med-samtykke";
const SPILLER_UTEN_SAMTYKKE = "spiller-uten-samtykke";

function settOppPrismaMock(t: TestContext) {
  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        eksternLeserGruppe: {
          findMany: async () => [{ groupId: TEAM_NORWAY_GROUP_ID }],
        },
        group: {
          findMany: async () => [{ id: TEAM_NORWAY_GROUP_ID, name: "Team Norway Golf" }],
        },
        user: {
          findMany: async () => [
            {
              id: SPILLER_MED_SAMTYKKE,
              requiresGuardianConsent: false,
              groupMemberships: [{ groupId: TEAM_NORWAY_GROUP_ID }],
            },
            {
              id: SPILLER_UTEN_SAMTYKKE,
              requiresGuardianConsent: false,
              groupMemberships: [{ groupId: TEAM_NORWAY_GROUP_ID }],
            },
          ],
        },
        delingsSamtykke: {
          // Kun én av de to spillerne har gitt gyldig samtykke mot
          // Team Norway-gruppen for TEST_RESULTATER.
          findMany: async () => [
            {
              userId: SPILLER_MED_SAMTYKKE,
              scope: "TEST_RESULTATER",
              mottakerGruppeId: TEAM_NORWAY_GROUP_ID,
              gitt: true,
              gittAvRolle: "SELV",
              createdAt: new Date("2026-08-20T10:00:00Z"),
            },
          ],
        },
      },
    },
  });
}

test("ekstern-leser mot Team Norway: gyldig samtykke GIR tilgang, generisk (ingen org-allowliste)", async (t) => {
  settOppPrismaMock(t);

  const { eksternLeserSpillerIder, harEksternLeserTilgang } = await import(
    "./ekstern-leser-scope"
  );

  const ider = await eksternLeserSpillerIder(LESER_ID, "TEST_RESULTATER");
  assert.ok(ider.includes(SPILLER_MED_SAMTYKKE), "spiller med gyldig samtykke er i scopet");

  const tilgang = await harEksternLeserTilgang(
    LESER_ID,
    SPILLER_MED_SAMTYKKE,
    "TEST_RESULTATER",
  );
  assert.equal(tilgang, true);
});

test("ekstern-leser mot Team Norway: FRAVÆR av samtykke NEKTER tilgang — spilleren usynlig selv med aktivt medlemskap", async (t) => {
  settOppPrismaMock(t);

  const { eksternLeserSpillerIder, harEksternLeserTilgang } = await import(
    "./ekstern-leser-scope"
  );

  const ider = await eksternLeserSpillerIder(LESER_ID, "TEST_RESULTATER");
  assert.ok(
    !ider.includes(SPILLER_UTEN_SAMTYKKE),
    "spiller uten samtykke skal IKKE være i scopet, selv om aktivt gruppemedlem",
  );

  const tilgang = await harEksternLeserTilgang(
    LESER_ID,
    SPILLER_UTEN_SAMTYKKE,
    "TEST_RESULTATER",
  );
  assert.equal(tilgang, false, "harEksternLeserTilgang skal nekte uten gyldig samtykke");
});

test("ekstern-leser mot Team Norway: STATS-scope er uavhengig av TEST_RESULTATER-samtykke", async (t) => {
  settOppPrismaMock(t);

  const { harEksternLeserTilgang } = await import("./ekstern-leser-scope");

  // Samtykket i mock-oppsettet gjelder kun TEST_RESULTATER — STATS er ikke
  // samtykket for noen, så selv spilleren med TEST_RESULTATER-samtykke skal
  // nektes STATS.
  const tilgang = await harEksternLeserTilgang(LESER_ID, SPILLER_MED_SAMTYKKE, "STATS");
  assert.equal(tilgang, false, "samtykke er per scope — TEST_RESULTATER gir ikke STATS");
});

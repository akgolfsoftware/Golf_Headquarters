// Tester for herdingen av norge-mandag-sync (T7): ett feilende steg stopper
// ikke resten av kjeden, feilene samles, admin varsles, og oppsummeringen
// viser status per steg.
//
// Samme mock-mønster som gfgk-ballplukking-agent.test.ts: t.mock.module() på
// alle avhengigheter FØR modulen under test importeres dynamisk — og modulen
// importeres kun ÉN gang per fil (senere import rebindes ikke til nye mocks).
// Derfor: ett oppsett med mutérbar mock-tilstand, scenarioer sekvensielt.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

test("norge-mandag-sync — herdet stegkjøring", async (t) => {
  let golfboxFeiler = false;
  const varsleCalls: { tittel: string; tekst: string; coachId: string }[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        user: {
          findFirst: async () => ({ id: "admin-1" }),
        },
      },
    },
  });
  t.mock.module("@/lib/turneringer/sync", {
    namedExports: {
      syncNorwegianPlayers: async () => ({ added: 2, updated: 5 }),
    },
  });
  t.mock.module("@/lib/turneringer/golfbox-sync", {
    namedExports: {
      syncGolfBoxSchedules: async () => {
        if (golfboxFeiler) throw new Error("GolfBox timeout");
        return { customers: 10, events: 40, upcoming: 12 };
      },
    },
  });
  t.mock.module("@/lib/turneringer/link-public-players", {
    namedExports: {
      linkPublicPlayersByExactName: async () => ({ linked: 1, scannedUsers: 30 }),
      backfillTournamentResultsForLinkedUsers: async () => ({ mirrored: 3 }),
    },
  });
  t.mock.module("@/lib/turneringer/dedupe-player-names", {
    namedExports: {
      runDedupePlayerNames: async () => ({ mergedGroups: 0, fuzzyLeft: 2 }),
    },
  });
  t.mock.module("@/lib/agents/agent-notify", {
    namedExports: {
      varsleAgentFunn: async (v: { tittel: string; tekst: string; coachId: string }) => {
        varsleCalls.push(v);
      },
    },
  });

  const { runNorgeMandagSync } = await import("@/lib/turneringer/norge-mandag-sync");

  await t.test("alle steg grønne: ok=true, ingen varsling", async () => {
    golfboxFeiler = false;
    const r = await runNorgeMandagSync();
    assert.equal(r.ok, true);
    assert.deepEqual(r.feil, []);
    assert.deepEqual(r.steg.players, { ok: true, resultat: { added: 2, updated: 5 } });
    assert.deepEqual(r.steg.golfbox, {
      ok: true,
      resultat: { customers: 10, events: 40, upcoming: 12 },
    });
    assert.equal(varsleCalls.length, 0);
  });

  await t.test("ett steg feiler: resten kjører, feilen samles, admin varsles", async () => {
    golfboxFeiler = true;
    const r = await runNorgeMandagSync();
    assert.equal(r.ok, false);
    assert.equal(r.feil.length, 1);
    assert.match(r.feil[0], /GolfBox timeout/);
    // Steget etter det feilende kjørte likevel.
    assert.deepEqual(r.steg.link, { ok: true, resultat: { linked: 1, scannedUsers: 30 } });
    assert.deepEqual(r.steg.backfill, { ok: true, resultat: { mirrored: 3 } });
    assert.deepEqual(r.steg.dedupe, { ok: true, resultat: { mergedGroups: 0, fuzzyLeft: 2 } });
    assert.equal(r.steg.golfbox.ok, false);
    // Varsel til admin med klarspråk.
    assert.equal(varsleCalls.length, 1);
    assert.equal(varsleCalls[0].coachId, "admin-1");
    assert.match(varsleCalls[0].tittel, /1 av 5 steg feilet/);
    assert.match(varsleCalls[0].tekst, /GolfBox timeout/);
  });
});

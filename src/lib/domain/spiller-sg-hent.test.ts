/**
 * hentSpillerSg — kilderegelen mot ekte funksjon med mocket prisma.
 *
 * EGEN FIL med vilje: modulen må IKKE importeres statisk før
 * t.mock.module() kjører (Node re-evaluerer ikke en allerede lastet
 * ES-modul, så en statisk import øverst ville bundet ekte @/lib/prisma).
 * Samme mønster som live-coach-agent.test.ts / sg-analyse-ekspert.test.ts.
 * De rene byggerne testes i spiller-sg.test.ts.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import type { SgRad } from "./spiller-sg";

const rad = (deler: Partial<SgRad>): SgRad => ({
  sgTotal: null,
  sgOtt: null,
  sgApp: null,
  sgArg: null,
  sgPutt: null,
  ...deler,
});

/**
 * Kilderegelen bor i hentSpillerSg — den testes derfor mot den ekte
 * funksjonen med mocket prisma (mønster fra live-coach-agent.test.ts).
 * VIKTIG: modulen importeres kun ÉN gang; Node re-evaluerer ikke en allerede
 * lastet ES-modul, så all mock-tilstand er mutérbar og scenarioene kjører
 * sekvensielt i samme test.
 */
test("hentSpillerSg — kilderegel, vindu og fallback", async (t) => {
  let runder: SgRad[] = [];
  let registreringer: SgRad[] = [];
  const kall: { rundeArgs?: Record<string, unknown>; inputKalt: boolean } = { inputKalt: false };

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        round: {
          findMany: async (args: Record<string, unknown>) => {
            kall.rundeArgs = args;
            return runder;
          },
        },
        brukerSgInput: {
          findMany: async () => {
            kall.inputKalt = true;
            return registreringer;
          },
        },
      },
    },
  });

  const { hentSpillerSg, SPILLER_SG_RUNDER } = await import("./spiller-sg");

  // 1) Runder med SG vinner over registreringer — og input-grenen røres ikke.
  runder = [rad({ sgTotal: -0.4, sgPutt: -0.9 })];
  registreringer = [rad({ sgTotal: 2.5 })];
  const beregnet = await hentSpillerSg("u1");
  assert.ok(beregnet);
  assert.equal(beregnet.kilde, "BEREGNET");
  assert.equal(beregnet.total.sg, -0.4);
  assert.equal(kall.inputKalt, false, "fallback skal ikke slå til når runder har SG");

  // Vinduet er de N nyeste rundene UANSETT SG (samme som Hjem/Analysere) —
  // ingen OR-filtrering på sg-feltene i spørringen.
  assert.deepEqual(kall.rundeArgs?.where, { userId: "u1" });
  assert.equal(kall.rundeArgs?.take, SPILLER_SG_RUNDER);

  // 2) Runder finnes, men uten SG (hurtig score) → fallback til selvrapportert.
  runder = [rad({}), rad({})];
  registreringer = [rad({ sgApp: -1.0 })];
  const selvrapportert = await hentSpillerSg("u1");
  assert.ok(selvrapportert);
  assert.equal(selvrapportert.kilde, "SELVRAPPORTERT");
  assert.equal(selvrapportert.app.sg, -1.0);
  assert.equal(kall.inputKalt, true);

  // 3) Ingen data noe sted → null (aldri fabrikkerte nuller).
  runder = [];
  registreringer = [];
  assert.equal(await hentSpillerSg("u1"), null);
});

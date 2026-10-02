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

type StoredRad = SgRad & { sgSource: string | null; sgModelVersionId: string | null };
const rad = (deler: Partial<StoredRad>): StoredRad => ({
  sgTotal: null,
  sgOtt: null,
  sgApp: null,
  sgArg: null,
  sgPutt: null,
  sgSource: null,
  sgModelVersionId: null,
  ...deler,
});

/**
 * Kilderegelen bor i hentSpillerSg — den testes derfor mot den ekte
 * funksjonen med mocket prisma (mønster fra live-coach-agent.test.ts).
 * VIKTIG: modulen importeres kun ÉN gang; Node re-evaluerer ikke en allerede
 * lastet ES-modul, så all mock-tilstand er mutérbar og scenarioene kjører
 * sekvensielt i samme test.
 */
test("hentSpillerSg — bare versjonert eller manuelt SG vises", async (t) => {
  let runder: StoredRad[] = [];
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
  runder = [rad({ sgTotal: -0.4, sgPutt: -0.9,
    sgSource: "beregnet", sgModelVersionId: "own-v1" })];
  registreringer = [rad({ sgTotal: 2.5 })];
  const beregnet = await hentSpillerSg("u1");
  assert.ok(beregnet);
  assert.equal(beregnet.kilde, "BEREGNET");
  assert.equal(beregnet.total.sg, -0.4);
  assert.equal(kall.inputKalt, false);

  // Vinduet er de N nyeste rundene UANSETT SG (samme som Hjem/Analysere) —
  // ingen OR-filtrering på sg-feltene i spørringen.
  assert.deepEqual(kall.rundeArgs?.where, { userId: "u1" });
  assert.equal(kall.rundeArgs?.take, SPILLER_SG_RUNDER);

  // 2) Eldre beregnet SG og selvrapportering uten dokumentert modell skjules.
  runder = [rad({ sgTotal: 2.1, sgSource: "beregnet" }), rad({})];
  registreringer = [rad({ sgApp: -1.0 })];
  assert.equal(await hentSpillerSg("u1"), null);
  assert.equal(kall.inputKalt, false);

  // 3) Ingen data noe sted → null (aldri fabrikkerte nuller).
  runder = [];
  registreringer = [];
  assert.equal(await hentSpillerSg("u1"), null);
});

/**
 * Tester for SG-broen (T6): ren aggregering (beregnSgAggregat) + tynn IO
 * (synkroniserSgFraRunder) med mocket prisma.
 *
 * Mock-mønster som resten av suiten (t.mock.module før dynamisk import).
 * Modulen under test importeres KUN ÉN GANG per fil — scenarioene kjøres
 * sekvensielt med mutérbar mock-tilstand.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import type { SgBroRunde } from "@/lib/portal-stats/sg-bro";

function runde(
  playedAt: string,
  score: number,
  sg: Partial<Pick<SgBroRunde, "sgTotal" | "sgOtt" | "sgApp" | "sgArg" | "sgPutt">> = {},
): SgBroRunde {
  return {
    playedAt: new Date(playedAt),
    score,
    sgTotal: sg.sgTotal ?? null,
    sgOtt: sg.sgOtt ?? null,
    sgApp: sg.sgApp ?? null,
    sgArg: sg.sgArg ?? null,
    sgPutt: sg.sgPutt ?? null,
  };
}

test("sg-broen — aggregering og synk", async (t) => {
  // --- mutérbar mock-tilstand for IO-delen ---
  let runderIDb: Array<Record<string, unknown>> = [];
  let eksisterendeRad: { id: string } | null = null;
  const updates: Array<{ where: unknown; data: Record<string, unknown> }> = [];
  const creates: Array<{ data: Record<string, unknown> }> = [];
  const loggedeFeil: string[] = [];
  let findManyKaster = false;
  let sisteFindManyArgs: Record<string, unknown> | null = null;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        round: {
          findMany: async (args: Record<string, unknown>) => {
            if (findManyKaster) throw new Error("db nede");
            sisteFindManyArgs = args;
            return runderIDb;
          },
        },
        brukerSgInput: {
          findFirst: async () => eksisterendeRad,
          update: async (args: { where: unknown; data: Record<string, unknown> }) => {
            updates.push(args);
            return { id: "oppdatert" };
          },
          create: async (args: { data: Record<string, unknown> }) => {
            creates.push(args);
            return { id: "ny" };
          },
        },
      },
    },
  });
  t.mock.module("@/lib/error-tracking", {
    namedExports: {
      logError: async ({ context }: { context: string }) => {
        loggedeFeil.push(context);
      },
    },
  });

  const { beregnSgAggregat, synkroniserSgFraRunder, SG_BRO_KILDE } = await import(
    "@/lib/portal-stats/sg-bro"
  );

  await t.test("tom liste gir null (no-op-signal)", () => {
    assert.equal(beregnSgAggregat([]), null);
  });

  await t.test("snitt per kategori med 2 desimaler, score med 1", () => {
    const a = beregnSgAggregat([
      runde("2026-08-01", 71, { sgTotal: 1.5, sgOtt: 0.1, sgApp: 0.55, sgArg: 0.25, sgPutt: 0.6 }),
      runde("2026-08-08", 74, { sgTotal: -0.5, sgOtt: 0.2, sgApp: -0.45, sgArg: -0.15, sgPutt: -0.1 }),
      runde("2026-08-15", 72, { sgTotal: 1.0, sgOtt: 0.3, sgApp: 0.2, sgArg: 0.2, sgPutt: 0.3 }),
    ]);
    assert.ok(a);
    assert.equal(a.sgOtt, 0.2); // (0,1+0,2+0,3)/3
    assert.equal(a.sgApp, 0.1); // (0,55−0,45+0,2)/3
    assert.equal(a.sgArg, 0.1); // (0,25−0,15+0,2)/3
    assert.equal(a.sgPutt, 0.27); // (0,6−0,1+0,3)/3 = 0,2666… → 0,27
    assert.equal(a.sgTotal, 0.67); // (1,5−0,5+1,0)/3 = 0,6666… → 0,67
    assert.equal(a.snittScore, 72.3); // 217/3 = 72,33… → 72,3
    assert.equal(a.antallRunder, 3);
  });

  await t.test("kategori uten registrerte tall blir null — aldri fabrikkert", () => {
    const a = beregnSgAggregat([
      runde("2026-08-01", 75, { sgTotal: 0.4, sgPutt: 0.4 }),
      runde("2026-08-05", 77, { sgTotal: -0.2, sgPutt: -0.2 }),
    ]);
    assert.ok(a);
    assert.equal(a.sgOtt, null);
    assert.equal(a.sgApp, null);
    assert.equal(a.sgArg, null);
    assert.equal(a.sgPutt, 0.1);
  });

  await t.test("kategori-snitt bruker kun runder der kategorien finnes", () => {
    const a = beregnSgAggregat([
      runde("2026-08-01", 75, { sgTotal: 0.8, sgOtt: 0.8 }),
      runde("2026-08-05", 77, { sgTotal: 0.2 }),
    ]);
    assert.ok(a);
    // sgOtt-snittet deles på 1 (én runde med tall), ikke på 2.
    assert.equal(a.sgOtt, 0.8);
    assert.equal(a.sgTotal, 0.5);
  });

  await t.test("periode går fra eldste til nyeste uavhengig av rekkefølge", () => {
    const a = beregnSgAggregat([
      runde("2026-08-10", 72, { sgTotal: 0.1 }),
      runde("2026-07-01", 74, { sgTotal: 0.2 }),
      runde("2026-08-02", 73, { sgTotal: 0.3 }),
    ]);
    assert.ok(a);
    assert.equal(a.periodeFra.toISOString(), new Date("2026-07-01").toISOString());
    assert.equal(a.periodeTil.toISOString(), new Date("2026-08-10").toISOString());
  });

  await t.test("synk: null runder med SG er no-op — ingenting skrives", async () => {
    runderIDb = [];
    await synkroniserSgFraRunder("user-1");
    assert.equal(updates.length, 0);
    assert.equal(creates.length, 0);
    // Broen skal kun se runder som faktisk har SG.
    assert.deepEqual(
      (sisteFindManyArgs as { where?: unknown } | null)?.where,
      { userId: "user-1", sgTotal: { not: null } },
    );
  });

  await t.test("synk: uten eksisterende PLAYERHQ-rad opprettes ny", async () => {
    runderIDb = [runde("2026-08-01", 72, { sgTotal: 0.5, sgPutt: 0.5 })];
    eksisterendeRad = null;
    await synkroniserSgFraRunder("user-1");
    assert.equal(creates.length, 1);
    assert.equal(updates.length, 0);
    assert.equal(creates[0].data.kilde, SG_BRO_KILDE);
    assert.equal(creates[0].data.sgTotal, 0.5);
    assert.equal(creates[0].data.antallRunder, 1);
  });

  await t.test("synk: eksisterende PLAYERHQ-rad oppdateres i stedet for ny", async () => {
    runderIDb = [runde("2026-08-01", 72, { sgTotal: 0.5 })];
    eksisterendeRad = { id: "rad-1" };
    await synkroniserSgFraRunder("user-1");
    assert.equal(creates.length, 1); // uendret fra forrige scenario
    assert.equal(updates.length, 1);
    assert.deepEqual(updates[0].where, { id: "rad-1" });
    assert.equal(updates[0].data.antallRunder, 1);
  });

  await t.test("synk: kaster aldri — DB-feil logges og svelges", async () => {
    findManyKaster = true;
    await assert.doesNotReject(synkroniserSgFraRunder("user-1"));
    assert.deepEqual(loggedeFeil, ["portal-stats.synkroniserSgFraRunder"]);
  });
});

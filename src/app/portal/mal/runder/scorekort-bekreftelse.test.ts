import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let eier = "spiller-1";
let slag = [{ id: "slag-1", holeNumber: 1 }];
const skriving: unknown[] = [];
const transaksjoner: unknown[] = [];
const tx = {
  holeScore: {
    findMany: async () => [{ holeNumber: 1, strokes: 4 }],
    upsert: async (data: unknown) => { skriving.push(data); },
    deleteMany: async (data: unknown) => { skriving.push(data); },
  },
  shot: {
    findMany: async () => slag,
    deleteMany: async (data: unknown) => { skriving.push(data); },
  },
  round: { update: async (data: unknown) => { skriving.push(data); } },
};
mock.module("@/lib/auth/requireConsentingUser", {
  namedExports: { requireConsentingUser: async () => ({ id: "spiller-1", role: "PLAYER" }) },
});
mock.module("@/lib/prisma", {
  namedExports: { prisma: {
    round: { findUnique: async () => ({ userId: eier }), findFirst: async () => null },
    // Slettingsgrunnlaget skal aldri leses utenfor transaksjonen.
    holeScore: { findMany: async () => { throw new Error("lesing utenfor transaksjon"); } },
    shot: { findMany: async () => [] },
    $transaction: async (fn: (db: typeof tx) => Promise<unknown>, options: unknown) => {
      transaksjoner.push(options);
      return fn(tx);
    },
  } },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/domain/sg-reference", {
  namedExports: { hentSgReferanseForRunde: async () => null, SG_ENGINE_VERSION: "test" },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });

let lagreHullScorer: typeof import("./[id]/actions").lagreHullScorer;
before(async () => { ({ lagreHullScorer } = await import("./[id]/actions")); });
const hull = [{ holeNumber: 1, par: 4, strokes: 5, putts: 2, fairway: true, gir: false }];
beforeEach(() => {
  eier = "spiller-1";
  slag = [{ id: "slag-1", holeNumber: 1 }];
  skriving.length = 0;
  transaksjoner.length = 0;
});

test("tap av slag varsles uten skriving, med grunnlag fra serialiserbar transaksjon", async () => {
  const svar = await lagreHullScorer("runde-1", hull);
  assert.equal(svar.ok, false);
  assert.equal(svar.krevBekreftelse, true);
  assert.match(svar.bekreftelse ?? "", /^[a-f0-9]{64}$/);
  assert.deepEqual(skriving, []);
  assert.deepEqual(transaksjoner, [{ isolationLevel: "Serializable" }]);
});

test("bekreftelsen lagrer bare slagene i den aktuelle runden og på berørte hull", async () => {
  const forst = await lagreHullScorer("runde-1", hull);
  const svar = await lagreHullScorer("runde-1", hull, forst.bekreftelse);
  assert.equal(svar.ok, true);
  assert.ok(skriving.some(data => JSON.stringify(data) === JSON.stringify({ where: { roundId: "runde-1", holeNumber: { in: [1] } } })));
});

test("nye slag etter varselet krever ny bekreftelse og gir ingen skriving", async () => {
  const forst = await lagreHullScorer("runde-1", hull);
  slag.push({ id: "slag-2", holeNumber: 1 });
  const svar = await lagreHullScorer("runde-1", hull, forst.bekreftelse);
  assert.equal(svar.krevBekreftelse, true);
  assert.notEqual(svar.bekreftelse, forst.bekreftelse);
  assert.deepEqual(skriving, []);
});

test("samme antall, men andre slag kan ikke slettes med gammel bekreftelse", async () => {
  const forst = await lagreHullScorer("runde-1", hull);
  slag = [{ id: "et-annet-slag", holeNumber: 1 }];
  const svar = await lagreHullScorer("runde-1", hull, forst.bekreftelse);
  assert.equal(svar.krevBekreftelse, true);
  assert.deepEqual(skriving, []);
});

test("endret scorekort eller annen runde kan ikke gjenbruke bekreftelsen", async () => {
  const forst = await lagreHullScorer("runde-1", hull);
  for (const [id, data] of [["runde-2", hull], ["runde-1", [{ ...hull[0], strokes: 6 }]]] as const) {
    const svar = await lagreHullScorer(id, data, forst.bekreftelse);
    assert.equal(svar.krevBekreftelse, true);
  }
  assert.deepEqual(skriving, []);
});

test("andres runde avvises før lesing eller skriving i transaksjonen", async () => {
  eier = "annen-spiller";
  await assert.rejects(lagreHullScorer("runde-1", hull), /forbidden/);
  assert.deepEqual(transaksjoner, []);
  assert.deepEqual(skriving, []);
});

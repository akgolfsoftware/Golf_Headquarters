import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hentWagrPlassForSpiller } from "./tn-wagr-plass";

type Db = Parameters<typeof hentWagrPlassForSpiller>[0];
const dato = new Date(Date.UTC(2026, 9, 19));

function fakeDb(wagrId: string | null, rad: { rank: number | null; wagrDate: Date } | null) {
  const oppslag: number[] = [];
  const db = {
    user: { findUnique: async () => ({ publicPlayer: wagrId === null ? null : { wagrId } }) },
    wagrRefPlayer: { findUnique: async ({ where }: { where: { wagrPlayerId: number } }) => { oppslag.push(where.wagrPlayerId); return rad; } },
  } as unknown as Db;
  return { db, oppslag };
}

describe("hentWagrPlassForSpiller (A3: én kilde for WAGR-plass i TN)", () => {
  it("leser plassen og datoen fra wagr_ref_players", async () => {
    const { db, oppslag } = fakeDb("4521", { rank: 312, wagrDate: dato });
    assert.deepEqual(await hentWagrPlassForSpiller(db, "u1"), { plass: 312, dato });
    assert.deepEqual(oppslag, [4521]);
  });
  it("gir null uten kobling eller ugyldig WAGR-ID, uten oppslag i tabellen", async () => {
    for (const id of [null, "", "abc"]) {
      const { db, oppslag } = fakeDb(id, { rank: 1, wagrDate: dato });
      assert.equal(await hentWagrPlassForSpiller(db, "u1"), null);
      assert.deepEqual(oppslag, []);
    }
  });
  it("gir null når pipelines ikke har skrevet spilleren, og beholder plass uten tall", async () => {
    assert.equal(await hentWagrPlassForSpiller(fakeDb("77", null).db, "u1"), null);
    assert.deepEqual(await hentWagrPlassForSpiller(fakeDb("77", { rank: null, wagrDate: dato }).db, "u1"), { plass: null, dato });
  });
});

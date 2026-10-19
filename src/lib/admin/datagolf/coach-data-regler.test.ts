/**
 * Data Golf for coach: Kilde (DG-09) har én rad per endepunkt, Norske proffer (DG-08) er bare
 * norske, og katalogen (DG-02) har sider. Feilene ble funnet i designkontrollen 19.10.2026.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { KATALOG_PER_SIDE, katalogLenke, katalogSide, lesSide, norskProffWhere, samleKilde, type KildeSynkRad } from "./coach-data-regler";

const rad = (endpoint: string, rowCount: number | null, dag: number, feil = false): KildeSynkRad => ({
  endpoint, rowCount, lastStatus: feil ? 500 : 200, lastError: feil ? "boom" : null, lastSyncedAt: new Date(Date.UTC(2026, 8, dag)),
});

test("Kilde: tusenvis av parametersett for samme endepunkt blir én rad", () => {
  const synk = Array.from({ length: 3199 }, (_, i) => rad("historical-raw-data/rounds", 241, 1 + (i % 20)));
  synk.push(rad("skill-ratings", 412, 3));
  const ut = samleKilde(synk);
  assert.equal(ut.length, 2);
  assert.deepEqual(ut.map((r) => r.endepunkt), ["historical-raw-data/rounds", "skill-ratings"]);
  assert.equal(ut[0].rader, 3199 * 241);
  assert.equal(ut[0].sist?.toISOString(), new Date(Date.UTC(2026, 8, 20)).toISOString());
  assert.equal(ut[0].feil, null);
});

test("Kilde: status er fra siste kjøring, og feilede kjøringer telles", () => {
  const ut = samleKilde([rad("a", 10, 1, true), rad("a", 5, 9), rad("b", null, 2, true)]);
  assert.equal(ut[0].status, 200);
  assert.equal(ut[0].feil, "1 av 2 kjøringer feilet.");
  assert.equal(ut[1].rader, null);
  assert.equal(ut[1].feil, "Siste synk feilet.");
});

test("Norske proffer: bare spillere med landkode NO som er koblet til Data Golf", () => {
  assert.deepEqual(norskProffWhere, { dataGolfId: { not: null }, country: "NO" });
  const kilde = readFileSync("src/lib/admin/datagolf/coach-data.ts", "utf8");
  assert.equal((kilde.match(/where: norskProffWhere/g) ?? []).length, 2, "norskeIder og hentNorskeResultater bruker landfilteret");
  assert.doesNotMatch(kilde, /publicPlayer\.findMany\(\{\s*where: \{ dataGolfId: \{ not: null \} \}/);
  assert.match(kilde, /return samleKilde\(synk\)/);
  assert.doesNotMatch(kilde, /take: 200/);
});

test("Katalog: sider på 50, side holdes innenfor 1..siste", () => {
  assert.equal(KATALOG_PER_SIDE, 50);
  assert.deepEqual(katalogSide(1, 412), { side: 1, sider: 9, skip: 0, perSide: 50 });
  assert.deepEqual(katalogSide(3, 412), { side: 3, sider: 9, skip: 100, perSide: 50 });
  assert.equal(katalogSide(99, 412).side, 9);
  assert.equal(katalogSide(0, 412).side, 1);
  assert.deepEqual(katalogSide(1, 0), { side: 1, sider: 1, skip: 0, perSide: 50 });
  assert.equal(lesSide("4"), 4);
  assert.equal(lesSide("-2"), 1);
  assert.equal(lesSide("x"), 1);
  assert.equal(lesSide(undefined), 1);
});

test("Katalog: sidelenken beholder filtrene og utelater sidenr på side 1", () => {
  assert.equal(katalogLenke("/admin/datagolf/proffer", { sok: "hov", tour: undefined, norske: "1" }, 2), "/admin/datagolf/proffer?sok=hov&norske=1&sidenr=2");
  assert.equal(katalogLenke("/admin/datagolf/proffer", {}, 1), "/admin/datagolf/proffer");
});

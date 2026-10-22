import assert from "node:assert/strict";
import { test } from "node:test";

import { byggApneSpillerrader, tilWagrSpillerId } from "./tn-spillerliste-regler";

const DATO = new Date("2026-10-19T00:00:00Z");
const wagr = new Map([[123, { plass: 412, dato: DATO }], [456, { plass: null, dato: DATO }]]);

test("spiller uten deling vises med navn og WAGR-plass, men uten plan-, trenings- eller testtall", () => {
  const [rad] = byggApneSpillerrader([{ id: "u1", navn: "Eva Berg", wagrId: "123" }], new Set(), wagr);
  assert.deepEqual(rad, { id: "u1", navn: "Eva Berg", wagrPlass: 412, wagrDato: DATO, delt: false });
  assert.deepEqual(Object.keys(rad).sort(), ["delt", "id", "navn", "wagrDato", "wagrPlass"]);
});

test("delt-merket følger deltIder", () => {
  const rader = byggApneSpillerrader([{ id: "a", navn: "A", wagrId: null }, { id: "b", navn: "B", wagrId: null }], new Set(["b"]), wagr);
  assert.deepEqual(rader.map((r) => [r.id, r.delt]), [["a", false], ["b", true]]);
});

test("mangler kobling eller plass, er plassen null og ikke 0", () => {
  const rader = byggApneSpillerrader(
    [{ id: "a", navn: "A", wagrId: null }, { id: "b", navn: "B", wagrId: "456" }, { id: "c", navn: "C", wagrId: "999" }, { id: "d", navn: "D", wagrId: "abc" }],
    new Set(),
    wagr,
  );
  for (const r of rader) assert.deepEqual([r.wagrPlass, r.wagrDato], [null, null]);
});

test("sorterer på navn med norske bokstaver og setter «Ukjent» for manglende navn", () => {
  const rader = byggApneSpillerrader([{ id: "1", navn: "Åse", wagrId: null }, { id: "2", navn: "Øyvind", wagrId: null }, { id: "3", navn: "Ola", wagrId: null }, { id: "4", navn: null, wagrId: null }], new Set(), wagr);
  assert.deepEqual(rader.map((r) => r.navn), ["Ola", "Ukjent", "Øyvind", "Åse"]);
});

test("tilWagrSpillerId godtar bare rene sifre", () => {
  assert.equal(tilWagrSpillerId("123"), 123);
  assert.equal(tilWagrSpillerId(" 45 "), 45);
  for (const v of [null, "", "12a", "-1", "1.5"]) assert.equal(tilWagrSpillerId(v), null);
});

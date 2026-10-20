import test from "node:test";
import assert from "node:assert/strict";
import { medBrukSortert } from "./sorter";
import type { OvelseVisning } from "@/lib/portal-drills/ovelser-visning";

const o = (id: string, navn: string): OvelseVisning => ({
  id, navn, akse: "slag", omraade: null, min: null, mengde: null, miljo: [], press: null, motorikk: null, utstyr: [], kilde: "AK Golf", egen: false,
  beskrivelse: null, bilde: { src: "/x.jpg", posisjon: "50% 50%" }, brukt: 0,
});

test("mest brukt først, så navn", () => {
  const ut = medBrukSortert([o("a", "Putting"), o("b", "Driver"), o("c", "Wedge")], new Map([["c", 9], ["a", 2]]));
  assert.deepEqual(ut.map((x) => [x.id, x.brukt]), [["c", 9], ["a", 2], ["b", 0]]);
});

test("like tall sorteres på navn, og tomt kart gir null brukt", () => {
  const ut = medBrukSortert([o("a", "Øvelse B"), o("b", "Øvelse A")], new Map());
  assert.deepEqual(ut.map((x) => x.navn), ["Øvelse A", "Øvelse B"]);
  assert.ok(ut.every((x) => x.brukt === 0));
});

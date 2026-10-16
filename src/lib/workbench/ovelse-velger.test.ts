import assert from "node:assert/strict";
import { test } from "node:test";
import { bruktTekst, sorterMestBrukt, tellBruk, treffer, velgOvelser, type VelgerOvelse } from "./ovelse-velger";

const o = (id: string, navn: string, brukt: number, extra: Partial<VelgerOvelse> = {}): VelgerOvelse =>
  ({ id, navn, pyramide: "SLAG", omraade: null, egen: false, brukt, min: null, ...extra });

test("tellBruk teller hver WorkbenchDrill per øvelse og hopper over rader uten øvelse", () => {
  const bruk = tellBruk([{ exerciseId: "a" }, { exerciseId: "b" }, { exerciseId: "a" }, { exerciseId: null }, { exerciseId: "a" }]);
  assert.equal(bruk.get("a"), 3);
  assert.equal(bruk.get("b"), 1);
  assert.equal(bruk.size, 2);
});

test("mest brukt først, så navn i norsk rekkefølge", () => {
  const liste = sorterMestBrukt([o("1", "Ålesund-drill", 0), o("2", "Bunker", 0), o("3", "Wedge", 11), o("4", "Innspill", 14)]);
  assert.deepEqual(liste.map((x) => x.id), ["4", "3", "2", "1"]);
});

test("søket treffer navn og område uten hensyn til store bokstaver", () => {
  assert.equal(treffer(o("1", "Wedge til tre lengder", 0), "WEDGE"), true);
  assert.equal(treffer(o("1", "Tre mål", 0, { omraade: "Chip" }), "chip"), true);
  assert.equal(treffer(o("1", "Tre mål", 0), "putt"), false);
  assert.equal(treffer(o("1", "Tre mål", 0), "  "), true);
});

test("søket leter i alle øvelser, også dem etter de 60 første", () => {
  const alle = Array.from({ length: 120 }, (_, i) => o(`id-${i}`, `Øvelse ${String(i).padStart(3, "0")}`, 0));
  alle.push(o("sjelden", "Zulu lob over bunker", 0));
  const r = velgOvelser(alle, { q: "zulu", grense: 40 });
  assert.equal(r.antall, 1);
  assert.equal(r.treff[0]?.id, "sjelden");
});

test("standardlista uten søk er sortert etter antall, filtrert på pyramide og kuttet ved grensen", () => {
  const alle = [o("a", "A", 2), o("b", "B", 9, { pyramide: "TEK" }), o("c", "C", 5), o("d", "D", 7), o("e", "E", 0)];
  const r = velgOvelser(alle, { grense: 2, pyramide: "SLAG" });
  assert.deepEqual(r.treff.map((x) => x.id), ["d", "c"]);
  assert.equal(r.antall, 4);
  assert.equal(r.total, 5);
});

test("antallet vises som «14× lagt inn», og «—» når øvelsen ikke er brukt", () => {
  assert.equal(bruktTekst(14), "14× lagt inn");
  assert.equal(bruktTekst(0), "—");
});

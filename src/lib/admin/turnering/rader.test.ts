import { test } from "node:test";
import assert from "node:assert/strict";
import { byggTurneringRader } from "./rader";

const alle = [
  { id: "t1", navn: "Tour 1", datoTekst: "9. jun", anlegg: "Bane A", paameldte: 4, kilde: "NGF", latitude: 59.2, longitude: 10.9 },
  { id: "t2", navn: "Tour 2", datoTekst: "10. jun", anlegg: null, paameldte: 0, kilde: null, latitude: null, longitude: null },
];

test("koordinater kommer bare fra basen, aldri fra radnummer", () => {
  const rader = byggTurneringRader(alle, []);
  assert.equal(rader[0].lat, 59.2);
  assert.equal(rader[0].lon, 10.9);
  assert.equal(rader[1].lat, null);
  assert.equal(rader[1].lon, null);
  assert.equal(rader[1].course, null);
});

test("ugyldige koordinater avvises", () => {
  const rader = byggTurneringRader([{ ...alle[0], latitude: 999, longitude: 10 }], []);
  assert.equal(rader[0].lat, null);
});

test("stallens påmeldinger merkes, og manglende rader legges til", () => {
  const rader = byggTurneringRader(alle, [
    { key: "t1", navn: "Tour 1", datoTekst: "9. jun", anlegg: "Bane A", paameldte: 2 },
    { key: "manuell:X", navn: "Manuell", datoTekst: "1. jul", anlegg: null, paameldte: 1 },
  ]);
  assert.equal(rader[0].st, "Påmeldt");
  assert.equal(rader[0].paameldte, 2);
  assert.equal(rader[1].st, null);
  assert.equal(rader[2].name, "Manuell");
  assert.equal(rader[2].lat, null);
});

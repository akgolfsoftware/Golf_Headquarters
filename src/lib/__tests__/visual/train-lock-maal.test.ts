/**
 * Rene deler av målemotoren i Train-lock sign-off-riggen
 * (scripts/lib/train-lock-maal.mjs) — beskjæring, størrelsesvakt, diff og
 * fasit-oppslag. Nettleserdelene (fasit-/app-skjermbilde) kjøres av
 * tests/visual/train-lock-pixelnaerhet.spec.ts, ikke her.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import {
  slug,
  kuttTopp,
  kuttBunn,
  klippTilFelles,
  diffBilder,
  finnFasitFil,
  STANDARD_NAA,
} from "../../../../scripts/lib/train-lock-maal.mjs";

/** Ensfarget PNG. */
function bilde(bredde: number, hoyde: number, rgba: [number, number, number, number]): PNG {
  const png = new PNG({ width: bredde, height: hoyde });
  for (let i = 0; i < bredde * hoyde; i++) png.data.set(rgba, i * 4);
  return png;
}
const HVIT: [number, number, number, number] = [255, 255, 255, 255];
const SVART: [number, number, number, number] = [0, 0, 0, 255];

test("slug: label → filnavn-trygg streng", () => {
  assert.equal(slug("PH-01 I dag"), "ph-01-i-dag");
  assert.equal(slug("S3-03a Spiller profil Mac"), "s3-03a-spiller-profil-mac");
});

test("kuttTopp/kuttBunn: cropTop 0 gir samme objekt, ellers riktig høyde", () => {
  const p = bilde(4, 10, HVIT);
  assert.equal(kuttTopp(p, 0), p);
  assert.equal(kuttBunn(p, 0), p);
  assert.equal(kuttTopp(p, 3).height, 7);
  assert.equal(kuttBunn(p, 3).height, 7);
  assert.equal(kuttTopp(p, 3).width, 4);
});

test("klippTilFelles: inntil 2 px avvik klippes til minste felles mål", () => {
  const [a, b] = klippTilFelles(bilde(100, 100, HVIT), bilde(101, 102, HVIT));
  assert.deepEqual([a.width, a.height, b.width, b.height], [100, 100, 100, 100]);
});

test("klippTilFelles: mer enn 2 px er en reell størrelsesfeil", () => {
  assert.throws(
    () => klippTilFelles(bilde(100, 100, HVIT), bilde(104, 100, HVIT), 54),
    /STØRRELSE MATCHER IKKE: fasit 100×100 vs app 104×100 \(etter cropTop=54\)/,
  );
});

test("diffBilder: identiske bilder gir 0, motsatte gir 100 %, cropTop teller fra riktig ende", () => {
  const likt = diffBilder(bilde(4, 10, HVIT), bilde(4, 10, HVIT), 0);
  assert.equal(likt.avvikPiksler, 0);
  assert.equal(likt.totalPiksler, 40);
  const ulikt = diffBilder(bilde(4, 10, HVIT), bilde(4, 10, SVART), 2);
  assert.equal(ulikt.totalPiksler, 32);
  assert.equal(ulikt.andel, 1);
  assert.equal(ulikt.diff.height, 8);
});

test("finnFasitFil: finner fila på data-screen-label, null når ingen har den", async () => {
  assert.equal(await finnFasitFil("PH-01 I dag"), "PH-01 I dag.dc.html");
  assert.equal(await finnFasitFil("Finnes ikke 0000"), null);
});

test("STANDARD_NAA er riggens frosne testdato (09:10 Oslo 22.08.2026)", () => {
  assert.equal(STANDARD_NAA, "2026-08-22T07:10:00Z");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { byggKoRad, sammeTapperSnapshot } from "./tapper-kladd";

test("sen kvittering kan ikke fjerne slag registrert mens sendingen pågikk", () => {
  const sent = byggKoRad("spiller-a", "okt-a", [{ club: "7i", count: 10 }], new Date());
  const current = { ...sent, revision: 1, counts: [{ club: "7i", count: 11 }] };
  assert.equal(sammeTapperSnapshot(current, sent), false);
});
test("angre og nytt slag gir ny versjon selv om tellingen er lik", () => {
  const sent = byggKoRad("spiller-a", "okt-a", [{ club: "7i", count: 10 }], new Date());
  assert.equal(sammeTapperSnapshot({ ...sent, revision: 2 }, sent), false);
});
test("samme snapshots fra ulike eiere eller økter deler ikke kvittering", () => {
  const sent = byggKoRad("spiller-a", "okt-a", [], new Date());
  assert.equal(sammeTapperSnapshot(byggKoRad("spiller-b", "okt-a", [], new Date()), sent), false);
  assert.equal(sammeTapperSnapshot(byggKoRad("spiller-a", "okt-b", [], new Date()), sent), false);
  assert.equal(sammeTapperSnapshot(sent, sent), true);
});

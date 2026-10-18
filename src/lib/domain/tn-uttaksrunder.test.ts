import assert from "node:assert/strict";
import { test } from "node:test";

import { avPlasser, byggUttaksrunder, velgHeltRunde } from "./tn-uttaksrunder";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);
const uttak = [
  { arrangement: "European Young Masters 2027", status: "UTTATT", decidedAt: d("2026-10-10") },
  { arrangement: "European Young Masters 2027", status: "UTTATT", decidedAt: d("2026-10-12") },
  { arrangement: "European Young Masters 2027", status: "RESERVE", decidedAt: d("2026-10-11") },
  { arrangement: "NM lag", status: "IKKE_UTTATT", decidedAt: d("2026-09-01") },
];

test("frist og plasser fra trener vises på runden, med dager til fristen", () => {
  const runder = byggUttaksrunder(uttak, [{ arrangement: "European Young Masters 2027", frist: d("2026-11-01"), plasser: 4, reserver: 2 }], "2026-10-14");
  const emy = runder.find((r) => r.arrangement === "European Young Masters 2027")!;
  assert.equal(emy.frist, "2026-11-01");
  assert.equal(emy.dagerTilFrist, 18);
  assert.equal(emy.plasser, 4);
  assert.equal(emy.reserver, 2);
  assert.equal(avPlasser(emy.tattUt, emy.plasser), "2/4");
  assert.equal(avPlasser(emy.reserve, emy.reserver), "1/2");
});

test("uten frist og plasser er verdiene null, så skjermen viser «—»", () => {
  const nm = byggUttaksrunder(uttak, [], "2026-10-14").find((r) => r.arrangement === "NM lag")!;
  assert.equal(nm.frist, null);
  assert.equal(nm.dagerTilFrist, null);
  assert.equal(nm.plasser, null);
  assert.equal(nm.reserver, null);
  assert.equal(avPlasser(nm.tattUt, nm.plasser), "0");
});

test("en runde med frist men uten uttak ennå står i lista", () => {
  const runder = byggUttaksrunder([], [{ arrangement: "Junior Solheim Cup", frist: d("2027-03-01"), plasser: 6, reserver: null }], "2026-10-14");
  assert.equal(runder.length, 1);
  assert.equal(runder[0]!.tattUt, 0);
  assert.equal(runder[0]!.sistAvgjort, null);
});

test("helteflaten velger nærmeste frist fram i tid, ellers sist avgjorte runde", () => {
  const runder = byggUttaksrunder(uttak, [
    { arrangement: "European Young Masters 2027", frist: d("2026-11-01"), plasser: 4, reserver: 2 },
    { arrangement: "NM lag", frist: d("2026-10-20"), plasser: 3, reserver: 1 },
  ], "2026-10-14");
  assert.equal(velgHeltRunde(runder)?.arrangement, "NM lag");
  const passert = byggUttaksrunder(uttak, [{ arrangement: "NM lag", frist: d("2026-10-01"), plasser: 3, reserver: 1 }], "2026-10-14");
  assert.equal(velgHeltRunde(passert)?.arrangement, "European Young Masters 2027");
  assert.equal(velgHeltRunde([]), null);
});

/** TN-11 Månedsplan: kalenderuker, perioder og tall bygges på Oslo-dager. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { byggManedsplan, dagnokkel } from "./tn-manedsplan";

const tom = { okter: [], perioder: [], turneringer: [], samlinger: [] };

test("september 2026 gir hele uker fra mandag 31.08 til søndag 04.10", () => {
  const { uker } = byggManedsplan({ aar: 2026, maned: 9, ...tom });
  assert.equal(uker[0]!.fra, "2026-08-31");
  assert.equal(uker.at(-1)!.til, "2026-10-04");
  assert.deepEqual(uker.map((u) => u.nr), [36, 37, 38, 39, 40]);
  assert.equal(uker[0]!.dager[0]!.iManed, false);
  assert.equal(uker[0]!.dager[1]!.dag, 1);
});

test("økt sent på kvelden havner på Oslo-dagen, ikke UTC-dagen", () => {
  const startAt = new Date("2026-09-14T22:30:00Z"); // 00:30 15.09 i Oslo
  assert.equal(dagnokkel(startAt), "2026-09-15");
  const { uker, tall } = byggManedsplan({ aar: 2026, maned: 9, ...tom, okter: [{ id: "a", title: "Teknikk", startAt, endAt: startAt, location: null, kind: null }] });
  const dag = uker.flatMap((u) => u.dager).find((d) => d.nokkel === "2026-09-15")!;
  assert.equal(dag.hendelser[0]!.tid, "00:30");
  assert.equal(tall.okter, 1);
});

test("periodebåndet teller uker i blokken", () => {
  const { uker } = byggManedsplan({
    aar: 2026,
    maned: 9,
    ...tom,
    perioder: [{ lPhase: "TURNERING", startDate: new Date("2026-06-01T00:00:00Z"), endDate: new Date("2026-09-27T00:00:00Z") }],
  });
  assert.deepEqual(uker[0]!.periode, { navn: "Turnering", indeks: 14, antall: 17 });
  assert.equal(uker.at(-1)!.periode, null);
});

test("turnering og samling teller dager bare innenfor måneden", () => {
  const { tall } = byggManedsplan({
    aar: 2026,
    maned: 9,
    ...tom,
    turneringer: [{ id: "t", name: "Srixon Tour", startDate: new Date("2026-08-30T08:00:00Z"), endDate: new Date("2026-09-02T08:00:00Z"), location: null }],
    samlinger: [{ id: "s", name: "Mar Menor", startDate: new Date("2026-09-29T08:00:00Z"), endDate: new Date("2026-10-03T08:00:00Z"), location: null }],
  });
  assert.equal(tall.turneringsdager, 2);
  assert.equal(tall.samlingsdager, 2);
});

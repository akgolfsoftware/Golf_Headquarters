/**
 * beregnSgGap — svakeste SG-kategori (AP0.3).
 *
 * Etter omleggingen til den kanoniske selectoren er sg-gap et tynt skall
 * rundt hentSpillerSg, så testen mocker `@/lib/domain/spiller-sg` (ikke
 * prisma): da testes utvelgelsen isolert, uavhengig av kilderegelen som
 * allerede har egne tester i spiller-sg-hent.test.ts.
 *
 * VIKTIG: modulen under test importeres kun ÉN gang, etter t.mock.module —
 * Node re-evaluerer ikke en allerede lastet ES-modul (samme fallgruve som
 * dokumentert i sg-analyse-ekspert.test.ts).
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

type Verdi = { sg: number | null; trend: number[] };

const v = (sg: number | null): Verdi => ({ sg, trend: [] });

test("beregnSgGap — velger svakeste kategori", async (t) => {
  let svar: {
    kilde: "BEREGNET" | "SELVRAPPORTERT";
    grunnlag: string;
    antall: number;
    total: Verdi;
    ott: Verdi;
    app: Verdi;
    arg: Verdi;
    putt: Verdi;
  } | null = null;

  t.mock.module("@/lib/domain/spiller-sg", {
    namedExports: { hentSpillerSg: async () => svar },
  });

  const { beregnSgGap } = await import("./sg-gap");

  const sg = (deler: {
    ott?: number | null;
    app?: number | null;
    arg?: number | null;
    putt?: number | null;
    kilde?: "BEREGNET" | "SELVRAPPORTERT";
  }) => ({
    kilde: deler.kilde ?? ("BEREGNET" as const),
    grunnlag: "10 runder",
    antall: 10,
    total: v(null),
    ott: v(deler.ott ?? null),
    app: v(deler.app ?? null),
    arg: v(deler.arg ?? null),
    putt: v(deler.putt ?? null),
  });

  // 1) Laveste verdi vinner — negative tall er svakest.
  svar = sg({ ott: 0.8, app: -0.9, arg: 0.2, putt: -0.3 });
  assert.deepEqual(await beregnSgGap("u1"), { kategori: "APP", sg: -0.9 });

  // 2) Alle positive: den minste er fortsatt «svakest» (relativt gap).
  svar = sg({ ott: 1.2, app: 0.4, arg: 2.0, putt: 0.9 });
  assert.deepEqual(await beregnSgGap("u1"), { kategori: "APP", sg: 0.4 });

  // 3) Null-felter hoppes over — ikke behandlet som 0.
  svar = sg({ ott: null, app: null, arg: 0.5, putt: null });
  assert.deepEqual(await beregnSgGap("u1"), { kategori: "ARG", sg: 0.5 });

  // 4) Likhet: første kategori i rekkefølgen OTT→APP→ARG→PUTT vinner
  //    (deterministisk — ellers ville «ukas fokus» hoppe tilfeldig).
  svar = sg({ ott: -0.5, app: -0.5, arg: 0.1, putt: 0.2 });
  assert.deepEqual(await beregnSgGap("u1"), { kategori: "OTT", sg: -0.5 });

  // 5) Kilden påvirker ikke utvelgelsen — selvrapportert behandles likt.
  svar = sg({ ott: 0.3, app: 0.1, arg: 0.9, putt: 0.7, kilde: "SELVRAPPORTERT" });
  assert.deepEqual(await beregnSgGap("u1"), { kategori: "APP", sg: 0.1 });

  // 6) Ingen SG i det hele tatt → null (aldri fabrikkert fokus).
  svar = sg({});
  assert.equal(await beregnSgGap("u1"), null);

  // 7) Selectoren gir null (ny spiller) → null.
  svar = null;
  assert.equal(await beregnSgGap("u1"), null);
});

// Tester for provenance-hjelperen: bygging, tilbakelesing og norske linjer.
// Rene funksjoner — ingen mocking av prisma nødvendig.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  byggProvenance,
  lesProvenance,
  provenanceLinjer,
  type Provenance,
} from "@/lib/agents/provenance";

const BEREGNET = new Date("2026-07-29T10:00:00.000Z");

test("byggProvenance normaliserer datoer til ISO og setter versjon 1", () => {
  const prov = byggProvenance({
    kilde: "RUNDE",
    regel: "SG APP under terskel siste 30 dager",
    datapunkter: [
      { id: "runde1", dato: new Date("2026-07-20T12:00:00.000Z"), etikett: "Bossum" },
      { id: "runde2", dato: "2026-07-15T12:00:00.000Z" },
    ],
    terskel: -0.35,
    maaltVerdi: -0.62,
    enhet: "SG",
    fraDato: new Date("2026-06-29T00:00:00.000Z"),
    tilDato: BEREGNET,
    beregnetAt: BEREGNET,
  });

  const lest = lesProvenance(prov);
  assert.ok(lest, "provenance skal kunne leses tilbake");
  assert.equal(lest.versjon, 1);
  assert.equal(lest.kilde, "RUNDE");
  assert.equal(lest.datapunkter.length, 2);
  assert.equal(lest.datapunkter[0].dato, "2026-07-20T12:00:00.000Z");
  assert.equal(lest.datapunkter[0].etikett, "Bossum");
  assert.equal(lest.beregnetAt, BEREGNET.toISOString());
});

test("byggProvenance dropper ugyldige og manglende datoer i stedet for å skrive NaN", () => {
  const lest = lesProvenance(
    byggProvenance({
      kilde: "TEST",
      regel: "Testresultat under målnivå",
      datapunkter: [{ id: "test1", dato: "ikke-en-dato" }, { id: "test2" }],
      fraDato: null,
      beregnetAt: BEREGNET,
    }),
  );

  assert.ok(lest);
  assert.equal(lest.datapunkter[0].dato, undefined);
  assert.equal(lest.datapunkter[1].dato, undefined);
  assert.equal(lest.fraDato, undefined);
});

test("byggProvenance kaster på ugyldig form i stedet for å skrive et halvt spor", () => {
  assert.throws(() =>
    byggProvenance({
      kilde: "RUNDE",
      regel: "",
      beregnetAt: BEREGNET,
    }),
  );
});

test("byggProvenance kutter datapunkt-lista ved 50", () => {
  const mange = Array.from({ length: 80 }, (_, i) => ({ id: `rad${i}` }));
  const lest = lesProvenance(
    byggProvenance({
      kilde: "OKT",
      regel: "For få gjennomførte økter",
      datapunkter: mange,
      beregnetAt: BEREGNET,
    }),
  );

  assert.ok(lest);
  assert.equal(lest.datapunkter.length, 50);
});

test("lesProvenance returnerer null for tomt og ugyldig grunnlag", () => {
  assert.equal(lesProvenance(null), null);
  assert.equal(lesProvenance(undefined), null);
  assert.equal(lesProvenance({ versjon: 99, kilde: "RUNDE" }), null);
  assert.equal(lesProvenance("noe helt annet"), null);
});

test("provenanceLinjer skriver norske setninger, ikke JSON", () => {
  const prov: Provenance = {
    versjon: 1,
    kilde: "RUNDE",
    regel: "SG APP under terskel siste 30 dager",
    datapunkter: [{ id: "r1" }, { id: "r2" }, { id: "r3" }],
    terskel: -0.35,
    maaltVerdi: -0.62,
    enhet: "SG",
    fraDato: "2026-06-29T00:00:00.000Z",
    tilDato: "2026-07-29T00:00:00.000Z",
    beregnetAt: BEREGNET.toISOString(),
  };

  const linjer = provenanceLinjer(prov);
  assert.equal(linjer[0], "SG APP under terskel siste 30 dager");
  assert.equal(linjer[1], "Målt: -0.62 SG (terskel -0.35 SG)");
  assert.ok(
    linjer.some((l) => l.startsWith("Periode: ")),
    "skal vise periode-linje",
  );
  assert.ok(
    linjer.some((l) => l === "Runder: 3 lest"),
    "skal vise antall leste rader med norsk kilde-etikett",
  );
});

test("provenanceLinjer tåler grunnlag uten tall og uten datapunkter", () => {
  const linjer = provenanceLinjer({
    versjon: 1,
    kilde: "PLAN",
    regel: "Ingen aktiv plan for kommende uke",
    datapunkter: [],
    beregnetAt: BEREGNET.toISOString(),
  });

  assert.deepEqual(linjer, ["Ingen aktiv plan for kommende uke"]);
});

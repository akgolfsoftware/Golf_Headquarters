import test from "node:test";
import assert from "node:assert/strict";
import { byggProvenance, provenanceLesbarTekst } from "./provenance";

test("byggProvenance: gyldig input gir strukturert provenance", () => {
  const p = byggProvenance({
    kilde: "RUNDER",
    rader: [{ id: "r1", dato: "2026-07-20" }],
    regel: "SG_APP under terskel -0.35",
    terskel: -0.35,
    maaltVerdi: -0.42,
  });
  assert.ok(p);
  assert.equal(p?.kilde, "RUNDER");
  assert.equal(p?.rader.length, 1);
  assert.equal(p?.terskel, -0.35);
});

test("byggProvenance: tidsvindu konverteres til ISO-strenger", () => {
  const p = byggProvenance({
    kilde: "TRACKMAN",
    rader: [],
    regel: "ingen økter siste 14 dager",
    tidsvindu: { fra: new Date("2026-07-01"), til: new Date("2026-07-15") },
  });
  assert.ok(p?.tidsvindu);
  assert.equal(p?.tidsvindu?.fra, "2026-07-01T00:00:00.000Z");
});

test("byggProvenance: valgfrie felt kan utelates", () => {
  const p = byggProvenance({
    kilde: "TESTER",
    rader: [{ id: "t1", dato: "2026-07-10" }],
    regel: "test-forfall over 30 dager",
  });
  assert.ok(p);
  assert.equal(p?.terskel, undefined);
  assert.equal(p?.tidsvindu, undefined);
});

test("byggProvenance: ugyldig kilde gir undefined uten å kaste", () => {
  const p = byggProvenance({
    // @ts-expect-error -- bevisst ugyldig for å teste feilhåndtering
    kilde: "UKJENT",
    rader: [],
    regel: "test",
  });
  assert.equal(p, undefined);
});

test("provenanceLesbarTekst: formaterer full struktur norsk og lesbart", () => {
  const p = byggProvenance({
    kilde: "RUNDER",
    rader: [{ id: "r1", dato: "2026-07-20" }],
    regel: "SG APP under terskel -0.35",
    terskel: -0.35,
    maaltVerdi: -0.42,
  });
  const tekst = provenanceLesbarTekst(p);
  assert.equal(
    tekst,
    "SG APP under terskel -0.35, grense -0.35, målt -0.42 — kilde: runder (1 rad)",
  );
});

test("provenanceLesbarTekst: null/ugyldig input gir null (skjuler seksjon)", () => {
  assert.equal(provenanceLesbarTekst(null), null);
  assert.equal(provenanceLesbarTekst(undefined), null);
  assert.equal(provenanceLesbarTekst({ ugyldig: true }), null);
});

test("provenanceLesbarTekst: uten rader utelater rad-antall", () => {
  const p = byggProvenance({
    kilde: "PLAN",
    rader: [],
    regel: "avvik over terskel",
  });
  const tekst = provenanceLesbarTekst(p);
  assert.equal(tekst, "avvik over terskel — kilde: plan");
});

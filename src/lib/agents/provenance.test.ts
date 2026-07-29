import test from "node:test";
import assert from "node:assert/strict";
import { byggProvenance } from "./provenance";

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

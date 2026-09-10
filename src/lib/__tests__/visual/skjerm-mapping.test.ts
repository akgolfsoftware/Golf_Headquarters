import test from "node:test";
import assert from "node:assert/strict";
import { SKJERM_MAPPING } from "../../../../tests/visual/skjerm-mapping";

// Vakt for sign-off-riggen (fase 1, økt 4 — docs/planer/design/2026-09-05-komplett-designport.md §3 regel 2):
// ingen måling mot en tegning uten dato, ingen «ukalibrert» uten årsak, panel-modus alltid komplett.

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

test("hver riggrad har fasitDato (git-dato for fasitfila, YYYY-MM-DD)", () => {
  for (const rad of SKJERM_MAPPING) {
    assert.match(rad.fasitDato ?? "", ISO_DATO, `${rad.label}: mangler fasitDato`);
  }
});

test("ukalibrert krever aarsak", () => {
  for (const rad of SKJERM_MAPPING) {
    if (rad.status === "ukalibrert") assert.ok(rad.aarsak, `${rad.label}: ukalibrert uten aarsak`);
  }
});

test("panel-modus: selector og viewport settes sammen, cropTop er 0", () => {
  for (const rad of SKJERM_MAPPING) {
    assert.equal(Boolean(rad.selector), Boolean(rad.viewport), `${rad.label}: selector og viewport hører sammen`);
    if (rad.viewport) {
      assert.ok(rad.viewport.bredde > 0 && rad.viewport.hoyde > 0, `${rad.label}: viewport må være positiv`);
      assert.equal(rad.cropTop, 0, `${rad.label}: et panel har ingen bakt statuslinje`);
    }
  }
});

test("ingen rad peker på en redirect-adresse under /admin/agenticos (MASTERPLAN 15.1/15.5)", () => {
  for (const rad of SKJERM_MAPPING) {
    assert.ok(!rad.rute.startsWith("/admin/agenticos"), `${rad.label}: ${rad.rute} er en redirect`);
  }
});

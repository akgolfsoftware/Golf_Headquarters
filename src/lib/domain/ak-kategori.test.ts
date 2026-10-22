import { test } from "node:test";
import assert from "node:assert/strict";

import { akKategoriFraTall } from "./ak-kategori";

test("A7: kategorien kommer fra brutto snitt i turnering når det finnes", () => {
  assert.equal(akKategoriFraTall({ snitt: 71.5, hcp: 20 }), "B");
  assert.equal(akKategoriFraTall({ snitt: 80, hcp: null }), "G");
  assert.equal(akKategoriFraTall({ snitt: 100, hcp: null }), "K");
});

test("A7: uten turneringssnitt brukes HCP, og uten begge er kategorien tom («—»)", () => {
  assert.notEqual(akKategoriFraTall({ snitt: null, hcp: 5 }), null);
  assert.equal(akKategoriFraTall({ snitt: null, hcp: null }), null);
});

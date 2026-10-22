import test from "node:test";
import assert from "node:assert/strict";
import { skjultVedRulling } from "./hurtigknapp-rulling";

// Hurtigknappen skjules ved ned-rulling på mobil så den ikke dekker høyre kant av lister.
test("rulling nedover skjuler knappen", () => assert.equal(skjultVedRulling(100, 140, false), true));
test("rulling oppover viser knappen", () => assert.equal(skjultVedRulling(140, 100, true), false));
test("små bevegelser endrer ingenting", () => {
  assert.equal(skjultVedRulling(100, 104, true), true);
  assert.equal(skjultVedRulling(100, 96, false), false);
});

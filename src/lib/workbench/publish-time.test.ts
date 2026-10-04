import assert from "node:assert/strict";
import { test } from "node:test";
import { formaterPubliserTid } from "./publish-time";

test("publiseringstid vises i Oslo både om vinteren og sommeren", () => {
  assert.equal(formaterPubliserTid("2026-01-10T12:05:00Z"), "10.1 13:05");
  assert.equal(formaterPubliserTid("2026-07-10T12:05:00Z"), "10.7 14:05");
});
test("Oslo-datoen følger døgn- og årsskiftet, ikke UTC-datoen", () => {
  assert.equal(formaterPubliserTid("2026-12-31T23:30:00Z"), "1.1 00:30");
});
test("sommertidsskiftet viser riktig time på begge sider", () => {
  assert.equal(formaterPubliserTid("2026-03-29T00:30:00Z"), "29.3 01:30");
  assert.equal(formaterPubliserTid("2026-03-29T01:30:00Z"), "29.3 03:30");
});
test("skadet tidspunkt vises som ukjent, uten fabrikkert dato eller kast", () => {
  assert.equal(formaterPubliserTid("ikke-en-dato"), "Ukjent tid");
});

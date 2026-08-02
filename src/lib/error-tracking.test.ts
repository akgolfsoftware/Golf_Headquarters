import test from "node:test";
import assert from "node:assert/strict";
import { skalVarsle, VARSEL_STRUPE_MS } from "./error-tracking";

test("skalVarsle: første feil i en kontekst varsles alltid", () => {
  assert.equal(skalVarsle(undefined, 1_000_000), true);
});

test("skalVarsle: gjentatt feil innenfor strupevinduet varsles ikke", () => {
  const naa = 1_000_000;
  assert.equal(skalVarsle(naa, naa + 1), false);
  assert.equal(skalVarsle(naa, naa + VARSEL_STRUPE_MS - 1), false);
});

test("skalVarsle: varsler igjen når strupevinduet er ute", () => {
  const naa = 1_000_000;
  assert.equal(skalVarsle(naa, naa + VARSEL_STRUPE_MS), true);
  assert.equal(skalVarsle(naa, naa + VARSEL_STRUPE_MS * 3), true);
});

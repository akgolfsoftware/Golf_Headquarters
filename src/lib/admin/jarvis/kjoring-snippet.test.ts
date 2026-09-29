import test from "node:test";
import assert from "node:assert/strict";
import { lagSnippet } from "./kjoring-snippet";

test("ingen output gir null", () => {
  assert.equal(lagSnippet(null), null);
});

test("briefs telles og entall/flertall er riktig", () => {
  assert.equal(lagSnippet({ briefs: [{ brief: "Kort" }], varsler: 1 }), "1 brief · 1 varsel — Kort");
  assert.match(lagSnippet({ briefs: [{}, {}], varsler: 0 }) ?? "", /^2 briefer · 0 varsler$/);
});

test("endringer viser spiller og antall", () => {
  assert.equal(lagSnippet({ endringer: [1, 2], spillerNavn: "Test Spiller" }), "Test Spiller · 2 endringer");
});

test("melding vinner over generisk json og kappes ved 240 tegn", () => {
  assert.equal(lagSnippet({ melding: "Hei" }), "Hei");
  assert.equal(lagSnippet({ melding: "x".repeat(300) })?.length, 240);
});

test("ukjent form faller til json, tomt objekt gir null", () => {
  assert.equal(lagSnippet({ a: 1 }), '{"a":1}');
  assert.equal(lagSnippet({}), null);
});

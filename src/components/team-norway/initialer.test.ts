import { test } from "node:test";
import assert from "node:assert/strict";
import { initialer } from "./initialer";

test("initialer tar første bokstav i de to første navnene", () => {
  assert.equal(initialer("Magnus Aasheim"), "MA");
  assert.equal(initialer("ola  nordmann hansen"), "ON");
  assert.equal(initialer("Øyvind"), "Ø");
});

test("initialer gir spørsmålstegn for tomt navn", () => {
  assert.equal(initialer(""), "?");
  assert.equal(initialer("   "), "?");
});

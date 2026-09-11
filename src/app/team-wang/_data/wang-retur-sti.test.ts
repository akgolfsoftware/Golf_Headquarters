import assert from "node:assert/strict";
import { test } from "node:test";

import { tryggWangRetursti } from "./wang-retur-sti";

test("beholder bare interne returstier under team-wang", () => {
  assert.equal(tryggWangRetursti("/team-wang/coach?fane=plan#uke"), "/team-wang/coach?fane=plan#uke");
  assert.equal(tryggWangRetursti("/team-wang"), "/team-wang");
});

test("avviser ekstern, protokollrelativ og forfalsket WANG-sti", () => {
  for (const verdi of [
    "https://ond.example/team-wang",
    "//ond.example/team-wang",
    "/team-wang-ond/coach",
    "/portal",
    "/team-wang\\@ond.example",
  ]) {
    assert.equal(tryggWangRetursti(verdi), "/team-wang", verdi);
  }
});

test("avviser login-loop, ugyldig verdi og flere next-parametre", () => {
  for (const verdi of [
    "/team-wang/logg-inn",
    "/team-wang/logg-inn/igjen",
    "",
    ["/team-wang/coach", "https://ond.example"],
    undefined,
  ]) {
    assert.equal(tryggWangRetursti(verdi), "/team-wang");
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { erDemoEpost, ikkeDemoBrukerWhere } from "./demo-bruker";

test("demo- og testkontoer kjennes igjen", () => {
  for (const epost of [
    "oyvind-rohjan@stall.akgolf.test",
    "screentest@akgolf.test",
    "screentest-junior@akgolf.test",
    "demo.wang.elev01@demo.invalid",
    "ida.demo@demo-wang.akgolf.test",
    "mathias.demo@demo-tn.akgolf.test",
    "oyvind.rohjan@golfforbundet.no",
    "Demo@WANG.no",
    "spiller@akgolf.no",
  ]) {
    assert.equal(erDemoEpost(epost), true, epost);
  }
});

test("ekte kontoer er ikke demo", () => {
  for (const epost of [
    "akgolfgroup@gmail.com",
    "markus@akgolf.no",
    "max.risvag@gmail.com",
    "karlludvigbb@gmail.com",
    "ola@vikhals.no",
    "fkjolberg@icloud.com",
  ]) {
    assert.equal(erDemoEpost(epost), false, epost);
  }
});

test("where-fragmentet dekker de samme domenene og adressene", () => {
  const where = JSON.stringify(ikkeDemoBrukerWhere());
  for (const del of ["@stall.akgolf.test", "@demo.invalid", "demo@wang.no"]) {
    assert.ok(where.includes(del), del);
  }
});

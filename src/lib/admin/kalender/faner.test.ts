import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  KALENDER_FANER,
  KALENDER_STANDARDFANE,
  erKalenderFaneId,
  kalenderHref,
  velgKalenderFane,
} from "./faner";

/**
 * MASTERPLAN 15.4: fem adresser ble til én. Fanene arver samme gate som
 * kildesidene (ADMIN/COACH) — testene låser fanelogikken, bakoverkompatible
 * `?visning=`-dyplenker og at redirect-kilden faktisk peker hit.
 */

test("fire faner, uke først som standard", () => {
  assert.deepEqual(
    KALENDER_FANER.map((f) => f.id),
    ["uke", "maned", "dag", "stall"],
  );
  assert.equal(KALENDER_STANDARDFANE, "uke");
});

test("stall-fanen dokumenterer adressen den erstattet", () => {
  assert.deepEqual(
    KALENDER_FANER.map((f) => f.gammelHref),
    [null, null, null, "/admin/stall/dag"],
  );
});

test("erKalenderFaneId godtar kun kjente ider", () => {
  assert.equal(erKalenderFaneId("uke"), true);
  assert.equal(erKalenderFaneId("stall"), true);
  assert.equal(erKalenderFaneId("lag"), false);
  assert.equal(erKalenderFaneId("ledighet"), false);
  assert.equal(erKalenderFaneId(undefined), false);
});

test("velgKalenderFane: ?fane= vinner, ukjent faller til standard", () => {
  assert.equal(velgKalenderFane("stall", undefined), "stall");
  assert.equal(velgKalenderFane("tull", undefined), "uke");
  assert.equal(velgKalenderFane(undefined, undefined), "uke");
});

test("velgKalenderFane: gamle ?visning=-dyplenker mapper til riktig fane", () => {
  assert.equal(velgKalenderFane(undefined, "maned"), "maned");
  assert.equal(velgKalenderFane(undefined, "dag"), "dag");
  assert.equal(velgKalenderFane(undefined, "uke"), "uke");
  // ?fane= vinner over ?visning=
  assert.equal(velgKalenderFane("stall", "maned"), "stall");
});

test("kalenderHref: standardfanen får ren adresse", () => {
  assert.equal(kalenderHref("uke"), "/admin/kalender");
  assert.equal(kalenderHref("maned"), "/admin/kalender?fane=maned");
  assert.equal(kalenderHref("stall"), "/admin/kalender?fane=stall");
});

test("/admin/stall/dag er en redirect til stall-fanen", () => {
  const kilde = readFileSync(
    join(process.cwd(), "src/app/admin/stall/dag/page.tsx"),
    "utf8",
  );
  assert.match(kilde, /permanentRedirect|redirect\(/);
  assert.match(kilde, /\/admin\/kalender\?fane=stall/);
});

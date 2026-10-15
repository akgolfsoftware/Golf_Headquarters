import { test } from "node:test";
import assert from "node:assert/strict";
import { osloLokalTilDato, datoTilOsloLokal } from "./gruppe-tid";

test("vintertid: 16:00 Oslo er 15:00 UTC", () => {
  assert.equal(osloLokalTilDato("2026-01-15", "16:00")?.toISOString(), "2026-01-15T15:00:00.000Z");
});

test("sommertid: 16:00 Oslo er 14:00 UTC", () => {
  assert.equal(osloLokalTilDato("2026-07-15", "16:00")?.toISOString(), "2026-07-15T14:00:00.000Z");
});

test("datetime-local uten eget tidsargument", () => {
  assert.equal(osloLokalTilDato("2026-10-01T16:00")?.toISOString(), "2026-10-01T14:00:00.000Z");
});

test("rett over overgangen til vintertid (25. oktober 2026)", () => {
  assert.equal(osloLokalTilDato("2026-10-25", "12:00")?.toISOString(), "2026-10-25T11:00:00.000Z");
});

test("ugyldig inndata gir null", () => {
  assert.equal(osloLokalTilDato("i dag", "16:00"), null);
  assert.equal(osloLokalTilDato("2026-10-01", ""), null);
});

test("rundtur Date -> Oslo-lokal", () => {
  assert.equal(datoTilOsloLokal(new Date("2026-10-01T14:00:00.000Z")), "2026-10-01T16:00");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildWagrPlayerSlug } from "./wagr-client";

test("buildWagrPlayerSlug: ascii-normaliserer norske tegn", () => {
  assert.equal(buildWagrPlayerSlug("Øyvind Rohjan", 12345), "oyvind-rohjan-12345");
});

test("buildWagrPlayerSlug: matcher observert wagr.com-mønster", () => {
  assert.equal(buildWagrPlayerSlug("Mathias Aase", 41993), "mathias-aase-41993");
});

test("buildWagrPlayerSlug: kollapser flere mellomrom og fjerner tegnsetting", () => {
  assert.equal(
    buildWagrPlayerSlug("Benjamin  Borrestuen-Herstad", 99),
    "benjamin-borrestuen-herstad-99",
  );
});

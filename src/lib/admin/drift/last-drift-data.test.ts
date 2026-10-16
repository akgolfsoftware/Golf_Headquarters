import { test } from "node:test";
import assert from "node:assert/strict";
import { feilNivaa, gdprStatus, grupperFeil } from "./last-drift-data";

test("GDPR-status følger moderasjonsstatus", () => {
  assert.equal(gdprStatus("OPEN"), "Venter");
  assert.equal(gdprStatus("APPROVED"), "Godkjent");
  assert.equal(gdprStatus("EXECUTED"), "Slettet");
  assert.equal(gdprStatus("REJECTED"), null);
});

test("feilnivå og gruppering teller like feil", () => {
  assert.equal(feilNivaa("fatal"), "Feil");
  assert.equal(feilNivaa("warn"), "Advarsel");
  assert.equal(feilNivaa("info"), "Info");
  const d = new Date("2026-10-05T08:00:00Z");
  const rader = grupperFeil([
    { id: "1", createdAt: d, severity: "error", context: "stripe.webhook", message: "x" },
    { id: "2", createdAt: d, severity: "error", context: "stripe.webhook", message: "x" },
    { id: "3", createdAt: d, severity: "warn", context: "gcal.sync", message: "y" },
  ]);
  assert.equal(rader.length, 2);
  assert.equal(rader[0].n, 2);
});

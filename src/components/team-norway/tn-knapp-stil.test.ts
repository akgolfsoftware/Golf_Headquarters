import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { tnKnappStil } from "./tn-knapp-stil";

// Serverskjermen Oversikt kalte tnKnappStil fra en "use client"-fil og krasjet for innloggede
// trenere. Funksjonen må bo i en fil uten klient-merking.
test("tn-knapp-stil.ts har ikke use client, så serverskjermer kan kalle den", () => {
  const kilde = readFileSync(new URL("./tn-knapp-stil.ts", import.meta.url), "utf8");
  assert.doesNotMatch(kilde, /^\s*["']use client["']/m);
});

test("alle knappevarianter er minst 44 px høye og brede", () => {
  for (const v of ["primar", "sekundar", "slett", "tekst", "hvit", "konturHvit", "meny"] as const) {
    const s = tnKnappStil(v);
    assert.equal(s.minHeight, 44, v);
    if (v !== "meny") assert.ok(v === "tekst" ? s.minWidth === 44 : s.padding !== undefined, v);
  }
});

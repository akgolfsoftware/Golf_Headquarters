import { test } from "node:test";
import assert from "node:assert/strict";
import { pseudonymForId } from "@/lib/ai/anonymiser";
import { nyttSpillerRegister, pseudonymiserNavn } from "./minimering";
import { substituerPseudonymer } from "@/lib/ai/anonymiser";

test("pseudonymiserNavn er deterministisk per id (samme spiller => samme pseudonym)", () => {
  const reg = nyttSpillerRegister();
  const p1 = pseudonymiserNavn(reg, "u-1", "Kari Nordmann");
  const p2 = pseudonymiserNavn(reg, "u-1", "Kari Nordmann");
  assert.equal(p1, p2);
  assert.equal(p1, pseudonymForId("u-1"));
});

test("pseudonymet inneholder ALDRI det ekte navnet som delstreng", () => {
  const reg = nyttSpillerRegister();
  const pseudonym = pseudonymiserNavn(reg, "u-2", "Ola Nordmann");
  assert.ok(!pseudonym.includes("Ola"));
  assert.ok(!pseudonym.includes("Nordmann"));
});

test("registeret lar en tekst med pseudonymer skrives tilbake til ekte navn (server-side, etter AI-kallet)", () => {
  const reg = nyttSpillerRegister();
  const navn1 = pseudonymiserNavn(reg, "u-3", "Kari Nordmann");
  const navn2 = pseudonymiserNavn(reg, "u-4", "Per Hansen");
  const modellsvar = `${navn1} har forbedret SG Approach, mens ${navn2} bør trene mer putting.`;
  const ekteSvar = substituerPseudonymer(modellsvar, reg);
  assert.equal(
    ekteSvar,
    "Kari Nordmann har forbedret SG Approach, mens Per Hansen bør trene mer putting.",
  );
});

test("tomt/manglende navn registrerer ingen tilbake-kobling", () => {
  const reg = nyttSpillerRegister();
  pseudonymiserNavn(reg, "u-5", null);
  pseudonymiserNavn(reg, "u-6", "");
  assert.equal(reg.size, 0);
});

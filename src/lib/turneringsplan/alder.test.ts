import { test } from "node:test";
import assert from "node:assert/strict";
import { vurderAlder } from "./alder";

const dato = (s: string) => new Date(`${s}T00:00:00Z`);

test("født 2009, U18 i 2027: 17 år 1. januar, så aldri sikkert nei", () => {
  // Bursdag etter turneringen: under 18 både 1. januar og ved start, men fyller 18 i året.
  assert.deepEqual(vurderAlder("U18", "2027-07-09", { fodselsdato: dato("2009-11-03"), fodselsaar: null }).status, "sjekk");
  // Bursdag før turneringen: fyller 18 før start.
  const v = vurderAlder("U18", "2027-07-09", { fodselsdato: dato("2009-03-01"), fodselsaar: null });
  assert.equal(v.status, "sjekk");
  assert.match(v.status === "sjekk" ? v.tekst : "", /før start/);
  // Bare fødselsår.
  assert.equal(vurderAlder("U18", "2027-07-09", { fodselsdato: null, fodselsaar: 2009 }).status, "sjekk");
});

test("for gammel etter alle regler: 18 år allerede 1. januar", () => {
  assert.equal(vurderAlder("U18", "2027-07-09", { fodselsdato: dato("2008-12-31"), fodselsaar: null }).status, "for-gammel");
  assert.equal(vurderAlder("U18", "2027-07-09", { fodselsdato: null, fodselsaar: 2008 }).status, "for-gammel");
});

test("god margin gir ok, og ingen grense gir ok", () => {
  assert.equal(vurderAlder("U21", "2027-07-09", { fodselsdato: dato("2009-03-01"), fodselsaar: null }).status, "ok");
  assert.equal(vurderAlder(null, "2027-07-09", { fodselsdato: null, fodselsaar: null }).status, "ok");
});

test("juniorturnering uten tall og manglende fødselsdato gir sjekk", () => {
  assert.equal(vurderAlder("Junior (sjekk reglementet)", "2027-07-09", { fodselsdato: dato("2009-03-01"), fodselsaar: null }).status, "sjekk");
  assert.equal(vurderAlder("U16", "2027-07-09", { fodselsdato: null, fodselsaar: null }).status, "sjekk");
});

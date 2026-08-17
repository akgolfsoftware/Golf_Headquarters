/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/saker/anonymiser.test.ts
 *
 * Anonymisering av personnavn i Sak-innhold (Jarvis steg 3) — se filhode i
 * anonymiser.ts for hvorfor dette MÅ være rene, testede funksjoner: kun det
 * anonymiserte innholdet sendes videre til Claude, og navnene skal komme
 * eksakt tilbake når svaret er skrevet.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { anonymiserNavn, reSubstituer } from "./anonymiser";

test("round-trip: navn inn -> plassholder -> re-substitusjon = identisk tekst", () => {
  const original = "Hei, dette er Ola Nordmann. Kan du ringe meg på 12345678?";
  const { anonymisert, mapping } = anonymiserNavn(original, ["Ola Nordmann"]);
  assert.notEqual(anonymisert, original);
  assert.match(anonymisert, /\[PERSON1\]/);
  assert.equal(reSubstituer(anonymisert, mapping), original);
});

test("round-trip holder for flere navn og gjentatte forekomster av samme navn", () => {
  const original = "Kari Hansen ringte om Per Olsen. Kari Hansen ringer igjen i morgen.";
  const { anonymisert, mapping } = anonymiserNavn(original, ["Kari Hansen", "Per Olsen"]);
  assert.equal(reSubstituer(anonymisert, mapping), original);
  // Samme navn nevnt to ganger skal gi samme plassholder begge steder.
  const antallKariTreff = (anonymisert.match(/\[PERSON1\]/g) ?? []).length;
  assert.equal(antallKariTreff, 2);
});

test("norske tegn (æøå) anonymiseres og gjenopprettes korrekt", () => {
  const original = "Åse Bjørgum og Øyvind Kristoffersen møtes på Gamle Fredrikstad golfklubb.";
  const { anonymisert, mapping } = anonymiserNavn(original, ["Åse Bjørgum", "Øyvind Kristoffersen"]);
  assert.ok(!anonymisert.includes("Åse Bjørgum"));
  assert.ok(!anonymisert.includes("Øyvind Kristoffersen"));
  assert.equal(reSubstituer(anonymisert, mapping), original);
});

test("ingen plassholder-kollisjoner: hvert unike navn får sin egen, distinkte plassholder", () => {
  const original = "Ole Hansen ringte. Ole kom innom senere. Ole Hansen igjen.";
  const { anonymisert, mapping } = anonymiserNavn(original, ["Ole Hansen", "Ole"]);
  // To ulike navn i input -> to ulike plassholdere, ingen deler samme verdi.
  const plassholdere = [...mapping.keys()];
  assert.equal(new Set(plassholdere).size, plassholdere.length);
  const navnVerdier = [...mapping.values()];
  assert.equal(new Set(navnVerdier).size, navnVerdier.length);
  // Det lengre navnet ("Ole Hansen") skal IKKE bli stående igjen delvis
  // erstattet (dvs. teksten skal ikke inneholde "Hansen" løsrevet).
  assert.ok(!anonymisert.includes("Hansen"));
  assert.equal(reSubstituer(anonymisert, mapping), original);
});

test("dedupliserer navn som kun skiller seg i store/små bokstaver", () => {
  const original = "Petter Nilsen skrev til Petter Nilsen sin egen adresse.";
  const { mapping } = anonymiserNavn(original, ["Petter Nilsen", "petter nilsen"]);
  assert.equal(mapping.size, 1);
});

test("navn som ikke finnes i teksten gir ingen plassholder eller mapping-oppføring", () => {
  const original = "En helt vanlig henvendelse uten navn i teksten.";
  const { anonymisert, mapping } = anonymiserNavn(original, ["Navn Somikkefinnes"]);
  assert.equal(anonymisert, original);
  assert.equal(mapping.size, 0);
});

test("tom navneliste gir uendret tekst", () => {
  const original = "Ingenting å anonymisere her.";
  const { anonymisert, mapping } = anonymiserNavn(original, []);
  assert.equal(anonymisert, original);
  assert.equal(mapping.size, 0);
});

test("delstreng-navn matcher ikke midt inne i et annet ord", () => {
  // "Ole" skal ikke matche inni "Olemann" eller "Karole".
  const original = "Olemann og Karole er ikke det samme som Ole.";
  const { anonymisert, mapping } = anonymiserNavn(original, ["Ole"]);
  assert.ok(anonymisert.includes("Olemann"));
  assert.ok(anonymisert.includes("Karole"));
  assert.match(anonymisert, /\[PERSON1\]\.$/);
  assert.equal(reSubstituer(anonymisert, mapping), original);
});

test("reSubstituer er trygg mot en tom mapping (returnerer teksten uendret)", () => {
  const tekst = "Ingen plassholdere her.";
  assert.equal(reSubstituer(tekst, new Map()), tekst);
});

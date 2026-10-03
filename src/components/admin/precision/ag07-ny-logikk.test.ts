import assert from "node:assert/strict";
import { test } from "node:test";
import { AG07_NY_TOM, alderFraDato, valider } from "./ag07-ny-logikk";

const naa = new Date(Date.UTC(2026, 8, 30));

test("alder regnes i hele år og teller bursdag på dagen", () => {
  assert.equal(alderFraDato("2011-09-30", naa), 15);
  assert.equal(alderFraDato("2011-10-01", naa), 14);
  assert.equal(alderFraDato("2008-09-30", naa), 18);
  assert.equal(alderFraDato("", naa), null);
});

test("tomt skjema gir feil på navn, e-post og fødselsdato", () => {
  const e = valider(AG07_NY_TOM, null);
  assert.deepEqual(Object.keys(e).sort(), ["epost", "fodselsdato", "navn"]);
});

test("under 18 krever foresatt, myndig gjør ikke", () => {
  const ok = { ...AG07_NY_TOM, navn: "Eira Test", epost: "e@eksempel.no", fodselsdato: "2011-03-14" };
  assert.deepEqual(Object.keys(valider(ok, 15)).sort(), ["foreldreEpost", "foreldreNavn"]);
  assert.deepEqual(valider({ ...ok, foreldreNavn: "Kari Test", foreldreEpost: "k@eksempel.no" }, 15), {});
  assert.deepEqual(valider({ ...ok, fodselsdato: "1990-01-01" }, 36), {});
});

test("HCP godtar komma og avviser utenfor -10 til 54", () => {
  const ok = { ...AG07_NY_TOM, navn: "Ola Test", epost: "o@eksempel.no", fodselsdato: "1990-01-01" };
  assert.deepEqual(valider({ ...ok, hcp: "12,3" }, 36), {});
  assert.deepEqual(Object.keys(valider({ ...ok, hcp: "60" }, 36)), ["hcp"]);
  assert.deepEqual(Object.keys(valider({ ...ok, hcp: "abc" }, 36)), ["hcp"]);
});

test("alder under 4 eller over 110 avvises", () => {
  const ok = { ...AG07_NY_TOM, navn: "Ola Test", epost: "o@eksempel.no", fodselsdato: "2025-01-01" };
  assert.ok("fodselsdato" in valider(ok, 1));
});

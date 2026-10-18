import assert from "node:assert/strict";
import { test } from "node:test";
import { forelderKontekstHref, lesForelderSamtykker, velgBarnFraGodkjente } from "./forelder-kontekst";

const barn = [{ child: { id: "barn-a" } }, { child: { id: "barn-b" } }];
test("barnekontekst videreføres gjennom lenker uten å endre andre valg", () => {
  assert.equal(forelderKontekstHref("/forelder/coach", "barn-b"), "/forelder/coach?barn=barn-b");
  assert.equal(forelderKontekstHref("/forelder/bookinger?steg=2", "barn b&x"), "/forelder/bookinger?steg=2&barn=barn+b%26x");
  assert.equal(forelderKontekstHref("/forelder/coach", null), "/forelder/coach");
});
test("ukjent barn gir ingen annen families eller første barns data", () => {
  assert.deepEqual(velgBarnFraGodkjente(barn, "barn-b"), { barn: [barn[1]], gyldig: true });
  assert.deepEqual(velgBarnFraGodkjente(barn, "fremmed"), { barn: [], gyldig: false });
  assert.deepEqual(velgBarnFraGodkjente(barn), { barn, gyldig: true });
});
test("samtykker er registrerte booleans, aldri truthy tekst eller rå JSON", () => {
  assert.deepEqual(lesForelderSamtykker({ fotoBruk: true, dataDeling: false, onboarding: { step: 3 } }), { fotoBruk: true, dataDeling: false });
  for (const raw of [null, [], { fotoBruk: "true" }]) assert.deepEqual(lesForelderSamtykker(raw), {});
});

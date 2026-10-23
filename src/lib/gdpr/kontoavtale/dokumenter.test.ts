import assert from "node:assert/strict";
import { test } from "node:test";
import { frysKontoAvtale, hentGjeldendeKontoAvtale } from "./dokumenter";
import { syntetiskKontoAvtale as pakke } from "../../../../tests/fixtures/kontoavtale";

test("produksjonskatalogen har ingen godkjent pakke: utkast kan ikke aktiveres", () => {
  assert.equal(hentGjeldendeKontoAvtale(), null);
});

test("kontrollsummen binder versjon, begge tekster og nøyaktig bekreftelse", () => {
  const original = frysKontoAvtale(pakke);
  for (const endret of [
    { ...pakke, versjon: "annen" },
    { ...pakke, vilkar: { ...pakke.vilkar, tekst: "Endret testtekst" } },
    { ...pakke, personvern: { ...pakke.personvern, versjon: "annen" } },
    { ...pakke, bekreftelse: { ...pakke.bekreftelse, vilkar: "Annet valg" } },
  ]) assert.notEqual(frysKontoAvtale(endret).dokumentHash, original.dokumentHash);
  assert.equal(frysKontoAvtale({ bekreftelse: pakke.bekreftelse, personvern: pakke.personvern, vilkar: pakke.vilkar, versjon: pakke.versjon }).dokumentHash, original.dokumentHash);
  assert.deepEqual(original.dokumenter, pakke);
});

test("tom eller utvidet dokumentpakke avvises før lagring", () => {
  assert.throws(() => frysKontoAvtale({ ...pakke, personvern: { ...pakke.personvern, tekst: "" } }));
  assert.throws(() => frysKontoAvtale({ ...pakke, laering: true } as typeof pakke));
});

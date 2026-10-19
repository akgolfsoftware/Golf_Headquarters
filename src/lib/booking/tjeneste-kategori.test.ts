import assert from "node:assert/strict";
import { test } from "node:test";
import { erAbonnementTjeneste, erDuoTjeneste, erTjenesteKategori, kategoriNavn } from "./tjeneste-kategori";
import { lagTjenesteSlug } from "./tjeneste-slug";

test("kategorien avgjør når den er satt; navnet bare når den mangler", () => {
  assert.equal(erAbonnementTjeneste({ kategori: "abonnement", name: "Fast oppfølging" }), true);
  assert.equal(erAbonnementTjeneste({ kategori: "drop-in", name: "Performance 20 min" }), false);
  assert.equal(erAbonnementTjeneste({ kategori: null, name: "Performance Pro — Anders" }), true);
  assert.equal(erAbonnementTjeneste({ kategori: null, name: "Flex 50 min" }), false);
});

test("duo: kategorien «duo» eller ordet «duo» i navnet, også når kategorien er drop-in", () => {
  assert.equal(erDuoTjeneste({ kategori: "duo", name: "Coaching for to" }), true);
  assert.equal(erDuoTjeneste({ kategori: "drop-in", name: "Flex Duo 50 min — Anders" }), true);
  assert.equal(erDuoTjeneste({ kategori: "drop-in", name: "Flex 50 min — Anders" }), false);
  assert.equal(erDuoTjeneste({ kategori: null, name: "Flex Duo 90 min" }), true);
  assert.equal(erDuoTjeneste({ kategori: null, name: "Flex 50 min" }), false);
  assert.equal(erDuoTjeneste({ kategori: null, name: "Duologen" }), false);
});

test("kjente kategorier og navn", () => {
  assert.equal(erTjenesteKategori("duo"), true);
  assert.equal(kategoriNavn("duo"), "Duo (to deltakere)");
  assert.equal(erTjenesteKategori("gruppe"), true);
  assert.equal(erTjenesteKategori("tull"), false);
  assert.equal(kategoriNavn("drop-in"), "Drop-in (Flex)");
  assert.equal(kategoriNavn(null), "Ikke satt");
});

test("slug er norsk-normalisert og tom uten bokstaver eller tall", () => {
  assert.equal(lagTjenesteSlug("Flex Duo 50 min"), "flex-duo-50-min");
  assert.equal(lagTjenesteSlug("Økt på Ærfuglveien"), "oekt-pa-aerfuglveien");
  assert.equal(lagTjenesteSlug("!!!"), "");
});

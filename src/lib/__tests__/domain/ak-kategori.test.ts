/**
 * Tester for ak-kategori.ts — A–K kategorisystem (snittscore → kategori).
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/ak-kategori.test.ts
 *
 * Låser grense-konvensjonen: [min, max) — min inklusiv, max eksklusiv.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  kategoriFraSnittscore,
  nesteKategori,
  prosentTilNesteNiva,
  AK_BANDS,
} from "../../domain/ak-kategori";

test("tabellen dekker hele tallinja uten hull eller overlapp", () => {
  // A har åpen nedre, K har åpen øvre; alle indre grenser møtes eksakt.
  assert.equal(AK_BANDS[0].min, null);
  assert.equal(AK_BANDS[AK_BANDS.length - 1].max, null);
  for (let i = 1; i < AK_BANDS.length; i++) {
    assert.equal(AK_BANDS[i].min, AK_BANDS[i - 1].max, `hull/overlapp mellom ${AK_BANDS[i - 1].kategori} og ${AK_BANDS[i].kategori}`);
  }
});

test("snittscore → kategori (midt i bånd)", () => {
  assert.equal(kategoriFraSnittscore(65).kategori, "A"); // World Elite
  assert.equal(kategoriFraSnittscore(70).kategori, "B"); // National Elite
  assert.equal(kategoriFraSnittscore(73).kategori, "C");
  assert.equal(kategoriFraSnittscore(75).kategori, "D");
  assert.equal(kategoriFraSnittscore(77).kategori, "E");
  assert.equal(kategoriFraSnittscore(79).kategori, "F");
  assert.equal(kategoriFraSnittscore(82).kategori, "G");
  assert.equal(kategoriFraSnittscore(87).kategori, "H");
  assert.equal(kategoriFraSnittscore(92).kategori, "I");
  assert.equal(kategoriFraSnittscore(97).kategori, "J");
  assert.equal(kategoriFraSnittscore(110).kategori, "K"); // Nybegynner Junior
});

test("grenseverdier hører til øvre kategori-bokstav (min inklusiv)", () => {
  assert.equal(kategoriFraSnittscore(68).kategori, "B"); // ikke A
  assert.equal(kategoriFraSnittscore(72).kategori, "C"); // ikke B
  assert.equal(kategoriFraSnittscore(80).kategori, "G"); // ikke F
  assert.equal(kategoriFraSnittscore(100).kategori, "K"); // ikke J
});

test("ekstremer", () => {
  assert.equal(kategoriFraSnittscore(50).kategori, "A");
  assert.equal(kategoriFraSnittscore(150).kategori, "K");
});

test("nesteKategori går mot bedre (lavere) bånd", () => {
  assert.equal(nesteKategori("B")?.kategori, "A");
  assert.equal(nesteKategori("K")?.kategori, "J");
  assert.equal(nesteKategori("A"), null); // toppen
});

test("prosentTilNesteNiva: lavere score = nærmere opprykk", () => {
  // Bånd G = [80, 85). 84 (verst) → ~20 %, 80 (best) → 100 %.
  assert.equal(prosentTilNesteNiva(84), 20);
  assert.equal(prosentTilNesteNiva(80), 100);
  assert.equal(prosentTilNesteNiva(82.5), 50);
  // A og K har åpne ender → null.
  assert.equal(prosentTilNesteNiva(60), null);
  assert.equal(prosentTilNesteNiva(120), null);
});

/**
 * Filer som er fjernet med vilje skal ikke komme tilbake via `npm run sync:masterbrain`.
 * Synken kopierer alt fra masterbrain-kilden; ligger de gamle filene der, overskriver
 * den app-kopien. Det skjedde 27.09.2026 (#977). Rett kilden, ikke denne testen.
 *
 * - canon-invariants-13: ingen treningsregel er låst (beslutning 18.08.2026, #562)
 * - canon-l-fase-overrides, canon-pyramide-ak-formel: L-faser, CS, M0–M5 og PR1–PR5
 *   er utgått til fordel for AK-formel v2 (#893)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const RAG = path.join(process.cwd(), "src/lib/masterbrain/rag-corpus");
const FJERNET = [
  "morad/canon-invariants-13.md",
  "morad/canon-l-fase-overrides.md",
  "morad/canon-pyramide-ak-formel.md",
];

test("fjernede kunnskapsfiler er ikke synket inn igjen", () => {
  const tilbake = FJERNET.filter((fil) => existsSync(path.join(RAG, fil)));
  assert.deepEqual(tilbake, [], "Fjern filene i masterbrain-kilden og synk på nytt");
});

test("RAG-indeksen peker ikke på fjernede kunnskapsfiler", () => {
  const indeks = readFileSync(path.join(RAG, "index.json"), "utf8");
  const treff = FJERNET.filter((fil) => indeks.includes(path.basename(fil, ".md")));
  assert.deepEqual(treff, []);
});

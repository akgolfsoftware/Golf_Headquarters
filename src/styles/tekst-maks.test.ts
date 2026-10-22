import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Én felles regel for løpende tekst og skjemafelt: maks 720 px (beslutninger.md §SKRÅ-RESTEN, Anders 22.10.2026).
const mappe = join(process.cwd(), "src/styles");
const fil = (navn: string) => readFileSync(join(mappe, navn), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

test("--ak-tekst-maks er 720 px og står ett sted", () => {
  assert.match(fil("ak-tokens.css"), /--ak-tekst-maks:\s*720px;/);
});

test("AgencyOS og PlayerHQ bruker tokenet, aldri tallet 720 px som bredde", () => {
  const brudd: string[] = [];
  for (const navn of readdirSync(mappe).filter((f) => /^(agencyos-ny|playerhq-ny).*\.css$/.test(f))) {
    for (const m of fil(navn).matchAll(/max-width:\s*720px/g)) brudd.push(`${navn}: ${m[0]}`);
  }
  assert.deepEqual(brudd, []);
});

test("tekst og skjema i bølge 3 er begrenset av tokenet", () => {
  assert.match(fil("agencyos-ny-a6-skra.css"), /\.agn-a6 :is\(form, \.forklar\) \{ max-width: var\(--ak-tekst-maks\); \}/);
});

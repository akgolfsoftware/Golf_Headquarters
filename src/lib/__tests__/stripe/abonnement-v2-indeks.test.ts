/**
 * V1 cutover: A1-indeksbyttet (`--dropp-gammel-indeks`).
 *
 * Scriptet dropper den gamle unike indeksen `subscriptions_userId_key` slik at
 * én bruker kan ha både COACHING- og PLAYERHQ-rad. Det er destruktivt mot
 * prod og skal ALDRI kjøres herfra. Denne fila låser kun at:
 *   1. Prisma-skjemaet allerede har (userId, kind)-unikhet, ikke userId alene.
 *   2. DROP INDEX i scriptet ligger bak eksplisitt flagg.
 *   3. Scriptet bor i scripts/arkiv/ (sjekklisten pekte tidligere på scripts/).
 *
 * Om flagget er kjørt i prod kan ikke leses fra git. Anders sjekker:
 *   SELECT indexname FROM pg_indexes WHERE tablename = 'subscriptions';
 * Skal ha subscriptions_userId_kind_key. Skal IKKE ha subscriptions_userId_key.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROT = process.cwd();
const SCRIPT = join(ROT, "scripts/arkiv/add-abonnement-v2-2026-08-16.ts");
const GAMMEL_STI = join(ROT, "scripts/add-abonnement-v2-2026-08-16.ts");
const SCHEMA = join(ROT, "prisma/schema.prisma");

function subscriptionModell(schema: string): string {
  const m = /model Subscription \{[\s\S]*?\n\}/.exec(schema);
  assert.ok(m, "Fant ikke model Subscription i schema.prisma");
  return m[0];
}

test("A1-scriptet ligger i scripts/arkiv/ — ikke den gamle scripts/-stien", () => {
  assert.equal(existsSync(SCRIPT), true, `Mangler ${SCRIPT}`);
  assert.equal(
    existsSync(GAMMEL_STI),
    false,
    "Gammel sti scripts/add-abonnement-v2-2026-08-16.ts finnes igjen — oppdater sjekklisten.",
  );
});

test("DROP INDEX kjører kun med --dropp-gammel-indeks (aldri ubetinget)", () => {
  const src = readFileSync(SCRIPT, "utf8");
  const dropLinjer = src
    .split("\n")
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /DROP INDEX/i.test(l));
  assert.equal(
    dropLinjer.length,
    1,
    `Forventet nøyaktig én DROP INDEX, fant ${dropLinjer.length}`,
  );

  const flaggLinje = src.split("\n").findIndex((l) =>
    l.includes('process.argv.includes("--dropp-gammel-indeks")'),
  );
  assert.ok(flaggLinje >= 0, "Mangler --dropp-gammel-indeks-grenen");
  assert.ok(
    dropLinjer[0].i > flaggLinje,
    "DROP INDEX står utenfor --dropp-gammel-indeks-grenen",
  );
  assert.match(src, /DROP INDEX IF EXISTS "subscriptions_userId_key"/);
});

test("Prisma-skjemaet har unikhet på (userId, kind), ikke userId alene", () => {
  const modell = subscriptionModell(readFileSync(SCHEMA, "utf8"));
  assert.match(modell, /@@unique\(\[userId, kind\]\)/);
  assert.equal(
    /@@unique\(\[userId\]\)/.test(modell),
    false,
    "Subscription har @@unique([userId]) igjen — da kan ikke COACHING og PLAYERHQ sameksistere.",
  );
});

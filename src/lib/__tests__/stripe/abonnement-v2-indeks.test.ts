/**
 * Abonnementenes unikhet etter at A1-engangsskriptet er tatt ut av repoet.
 *
 * Commit 25067d76e slettet scripts/arkiv/add-abonnement-v2-2026-08-16.ts.
 * Testene skal ikke kreve at destruktiv engangskode gjenopprettes. De låser at:
 *   1. Begge tidligere skriptstier fortsatt er borte, også fra npm-kommandoer.
 *   2. Prisma har (userId, kind)-unikhet, ikke userId alene.
 *
 * Faktiske indekser i prod kan ikke bevises fra Git. En separat autorisert
 * databasekontroll må eventuelt lese:
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

test("Det utgåtte A1-engangsskriptet er ikke gjeninnført eller koblet til npm", () => {
  for (const sti of [SCRIPT, GAMMEL_STI]) {
    assert.equal(existsSync(sti), false, `Utgått databaseskript er gjeninnført: ${sti}`);
  }
  const pakke = JSON.parse(readFileSync(join(ROT, "package.json"), "utf8"));
  for (const [navn, kommando] of Object.entries(pakke.scripts ?? {})) {
    assert.doesNotMatch(
      String(kommando),
      /add-abonnement-v2-2026-08-16/,
      `npm-kommandoen ${navn} peker på det utgåtte databaseskriptet`,
    );
  }
});

test("Prisma-skjemaet har unikhet på (userId, kind), ikke userId alene", () => {
  const modell = subscriptionModell(readFileSync(SCHEMA, "utf8"));
  const utenKommentarer = modell.replace(/\/\/[^\n]*/g, "");
  assert.match(utenKommentarer, /@@unique\(\s*\[\s*userId\s*,\s*kind\s*\]/);
  assert.equal(
    /@@unique\(\s*\[\s*userId\s*\]/.test(utenKommentarer),
    false,
    "Subscription har @@unique([userId]) igjen — da kan ikke COACHING og PLAYERHQ sameksistere.",
  );
  assert.doesNotMatch(
    utenKommentarer,
    /^\s*userId\s+[^\n]*@(unique|id)\b/m,
    "Subscription.userId må ikke ha @unique eller @id — én spiller må kunne ha begge abonnementstyper.",
  );
});

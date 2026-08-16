/**
 * Varsel-registeret (`triggers.ts`) — invariantene ingen kompilator fanger.
 *
 * Registeret er rent data, men to felt er FREMMEDNØKLER ut av TypeScript:
 *   - `key` skrives til `Notification.type` i databasen
 *   - `emailSlug` må matche `EmailTemplate.slug`
 * Duplikat eller glemt slug gir ingen typefeil — det gir et varsel som
 * stille aldri sendes. Derfor testes formen på registeret her.
 *
 * At slug-ene faktisk FINNES som EmailTemplate-rader er en DB-egenskap og
 * kan ikke sjekkes her — den står i docs/testing.md §Manuell verifisering.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TRIGGERS,
  getTrigger,
  triggersByCategory,
  type TriggerCategory,
  type TriggerDefinition,
  type TriggerKeyValue,
} from "@/lib/notifications/triggers";

// TRIGGERS er `as const satisfies Record<string, TriggerDefinition>`, så
// Object.values() gir en union av literal-typer der `emailSlug` mangler på de
// oppføringene som ikke har den, og `channels` blir en literal-tuple.
// Vi tester registeret som DATA, ikke som literaler — derfor widening til den
// deklarerte typen. (Uten den: TS2339 på emailSlug og TS2345 på channels.)
const ALLE: TriggerDefinition[] = Object.values(TRIGGERS);
const KATEGORIER: TriggerCategory[] = ["spiller", "coach", "forelder", "system"];

test("registeret er ikke tomt", () => {
  assert.ok(ALLE.length > 0, "TRIGGERS er tomt — resten av fila tester ingenting");
});

test("hver key er unik — den skrives til Notification.type", () => {
  const sett = new Map<string, string[]>();
  for (const [navn, t] of Object.entries(TRIGGERS)) {
    sett.set(t.key, [...(sett.get(t.key) ?? []), navn]);
  }
  const kolliderende = [...sett.entries()].filter(([, navn]) => navn.length > 1);
  assert.deepEqual(
    kolliderende.map(([key, navn]) => `${key} ← ${navn.join(", ")}`),
    [],
    "To triggers deler samme key. De blir umulige å skille i varselsenteret, " +
      "og getTrigger() returnerer vilkårlig den første.",
  );
});

test("emailSlug finnes nøyaktig når email er en kanal", () => {
  const utenSlug = ALLE.filter((t) => t.channels.includes("email") && !t.emailSlug);
  assert.deepEqual(
    utenSlug.map((t) => t.key),
    [],
    "Trigger har email som kanal, men ingen emailSlug — e-posten får aldri " +
      "en mal å rendre og forsvinner stille.",
  );

  const slugUtenKanal = ALLE.filter((t) => t.emailSlug && !t.channels.includes("email"));
  assert.deepEqual(
    slugUtenKanal.map((t) => t.key),
    [],
    "Trigger har emailSlug, men email er ikke blant kanalene — malen blir " +
      "aldri brukt. Enten mangler kanalen, eller så er slug-en et levn.",
  );
});

test("hver emailSlug brukes av kun én trigger", () => {
  const brukt = new Map<string, string[]>();
  for (const t of ALLE) {
    if (t.emailSlug) brukt.set(t.emailSlug, [...(brukt.get(t.emailSlug) ?? []), t.key]);
  }
  const delte = [...brukt.entries()].filter(([, keys]) => keys.length > 1);
  assert.deepEqual(
    delte.map(([slug, keys]) => `${slug} ← ${keys.join(", ")}`),
    [],
    "To triggers peker på samme e-postmal. Som oftest en klipp-og-lim-feil: " +
      "mottakeren får feil tekst for den ene av dem.",
  );
});

test("ingen trigger står uten kanal", () => {
  const stumme = ALLE.filter((t) => t.channels.length === 0);
  assert.deepEqual(
    stumme.map((t) => t.key),
    [],
    "Trigger uten kanaler kan aldri nå noen — da er den død kode.",
  );
});

test("getTrigger finner hver eneste registrert trigger", () => {
  for (const t of ALLE) {
    const funnet = getTrigger(t.key as TriggerKeyValue);
    assert.equal(funnet?.key, t.key, `getTrigger("${t.key}") fant ikke sin egen oppføring`);
  }
});

test("getTrigger gir undefined for ukjent key", () => {
  assert.equal(getTrigger("finnes-ikke" as TriggerKeyValue), undefined);
});

test("triggersByCategory deler registeret fullstendig og uten overlapp", () => {
  const sum = KATEGORIER.flatMap((k) => triggersByCategory(k));
  assert.equal(
    sum.length,
    ALLE.length,
    `Kategoriene dekker ${sum.length} av ${ALLE.length} triggers. En trigger ` +
      `med kategori utenfor de fire blir usynlig i varselinnstillingene.`,
  );
  assert.equal(new Set(sum.map((t) => t.key)).size, ALLE.length, "En trigger havnet i to kategorier");
});

test("hver trigger har lesbar label og gyldig prioritet", () => {
  const daarlige = ALLE.filter(
    (t) => !t.label?.trim() || !["high", "normal", "low"].includes(t.priority),
  );
  assert.deepEqual(
    daarlige.map((t) => t.key),
    [],
    "Label vises i admin/audit-logg og prioritet styrer sortering i " +
      "varselsenteret — begge må være satt.",
  );
});

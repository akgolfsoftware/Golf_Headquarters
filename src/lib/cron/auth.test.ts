/**
 * Tester for den delte cron-autentiseringen (steg 5 i
 * `docs/plan-testdekning.md`).
 *
 * Dette er den eneste sperren mellom åpent internett og agent-kjøring, og den
 * var håndkopiert i åtte rutefiler uten en eneste test. De tre avvis-tilfellene
 * under er de som faktisk betyr noe:
 *
 *  1. Manglende header — den åpenbare.
 *  2. Feil secret — den forventede.
 *  3. USET `CRON_SECRET` — den som har vært en ekte bug før (fail-open når
 *     env-variabelen mangler). Den er hovedgrunnen til at denne filen finnes.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { erGyldigCronAuth } from "./auth";

const SECRET = "hemmelig-verdi";

test("cron-auth: gyldig Bearer-header med riktig secret slipper gjennom", () => {
  assert.equal(erGyldigCronAuth(`Bearer ${SECRET}`, SECRET), true);
});

test("cron-auth: manglende header avvises", () => {
  assert.equal(erGyldigCronAuth(null, SECRET), false);
  assert.equal(erGyldigCronAuth(undefined, SECRET), false);
  assert.equal(erGyldigCronAuth("", SECRET), false);
});

test("cron-auth: feil secret avvises", () => {
  assert.equal(erGyldigCronAuth("Bearer feil-verdi", SECRET), false);
});

test("cron-auth: uset CRON_SECRET avviser ALT (fail-closed)", () => {
  // Den historiske buggen: `if (env.CRON_SECRET && auth !== forventet)` hoppet
  // over hele sjekken når variabelen manglet, og slapp dermed alle gjennom.
  // En konfigurasjonsfeil skal stenge døra, ikke åpne den.
  assert.equal(erGyldigCronAuth("Bearer hva-som-helst", undefined), false);
  assert.equal(erGyldigCronAuth("Bearer hva-som-helst", ""), false);
  assert.equal(erGyldigCronAuth(null, undefined), false);
  // Selv en header som matcher «Bearer undefined» skal ikke slippe gjennom.
  assert.equal(erGyldigCronAuth("Bearer undefined", undefined), false);
  assert.equal(erGyldigCronAuth("Bearer ", ""), false);
});

test("cron-auth: nesten-riktige headere avvises", () => {
  // Rå secret uten «Bearer »-prefiks.
  assert.equal(erGyldigCronAuth(SECRET, SECRET), false);
  // Feil skjema.
  assert.equal(erGyldigCronAuth(`Basic ${SECRET}`, SECRET), false);
  // Prefiks-forveksling: riktig start, men ikke identisk.
  assert.equal(erGyldigCronAuth(`Bearer ${SECRET}x`, SECRET), false);
  assert.equal(erGyldigCronAuth(`Bearer ${SECRET} `, SECRET), false);
  // Store/små bokstaver skal ikke være likegyldig.
  assert.equal(erGyldigCronAuth(`bearer ${SECRET}`, SECRET), false);
});

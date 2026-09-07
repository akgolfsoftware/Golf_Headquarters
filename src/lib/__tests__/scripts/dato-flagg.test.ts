import test from "node:test";
import assert from "node:assert/strict";
import { finnDatoFlagg, byggKjoredato, losKjoredato } from "../../../../scripts/_dato-flagg";

test("finnDatoFlagg: finner --dato=, ignorerer andre flagg og fravær", () => {
  assert.equal(finnDatoFlagg(["node", "script.ts", "--dato=2026-08-22"]), "2026-08-22");
  assert.equal(finnDatoFlagg(["node", "script.ts", "--kun-enrollering"]), null);
  assert.equal(finnDatoFlagg(["node", "script.ts"]), null);
});

test("byggKjoredato: kl 12:00 lokalt, null ved ugyldig format", () => {
  const d = byggKjoredato("2026-08-22");
  assert.equal(d?.getFullYear(), 2026);
  assert.equal(d?.getMonth(), 7); // august = måned 7, 0-indeksert
  assert.equal(d?.getDate(), 22);
  assert.equal(d?.getHours(), 12);
  assert.equal(byggKjoredato("ikke-en-dato"), null);
});

test("losKjoredato: uten flagg = nær ekte 'nå'; med flagg = frosset dato; ugyldig kaster", () => {
  const utenFlagg = losKjoredato(["node", "script.ts"]);
  assert.ok(Math.abs(utenFlagg.getTime() - Date.now()) < 5000, "uten --dato skal 'nå' være ekte");
  const medFlagg = losKjoredato(["node", "script.ts", "--dato=2026-08-22"]);
  assert.equal(medFlagg.getDate(), 22);
  assert.throws(() => losKjoredato(["node", "script.ts", "--dato=ikke-en-dato"]), /Ugyldig --dato/);
});

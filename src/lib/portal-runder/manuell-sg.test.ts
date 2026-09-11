import { test } from "node:test";
import assert from "node:assert/strict";
import { SG_ALLE_FELT, SG_DETALJFELT, validerManuellSg, lesManuellSgKladd, sgKladdFraVerdier, byttSgFortegn } from "./manuell-sg";

test("hele Round-taksonomien har 21 unike felt, inkludert lob og alle puttebånd", () => {
  assert.equal(SG_ALLE_FELT.length, 21);
  assert.equal(new Set(SG_ALLE_FELT.map((f) => f.key)).size, 21);
  assert.equal(SG_DETALJFELT.length, 16);
  for (const key of ["sgLob", "sgPutt15_25", "sgPutt25_40", "sgPutt40plus"]) assert.ok(SG_DETALJFELT.some((f) => f.key === key));
});

test("norsk komma, Unicode-minus, pluss og null bevares gjennom tekst → verdier → tekst", () => {
  const r = lesManuellSgKladd({ ...sgKladdFraVerdier(), sgOtt: "+0,45", sgApp: "−0,25", sgArg: "0", sgPutt: ".1" });
  assert.ok(r.ok);
  assert.equal(r.verdier.sgTotal, 0.3);
  assert.equal(r.verdier.sgArg, 0);
  assert.equal(sgKladdFraVerdier(r.verdier).sgOtt, "0,45");
});

test("blankt, bare total, delvis hovedkategori og bare detaljer er forskjellige tilstander", () => {
  const empty = validerManuellSg({}); assert.ok(empty.ok); assert.equal(empty.harTall, false);
  const total = validerManuellSg({ sgTotal: -4.25 }); assert.ok(total.ok); assert.equal(total.verdier.sgOtt, null);
  const partial = validerManuellSg({ sgPutt: 0 }); assert.ok(partial.ok); assert.equal(partial.harTall, true); assert.equal(partial.verdier.sgTotal, null);
  const detail = validerManuellSg({ sgTee: 2, sgLob: -1, sgPutt40plus: -0.2 });
  assert.ok(detail.ok); assert.equal(detail.verdier.sgTotal, null); assert.equal(detail.verdier.sgOtt, null); assert.equal(detail.verdier.sgArg, null);
});

test("tomme felt blir aldri nullpoeng og ugyldig tekst blir aldri ukjent", () => {
  for (const text of ["abc", "1.2.3", "1,2,3", "Infinity", "NaN", "1e2", "0x10", "-", "+"]) {
    const r = lesManuellSgKladd({ ...sgKladdFraVerdier(), sgApp: text });
    assert.equal(r.ok, false, text);
    if (!r.ok) assert.ok(r.feil.sgApp);
  }
  const blank = lesManuellSgKladd({ ...sgKladdFraVerdier(), sgApp: "  " });
  assert.ok(blank.ok); assert.equal(blank.verdier.sgApp, null);
});

test("servergrensen avviser feil typer, ikke-endelige tall, ekstreme tall og fremmede felt", () => {
  for (const input of [null, [], { sgApp: "0.5" }, { sgLob: NaN }, { sgTotal: Infinity }, { sgTee: 101 }, { sgPutt40plus: -101 }, { userId: "annen" }]) {
    assert.equal(validerManuellSg(input).ok, false);
  }
});

test("total kontrolleres bare mot fire kjente hovedkategorier; avrunding tolereres", () => {
  const main = { sgOtt: 0.1, sgApp: 0.2, sgArg: 0.3, sgPutt: 0.4 };
  assert.equal(validerManuellSg({ ...main, sgTotal: 1.02 }).ok, true);
  const mismatch = validerManuellSg({ ...main, sgTotal: 2 });
  assert.equal(mismatch.ok, false); if (!mismatch.ok) assert.ok(mismatch.feil.sgTotal);
  assert.equal(validerManuellSg({ sgTotal: 4, sgApp: 1 }).ok, true);
});

test("alle detaljverdier overlever visningsbytte uten å dobbelttelles i totalen", () => {
  const details = Object.fromEntries(SG_DETALJFELT.map((f, i) => [f.key, -(i + 1) / 10]));
  const input = { ...details, sgOtt: 1, sgApp: 2, sgArg: -1, sgPutt: 0 };
  const r = lesManuellSgKladd(sgKladdFraVerdier(input)); assert.ok(r.ok);
  assert.equal(r.verdier.sgTotal, 2);
  for (const f of SG_DETALJFELT) assert.equal(r.verdier[f.key], details[f.key]);
});

test("fortegn kan angis også på et mobilt tastatur uten minustast", () => {
  assert.equal(byttSgFortegn(""), "-");
  assert.equal(byttSgFortegn("+0,25"), "-0,25");
  assert.equal(byttSgFortegn("−0,25"), "0,25");
  assert.equal(byttSgFortegn("0"), "-0");
});

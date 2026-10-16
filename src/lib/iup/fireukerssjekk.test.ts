import assert from "node:assert/strict";
import { test } from "node:test";
import { desimal, endring, fireukerNiva, fireukerOmraader, fireukerRunde, serSvareneTekst, snitt } from "./fireukerssjekk";
import { lesIupBesvarelse } from "./utviklingssjekk";

test("runden er fire ISO-uker forankret i uke 32 2026, som designet", () => {
  assert.deepEqual(fireukerRunde("2026-09-23"), { periodeStart: "2026-08-31", periodeSlutt: "2026-09-27", ukeFra: 36, ukeTil: 39 });
  assert.deepEqual(fireukerRunde("2026-09-23", -1), { periodeStart: "2026-08-03", periodeSlutt: "2026-08-30", ukeFra: 32, ukeTil: 35 });
  // Mandag og søndag hører til samme runde.
  assert.equal(fireukerRunde("2026-08-31").periodeStart, "2026-08-31");
  assert.equal(fireukerRunde("2026-09-27").periodeStart, "2026-08-31");
  assert.equal(fireukerRunde("2026-09-28").periodeStart, "2026-09-28");
  // Over årsskiftet fortsetter blokkene uten hull.
  const des = fireukerRunde("2026-12-30");
  const jan = fireukerRunde(des.periodeSlutt.replace(/\d\d$/, (d) => String(Number(d))), 1);
  assert.equal(new Date(`${jan.periodeStart}T00:00:00Z`).getTime() - new Date(`${des.periodeSlutt}T00:00:00Z`).getTime(), 86_400_000);
});

test("nivå: født 2011–2013 er Ung, ellers Junior, ukjent er Junior", () => {
  assert.equal(fireukerNiva(2011), "UNG");
  assert.equal(fireukerNiva(2013), "UNG");
  assert.equal(fireukerNiva(2010), "JUNIOR");
  assert.equal(fireukerNiva(2014), "JUNIOR");
  assert.equal(fireukerNiva(null), "JUNIOR");
});

test("områdene og antallet spørsmål følger IUP 2027-kilden", () => {
  const ung = fireukerOmraader("UNG");
  const junior = fireukerOmraader("JUNIOR");
  assert.equal(ung.length, 7);
  assert.equal(ung.reduce((a, o) => a + o.sporsmal.length, 0), 34);
  assert.equal(junior.reduce((a, o) => a + o.sporsmal.length, 0), 43);
  assert.deepEqual(junior.map((o) => o.kategori), ["Sosial", "Mentalt", "Fysisk", "Strategisk", "Teknisk", "Golfutvikling", "Neste trinn"]);
});

test("snitt, desimal og endring: manglende er «—», minus er ekte minus", () => {
  const qs = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.equal(snitt(qs, { a: 4, b: 3 }), 3.5);
  assert.equal(snitt(qs, {}), null);
  assert.equal(desimal(null), "—");
  assert.equal(desimal(3.75), "3,8");
  assert.equal(endring(3.8, 3.4), "+0,4");
  assert.equal(endring(3.2, 3.4), "−0,2");
  assert.equal(endring(3.4, 3.42), "±0,0");
  assert.equal(endring(3.4, null), "—");
});

test("hvem som ser svarene", () => {
  assert.equal(serSvareneTekst([]), null);
  assert.equal(serSvareneTekst(["Anders"]), "Anders ser svarene");
  assert.equal(serSvareneTekst(["Anders", "WANG", "Team Norway"]), "Anders, WANG og Team Norway ser svarene");
});

test("besvarelsen tar prosessmål og notat, og avviser ukjent prosessvar", () => {
  const ok = lesIupBesvarelse({ versjon: "iup-2027", niva: "UNG", status: "UTKAST", svar: {}, prosessmal: { "goal-1": "DELVIS" }, notat: "Mye skole." });
  assert.equal(ok.ok, true);
  const feil = lesIupBesvarelse({ versjon: "iup-2027", niva: "UNG", status: "UTKAST", svar: {}, prosessmal: { "goal-1": "KANSKJE" } });
  assert.equal(feil.ok, false);
});

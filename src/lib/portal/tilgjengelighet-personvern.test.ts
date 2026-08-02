import { test } from "node:test";
import assert from "node:assert/strict";
import { beregnLedigeLuker, type OpptattBlokk } from "./tilgjengelighet";

// Personvern: en privat avtale skal telle som opptatt tid, men aldri røpe hva
// den er. Flere av spillerne er under 18, og en tannlege- eller legetime kan
// røpe helseopplysninger. Kontrakten er: tiden deles, tittelen ikke.

const dagStart = new Date(2026, 7, 3, 0, 0);
const dagSlutt = new Date(2026, 7, 3, 23, 59, 59, 999);

const privatAvtale: OpptattBlokk = {
  kilde: "EGEN_AVTALE",
  tittel: null, // hentOpptattTid setter null når isPrivate = true
  start: new Date(2026, 7, 3, 16, 30),
  slutt: new Date(2026, 7, 3, 17, 30),
  heleDagen: false,
};

test("privat avtale blokkerer tiden like effektivt som en åpen", () => {
  const medPrivat = beregnLedigeLuker([privatAvtale], dagStart, dagSlutt, {
    fraTime: 7,
    tilTime: 21,
  });
  const medAapen = beregnLedigeLuker(
    [{ ...privatAvtale, tittel: "Tannlege" }],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 21 },
  );

  assert.equal(medPrivat.length, medAapen.length);
  for (let i = 0; i < medPrivat.length; i++) {
    assert.equal(medPrivat[i].start.getTime(), medAapen[i].start.getTime());
    assert.equal(medPrivat[i].minutter, medAapen[i].minutter);
  }
});

test("ledige luker inneholder ingen titler i det hele tatt", () => {
  // LedigLuke har bare start/slutt/minutter. Skulle noen legge til et
  // tittelfelt senere, ville privat informasjon lekket ut hit.
  const luker = beregnLedigeLuker(
    [{ ...privatAvtale, tittel: "Psykolog" }],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 21 },
  );
  const serialisert = JSON.stringify(luker);
  assert.ok(!serialisert.includes("Psykolog"), "tittel lekket til lukene");
  for (const l of luker) {
    assert.deepEqual(Object.keys(l).sort(), ["minutter", "slutt", "start"]);
  }
});

test("akseptansetesten: Filip prioriterer skole og søvn", () => {
  // «Han skal prioritere skole og søvn denne uke.»
  // Skole 08-15 (heldagsprøve), leggetid respekteres av tilTime=20.
  const luker = beregnLedigeLuker(
    [
      {
        kilde: "SKOLE",
        tittel: "Heldagsprøve matematikk",
        start: new Date(2026, 7, 3, 8),
        slutt: new Date(2026, 7, 3, 15),
        heleDagen: false,
      },
      {
        kilde: "EGEN_AVTALE",
        tittel: null,
        start: new Date(2026, 7, 3, 16, 30),
        slutt: new Date(2026, 7, 3, 17, 30),
        heleDagen: false,
      },
    ],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 20, minMinutter: 60 },
  );

  // 07:00-08:00 (60 min), 17:30-20:00 (150 min). 15:00-16:30 er 90 min.
  assert.equal(luker.length, 3);
  assert.deepEqual(
    luker.map((l) => l.minutter),
    [60, 90, 150],
  );
  // Ingenting etter 20:00 — søvn er prioritert.
  for (const l of luker) {
    assert.ok(l.slutt.getHours() <= 20, "luke går inn i kveldsro");
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  beregnLedigeLuker,
  utvidUkentlig,
  type OpptattBlokk,
} from "./tilgjengelighet";

// Mandag 3. august 2026.
const MANDAG = new Date(2026, 7, 3);
const d = (time: number, min = 0) =>
  new Date(2026, 7, 3, time, min, 0, 0);

function blokk(
  start: Date,
  slutt: Date,
  kilde: OpptattBlokk["kilde"] = "EGEN_AVTALE",
  tittel: string | null = "test",
): OpptattBlokk {
  return { kilde, tittel, start, slutt, heleDagen: false };
}

const dagStart = new Date(2026, 7, 3, 0, 0);
const dagSlutt = new Date(2026, 7, 3, 23, 59, 59, 999);

test("tom dag gir én luke fra fraTime til tilTime", () => {
  const luker = beregnLedigeLuker([], dagStart, dagSlutt, {
    fraTime: 7,
    tilTime: 21,
  });
  assert.equal(luker.length, 1);
  assert.equal(luker[0].start.getHours(), 7);
  assert.equal(luker[0].slutt.getHours(), 21);
  assert.equal(luker[0].minutter, 14 * 60);
});

test("akseptansekriteriet: skole 08-12 og tannlege 16.30 gir tre luker", () => {
  const luker = beregnLedigeLuker(
    [
      blokk(d(8), d(12), "SKOLE", "Skole"),
      blokk(d(16, 30), d(17, 30), "EGEN_AVTALE", "Tannlege"),
    ],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 21 },
  );

  assert.equal(luker.length, 3);
  // 07:00-08:00
  assert.equal(luker[0].minutter, 60);
  // 12:00-16:30
  assert.equal(luker[1].start.getHours(), 12);
  assert.equal(luker[1].minutter, 270);
  // 17:30-21:00
  assert.equal(luker[2].start.getHours(), 17);
  assert.equal(luker[2].minutter, 210);
});

test("luker kortere enn minMinutter forkastes", () => {
  const luker = beregnLedigeLuker(
    [blokk(d(7, 30), d(21))],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 21, minMinutter: 45 },
  );
  // 07:00-07:30 er 30 min — under terskelen.
  assert.equal(luker.length, 0);
});

test("overlappende blokker slås sammen, ikke dobbelttelles", () => {
  const luker = beregnLedigeLuker(
    [blokk(d(9), d(12)), blokk(d(10), d(14))],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 21 },
  );
  assert.equal(luker.length, 2);
  assert.equal(luker[0].minutter, 120); // 07-09
  assert.equal(luker[1].start.getHours(), 14); // etter den seneste sluttiden
});

test("blokk som dekker hele dagen gir ingen luker", () => {
  const luker = beregnLedigeLuker(
    [blokk(d(0), new Date(2026, 7, 3, 23, 59), "FRAVAER", "SKADE")],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 21 },
  );
  assert.equal(luker.length, 0);
});

test("blokker utenfor treningsvinduet påvirker ikke lukene", () => {
  const luker = beregnLedigeLuker(
    [blokk(d(5), d(6, 30)), blokk(d(22), d(23))],
    dagStart,
    dagSlutt,
    { fraTime: 7, tilTime: 21 },
  );
  assert.equal(luker.length, 1);
  assert.equal(luker[0].minutter, 14 * 60);
});

test("luker beregnes per dag, aldri sammenhengende over natten", () => {
  const treDager = new Date(2026, 7, 5, 23, 59, 59, 999);
  const luker = beregnLedigeLuker([], dagStart, treDager, {
    fraTime: 7,
    tilTime: 21,
  });
  assert.equal(luker.length, 3, "skal gi én luke per dag");
  for (const l of luker) {
    assert.equal(l.start.getDate(), l.slutt.getDate(), "luke krysser døgnskille");
    assert.equal(l.minutter, 14 * 60);
  }
});

test("utvidUkentlig gjentar inn i vinduet uten å iterere fra gammel startdato", () => {
  // Gruppetrening satt opp for to år siden, mandager 17-19.
  const gammelStart = new Date(2024, 7, 5, 17, 0);
  const gammelSlutt = new Date(2024, 7, 5, 19, 0);
  const treff = utvidUkentlig(
    gammelStart,
    gammelSlutt,
    MANDAG,
    new Date(2026, 7, 17, 23, 59),
  );
  assert.equal(treff.length, 3, "tre mandager i vinduet");
  for (const t of treff) {
    assert.equal(t.start.getDay(), 1, "skal alltid lande på mandag");
    assert.equal(t.start.getHours(), 17);
    assert.equal(t.slutt.getTime() - t.start.getTime(), 2 * 60 * 60 * 1000);
  }
});

test("ikke-gjentakende blokk utenfor vinduet gir ingen treff", () => {
  const treff = utvidUkentlig(
    new Date(2026, 0, 1, 10),
    new Date(2026, 0, 1, 11),
    MANDAG,
    new Date(2026, 7, 4),
  );
  assert.equal(treff.length, 0);
});

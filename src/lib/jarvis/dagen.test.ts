/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/jarvis/dagen.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";
import type { KalenderHendelse } from "@/lib/meg/connectors/google";
import {
  osloDagGrenser,
  innboksblokkTidspunkt,
  byggAvtaleElementer,
  byggInnboksblokker,
  byggLedigElementer,
  summerLedigMinutterIgjen,
} from "./dagen";

let telle = 0;
function lagSak(overrides: Partial<Sak> = {}): Sak {
  telle += 1;
  return {
    id: `sak-${telle}`,
    kanal: SakKanal.EPOST,
    avsender: "test@akgolf.no",
    emne: "Testsak",
    innhold: "Testinnhold",
    foreslattSvar: null,
    status: SakStatus.VENTER,
    kildeId: null,
    frist: null,
    opprettet: new Date("2026-08-16T08:00:00Z"),
    oppdatert: new Date("2026-08-16T08:00:00Z"),
    provenance: null,
    ...overrides,
  };
}

test("osloDagGrenser: sommertid (CEST, UTC+2) — midnatt Oslo er 22:00 UTC dagen før", () => {
  const { start, slutt } = osloDagGrenser(new Date("2026-08-16T12:00:00Z"));
  assert.equal(start.toISOString(), "2026-08-15T22:00:00.000Z");
  assert.equal(slutt.toISOString(), "2026-08-16T22:00:00.000Z");
});

test("osloDagGrenser: vintertid (CET, UTC+1) — midnatt Oslo er 23:00 UTC dagen før", () => {
  const { start, slutt } = osloDagGrenser(new Date("2026-01-16T12:00:00Z"));
  assert.equal(start.toISOString(), "2026-01-15T23:00:00.000Z");
  assert.equal(slutt.toISOString(), "2026-01-16T23:00:00.000Z");
});

test("innboksblokkTidspunkt: 11:30 og 16:00 Oslo-tid samme dag som dagStart", () => {
  const { start } = osloDagGrenser(new Date("2026-08-16T12:00:00Z"));
  const { formiddag, ettermiddag } = innboksblokkTidspunkt(start);
  assert.equal(formiddag.toISOString(), "2026-08-16T09:30:00.000Z");
  assert.equal(ettermiddag.toISOString(), "2026-08-16T14:00:00.000Z");
});

function lagHendelse(overrides: Partial<KalenderHendelse> = {}): KalenderHendelse {
  return {
    id: "ev-1",
    tittel: "Test-avtale",
    sted: null,
    start: "2026-08-16T10:00:00Z",
    slutt: "2026-08-16T11:00:00Z",
    heldag: false,
    ...overrides,
  };
}

test("byggAvtaleElementer: filtrerer bort heldagshendelser", () => {
  const el = byggAvtaleElementer([lagHendelse({ heldag: true }), lagHendelse({ id: "ev-2" })], new Date("2026-08-16T09:00:00Z"));
  assert.equal(el.length, 1);
  assert.equal(el[0].id, "avtale-ev-2");
});

test("byggAvtaleElementer: ferdig=true når slutt er før nå", () => {
  const na = new Date("2026-08-16T12:00:00Z");
  const el = byggAvtaleElementer([lagHendelse()], na);
  assert.equal(el[0].ferdig, true);
});

test("byggAvtaleElementer: ferdig=false når avtalen ikke er startet", () => {
  const na = new Date("2026-08-16T08:00:00Z");
  const el = byggAvtaleElementer([lagHendelse()], na);
  assert.equal(el[0].ferdig, false);
});

test("byggInnboksblokker: viser ventende-antall og over-frist-antall fra Sak-snapshotet", () => {
  const na = new Date("2026-08-16T12:00:00Z");
  const { start } = osloDagGrenser(na);
  const saker = [
    lagSak({ status: SakStatus.VENTER, frist: new Date("2026-08-16T10:00:00Z") }), // over frist
    lagSak({ status: SakStatus.VENTER, frist: new Date("2026-08-16T20:00:00Z") }), // ikke over frist
    lagSak({ status: SakStatus.GODKJENT }), // teller ikke
  ];
  const el = byggInnboksblokker(saker, start, na);
  assert.equal(el.length, 2);
  assert.match(el[0].undertekst ?? "", /2 saker venter/);
  assert.match(el[0].undertekst ?? "", /1 over frist/);
});

test("byggInnboksblokker: ærlig 'ingen saker venter' når køen er tom", () => {
  const na = new Date("2026-08-16T12:00:00Z");
  const { start } = osloDagGrenser(na);
  const el = byggInnboksblokker([], start, na);
  assert.equal(el[0].undertekst, "Ingen saker venter");
});

test("byggLedigElementer: finner luken mellom to opptatte elementer", () => {
  const grenser = { start: new Date("2026-08-16T08:00:00Z"), slutt: new Date("2026-08-16T18:00:00Z") };
  const opptatt = byggAvtaleElementer(
    [
      lagHendelse({ id: "a", start: "2026-08-16T09:00:00Z", slutt: "2026-08-16T10:00:00Z" }),
      lagHendelse({ id: "b", start: "2026-08-16T11:00:00Z", slutt: "2026-08-16T12:00:00Z" }),
    ],
    new Date("2026-08-16T08:30:00Z"),
  );
  const luker = byggLedigElementer(opptatt, grenser, new Date("2026-08-16T08:30:00Z"));
  // Luke før første avtale (08:00-09:00) og mellom avtalene (10:00-11:00) — begge 60 min, over terskelen.
  assert.equal(luker.length, 2);
  assert.equal(luker[0].start, "2026-08-16T08:00:00.000Z");
  assert.equal(luker[1].start, "2026-08-16T10:00:00.000Z");
});

test("byggLedigElementer: ignorerer luker under 15 minutter", () => {
  const grenser = { start: new Date("2026-08-16T09:00:00Z"), slutt: new Date("2026-08-16T18:00:00Z") };
  const opptatt = byggAvtaleElementer(
    [
      lagHendelse({ id: "a", start: "2026-08-16T09:00:00Z", slutt: "2026-08-16T10:00:00Z" }),
      lagHendelse({ id: "b", start: "2026-08-16T10:10:00Z", slutt: "2026-08-16T11:00:00Z" }),
    ],
    new Date("2026-08-16T08:30:00Z"),
  );
  const luker = byggLedigElementer(opptatt, grenser, new Date("2026-08-16T08:30:00Z"));
  assert.equal(luker.length, 0);
});

test("summerLedigMinutterIgjen: teller kun luker som ikke er ferdig, klippet mot nå", () => {
  const na = new Date("2026-08-16T09:30:00Z");
  const elementer = [
    {
      id: "ledig-1",
      type: "ledig" as const,
      start: "2026-08-16T09:00:00.000Z",
      slutt: "2026-08-16T10:00:00.000Z",
      tittel: "1t ledig",
      undertekst: null,
      ferdig: false,
    },
    {
      id: "ledig-2",
      type: "ledig" as const,
      start: "2026-08-16T07:00:00.000Z",
      slutt: "2026-08-16T08:00:00.000Z",
      tittel: "1t ledig",
      undertekst: null,
      ferdig: true,
    },
  ];
  // ledig-1 klippes til [09:30, 10:00] = 30 min. ledig-2 telles ikke (ferdig).
  assert.equal(summerLedigMinutterIgjen(elementer, na), 30);
});

/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/jarvis/kalendervakt.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import type { KalenderHendelse } from "@/lib/meg/connectors/google";
import { finnAvvik, formatTidsrom } from "./kalendervakt";

// «Nå» før alle testhendelsene — så ingen avvik filtreres bort som passerte.
const NA = new Date("2026-08-17T06:00:00Z");

function lagHendelse(overrides: Partial<KalenderHendelse> = {}): KalenderHendelse {
  return {
    id: "ev-1",
    tittel: "Avtale",
    sted: null,
    start: "2026-08-17T10:00:00Z",
    slutt: "2026-08-17T11:00:00Z",
    heldag: false,
    ...overrides,
  };
}

test("finnAvvik: tom liste gir ingen avvik", () => {
  assert.deepEqual(finnAvvik([], NA), []);
});

test("KONFLIKT: overlappende hendelser flagges med begge tidsrom og forslag fra hendelseslisten", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", tittel: "Juniorgruppa", start: "2026-08-17T10:30:00Z", slutt: "2026-08-17T12:00:00Z" }),
      lagHendelse({ id: "b", tittel: "Booking Henrik", start: "2026-08-17T11:00:00Z", slutt: "2026-08-17T12:00:00Z" }),
    ],
    NA,
  );
  assert.equal(avvik.length, 1);
  assert.equal(avvik[0].type, "KONFLIKT");
  assert.equal(avvik[0].id, "konflikt-a-b");
  assert.equal(avvik[0].tittel, "Booking Henrik overlapper Juniorgruppa");
  // Oslo-tid (CEST, UTC+2): 10:30Z–12:00Z = 12:30–14:00, 11:00Z–12:00Z = 13:00–14:00.
  assert.equal(avvik[0].for, "17.08 12:30–14:00 · 17.08 13:00–14:00");
  // Neste ledige luke etter konflikten: rett etter 14:00 Oslo, én times varighet.
  assert.equal(avvik[0].etter, "17.08 12:30–14:00 · 17.08 14:00–15:00");
  assert.equal(avvik[0].godkjent, null);
});

test("KONFLIKT: forslaget hopper over senere hendelser som blokkerer luka", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T11:00:00Z" }),
      lagHendelse({ id: "b", start: "2026-08-17T10:30:00Z", slutt: "2026-08-17T11:30:00Z" }),
      lagHendelse({ id: "c", start: "2026-08-17T11:30:00Z", slutt: "2026-08-17T12:30:00Z" }),
    ],
    NA,
  );
  const konflikt = avvik.find((x) => x.id === "konflikt-a-b");
  assert.ok(konflikt);
  // b (1t) får ikke plass før c slutter 12:30Z = 14:30 Oslo.
  assert.ok(konflikt.etter.endsWith("17.08 14:30–15:30"));
});

test("KONFLIKT: hendelser rygg-mot-rygg (slutt == start) er IKKE overlapp", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T11:00:00Z" }),
      lagHendelse({ id: "b", start: "2026-08-17T11:00:00Z", slutt: "2026-08-17T12:00:00Z" }),
    ],
    NA,
  );
  assert.equal(avvik.filter((x) => x.type === "KONFLIKT").length, 0);
});

test("heldagshendelser ignoreres helt", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", heldag: true, start: "2026-08-17", slutt: "2026-08-18", sted: "GFGK" }),
      lagHendelse({ id: "b", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T11:00:00Z", sted: "WANG" }),
    ],
    NA,
  );
  assert.deepEqual(avvik, []);
});

test("REISETID: rygg-mot-rygg på to ulike steder flagges — uten minuttall for reisen", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", tittel: "Juniorgruppa", sted: "GFGK", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T12:00:00Z" }),
      lagHendelse({ id: "b", tittel: "Møte med Øyvind", sted: "WANG Fredrikstad", start: "2026-08-17T12:00:00Z", slutt: "2026-08-17T13:00:00Z" }),
    ],
    NA,
  );
  assert.equal(avvik.length, 1);
  assert.equal(avvik[0].type, "REISETID");
  assert.equal(avvik[0].id, "reisetid-a-b");
  assert.equal(avvik[0].tittel, "Ingen reisetid mellom GFGK og WANG Fredrikstad");
  // Ærlig: aldri et minuttall for selve reisen, og ingen oppdiktet fiks.
  assert.ok(!/\d+\s*min/.test(avvik[0].forklaring));
  assert.equal(avvik[0].etter, "");
});

test("REISETID: gap på 14 min flagges, gap på 15 min gjør det ikke", () => {
  const base = { id: "a", sted: "GFGK", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T11:00:00Z" };
  const kort = finnAvvik(
    [lagHendelse(base), lagHendelse({ id: "b", sted: "WANG", start: "2026-08-17T11:14:00Z", slutt: "2026-08-17T12:00:00Z" })],
    NA,
  );
  assert.equal(kort.length, 1);
  const langt = finnAvvik(
    [lagHendelse(base), lagHendelse({ id: "b", sted: "WANG", start: "2026-08-17T11:15:00Z", slutt: "2026-08-17T12:00:00Z" })],
    NA,
  );
  assert.equal(langt.length, 0);
});

test("REISETID: samme sted (uansett store/små bokstaver) flagges ikke", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", sted: "GFGK", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T11:00:00Z" }),
      lagHendelse({ id: "b", sted: "gfgk", start: "2026-08-17T11:00:00Z", slutt: "2026-08-17T12:00:00Z" }),
    ],
    NA,
  );
  assert.equal(avvik.length, 0);
});

test("REISETID: manglende sted på én av hendelsene flagges ikke", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", sted: "GFGK", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T11:00:00Z" }),
      lagHendelse({ id: "b", sted: null, start: "2026-08-17T11:00:00Z", slutt: "2026-08-17T12:00:00Z" }),
    ],
    NA,
  );
  assert.equal(avvik.length, 0);
});

test("REISETID: overlappende hendelser er KONFLIKT, ikke reisetid — selv med ulike steder", () => {
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", sted: "GFGK", start: "2026-08-17T10:00:00Z", slutt: "2026-08-17T11:00:00Z" }),
      lagHendelse({ id: "b", sted: "WANG", start: "2026-08-17T10:30:00Z", slutt: "2026-08-17T11:30:00Z" }),
    ],
    NA,
  );
  assert.equal(avvik.length, 1);
  assert.equal(avvik[0].type, "KONFLIKT");
});

test("passerte avvik filtreres bort — konflikt helt i fortid og overgang som allerede har skjedd", () => {
  const senereNa = new Date("2026-08-17T13:00:00Z");
  const avvik = finnAvvik(
    [
      lagHendelse({ id: "a", sted: "GFGK", start: "2026-08-17T09:00:00Z", slutt: "2026-08-17T10:00:00Z" }),
      lagHendelse({ id: "b", sted: "WANG", start: "2026-08-17T09:30:00Z", slutt: "2026-08-17T10:30:00Z" }),
      lagHendelse({ id: "c", sted: "Mulligan", start: "2026-08-17T10:30:00Z", slutt: "2026-08-17T11:00:00Z" }),
    ],
    senereNa,
  );
  assert.deepEqual(avvik, []);
});

test("formatTidsrom: dato tas med på begge sider når tidsrommet krysser midnatt", () => {
  const over = formatTidsrom(Date.parse("2026-08-17T21:00:00Z"), Date.parse("2026-08-17T22:30:00Z"));
  // 21:00Z = 23:00 Oslo (17.08), 22:30Z = 00:30 Oslo (18.08).
  assert.equal(over, "17.08 23:00 – 18.08 00:30");
});

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ForslagInput,
  SamtaleInput,
  dagTilDato,
  erTrenerRolle,
  kanSvare,
  lesUtviklingssjekk,
  sjekkStatus,
} from "./regler";

const svar = { "1": 3, "2": 4, "3": 2, "4": 3, "5": 4, "6": 3, "7": 2, "8": 3 };

test("utviklingssjekk: gyldig blob leses, ugyldig blir null", () => {
  assert.equal(lesUtviklingssjekk({ niva: "JUNIOR", svar })?.niva, "JUNIOR");
  assert.equal(lesUtviklingssjekk({ niva: "JUNIOR", svar: { "1": 5 } }), null);
  assert.equal(lesUtviklingssjekk({ niva: "ELITE", svar }), null);
  assert.equal(lesUtviklingssjekk({ niva: "UNG", svar: { "9": 2 } }), null);
  assert.equal(lesUtviklingssjekk(null), null);
});

test("forslag: tekst trimmes, tom og for lang avvises, ukjent type avvises", () => {
  assert.equal(ForslagInput.safeParse({ elevId: "e1", type: "PLAN", tekst: "  Flytt økt  " }).data?.tekst, "Flytt økt");
  assert.equal(ForslagInput.safeParse({ elevId: "e1", type: "PLAN", tekst: "   " }).success, false);
  assert.equal(ForslagInput.safeParse({ elevId: "e1", type: "PLAN", tekst: "x".repeat(1001) }).success, false);
  assert.equal(ForslagInput.safeParse({ elevId: "e1", type: "ANNET", tekst: "x" }).success, false);
  assert.equal(ForslagInput.safeParse({ elevId: "", type: "IUP", tekst: "x" }).success, false);
});

test("samtale: dato må være en ekte dag", () => {
  assert.equal(SamtaleInput.safeParse({ elevId: "e1", dag: "2026-09-29", type: "OPPFOLGING", avtalt: "Følg opp" }).success, true);
  assert.equal(SamtaleInput.safeParse({ elevId: "e1", dag: "29.09.2026", type: "OPPFOLGING", avtalt: "x" }).success, false);
  assert.equal(SamtaleInput.safeParse({ elevId: "e1", dag: "2026-09-29", type: "OPPFOLGING", avtalt: " " }).success, false);
  assert.equal(dagTilDato("2026-02-30"), null);
  assert.equal(dagTilDato("2026-09-29")?.toISOString(), "2026-09-29T00:00:00.000Z");
});

test("statusflyt: bare VENTER kan få svar, og ingen vei tilbake", () => {
  assert.equal(kanSvare("VENTER", "GODTATT"), true);
  assert.equal(kanSvare("VENTER", "AVVIST"), true);
  assert.equal(kanSvare("VENTER", "VENTER"), false);
  assert.equal(kanSvare("GODTATT", "AVVIST"), false);
  assert.equal(kanSvare("AVVIST", "GODTATT"), false);
});

test("fireukerssjekk: levert, forfalt og pågående", () => {
  const naa = new Date("2026-09-29T10:00:00Z");
  assert.equal(sjekkStatus({ levertAt: new Date("2026-09-28T10:00:00Z"), frist: new Date("2026-09-20T00:00:00Z") }, naa), "LEVERT");
  assert.equal(sjekkStatus({ levertAt: null, frist: new Date("2026-09-28T00:00:00Z") }, naa), "FORFALT");
  assert.equal(sjekkStatus({ levertAt: null, frist: new Date("2026-10-27T00:00:00Z") }, naa), "PAAGAAR");
});

test("tilgang: bare COACH og ASSISTANT er trenere; elev og foresatt nektes", () => {
  assert.equal(erTrenerRolle("COACH"), true);
  assert.equal(erTrenerRolle("ASSISTANT"), true);
  assert.equal(erTrenerRolle("PLAYER"), false);
  assert.equal(erTrenerRolle("GUARDIAN"), false);
  assert.equal(erTrenerRolle(null), false);
});

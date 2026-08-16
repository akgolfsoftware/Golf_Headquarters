/**
 * G3 · Duplikatfri gruppeplan-utrulling — dedup-logikken er en KONTRAKT:
 * utrulling av årsplan (perioder), malutrulling (økter) og workbench-visningen
 * (slots) bygger alle på disse tre funksjonene. Endres semantikken, skal
 * testene tvinge en bevisst beslutning.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  overlapper,
  skalHoppeOverPeriode,
  dedupGruppeSlots,
} from "@/lib/domain/gruppeplan-dedup";

// ───────── overlapper: ekte intervall-snitt ─────────

test("overlapper: disjunkte intervaller berører ikke", () => {
  assert.equal(
    overlapper("2026-08-17T08:00:00Z", "2026-08-17T10:00:00Z", "2026-08-17T12:00:00Z", "2026-08-17T14:00:00Z"),
    false,
  );
});

test("overlapper: kant-mot-kant (a slutter når b starter) er IKKE overlapp", () => {
  assert.equal(
    overlapper("2026-08-17T08:00:00Z", "2026-08-17T10:00:00Z", "2026-08-17T10:00:00Z", "2026-08-17T12:00:00Z"),
    false,
  );
  // Samme kant motsatt vei.
  assert.equal(
    overlapper("2026-08-17T10:00:00Z", "2026-08-17T12:00:00Z", "2026-08-17T08:00:00Z", "2026-08-17T10:00:00Z"),
    false,
  );
});

test("overlapper: a omslutter b (og motsatt) er overlapp", () => {
  assert.equal(
    overlapper("2026-08-17T08:00:00Z", "2026-08-17T18:00:00Z", "2026-08-17T10:00:00Z", "2026-08-17T12:00:00Z"),
    true,
  );
  assert.equal(
    overlapper("2026-08-17T10:00:00Z", "2026-08-17T12:00:00Z", "2026-08-17T08:00:00Z", "2026-08-17T18:00:00Z"),
    true,
  );
});

test("overlapper: delvis overlapp er overlapp", () => {
  assert.equal(
    overlapper("2026-08-17T08:00:00Z", "2026-08-17T11:00:00Z", "2026-08-17T10:00:00Z", "2026-08-17T13:00:00Z"),
    true,
  );
});

test("overlapper: samme dag uten tidsoverlapp kolliderer IKKE (WANG morgen + GFGK kveld)", () => {
  assert.equal(
    overlapper("2026-08-17T06:00:00Z", "2026-08-17T08:00:00Z", "2026-08-17T16:00:00Z", "2026-08-17T18:00:00Z"),
    false,
  );
});

test("overlapper: tar både Date og ISO-streng", () => {
  assert.equal(
    overlapper(
      new Date("2026-08-17T08:00:00Z"),
      new Date("2026-08-17T11:00:00Z"),
      "2026-08-17T10:00:00Z",
      "2026-08-17T13:00:00Z",
    ),
    true,
  );
});

// ───────── skalHoppeOverPeriode: to-lags-regelen ─────────

const GRUPPE_A = "gruppe-a";
const GRUPPE_B = "gruppe-b";

const nyPeriode = {
  lPhase: "GRUNN",
  startDate: "2026-11-01T00:00:00Z",
  endDate: "2026-12-20T00:00:00Z",
};

test("skalHoppeOverPeriode: samme gruppe + overlapp → IDEMPOTENT (re-kjøring trygg)", () => {
  const res = skalHoppeOverPeriode(
    { lPhase: "GRUNN", startDate: "2026-11-01T00:00:00Z", endDate: "2026-12-20T00:00:00Z", sourceGroupId: GRUPPE_A },
    nyPeriode,
    GRUPPE_A,
  );
  assert.deepEqual(res, { hopp: true, grunn: "IDEMPOTENT" });
});

test("skalHoppeOverPeriode: samme gruppe + overlapp er IDEMPOTENT uansett lPhase (aldri stable etter redigering)", () => {
  const res = skalHoppeOverPeriode(
    { lPhase: "SPESIAL", startDate: "2026-11-10T00:00:00Z", endDate: "2026-11-30T00:00:00Z", sourceGroupId: GRUPPE_A },
    nyPeriode,
    GRUPPE_A,
  );
  assert.deepEqual(res, { hopp: true, grunn: "IDEMPOTENT" });
});

test("skalHoppeOverPeriode: annen gruppe + samme lPhase + overlapp → KRYSSKILDE", () => {
  const res = skalHoppeOverPeriode(
    { lPhase: "GRUNN", startDate: "2026-11-10T00:00:00Z", endDate: "2026-11-30T00:00:00Z", sourceGroupId: GRUPPE_B },
    nyPeriode,
    GRUPPE_A,
  );
  assert.deepEqual(res, { hopp: true, grunn: "KRYSSKILDE" });
});

test("skalHoppeOverPeriode: spillerens egen periode (sourceGroupId null) + samme lPhase + overlapp → KRYSSKILDE", () => {
  const res = skalHoppeOverPeriode(
    { lPhase: "GRUNN", startDate: "2026-11-10T00:00:00Z", endDate: "2026-11-30T00:00:00Z", sourceGroupId: null },
    nyPeriode,
    GRUPPE_A,
  );
  assert.deepEqual(res, { hopp: true, grunn: "KRYSSKILDE" });
});

test("skalHoppeOverPeriode: annen kilde + ANNEN lPhase + overlapp → ingen hopp", () => {
  const res = skalHoppeOverPeriode(
    { lPhase: "SPESIAL", startDate: "2026-11-10T00:00:00Z", endDate: "2026-11-30T00:00:00Z", sourceGroupId: GRUPPE_B },
    nyPeriode,
    GRUPPE_A,
  );
  assert.deepEqual(res, { hopp: false, grunn: null });
});

test("skalHoppeOverPeriode: ingen datooverlapp → ingen hopp uansett kilde og lPhase", () => {
  const res = skalHoppeOverPeriode(
    { lPhase: "GRUNN", startDate: "2027-01-05T00:00:00Z", endDate: "2027-02-01T00:00:00Z", sourceGroupId: GRUPPE_A },
    nyPeriode,
    GRUPPE_A,
  );
  assert.deepEqual(res, { hopp: false, grunn: null });
});

test("skalHoppeOverPeriode: perioder er inklusive dagintervaller — delt sistedag ER overlapp", () => {
  // Eksisterende slutter 20.12, ny starter 20.12 — samme dag i begge → kollisjon.
  const res = skalHoppeOverPeriode(
    { lPhase: "GRUNN", startDate: "2026-10-01T00:00:00Z", endDate: "2026-11-01T00:00:00Z", sourceGroupId: null },
    nyPeriode,
    GRUPPE_A,
  );
  assert.deepEqual(res, { hopp: true, grunn: "KRYSSKILDE" });
});

// ───────── dedupGruppeSlots: identiske tidsrom slås sammen ─────────

const slot = (groupName: string, startAt: string, endAt: string, id = `${groupName}-${startAt}`) => ({
  id,
  groupName,
  startAt,
  endAt,
  title: "Fellestrening",
});

test("dedupGruppeSlots: identisk tidsrom fra to grupper → én slot med «A + B»", () => {
  const res = dedupGruppeSlots([
    slot("GFGK Elite", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z"),
    slot("WANG Toppidrett", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z"),
  ]);
  assert.equal(res.length, 1);
  assert.equal(res[0].groupName, "GFGK Elite + WANG Toppidrett");
});

test("dedupGruppeSlots: delvis overlappende (ikke identiske) tidsrom beholdes hver for seg", () => {
  const res = dedupGruppeSlots([
    slot("GFGK Elite", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z"),
    slot("WANG Toppidrett", "2026-08-18T17:00:00.000Z", "2026-08-18T19:00:00.000Z"),
  ]);
  assert.equal(res.length, 2);
  assert.deepEqual(res.map((s) => s.groupName), ["GFGK Elite", "WANG Toppidrett"]);
});

test("dedupGruppeSlots: tre grupper, samme tidsrom → «A + B + C», rekkefølge bevart", () => {
  const res = dedupGruppeSlots([
    slot("GFGK Elite", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z"),
    slot("Junior Academy", "2026-08-19T16:00:00.000Z", "2026-08-19T18:00:00.000Z"),
    slot("WANG Toppidrett", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z"),
    slot("AK Golf Academy", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z"),
  ]);
  assert.equal(res.length, 2);
  assert.equal(res[0].groupName, "GFGK Elite + WANG Toppidrett + AK Golf Academy");
  assert.equal(res[1].groupName, "Junior Academy");
});

test("dedupGruppeSlots: samme gruppenavn to ganger i samme tidsrom dupliseres ikke i navnet", () => {
  const res = dedupGruppeSlots([
    slot("GFGK Elite", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z", "a"),
    slot("GFGK Elite", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z", "b"),
  ]);
  assert.equal(res.length, 1);
  assert.equal(res[0].groupName, "GFGK Elite");
});

test("dedupGruppeSlots: muterer ikke input-radene", () => {
  const original = slot("GFGK Elite", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z");
  dedupGruppeSlots([
    original,
    slot("WANG Toppidrett", "2026-08-18T16:00:00.000Z", "2026-08-18T18:00:00.000Z"),
  ]);
  assert.equal(original.groupName, "GFGK Elite");
});

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  erMorgenokt,
  felleTittel,
  fireUker,
  gruppeokter,
  isoUke,
  lesHeltall,
  lesOktNokkel,
  mandagI,
  osloIso,
  osloTidspunkt,
  perOmrade,
  prosent,
  summer,
  timer,
  underSyttiToUker,
  type WangOkt,
} from "./wang-trening-beregning";

function okt(p: Partial<WangOkt>): WangOkt {
  return {
    id: p.id ?? Math.random().toString(36).slice(2),
    elevId: p.elevId ?? "e1",
    dato: p.dato ?? "2026-09-21",
    startMin: p.startMin ?? 480,
    varighetMin: p.varighetMin ?? 120,
    tittel: p.tittel ?? "Morgentrening",
    omrade: p.omrade ?? "TEK",
    status: p.status ?? "PUBLISHED",
    sted: p.sted ?? null,
    notat: null,
    maal: null,
    faktiskMin: null,
  };
}

// Tirsdag 29.09.2026 kl. 12:00 norsk tid (sommertid, UTC+2).
const NAA = new Date("2026-09-29T10:00:00Z");

test("norsk veggklokke blir riktig tidspunkt i sommer- og vintertid", () => {
  assert.equal(osloTidspunkt("2026-09-29", 480).toISOString(), "2026-09-29T06:00:00.000Z");
  assert.equal(osloTidspunkt("2026-12-01", 480).toISOString(), "2026-12-01T07:00:00.000Z");
  assert.equal(osloIso(new Date("2026-09-28T22:30:00Z")), "2026-09-29");
});

test("uke og mandag regnes på kalenderdagen", () => {
  assert.equal(mandagI("2026-09-29"), "2026-09-28");
  assert.equal(mandagI("2026-10-04"), "2026-09-28");
  assert.equal(isoUke("2026-09-28"), 40);
  assert.deepEqual(fireUker("2026-09-29"), ["2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28"]);
});

test("etterlevelse er gjennomført tid delt på planlagt tid med passert sluttid", () => {
  const s = summer(
    [
      okt({ dato: "2026-09-21", status: "COMPLETED" }),
      okt({ dato: "2026-09-22", status: "SKIPPED" }),
      okt({ dato: "2026-09-23", varighetMin: 60, status: "PUBLISHED" }),
      // Fremtidig: teller i planlagt tid, ikke i nevneren.
      okt({ dato: "2026-10-01", status: "PUBLISHED" }),
      // Kladd og ikke publisert: ikke planlagt.
      okt({ dato: "2026-09-24", status: "DRAFT" }),
      okt({ dato: "2026-09-25", status: "SCHEDULED" }),
    ],
    NAA,
  );
  assert.equal(s.planlagtMin, 420);
  assert.equal(s.forfaltMin, 300);
  assert.equal(s.gjennomfortMin, 120);
  assert.equal(s.etterlevelse, 0.4);
  assert.equal(prosent(s.etterlevelse), "40 %");
});

test("uten forfalte økter er etterlevelsen ukjent, aldri 0", () => {
  const s = summer([okt({ dato: "2026-10-05" })], NAA);
  assert.equal(s.etterlevelse, null);
  assert.equal(s.morgenAndel, null);
  assert.equal(prosent(s.etterlevelse), "—");
});

test("økt som slutter senere i dag er ikke forfalt ennå", () => {
  const s = summer([okt({ dato: "2026-09-29", startMin: 13 * 60 })], NAA);
  assert.equal(s.forfaltMin, 0);
});

test("morgenøkt starter før 10:00, og oppmøte er gjennomført morgenøkt", () => {
  assert.equal(erMorgenokt({ startMin: 480 }), true);
  assert.equal(erMorgenokt({ startMin: 600 }), false);
  const s = summer(
    [
      okt({ dato: "2026-09-22", status: "COMPLETED" }),
      okt({ dato: "2026-09-24", status: "SKIPPED" }),
      okt({ dato: "2026-09-24", startMin: 900, status: "COMPLETED" }),
    ],
    NAA,
  );
  assert.equal(s.morgenForfalt, 2);
  assert.equal(s.morgenOppmott, 1);
  assert.equal(s.morgenAndel, 0.5);
});

test("under 70 % to uker på rad bruker de to siste hele ukene", () => {
  const lav = [
    okt({ dato: "2026-09-14", status: "COMPLETED" }),
    okt({ dato: "2026-09-15", status: "SKIPPED" }),
    okt({ dato: "2026-09-16", status: "SKIPPED" }),
    okt({ dato: "2026-09-21", status: "COMPLETED" }),
    okt({ dato: "2026-09-22", status: "PUBLISHED" }),
  ];
  const funn = underSyttiToUker(lav, "2026-09-29", NAA);
  assert.ok(funn);
  assert.deepEqual(funn.uker, [38, 39]);
  const god = [...lav, okt({ dato: "2026-09-23", status: "COMPLETED" }), okt({ dato: "2026-09-24", status: "COMPLETED" })];
  assert.equal(underSyttiToUker(god, "2026-09-29", NAA), null);
  assert.equal(underSyttiToUker([], "2026-09-29", NAA), null);
});

test("fordeling per område summerer planlagt og gjennomført", () => {
  const f = perOmrade([okt({ omrade: "FYS", status: "COMPLETED" }), okt({ omrade: "fys" }), okt({ omrade: "ukjent" })]);
  const fys = f.find((x) => x.omrade === "FYS");
  assert.deepEqual(fys, { omrade: "FYS", planlagtMin: 240, gjennomfortMin: 120 });
  assert.equal(f.find((x) => x.omrade === "TEK")?.planlagtMin, 0);
});

test("gruppeøkter samler elevenes kopier per dag og klokkeslett", () => {
  const g = gruppeokter([
    okt({ elevId: "a", tittel: "Morgentrening · FYS", omrade: "FYS" }),
    okt({ elevId: "b", tittel: "Morgentrening · TEK", omrade: "TEK" }),
    okt({ elevId: "a", dato: "2026-09-22", startMin: 900, tittel: "Slag" }),
    okt({ elevId: "c", status: "DRAFT" }),
  ]);
  assert.equal(g.length, 2);
  assert.equal(g[0].key, "2026-09-21_480");
  assert.equal(g[0].tittel, "Morgentrening");
  assert.deepEqual(g[0].omrader, ["FYS", "TEK"]);
  assert.equal(g[0].okter.length, 2);
  assert.equal(felleTittel(["A", "B"]), "2 ulike økter");
});

test("adresseparametre leses strengt", () => {
  assert.deepEqual(lesOktNokkel("2026-09-21_480"), { dato: "2026-09-21", startMin: 480 });
  assert.equal(lesOktNokkel("2026-09-21_9999"), null);
  assert.equal(lesOktNokkel("<script>"), null);
  assert.equal(lesHeltall("-2", 0, -8, 8), -2);
  assert.equal(lesHeltall("abc", 0, -8, 8), 0);
  assert.equal(lesHeltall("99", 0, -8, 8), 0);
  assert.equal(timer(450), "7,5");
});

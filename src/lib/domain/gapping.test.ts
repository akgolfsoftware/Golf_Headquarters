import { test } from "node:test";
import assert from "node:assert/strict";

import {
  beregnGapping,
  GAP_TERSKEL_M,
  MIN_SLAG,
  type KolleSlag,
} from "@/lib/domain/gapping";

/**
 * N slag rundt en gitt median. Spredningen er SYMMETRISK om midtpunktet
 * (±6 m), så medianen blir eksakt den oppgitte — ellers ville testene målt
 * hjelpefunksjonens skjevhet i stedet for koden.
 */
function slag(klubb: string, median: number, antall: number): KolleSlag[] {
  return Array.from({ length: antall }, (_, i) => {
    const midt = (antall - 1) / 2;
    const offset = antall === 1 ? 0 : ((i - midt) / midt) * 6;
    return { klubb, carry: median + offset };
  });
}

test("median og persentiler regnes per kølle", () => {
  const { koller } = beregnGapping(slag("7-jern", 150, 26));
  const k = koller[0];

  assert.equal(k.klubb, "7-jern");
  assert.equal(k.median, 150);
  assert.ok(k.p25 < k.median, "p25 skal ligge under medianen");
  assert.ok(k.p75 > k.median, "p75 skal ligge over medianen");
  assert.equal(k.slag, 26);
});

test("køller sorteres etter målt carry, ikke etter navn", () => {
  const { koller } = beregnGapping([
    ...slag("PW", 112, 22),
    ...slag("Driver", 232, 22),
    ...slag("7-jern", 150, 22),
  ]);

  assert.deepEqual(
    koller.map((k) => k.klubb),
    ["Driver", "7-jern", "PW"],
  );
});

test("gap over terskelen flagges når begge køller har nok slag", () => {
  const { gap } = beregnGapping([
    ...slag("4-hybrid", 196, 31),
    ...slag("5-jern", 172, 38), // 24 m gap — over terskelen
  ]);

  assert.equal(gap.length, 1);
  assert.equal(gap[0].over, "4-hybrid");
  assert.equal(gap[0].under, "5-jern");
  assert.equal(gap[0].meter, 24);
  assert.equal(gap[0].hullMidt, 184, "midtpunktet er avstanden som mangler kølle");
});

test("gap akkurat på terskelen flagges ikke — regelen er «over 22»", () => {
  const { gap } = beregnGapping([
    ...slag("6-jern", 161, 25),
    ...slag("7-jern", 161 - GAP_TERSKEL_M, 25),
  ]);

  assert.equal(gap.length, 0);
});

test("driveren står utenfor flaggingen", () => {
  const { gap, koller } = beregnGapping([
    ...slag("Driver", 232, 48),
    ...slag("3-tre", 200, 26), // 32 m gap — ville blitt flagget uten unntaket
  ]);

  assert.equal(koller.length, 2, "driveren skal fortsatt måles og vises");
  assert.equal(gap.length, 0, "men aldri flagges — den slås fra tee");
});

test("kølle under 20 slag måles, men flagges ikke", () => {
  const { koller, gap } = beregnGapping([
    ...slag("54°", 82, 33),
    ...slag("58°", 55, 19), // 27 m gap, men 58° har for få slag
  ]);

  const tynn = koller.find((k) => k.klubb === "58°");
  assert.equal(tynn?.slag, 19);
  assert.equal(tynn?.tynn, true, "under terskelen skal merkes");
  assert.equal(tynn?.median, 55, "men tallene skal fortsatt regnes ut");
  assert.equal(gap.length, 0, "for tynt grunnlag til å konkludere");
});

test(`${MIN_SLAG} slag er nok — terskelen er inklusiv`, () => {
  const { koller, gap } = beregnGapping([
    ...slag("5-jern", 172, MIN_SLAG),
    ...slag("6-jern", 145, MIN_SLAG),
  ]);

  assert.equal(koller.every((k) => !k.tynn), true);
  assert.equal(gap.length, 1, "27 m mellom to køller med akkurat 20 slag");
});

test("under 20 slag totalt: kartet skal ikke tegnes", () => {
  const res = beregnGapping([
    ...slag("7-jern", 150, 6),
    ...slag("PW", 112, 5),
    ...slag("54°", 82, 3),
  ]);

  assert.equal(res.totaltSlag, 14);
  assert.equal(res.forFaaSlag, true);
});

test("gap regnes kun mellom NABOKØLLER, ikke på tvers av settet", () => {
  const { gap } = beregnGapping([
    ...slag("5-jern", 172, 25),
    ...slag("6-jern", 161, 25),
    ...slag("7-jern", 150, 25),
  ]);

  // 5-jern → 7-jern er 22 m, men de er ikke naboer. Ingen naboavstand
  // (11 m) er over terskelen.
  assert.equal(gap.length, 0);
});

test("slag uten gyldig carry hoppes over", () => {
  const { koller } = beregnGapping([
    { klubb: "7-jern", carry: 150 },
    { klubb: "7-jern", carry: 0 },
    { klubb: "7-jern", carry: Number.NaN },
    { klubb: "7-jern", carry: -3 },
  ]);

  assert.equal(koller[0].slag, 1, "kun det gyldige slaget telles");
});

test("tomt datasett gir tomt kart uten å kaste", () => {
  const res = beregnGapping([]);

  assert.deepEqual(res.koller, []);
  assert.deepEqual(res.gap, []);
  assert.equal(res.totaltSlag, 0);
  assert.equal(res.forFaaSlag, true);
});

test("flere gap i samme sett rapporteres hver for seg", () => {
  const { gap } = beregnGapping([
    ...slag("4-hybrid", 196, 25),
    ...slag("5-jern", 170, 25), // 26 m
    ...slag("7-jern", 140, 25), // 30 m
  ]);

  assert.equal(gap.length, 2);
  assert.deepEqual(
    gap.map((g) => g.meter),
    [26, 30],
  );
});

// Enhetstester for forslags-utledningen i «Fokus-spillere»-blokken (D3).
// Kjør med:
//   npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/admin/fokus-forslag.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  utledForslag,
  fmtSg,
  type ForslagSignalInput,
} from "@/lib/admin/fokus-forslag";

const basis: ForslagSignalInput = {
  playerId: "p1",
  navn: "Øyvind Rohjan",
  planlagt14d: 0,
  fullfort14d: 0,
  sgSnitt30d: null,
  dagerSidenInnlogging: 1,
};

test("fmtSg: fortegn, norsk komma og ekte minustegn", () => {
  assert.equal(fmtSg(0.8), "+0,8");
  assert.equal(fmtSg(-1.23), "−1,2");
  assert.equal(fmtSg(0), "0,0");
  assert.equal(fmtSg(-0.04), "0,0"); // avrundes til 0 → uten fortegn
});

test("plan-etterlevelse under terskel gir forslag med tall+enhet+retning", () => {
  const forslag = utledForslag(
    [{ ...basis, planlagt14d: 5, fullfort14d: 2 }],
    new Set(),
  );
  assert.equal(forslag.length, 1);
  assert.equal(forslag[0].kilde, "planEtterlevelse");
  assert.equal(forslag[0].grunn, "Plan-etterlevelse 40 % siste 2 uker");
  assert.equal(forslag[0].retning, "down");
});

test("for få planlagte økter gir IKKE plan-forslag (støyvern)", () => {
  const forslag = utledForslag(
    [{ ...basis, planlagt14d: 2, fullfort14d: 0 }],
    new Set(),
  );
  assert.equal(forslag.length, 0);
});

test("svak SG siste 30 d gir forslag; god SG gjør det ikke", () => {
  const forslag = utledForslag(
    [
      { ...basis, playerId: "p1", sgSnitt30d: -1.2 },
      { ...basis, playerId: "p2", navn: "Emma Lind", sgSnitt30d: 0.4 },
    ],
    new Set(),
  );
  assert.equal(forslag.length, 1);
  assert.equal(forslag[0].kilde, "sg");
  assert.equal(forslag[0].grunn, "Strokes Gained −1,2 siste 30 dager");
});

test("inaktivitet ≥ 10 dager gir forslag; aldri-innlogget (stub) gjør det ikke", () => {
  const forslag = utledForslag(
    [
      { ...basis, playerId: "p1", dagerSidenInnlogging: 12 },
      { ...basis, playerId: "p2", navn: "Stub Spiller", dagerSidenInnlogging: null },
    ],
    new Set(),
  );
  assert.equal(forslag.length, 1);
  assert.equal(forslag[0].grunn, "Ingen innlogging på 12 dager");
});

test("ÉN grunn per spiller — sterkeste signal vinner", () => {
  const forslag = utledForslag(
    [
      {
        ...basis,
        planlagt14d: 4,
        fullfort14d: 2, // 50 % → score ~0,17
        dagerSidenInnlogging: 28, // score ~0,93 → vinner
      },
    ],
    new Set(),
  );
  assert.equal(forslag.length, 1);
  assert.equal(forslag[0].kilde, "inaktivitet");
});

test("pinnede spillere ekskluderes og maks 3 forslag returneres", () => {
  const mange: ForslagSignalInput[] = ["a", "b", "c", "d", "e"].map((id, i) => ({
    ...basis,
    playerId: id,
    navn: `Spiller ${id.toUpperCase()}`,
    dagerSidenInnlogging: 30 - i, // fallende alvorlighet: a > b > c > d > e
  }));
  const forslag = utledForslag(mange, new Set(["a"]));
  assert.equal(forslag.length, 3);
  assert.deepEqual(
    forslag.map((f) => f.playerId),
    ["b", "c", "d"],
  );
});

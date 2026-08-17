// Tester for sync-vaktbikkje — den rene ferskhetslogikken (datoer inn,
// brudd ut — ingen DB). Selve agent-kjøringen (Prisma-spørringer + varsling)
// dekkes ikke her; den følger runAgent-mønsteret som er testet via
// gfgk-ballplukking-agent.
//
// Samme fallgruve som de andre agent-testene: modulen under test importerer
// prisma + agent-notify, så begge mockes med t.mock.module() FØR dynamisk
// import — og modulen importeres kun én gang per fil.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

test("sync-vaktbikkje — ferskhetslogikk", async (t) => {
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {} } });
  t.mock.module("@/lib/agents/agent-notify", {
    namedExports: { varsleAgentFunn: async () => {} },
  });

  const {
    erTurneringssesong,
    turneringsGrenseTimer,
    finnFerskhetsBrudd,
    bruddTekst,
    GRENSE_SESONG_TIMER,
    GRENSE_UTENFOR_SESONG_TIMER,
  } = await import("@/lib/agents/sync-vaktbikkje");

  await t.test("sesong: april–oktober er sesong (Oslo-tid)", () => {
    assert.equal(erTurneringssesong(new Date("2026-04-01T10:00:00Z")), true);
    assert.equal(erTurneringssesong(new Date("2026-07-15T10:00:00Z")), true);
    assert.equal(erTurneringssesong(new Date("2026-10-20T10:00:00Z")), true);
    assert.equal(erTurneringssesong(new Date("2026-11-05T10:00:00Z")), false);
    assert.equal(erTurneringssesong(new Date("2026-01-15T10:00:00Z")), false);
    assert.equal(erTurneringssesong(new Date("2026-03-20T10:00:00Z")), false);
  });

  await t.test("sesong-grensen på Oslo-kalender, ikke UTC", () => {
    // 31. mars 23:30 UTC er 1. april 01:30 i Oslo (sommertid) → sesong.
    assert.equal(erTurneringssesong(new Date("2026-03-31T23:30:00Z")), true);
    // 31. oktober 23:30 UTC er 1. november 00:30 i Oslo (vintertid) → utenfor.
    assert.equal(erTurneringssesong(new Date("2026-10-31T23:30:00Z")), false);
  });

  await t.test("turneringsGrenseTimer: 48 t i sesong, 8 dager ellers", () => {
    assert.equal(
      turneringsGrenseTimer(new Date("2026-08-16T08:00:00Z")),
      GRENSE_SESONG_TIMER,
    );
    assert.equal(
      turneringsGrenseTimer(new Date("2026-12-16T08:00:00Z")),
      GRENSE_UTENFOR_SESONG_TIMER,
    );
    assert.equal(GRENSE_SESONG_TIMER, 48);
    assert.equal(GRENSE_UTENFOR_SESONG_TIMER, 192);
  });

  await t.test("fersk kilde gir ingen brudd", () => {
    const now = new Date("2026-08-16T08:00:00Z");
    const brudd = finnFerskhetsBrudd(
      [{ navn: "Turneringsrunder", sist: new Date("2026-08-15T06:00:00Z"), grenseTimer: 48 }],
      now,
    );
    assert.equal(brudd.length, 0);
  });

  await t.test("nøyaktig på grensen er IKKE brudd — først over", () => {
    const now = new Date("2026-08-16T08:00:00Z");
    const paaGrensen = finnFerskhetsBrudd(
      [{ navn: "K", sist: new Date("2026-08-14T08:00:00Z"), grenseTimer: 48 }],
      now,
    );
    assert.equal(paaGrensen.length, 0);
    const overGrensen = finnFerskhetsBrudd(
      [{ navn: "K", sist: new Date("2026-08-14T06:59:00Z"), grenseTimer: 48 }],
      now,
    );
    assert.equal(overGrensen.length, 1);
    assert.equal(overGrensen[0].timerSiden, 49);
  });

  await t.test("kilde uten data noensinne er brudd med timerSiden null", () => {
    const brudd = finnFerskhetsBrudd(
      [{ navn: "SG-baseline", sist: null, grenseTimer: 192 }],
      new Date("2026-08-16T08:00:00Z"),
    );
    assert.equal(brudd.length, 1);
    assert.equal(brudd[0].sist, null);
    assert.equal(brudd[0].timerSiden, null);
  });

  await t.test("flere kilder: kun de stale kommer tilbake", () => {
    const now = new Date("2026-08-16T08:00:00Z");
    const brudd = finnFerskhetsBrudd(
      [
        { navn: "Fersk", sist: new Date("2026-08-15T08:00:00Z"), grenseTimer: 48 },
        { navn: "Stale", sist: new Date("2026-08-01T08:00:00Z"), grenseTimer: 48 },
        { navn: "Ukesjobb OK", sist: new Date("2026-08-10T08:00:00Z"), grenseTimer: 192 },
      ],
      now,
    );
    assert.deepEqual(brudd.map((b) => b.navn), ["Stale"]);
    assert.equal(brudd[0].timerSiden, 15 * 24);
  });

  await t.test("bruddTekst er klarspråk med navn og siden-når", () => {
    const tekst = bruddTekst([
      {
        navn: "Turneringsrunder (GolfBox/DataGolf)",
        sist: new Date("2026-08-01T06:00:00Z"),
        grenseTimer: 48,
        timerSiden: 15 * 24 + 2,
      },
      { navn: "SG-baseline (DataGolf)", sist: null, grenseTimer: 192, timerSiden: null },
    ]);
    assert.match(tekst, /Turneringsrunder \(GolfBox\/DataGolf\)/);
    assert.match(tekst, /15 dager siden/);
    assert.match(tekst, /grensen er 2 døgn/);
    assert.match(tekst, /SG-baseline \(DataGolf\): har aldri levert data/);
  });
});

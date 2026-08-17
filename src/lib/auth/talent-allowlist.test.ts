/**
 * A3 · Talent-allowlisten — fail-closed-kontrakten for den låste profilen.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { erApenForTalent } from "@/lib/auth/talent-allowlist";

test("åpne flater: tester, stats, runder, datagolf, talent, booking, konto", () => {
  for (const rute of [
    "/portal",
    "/portal/tren/tester",
    "/portal/tren/tester/abc123/gjennomfor",
    "/portal/analysere",
    "/portal/statistikk/runder",
    "/portal/mal/runder/ny",
    "/portal/datagolf",
    "/portal/talent/mitt-niva",
    "/portal/booking/ny",
    "/portal/meg/abonnement",
    "/portal/varsler",
    "/portal/oppgrader",
  ]) {
    assert.equal(erApenForTalent(rute), true, `${rute} skal være åpen`);
  }
});

test("låste flater: planlegging, trening, live, AI, coach, trackman m.fl.", () => {
  for (const rute of [
    "/portal/planlegge",
    "/portal/planlegge/workbench",
    "/portal/tren",
    "/portal/tren/drills",
    "/portal/gjennomfore",
    "/portal/ai",
    "/portal/coach/melding",
    "/portal/trackman",
    "/portal/gameplan",
    "/portal/utviklingsplan",
    "/portal/kalender",
  ]) {
    assert.equal(erApenForTalent(rute), false, `${rute} skal være låst`);
  }
});

test("«/portal» alene er eksakt match — undertrær arver IKKE hjem-åpningen", () => {
  assert.equal(erApenForTalent("/portal"), true);
  assert.equal(erApenForTalent("/portal/"), true);
  assert.equal(erApenForTalent("/portal/hemmelig-ny-rute"), false);
});

test("prefiks-match krever segmentgrense (ikke /portal/tren/testere-lignende)", () => {
  assert.equal(erApenForTalent("/portal/tren/testerx"), false);
  assert.equal(erApenForTalent("/portal/megx"), false);
});

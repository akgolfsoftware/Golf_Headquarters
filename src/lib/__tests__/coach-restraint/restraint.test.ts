// Rene enhetstester for restraint-motoren — ingen mocks (null I/O i modulene).
import { test } from "node:test";
import assert from "node:assert/strict";
import { computePlayerBand, findExceedances, MIN_SAMPLE } from "@/lib/coach-restraint/bands";
import {
  decideFeedback,
  initialState,
  isNoFeedbackBlock,
  registerSelfEstimate,
  registerShot,
} from "@/lib/coach-restraint/engine";
import { fromTrackManShot } from "@/lib/coach-restraint/shot-events";
import type { ShotEvent } from "@/lib/coach-restraint/shot-events";

// ── bands ────────────────────────────────────────────────────────────────────

test("bånd krever minst MIN_SAMPLE slag", () => {
  assert.equal(computePlayerBand("carry", Array(MIN_SAMPLE - 1).fill(150)), null);
  assert.notEqual(computePlayerBand("carry", Array(MIN_SAMPLE).fill(150).map((v, i) => v + i)), null);
});

test("båndet krymper når spilleren blir mer konsistent", () => {
  const spredt = computePlayerBand("carry", [140, 145, 150, 155, 160, 165, 170, 175]);
  const jevn = computePlayerBand("carry", [148, 149, 150, 150, 151, 151, 152, 152]);
  assert.ok(spredt && jevn);
  assert.ok(jevn.halfWidth < spredt.halfWidth);
});

test("båndet klampes mot gulv og tak fra PARAM_THRESHOLDS", () => {
  // Ekstremt jevn → gulvet (carry-nivå 1 = 4 m) hindrer null-bredde
  const jevn = computePlayerBand("carry", Array(10).fill(150));
  assert.equal(jevn?.halfWidth, 4);
  // Ekstremt spredt → taket (carry-nivå 4 = 14 m) hindrer meningsløst bredt bånd
  const vill = computePlayerBand("carry", [100, 200, 100, 200, 100, 200, 100, 200]);
  assert.equal(vill?.halfWidth, 14);
});

test("findExceedances flagger kun utenfor bånd, verste først", () => {
  const bands = [
    { metric: "carry" as const, center: 150, halfWidth: 5, sampleSize: 10 },
    { metric: "side" as const, center: 0, halfWidth: 4, sampleSize: 10 },
  ];
  const ex = findExceedances(bands, { carry: 153, side: 12 });
  assert.equal(ex.length, 1);
  assert.equal(ex[0].metric, "side");
  assert.equal(ex[0].severity, 3);
});

// ── engine ───────────────────────────────────────────────────────────────────

const BAND = [{ metric: "carry" as const, center: 150, halfWidth: 5, sampleSize: 10 }];
const skudd = (carry: number): ShotEvent => ({
  source: "trackman-import",
  club: "7-jern",
  at: new Date("2026-07-27T10:00:00Z"),
  metrics: { carry },
});

test("aldri feedback midt i en blokk — selv ved store avvik", () => {
  let state = initialState();
  state = registerShot(state, skudd(200), BAND); // grovt avvik, slag 1 av 5
  const verdict = decideFeedback(state);
  assert.equal(verdict.decision, "SILENT");
});

test("blokk innenfor bånd → fortsatt stillhet, ny blokk rulles", () => {
  let state = initialState();
  for (let i = 0; i < 5; i++) state = registerShot(state, skudd(150), BAND);
  const verdict = decideFeedback(state);
  assert.equal(verdict.decision, "SILENT");
  assert.equal(verdict.nextState.blocksCompleted, 1);
  assert.equal(verdict.nextState.shotsInBlock, 0);
});

test("blokk med avvik → selvestimat FØR data, deretter oppsummering", () => {
  let state = initialState();
  for (let i = 0; i < 5; i++) state = registerShot(state, skudd(170), BAND);

  const først = decideFeedback(state);
  assert.equal(først.decision, "ASK_SELF_ESTIMATE");
  assert.ok(først.exceedances.length > 0);

  // Uten selvestimat forblir vi i spørre-tilstand — data avsløres ikke
  const utenSvar = decideFeedback(først.nextState);
  assert.equal(utenSvar.decision, "ASK_SELF_ESTIMATE");

  const medSvar = decideFeedback(registerSelfEstimate(først.nextState));
  assert.equal(medSvar.decision, "OFFER_SUMMARY");
  assert.equal(medSvar.nextState.blocksCompleted, 1);
});

test("hver 4. blokk er planlagt stille — overstyrer båndavvik", () => {
  let state = initialState();
  // Fullfør 3 blokker innenfor bånd
  for (let b = 0; b < 3; b++) {
    for (let i = 0; i < 5; i++) state = registerShot(state, skudd(150), BAND);
    state = decideFeedback(state).nextState;
  }
  assert.equal(isNoFeedbackBlock(state), true);
  for (let i = 0; i < 5; i++) state = registerShot(state, skudd(200), BAND);
  const verdict = decideFeedback(state);
  assert.equal(verdict.decision, "NO_FEEDBACK_BLOCK");
  assert.equal(verdict.exceedances.length, 0); // ingen tall lekker
});

test("oppsummering begrenses til de 2 verste avvikene", () => {
  const bands = [
    { metric: "carry" as const, center: 150, halfWidth: 5, sampleSize: 10 },
    { metric: "side" as const, center: 0, halfWidth: 4, sampleSize: 10 },
    { metric: "smash" as const, center: 1.45, halfWidth: 0.02, sampleSize: 10 },
  ];
  let state = initialState();
  for (let i = 0; i < 5; i++) {
    state = registerShot(state, {
      source: "live",
      club: null,
      at: new Date("2026-07-27T10:00:00Z"),
      metrics: { carry: 170, side: 15, smash: 1.3 },
    }, bands);
  }
  state = registerSelfEstimate(decideFeedback(state).nextState);
  const verdict = decideFeedback(state);
  assert.equal(verdict.decision, "OFFER_SUMMARY");
  assert.equal(verdict.exceedances.length, 2);
});

// ── shot-events ──────────────────────────────────────────────────────────────

test("fromTrackManShot mapper felter og hopper over null", () => {
  const event = fromTrackManShot(
    {
      club: "Driver",
      createdAt: null,
      carryDistance: 240,
      side: -8,
      ballSpeed: null,
      launchAngle: 12.5,
      spinRate: 2600,
      smashFactor: 1.48,
    },
    new Date("2026-07-27T09:00:00Z"),
  );
  assert.equal(event.source, "trackman-import");
  assert.equal(event.metrics.carry, 240);
  assert.equal(event.metrics.smash, 1.48);
  assert.equal("ballSpeed" in event.metrics, false);
  assert.equal(event.at.toISOString(), "2026-07-27T09:00:00.000Z");
});

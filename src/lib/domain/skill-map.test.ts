/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/skill-map.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildSkillMapData, type SkillMapRound } from "./skill-map";

function round(input: Partial<SkillMapRound>): SkillMapRound {
  return {
    playedAt: input.playedAt ?? new Date("2026-09-01T00:00:00Z"),
    sgTee: input.sgTee ?? null,
    sgApp200: input.sgApp200 ?? null,
    sgApp150: input.sgApp150 ?? null,
    sgApp100: input.sgApp100 ?? null,
    sgApp50: input.sgApp50 ?? null,
    sgChip: input.sgChip ?? null,
    sgPitch: input.sgPitch ?? null,
    sgLob: input.sgLob ?? null,
    sgBunker: input.sgBunker ?? null,
    sgPutt0_3: input.sgPutt0_3 ?? null,
    sgPutt3_5: input.sgPutt3_5 ?? null,
    sgPutt5_10: input.sgPutt5_10 ?? null,
    sgPutt10_15: input.sgPutt10_15 ?? null,
    sgPutt15_25: input.sgPutt15_25 ?? null,
    sgPutt25_40: input.sgPutt25_40 ?? null,
    sgPutt40plus: input.sgPutt40plus ?? null,
  };
}

test("bygger soner fra granulære SG-felt uten å fabrikere manglende tall", () => {
  const data = buildSkillMapData(
    [
      round({ sgTee: -0.4, sgApp150: 0.2 }),
      round({ sgTee: -0.2, sgApp150: null }),
    ],
    [],
  );

  const tee = data.zones.find((zone) => zone.id === "TEE_TOTAL");
  const innspill150 = data.zones.find((zone) => zone.id === "INNSPILL_150");
  const chip = data.zones.find((zone) => zone.id === "CHIP");

  assert.equal(tee?.sg, -0.3);
  assert.equal(tee?.valueCount, 2);
  assert.equal(innspill150?.sg, 0.2);
  assert.equal(innspill150?.valueCount, 1);
  assert.equal(chip?.sg, null);
  assert.equal(chip?.dataStatus, "mangler");
});

test("slår sammen 10-15 og 15-25 fot til kanonisk 10-25-sone", () => {
  const data = buildSkillMapData(
    [
      round({ playedAt: new Date("2026-09-02T00:00:00Z"), sgPutt10_15: 0.1, sgPutt15_25: null }),
      round({ playedAt: new Date("2026-09-01T00:00:00Z"), sgPutt10_15: -0.2, sgPutt15_25: -0.4 }),
    ],
    [],
  );

  const zone = data.zones.find((z) => z.id === "PUTT_10_25");
  assert.deepEqual(zone?.trend, [-0.3, 0.1]);
  assert.equal(zone?.sg, -0.1);
});

test("kobler brede treningsøkter til sonene uten å gi dem falsk presisjon", () => {
  const data = buildSkillMapData(
    [round({ sgChip: -0.8 })],
    [
      { skillArea: "AROUND_GREEN", durationMin: 45 },
      { skillArea: "AROUND_GREEN", durationMin: 30 },
      { skillArea: "PUTTING", durationMin: 25 },
      { skillArea: "SPILL", durationMin: 90 },
    ],
  );

  const chip = data.zones.find((zone) => zone.id === "CHIP");
  const putt03 = data.zones.find((zone) => zone.id === "PUTT_0_3");

  assert.equal(chip?.trainingSessions, 2);
  assert.equal(chip?.trainingMinutes, 75);
  assert.equal(putt03?.trainingSessions, 1);
  assert.equal(putt03?.trainingMinutes, 25);
});

test("finner sterkeste og svakeste område fra soner med SG", () => {
  const data = buildSkillMapData(
    [
      round({ sgTee: 0.5, sgApp200: -0.7, sgBunker: -0.1 }),
      round({ sgTee: 0.3, sgApp200: -0.3, sgBunker: 0.1 }),
    ],
    [],
  );

  assert.equal(data.summary.strongestZoneId, "TEE_TOTAL");
  assert.equal(data.summary.weakestZoneId, "INNSPILL_200");
});

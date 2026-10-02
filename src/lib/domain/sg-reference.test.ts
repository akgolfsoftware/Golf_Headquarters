import assert from "node:assert/strict";
import { test } from "node:test";
import type { AkSgBaselinePoint } from "@/lib/domain/ak-sg";

const POINTS: AkSgBaselinePoint[] = [
  ...(["tee", "fairway", "rough", "bunker", "recovery", "green"] as const).flatMap((lie) => [
    { lie, distanceM: 10, expectedStrokes: 1.5 },
    { lie, distanceM: 50, expectedStrokes: 2.5 },
  ]),
];

test("appens SG-referanse kommer fra aktiv kurve og avviser gamle PGA-sett", async (t) => {
  let active: { versionId: string; points: AkSgBaselinePoint[] } | null = null;
  t.mock.module("@/lib/ak-sg/active-model", {
    namedExports: {
      loadActiveAkSgModel: async () => active,
    },
  });

  const {
    hentPublisertSgReferanse,
    hentSgReferanseForRunde,
    mapAkSgPointsToPlayerApp,
  } = await import("@/lib/domain/sg-reference");

  assert.equal(await hentPublisertSgReferanse(), null);
  assert.equal(await hentSgReferanseForRunde("legacy-pga-set"), null);

  const mapped = mapAkSgPointsToPlayerApp(POINTS);
  assert.ok(mapped.some((point) => point.phase === "OTT" && point.lie === "TEE" && point.teePar === 4));
  assert.ok(mapped.some((point) => point.phase === "ARG" && point.lie === "FAIRWAY" && point.distanceM === 10));
  assert.ok(mapped.some((point) => point.phase === "APP" && point.lie === "ROUGH" && point.distanceM === 50));
  assert.ok(mapped.some((point) => point.phase === "ARG" && point.lie === "TREES"));
  assert.ok(mapped.some((point) => point.phase === "PUTT" && point.lie === "GREEN"));

  active = { versionId: "ak-model-v1", points: POINTS };
  const published = await hentPublisertSgReferanse();
  assert.equal(published?.id, "ak-model-v1");
  assert.equal(published?.levelCode, "AK_BASELINE");
  assert.equal((await hentSgReferanseForRunde(null, "ak-model-v1"))?.id, "ak-model-v1");
  assert.equal(await hentSgReferanseForRunde(null, "old-model-v0"), null);
});

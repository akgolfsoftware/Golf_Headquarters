import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRepKey,
  parseRepKey,
  formatRepLabel,
  SHORT_GAME_TARGETS,
  PUTTING_TARGETS,
  REPETITION_AREAS,
  REPETITION_TYPES,
} from "@/lib/domain/workbench/reps";

test("buildRepKey og parseRepKey håndterer hastigheter og typer", () => {
  // Full speed (standard)
  assert.equal(buildRepKey("iron-7", "FULL_SPEED"), "iron-7");
  assert.deepEqual(parseRepKey("iron-7"), { baseId: "iron-7", repType: "FULL_SPEED" });

  // Low speed
  assert.equal(buildRepKey("chip", "LOW_SPEED"), "chip:low_speed");
  assert.deepEqual(parseRepKey("chip:low_speed"), { baseId: "chip", repType: "LOW_SPEED" });

  // Dry swings (tørrsving)
  assert.equal(buildRepKey("driver", "DRY"), "driver:dry");
  assert.deepEqual(parseRepKey("driver:dry"), { baseId: "driver", repType: "DRY" });
});

test("formatRepLabel gir presise etiketter på norsk", () => {
  assert.equal(formatRepLabel("7-jern", "FULL_SPEED"), "7-jern");
  assert.equal(formatRepLabel("Chip", "LOW_SPEED"), "Chip (lav fart)");
  assert.equal(formatRepLabel("Kortputt", "DRY"), "Kortputt (tørrsving)");
  assert.equal(formatRepLabel("Driver", null), "Driver");
});

test("domenedefinisjoner inneholder alle påkrevde kategorier og områder", () => {
  assert.equal(REPETITION_AREAS.length, 3);
  const areaIds = REPETITION_AREAS.map((a) => a.id);
  assert.ok(areaIds.includes("FULL_SVING"));
  assert.ok(areaIds.includes("NAERSPILL"));
  assert.ok(areaIds.includes("PUTTING"));

  const shortGameIds = SHORT_GAME_TARGETS.map((s) => s.baseId);
  assert.ok(shortGameIds.includes("chip"));
  assert.ok(shortGameIds.includes("pitch"));
  assert.ok(shortGameIds.includes("lob"));
  assert.ok(shortGameIds.includes("bunker"));

  const puttIds = PUTTING_TARGETS.map((p) => p.baseId);
  assert.ok(puttIds.includes("putt-greenlesing"));
  assert.ok(puttIds.includes("putt-sikte"));
  assert.ok(puttIds.includes("putt-ballstart"));
  assert.ok(puttIds.includes("putt-lengdekontroll"));
  assert.ok(puttIds.includes("putt-kort"));
  assert.ok(puttIds.includes("putt-mellom"));
  assert.ok(puttIds.includes("putt-lang"));

  const typeIds = REPETITION_TYPES.map((t) => t.id);
  assert.ok(typeIds.includes("FULL_SPEED"));
  assert.ok(typeIds.includes("LOW_SPEED"));
  assert.ok(typeIds.includes("DRY"));
});

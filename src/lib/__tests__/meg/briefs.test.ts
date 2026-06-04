import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as briefs from "@/lib/meg/briefs";

describe("Fase 6 — brief-motor", () => {
  it("eksporterer de fire brief-funksjonene", () => {
    for (const fn of ["runMorgenbrief", "runKveldsjournal", "runLoftesjekk", "runCrmNudge"]) {
      assert.equal(typeof (briefs as Record<string, unknown>)[fn], "function", `mangler ${fn}`);
    }
  });
});

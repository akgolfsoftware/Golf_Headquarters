// Tester for Plan Revision-agent.
//
// Kjør med:
//   npx tsx --test src/lib/__tests__/ai/plan-revision.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  PLAN_REVISION_SYSTEM,
  type PlanRevisionTrigger,
  type PlanRevisionForslag,
  type PlanRevisionEndring,
} from "@/lib/ai/agents/plan-revision";

describe("Plan Revision — system-prompt", () => {
  it("krever endring + pyramide-akse + rasjonale + varighet", () => {
    assert.ok(PLAN_REVISION_SYSTEM.includes("endring"));
    assert.ok(PLAN_REVISION_SYSTEM.includes("Pyramide-akse"));
    assert.ok(PLAN_REVISION_SYSTEM.includes("Rasjonale"));
    assert.ok(PLAN_REVISION_SYSTEM.includes("varighet"));
  });

  it("nevner norsk bokmål", () => {
    assert.ok(/[Nn]orsk\s+bokmål/.test(PLAN_REVISION_SYSTEM));
  });

  it("inneholder skills-kunnskap", () => {
    assert.ok(PLAN_REVISION_SYSTEM.includes("KUNNSKAP"));
  });
});

describe("Plan Revision — type-shape", () => {
  it("trigger har 3 lovlige varianter", () => {
    const triggers: PlanRevisionTrigger[] = [
      "siste-runde",
      "skade-flagg",
      "turnering-prep",
    ];
    assert.equal(triggers.length, 3);
  });

  it("PlanRevisionEndring har riktig form", () => {
    const e: PlanRevisionEndring = {
      endring: "Øk SLAG-fokus",
      pyramideAkser: ["SLAG"],
      rasjonale: "Siste runde svak SG-OTT",
      varighet: "2 uker",
    };
    assert.equal(e.pyramideAkser[0], "SLAG");
    assert.ok(e.varighet.length > 0);
  });

  it("PlanRevisionForslag fungerer som retur-type", () => {
    const f: PlanRevisionForslag = {
      planId: "p1",
      trigger: "siste-runde",
      spillerId: "s1",
      spillerNavn: "Test",
      endringer: [
        {
          endring: "Test",
          pyramideAkser: ["FYS"],
          rasjonale: "Test",
          varighet: "1 uke",
        },
      ],
      samletAnbefaling: "Test",
    };
    assert.equal(f.endringer.length, 1);
    assert.equal(f.trigger, "siste-runde");
  });
});

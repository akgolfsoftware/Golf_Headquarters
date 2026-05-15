/**
 * Unit-test: PlanForslag schema-validering.
 *
 * Kjøres med node:test + tsx:
 *   npx tsx --test src/lib/__tests__/plan-template-schema.test.ts
 *
 * Verifiserer at validerPlanForslag aksepterer gyldig payload og rejekter
 * ugyldig.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { validerPlanForslag } from "../ai-plan/schema";

const VALID_PAYLOAD = {
  navn: "Pre-sesong wedge-fokus",
  beskrivelse: "Fire ukers plan med wedge og putting.",
  periodeUker: 4,
  fokusOmrader: ["Wedge 50-100m", "Putting innenfor 3m"],
  okter: [
    {
      uke: 1,
      dag: "MAN",
      type: "NARESPILL",
      varighetMin: 60,
      fokus: "Wedge 50m",
      skillArea: "AROUND_GREEN",
      environment: "RANGE",
      lPhase: "SPESIAL",
      drills: [
        { navn: "30 baller fra 50m", sets: 3, reps: 10, csTarget: 70 },
      ],
    },
  ],
};

test("validerPlanForslag aksepterer gyldig payload", () => {
  const res = validerPlanForslag(VALID_PAYLOAD);
  assert.equal(res.ok, true, "Valid payload skal parse");
  if (res.ok) {
    assert.equal(res.data.navn, "Pre-sesong wedge-fokus");
    assert.equal(res.data.periodeUker, 4);
    assert.equal(res.data.okter.length, 1);
    assert.equal(res.data.okter[0].skillArea, "AROUND_GREEN");
  }
});

test("validerPlanForslag avviser ikke-objekt", () => {
  const res = validerPlanForslag(null);
  assert.equal(res.ok, false);
});

test("validerPlanForslag avviser manglende navn", () => {
  const bad = { ...VALID_PAYLOAD, navn: "" };
  const res = validerPlanForslag(bad);
  assert.equal(res.ok, false);
});

test("validerPlanForslag avviser ugyldig periodeUker", () => {
  const bad = { ...VALID_PAYLOAD, periodeUker: 99 };
  const res = validerPlanForslag(bad);
  assert.equal(res.ok, false);
});

test("validerPlanForslag avviser ugyldig økt-dag", () => {
  const bad = {
    ...VALID_PAYLOAD,
    okter: [{ ...VALID_PAYLOAD.okter[0], dag: "FOO" }],
  };
  const res = validerPlanForslag(bad);
  assert.equal(res.ok, false);
});

test("validerPlanForslag avviser tom drill uten navn", () => {
  const bad = {
    ...VALID_PAYLOAD,
    okter: [
      {
        ...VALID_PAYLOAD.okter[0],
        drills: [{ sets: 3 } as unknown as { navn: string }],
      },
    ],
  };
  const res = validerPlanForslag(bad);
  assert.equal(res.ok, false);
});

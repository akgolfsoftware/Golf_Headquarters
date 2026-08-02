import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GOLF_PROMPT } from "./transcribe";

/** Kanon-termer fra for-under-etter-spec §9 — må være i Whisper-glossaret. */
const PAAKREVDE_TERMER = [
  "P1.0",
  "P6.0",
  "P10.0",
  "CS20",
  "CS50",
  "CS60",
  "CS100",
  "L-KROPP",
  "L-ARM",
  "L-KØLLE",
  "L-BALL",
  "L-AUTO",
  "M0",
  "M2",
  "M5",
  "PR1",
  "PR5",
  "Mini",
  "Knøtt",
  "Basis",
  "Utvikling",
  "Elite",
  "FYS",
  "TEK",
  "SLAG",
  "SPILL",
  "TURN",
  "GRUNN",
  "Kategori",
] as const;

describe("GOLF_PROMPT (Whisper AK-glossar)", () => {
  it("inneholder AK/MORAD-kanon fra spec §9", () => {
    for (const term of PAAKREVDE_TERMER) {
      assert.ok(
        GOLF_PROMPT.includes(term),
        `mangler term i GOLF_PROMPT: ${term}`,
      );
    }
  });

  it("er norsk coaching-kontekst, ikke bare engelske svingtermer", () => {
    assert.match(GOLF_PROMPT, /Norsk golfcoaching/i);
    // Bevisst fjernet som eneste fokus: pure english swing jargon without AK
    assert.ok(!GOLF_PROMPT.includes("smash factor"));
    assert.ok(!GOLF_PROMPT.includes("swing path"));
  });

  it("holder seg under Whisper-praktisk maks (~900 tegn)", () => {
    // ~224 tokens ≈ grovt 800–900 tegn; hard fail over 1000 så vi merker bloat.
    assert.ok(
      GOLF_PROMPT.length <= 1000,
      `GOLF_PROMPT for lang: ${GOLF_PROMPT.length} tegn`,
    );
  });
});

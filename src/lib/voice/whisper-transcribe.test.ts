import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseVoiceRangeNote } from "./whisper-transcribe";

describe("Whisper Voice Range Parser", () => {
  it("gjenkjenner kølle, P-posisjon og reps fra talebeskjed", () => {
    const text = "Spiller slår med 7-jern. Litt for åpen kølle i P6 levering. Kjør 20 reps rolig for å kjenne vinkelen.";
    const result = parseVoiceRangeNote(text);

    assert.equal(result.club, "7-jern");
    assert.equal(result.position, "P6");
    assert.equal(result.positionName, "Levering / Delivery");
    assert.ok(result.suggestedReps != null);
    assert.equal(result.suggestedReps.lav, 20);
  });

  it("gjenkjenner Driver og topp av baksving (P4)", () => {
    const text = "På Driver ser vi litt overrotasjon på toppen av baksvingen. Gjør 15 reps tørrtrening foran speil.";
    const result = parseVoiceRangeNote(text);

    assert.equal(result.club, "Driver");
    assert.equal(result.position, "P4");
    assert.equal(result.positionName, "Topp av baksving");
    assert.ok(result.suggestedReps != null);
    assert.equal(result.suggestedReps.dry, 15);
  });

  it("gjenkjenner Wedge og trefføyeblikk (P7)", () => {
    const text = "Sand wedge på 50 meter. Sørg for at hender leder foran ball i impact.";
    const result = parseVoiceRangeNote(text);

    assert.equal(result.club, "Sand Wedge");
    assert.equal(result.position, "P7");
    assert.equal(result.positionName, "Trefføyeblikk / Impact");
  });

  it("håndterer tom eller uklar tekst uten krasj", () => {
    const result = parseVoiceRangeNote("");
    assert.equal(result.club, null);
    assert.equal(result.position, null);
  });
});

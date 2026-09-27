import { test } from "node:test";
import assert from "node:assert/strict";
import { vaskMotRelevans } from "@/lib/domain/omrade-relevans";

/**
 * Vakt for de tre nye feltene (22.09): felt som ikke gjelder området skal
 * aldri lagres, uansett hva klienten sender. Speiler `vasketeAkser` i
 * actions.ts, som ikke kan importeres direkte ("use server").
 */
test("læringssteg lagres bare for full sving", () => {
  const putt = vaskMotRelevans({
    omraade: "PUTT_3_5",
    motorikk: "LAV_HAST",
    belastning: "BANE",
    press: "ALENE",
    dimensjon: "BALLSTART",
    sandTrinn: null,
  });
  assert.equal(putt.motorikk, null, "putting har ingen læringssteg");
  assert.equal(putt.dimensjon, "BALLSTART", "teknisk fokus gjelder putting");

  const tee = vaskMotRelevans({
    omraade: "TEE_TOTAL",
    motorikk: "LAV_HAST",
    belastning: "BANE",
    press: "ALENE",
    dimensjon: "SIKTE",
    sandTrinn: null,
  });
  assert.equal(tee.motorikk, "LAV_HAST");
});

test("teknisk fokus som ikke hører til området forkastes", () => {
  const chip = vaskMotRelevans({
    omraade: "CHIP",
    motorikk: null,
    belastning: "TRENINGSOMRAADE",
    press: "OBSERVERT",
    dimensjon: "GREENLESING",
    sandTrinn: null,
  });
  assert.equal(chip.dimensjon, null, "greenlesing gjelder ikke chip");
});

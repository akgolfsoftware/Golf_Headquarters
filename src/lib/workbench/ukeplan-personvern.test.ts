import assert from "node:assert/strict";
import { test } from "node:test";
import { anonymiserUkeplandetaljer } from "./ukeplan-personvern";
import { tommeUkeplandetaljer, UKEPLAN_OMRADER, UKEPLAN_TYPER } from "./ukeplan-schema";

test("validerte v1-budsjetter/enum bevares og ALL fritekst fjernes idempotent", () => {
  for (const type of UKEPLAN_TYPER) {
    const details = tommeUkeplandetaljer();
    details.weekType = type.id; details.location = "Syntetisk opphold";
    for (const area of UKEPLAN_OMRADER) details.areas[area] = {
      priority: "UTVIKLE", sessionBudget: area === "TURN" ? 0 : 3, focus: `Syntetisk fritekst ${area}`,
    };
    const before = structuredClone(details);
    const washed = anonymiserUkeplandetaljer(details); assert.ok(washed);
    assert.equal(washed.version, 1); assert.equal(washed.weekType, type.id); assert.equal(washed.location, null);
    for (const area of UKEPLAN_OMRADER) {
      assert.equal(washed.areas[area].focus, null);
      assert.equal(washed.areas[area].priority, "UTVIKLE");
      assert.equal(washed.areas[area].sessionBudget, details.areas[area].sessionBudget);
    }
    assert.deepEqual(anonymiserUkeplandetaljer(washed), washed);
    assert.deepEqual(details, before, "kilden muteres ikke");
    assert.doesNotMatch(JSON.stringify(washed), /Syntetisk/);
  }
});

test("ukjent versjon, skjult fritekst og ugyldige metadata fjernes i sin helhet", () => {
  const valid = tommeUkeplandetaljer();
  for (const value of [null, undefined, "fritekst", [], { ...valid, version: 2 },
    { ...valid, freeText: "Syntetisk tekst" }, { ...valid, areas: { ...valid.areas, TEK: { priority: "FEIL", sessionBudget: 2, focus: "Tekst" } } },
    { ...valid, areas: { ...valid.areas, TURN: { ...valid.areas.TURN, sessionBudget: -1 } } },
  ]) assert.equal(anonymiserUkeplandetaljer(value), null);
});

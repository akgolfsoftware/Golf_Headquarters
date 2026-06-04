import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MEG_ALL_TOOLS, MEG_EXEC_BY_NAME } from "@/lib/meg/tools";

describe("Fase 3 — Notion- og helse-verktøy", () => {
  it("registrerer alle Notion- og helse-verktøy", () => {
    const names = MEG_ALL_TOOLS.map((t) => t.name);
    for (const n of [
      "notion_sok",
      "notion_les_side",
      "notion_oppgaver",
      "notion_opprett_oppgave",
      "notion_fullfor_oppgave",
      "helse_hent",
    ]) {
      assert.ok(names.includes(n), `mangler verktøy: ${n}`);
      assert.equal(typeof MEG_EXEC_BY_NAME[n], "function", `mangler executor: ${n}`);
    }
  });

  it("skrive-verktøy krever sine argumenter", () => {
    const opprett = MEG_ALL_TOOLS.find((t) => t.name === "notion_opprett_oppgave");
    assert.deepEqual(opprett?.input_schema.required, ["tittel"]);
    const fullfor = MEG_ALL_TOOLS.find((t) => t.name === "notion_fullfor_oppgave");
    assert.deepEqual(fullfor?.input_schema.required, ["pageId", "status"]);
  });
});

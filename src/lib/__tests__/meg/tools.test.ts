import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MEG_ALL_TOOLS, MEG_EXEC_BY_NAME } from "@/lib/meg/tools";

describe("MEG_ALL_TOOLS", () => {
  it("inneholder logg og hent_nylige", () => {
    const names = MEG_ALL_TOOLS.map((t) => t.name);
    assert.ok(names.includes("logg"));
    assert.ok(names.includes("hent_nylige"));
  });

  it("logg-tool har required kind og summary", () => {
    const logg = MEG_ALL_TOOLS.find((t) => t.name === "logg");
    assert.ok(logg);
    assert.deepEqual(logg.input_schema.required, ["kind", "summary"]);
  });

  it("hent_nylige-tool har ingen required", () => {
    const tool = MEG_ALL_TOOLS.find((t) => t.name === "hent_nylige");
    assert.ok(tool);
    assert.deepEqual(tool.input_schema.required, []);
  });
});

describe("MEG_EXEC_BY_NAME", () => {
  it("har executor for hvert tool", () => {
    for (const tool of MEG_ALL_TOOLS) {
      assert.ok(
        typeof MEG_EXEC_BY_NAME[tool.name] === "function",
        `mangler executor for ${tool.name}`,
      );
    }
  });
});

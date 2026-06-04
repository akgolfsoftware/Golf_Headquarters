import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MEG_ALL_TOOLS, MEG_EXEC_BY_NAME } from "@/lib/meg/tools";

describe("sok_minne tool", () => {
  it("er registrert i MEG_ALL_TOOLS", () => {
    const t = MEG_ALL_TOOLS.find((x) => x.name === "sok_minne");
    assert.ok(t);
    assert.deepEqual(t.input_schema.required, ["query"]);
  });

  it("har executor i MEG_EXEC_BY_NAME", () => {
    assert.equal(typeof MEG_EXEC_BY_NAME["sok_minne"], "function");
  });
});

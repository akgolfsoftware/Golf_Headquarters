import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { workbenchRedirectForTrenPath } from "@/lib/portal/tren-workbench-redirect";

describe("workbenchRedirectForTrenPath", () => {
  it("redirects planning module roots to workbench tabs", () => {
    assert.equal(
      workbenchRedirectForTrenPath("/portal/tren/aarsplan"),
      "/portal/planlegge/workbench?tab=gantt",
    );
    assert.equal(
      workbenchRedirectForTrenPath("/portal/tren/teknisk-plan/abc"),
      "/portal/planlegge/workbench?tab=tek",
    );
    assert.equal(
      workbenchRedirectForTrenPath("/portal/tren/turneringer"),
      "/portal/planlegge/workbench?tab=seson",
    );
  });

  it("keeps live session routes (cuid)", () => {
    assert.equal(
      workbenchRedirectForTrenPath("/portal/tren/cmj7k8x9y0000abcdefghij"),
      null,
    );
    assert.equal(
      workbenchRedirectForTrenPath("/portal/tren/cmj7k8x9y0000abcdefghij/planlagt"),
      null,
    );
  });

  it("keeps tester wizard and execution paths", () => {
    assert.equal(workbenchRedirectForTrenPath("/portal/tren/tester/ny"), null);
    assert.equal(
      workbenchRedirectForTrenPath("/portal/tren/tester/cmj7k8x9y0000abcdefghij"),
      null,
    );
  });
});
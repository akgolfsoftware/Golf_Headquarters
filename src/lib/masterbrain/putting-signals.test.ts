import { test } from "node:test";
import assert from "node:assert/strict";
import { derivePuttingFocus } from "./putting-signals";

test("empty signals → unknown low confidence", () => {
  const f = derivePuttingFocus({
    sgPutt: null,
    makePctInside8: null,
    threePuttRate: null,
    tags: [],
    level: null,
  });
  assert.equal(f.primary, "unknown");
  assert.equal(f.confidence, "low");
});

test("high 3-putt → distance_control", () => {
  const f = derivePuttingFocus({
    sgPutt: -0.5,
    makePctInside8: 0.9,
    threePuttRate: 0.25,
    tags: [],
    level: "C",
  });
  assert.equal(f.primary, "distance_control");
  assert.ok(f.fasitQueryTags.includes("putting"));
});

test("low make inside 8 → start_line/aim", () => {
  const f = derivePuttingFocus({
    sgPutt: 0,
    makePctInside8: 0.6,
    threePuttRate: 0.05,
    tags: ["sikte"],
    level: null,
  });
  assert.ok(["start_line", "aim"].includes(f.primary));
});

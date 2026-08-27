import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { erSynligForForelder, fornavnAv } from "./forelder-neste-okt";

describe("forelder-neste-okt · fornavnAv", () => {
  it("returnerer kun fornavn", () => {
    assert.equal(fornavnAv("Filip Hagen"), "Filip");
    assert.equal(fornavnAv("  Øyvind Rohjan  "), "Øyvind");
  });
});

describe("forelder-neste-okt · erSynligForForelder", () => {
  it("DRAFT er usynlig", () => {
    assert.equal(erSynligForForelder("DRAFT"), false);
  });

  it("PUBLISHED og IN_PROGRESS er synlige", () => {
    assert.equal(erSynligForForelder("PUBLISHED"), true);
    assert.equal(erSynligForForelder("IN_PROGRESS"), true);
  });

  it("COMPLETED / CANCELLED / SKIPPED er ikke neste økt", () => {
    assert.equal(erSynligForForelder("COMPLETED"), false);
    assert.equal(erSynligForForelder("CANCELLED"), false);
    assert.equal(erSynligForForelder("SKIPPED"), false);
  });
});

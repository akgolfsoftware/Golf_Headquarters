import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { looksSimple } from "@/lib/meg/router";

describe("looksSimple", () => {
  it("godtar enkle datapunkter", () => {
    assert.equal(looksSimple("sov dårlig 5 timer"), true);
    assert.equal(looksSimple("trente bein i dag"), true);
    assert.equal(looksSimple("god stemning"), true);
  });

  it("avviser spørsmål", () => {
    assert.equal(looksSimple("hvordan var søvnen denne uka?"), false);
    assert.equal(looksSimple("hva står på lista mi"), false);
    assert.equal(looksSimple("når er neste møte?"), false);
  });

  it("avviser handlinger", () => {
    assert.equal(looksSimple("send e-post til Markus"), false);
    assert.equal(looksSimple("lag oppgave: ring banen"), false);
    assert.equal(looksSimple("minn meg på å betale faktura"), false);
  });

  it("avviser tomt og veldig lange meldinger", () => {
    assert.equal(looksSimple("   "), false);
    assert.equal(looksSimple("a".repeat(141)), false);
  });

  it("lar ikke et komplekst ord midt i et annet ord slå ut", () => {
    // "hvattenn" inneholder ikke " hva " som eget ord
    assert.equal(looksSimple("spiste laksefilet til middag"), true);
  });
});

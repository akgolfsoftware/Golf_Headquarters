import { test } from "node:test";
import assert from "node:assert/strict";
import { lesStallUrlState, skrivStallUrlState } from "./stall-url-state";

test("lesStallUrlState: tom query gir default-tilstand", () => {
  const s = lesStallUrlState(new URLSearchParams(""));
  assert.deepEqual(s, { filter: "alle", sok: "", valgtId: null });
});

test("lesStallUrlState: leser filter, søk og valgt spiller", () => {
  const s = lesStallUrlState(new URLSearchParams("f=wang&q=ole&v=p_123"));
  assert.deepEqual(s, { filter: "wang", sok: "ole", valgtId: "p_123" });
});

test("lesStallUrlState: ugyldig filter faller tilbake til alle (fail-closed, ikke krasj)", () => {
  const s = lesStallUrlState(new URLSearchParams("f=tull-fra-manipulert-url"));
  assert.equal(s.filter, "alle");
});

test("lesStallUrlState: tom v-parameter blir null, ikke tom streng", () => {
  const s = lesStallUrlState(new URLSearchParams("v="));
  assert.equal(s.valgtId, null);
});

test("skrivStallUrlState: default-tilstand gir tom query-string", () => {
  const qs = skrivStallUrlState({ filter: "alle", sok: "", valgtId: null });
  assert.equal(qs, "");
});

test("skrivStallUrlState: skriver kun de feltene som avviker fra default", () => {
  const qs = skrivStallUrlState({ filter: "gfgk", sok: "", valgtId: null });
  assert.equal(qs, "f=gfgk");
});

test("skrivStallUrlState: søketekst trimmes for tomt-sjekk, men verdien selv bevares", () => {
  const qs = skrivStallUrlState({ filter: "alle", sok: "  ole  ", valgtId: null });
  assert.equal(new URLSearchParams(qs).get("q"), "  ole  ");
});

test("skrivStallUrlState -> lesStallUrlState er en rundtur (idempotent)", () => {
  const original: import("./stall-url-state").StallUrlState = { filter: "wang", sok: "kari", valgtId: "p_9" };
  const qs = skrivStallUrlState(original);
  const tilbake = lesStallUrlState(new URLSearchParams(qs));
  assert.deepEqual(tilbake, original);
});

test("skrivStallUrlState: bevarer parametre den ikke eier (f.eks. fane fra andre lenker)", () => {
  const eksisterende = new URLSearchParams("fane=stall");
  const qs = skrivStallUrlState({ filter: "wang", sok: "", valgtId: null }, eksisterende);
  const p = new URLSearchParams(qs);
  assert.equal(p.get("fane"), "stall");
  assert.equal(p.get("f"), "wang");
});

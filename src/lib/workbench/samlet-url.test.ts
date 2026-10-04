import test from "node:test";
import assert from "node:assert/strict";
import { brukSamletWorkbench, klassiskWorkbenchUrl, parseWorkbenchFlate, samletSpillerUrl, samletWorkbenchUrl } from "./samlet-url";
import { parsePlanKontekst } from "./plan-kontekst";

const ref = { uke: "2026-10-05", aar: "2027", maned: "2026-10", periode: "periode-p1", okt: "okt-p1" };
test("alle fire flater beholder samme uke, planår, måned, periode og økt", () => {
  for (const flate of ["sesong", "uke", "bord", "analyse"] as const) {
    const url = new URL(samletWorkbenchUrl("p1", flate, ref), "https://test.invalid");
    assert.equal(url.searchParams.get("flate"), flate);
    for (const [key, value] of Object.entries(ref)) assert.equal(url.searchParams.get(key), value);
    assert.equal(parsePlanKontekst(url.searchParams).weekNumber, 41);
    assert.equal(parsePlanKontekst(url.searchParams).year, 2027);
  }
});
test("zoom og øktvalg endrer bare det eksplisitte valget i samme spillerkontekst", () => {
  const url = new URL(samletWorkbenchUrl("p1", "sesong", { okt: "okt-p1-b" }, "agency", ref, { niva: "periode" }), "https://test.invalid");
  assert.equal(url.searchParams.get("niva"), "periode");
  assert.equal(url.searchParams.get("okt"), "okt-p1-b");
  assert.equal(url.searchParams.get("uke"), ref.uke);
  assert.equal(url.searchParams.get("periode"), ref.periode);
});
test("spillerbytte beholder kalenderen uten andre spilleres periode- og økt-ID-er", () => {
  const url = new URL(samletSpillerUrl("p2", "uke", ref), "https://test.invalid");
  assert.equal(url.pathname, "/admin/workbench/p2");
  assert.equal(url.searchParams.get("uke"), ref.uke);
  assert.equal(url.searchParams.get("aar"), ref.aar);
  assert.equal(url.searchParams.get("maned"), ref.maned);
  assert.equal(url.searchParams.has("periode"), false);
  assert.equal(url.searchParams.has("okt"), false);
});
test("PlayerHQ-lenker har ingen klientstyrt spiller-ID i ruten", () => {
  assert.equal(new URL(samletWorkbenchUrl("annen", "bord", ref, "player"), "https://test.invalid").pathname, "/portal/planlegge/workbench");
});
test("historiske nivåer oversettes mens Live, egen kalender og målsetninger beholdes", () => {
  assert.equal(parseWorkbenchFlate(undefined, "aar"), "sesong");
  assert.equal(parseWorkbenchFlate(undefined, "periode"), "sesong");
  assert.equal(parseWorkbenchFlate(undefined, "stall"), "bord");
  assert.equal(parseWorkbenchFlate(undefined, "vol"), "analyse");
  assert.equal(parseWorkbenchFlate("ukjent", "uke"), "uke");
  for (const niva of ["live", "min", "malsetninger"]) assert.equal(brukSamletWorkbench({ niva }), false);
  assert.equal(brukSamletWorkbench({ vis: "live" }), false);
  assert.equal(brukSamletWorkbench({ vis: "min" }), false);
  assert.equal(brukSamletWorkbench({}), true);
  assert.equal(brukSamletWorkbench({ flate: "analyse", niva: "malsetninger" }), true);
  assert.equal(brukSamletWorkbench({ flate: "uke", klassisk: "1" }), false);
  assert.match(klassiskWorkbenchUrl("p1", "periode", ref), /klassisk=1$/);
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { byggSjekkpunktFraAnalyse } from "./fangst-sjekkpunkt-tekst";
import type { AnalyseResultat } from "@/lib/coaching-analysis";

const base: AnalyseResultat = {
  teknisk: "P6",
  taktisk: "Ikke spesielt fokus denne økten.",
  mental: "Ikke spesielt fokus denne økten.",
  fysisk: "Ikke spesielt fokus denne økten.",
  hjemmelekse: "2×20 L-BALL approach",
  coachAnalyse: "Bra tempo.",
  nesteOktAnbefaling: "CS60 L-BALL på approach",
  oppsummering: "Fokus approach.",
};

describe("byggSjekkpunktFraAnalyse", () => {
  it("prioriterer neste økt + hjemmelekse", () => {
    const t = byggSjekkpunktFraAnalyse(base);
    assert.match(t, /CS60/);
    assert.match(t, /Hjemmelekse/);
  });

  it("har fallback når alt er tomt", () => {
    const t = byggSjekkpunktFraAnalyse({
      ...base,
      hjemmelekse: "x",
      nesteOktAnbefaling: "y",
      oppsummering: "z",
    });
    assert.ok(t.length > 0);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  tolkTall,
  byggSgBaseline,
  erTomBaseline,
  TOMT_SG_SKJEMA,
} from "@/lib/onboarding/sg-baseline";

describe("tolkTall", () => {
  it("leser norsk komma som desimaltegn", () => {
    assert.equal(tolkTall("-1,25"), -1.25);
  });
  it("gir undefined for tomt felt — ikke 0", () => {
    assert.equal(tolkTall(""), undefined);
    assert.equal(tolkTall("   "), undefined);
  });
  it("gir undefined for tekst som ikke er tall", () => {
    assert.equal(tolkTall("vet ikke"), undefined);
  });
  it("beholder ekte null", () => {
    assert.equal(tolkTall("0"), 0);
  });
});

describe("byggSgBaseline", () => {
  it("summerer sgTotal når alle fire kategoriene er fylt ut", () => {
    const ut = byggSgBaseline({ sgOtt: "0,5", sgApp: "-1,2", sgArg: "0,3", sgPutt: "-0,4" });
    assert.equal(ut.sgTotal, -0.8);
  });
  it("lar sgTotal være undefined ved delvis utfylling", () => {
    const ut = byggSgBaseline({ sgOtt: "0,5", sgApp: "", sgArg: "", sgPutt: "" });
    assert.equal(ut.sgTotal, undefined);
    assert.equal(ut.sgOtt, 0.5);
  });
  it("tar med snittscore når den er oppgitt", () => {
    const ut = byggSgBaseline(TOMT_SG_SKJEMA, 76);
    assert.equal(ut.snittScore, 76);
  });
});

describe("erTomBaseline", () => {
  it("er tom når spilleren hoppet over steget", () => {
    assert.equal(erTomBaseline(byggSgBaseline(TOMT_SG_SKJEMA)), true);
  });
  it("er ikke tom når kun snittscore er fylt ut", () => {
    assert.equal(erTomBaseline(byggSgBaseline(TOMT_SG_SKJEMA, 76)), false);
  });
  it("er ikke tom når én SG-kategori er fylt ut", () => {
    const baseline = byggSgBaseline({ ...TOMT_SG_SKJEMA, sgPutt: "-0,4" });
    assert.equal(erTomBaseline(baseline), false);
  });
});

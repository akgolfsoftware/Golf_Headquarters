import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MIN_SLAG_PER_BAND, dgForslagOkter, innspillOvelseTittel, innspillTak, nesteMandag, sgGap, storstInnspillGap } from "./spiller-mot-proff";

const runde = (sgApp: number | null, dag: number) => ({ sgTotal: null, sgOtt: 0.3, sgApp, sgArg: 0.2, sgPutt: null, playedAt: new Date(Date.UTC(2026, 8, dag)) });

describe("DG-05 sgGap", () => {
  it("gap er spiller minus proff, og manglende tall gir «—» (null)", () => {
    const g = sgGap([runde(-1, 1), runde(-0.8, 2)], { sgTotal: 1.9, sgOtt: 0.6, sgApp: 0.9, sgArg: 0.2, sgPutt: 0.2 });
    const app = g.rader.find((r) => r.key === "sgApp")!;
    assert.equal(app.spiller.antall, 2);
    assert.ok(Math.abs((app.gap ?? 0) - -1.8) < 1e-9);
    assert.equal(g.rader.find((r) => r.key === "sgPutt")!.gap, null);
    assert.equal(g.samlet.gap, null);
    assert.equal(g.storst?.key, "sgApp");
    assert.equal(g.antallRunder, 2);
  });

  it("uten proff og uten runder finnes ingen gap og ikke noe størst gap", () => {
    const g = sgGap([], null);
    assert.ok(g.rader.every((r) => r.gap === null));
    assert.equal(g.storst, null);
    assert.equal(g.fra, null);
  });
});

describe("DG-06 innspillTak", () => {
  const proff = [{ band: "innspill100", lie: "fairway", meter: 7, gir: 0.7, slag: 400 }];
  it("spillerens tall vises først fra ti slag, hullet slag teller som 0 m", () => {
    const slag = Array.from({ length: MIN_SLAG_PER_BAND }, (_, i) => ({ lie: "FAIRWAY", distanceToPin: 110, endDistanceToPinM: i === 0 ? null : 10, holed: i === 0 }));
    const rad = innspillTak(slag, proff).find((r) => r.id === "innspill100-fairway")!;
    assert.equal(rad.spillerSlag, 10);
    assert.equal(rad.spillerMeter, 9);
    assert.equal(rad.proffMeter, 7);
    assert.equal(rad.gap, 2);
    assert.equal(storstInnspillGap(innspillTak(slag, proff))?.id, "innspill100-fairway");
  });

  it("under ti slag gir «—», og rough skilles fra fairway", () => {
    const slag = Array.from({ length: 9 }, () => ({ lie: "ROUGH", distanceToPin: 110, endDistanceToPinM: 12, holed: false }));
    const rader = innspillTak(slag, proff);
    assert.equal(rader.find((r) => r.id === "innspill100-rough")!.spillerMeter, null);
    assert.equal(rader.find((r) => r.id === "innspill100-rough")!.spillerSlag, 9);
    assert.equal(rader.find((r) => r.id === "innspill100-fairway")!.spillerSlag, 0);
  });
});

describe("DG-07 forslag", () => {
  it("neste mandag og økter tirsdag/torsdag i hver uke", () => {
    assert.equal(nesteMandag("2026-10-19"), "2026-10-26");
    assert.equal(nesteMandag("2026-10-18"), "2026-10-19");
    const okter = dgForslagOkter({ fraMandag: "2026-10-26", oekterPerUke: 2, uker: 2, varighet: 45, tittel: "Innspill" });
    assert.deepEqual(okter.map((o) => o.date), ["2026-10-27", "2026-10-29", "2026-11-03", "2026-11-05"]);
    assert.ok(okter.every((o) => o.pyramid === "SLAG" && o.durationMinutes === 45));
  });

  it("tittelen spilleren ser har målet, ikke proffen", () => {
    const t = innspillOvelseTittel({ etikett: "100–150 yd · 91–137 m", lie: "fairway" }, 7, 20);
    assert.equal(t, "Innspill 91–137 m, fairway · mål 7 m · 20 slag");
    assert.ok(t.length <= 120);
  });
});

describe("DG-07 dgFunn", () => {
  it("innspill med størst gap gir øvelse med målet i meter", async () => {
    const { dgFunn } = await import("./spiller-mot-proff");
    const slag = Array.from({ length: 10 }, () => ({ lie: "FAIRWAY", distanceToPin: 110, endDistanceToPinM: 9.8, holed: false }));
    const f = dgFunn(null, innspillTak(slag, [{ band: "innspill100", lie: "fairway", meter: 7.04, gir: null, slag: null }]));
    assert.equal(f?.maalMeter, 7);
    assert.match(f?.maalsetning ?? "", /91–137 m, fairway: snitt 7 m/);
    assert.doesNotMatch(f?.tittel ?? "", /Hovland|Data Golf/);
  });
  it("uten tall finnes ikke noe funn", async () => {
    const { dgFunn } = await import("./spiller-mot-proff");
    assert.equal(dgFunn(null, []), null);
  });
});

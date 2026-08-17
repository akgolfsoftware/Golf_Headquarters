/**
 * Én SG-sannhet — tester for kilderegelen (AP0.1).
 *
 * De rene byggerne testes direkte (hentSpillerSg er et tynt prisma-skall
 * rundt dem). Fasit: BEREGNET (runder) vinner alltid over SELVRAPPORTERT;
 * fallback kun når runde-grenen gir null.
 *
 * Kjør med: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  byggSpillerSgFraRunder,
  byggSpillerSgFraInput,
  type SgRad,
} from "./spiller-sg";

const rad = (deler: Partial<SgRad>): SgRad => ({
  sgTotal: null,
  sgOtt: null,
  sgApp: null,
  sgArg: null,
  sgPutt: null,
  ...deler,
});

describe("byggSpillerSgFraRunder", () => {
  it("null når ingen runder har SG-tall", () => {
    assert.equal(byggSpillerSgFraRunder([]), null);
    assert.equal(byggSpillerSgFraRunder([rad({}), rad({})]), null);
  });

  it("snitter per felt og hopper over null-felter", () => {
    // Nyeste først: total 2,0 og 1,0 → snitt 1,5; putt kun i eldste rad.
    const sg = byggSpillerSgFraRunder([
      rad({ sgTotal: 2.0, sgOtt: 0.5 }),
      rad({ sgTotal: 1.0, sgPutt: -0.8 }),
    ]);
    assert.ok(sg);
    assert.equal(sg.kilde, "BEREGNET");
    assert.equal(sg.antall, 2);
    assert.equal(sg.grunnlag, "2 runder");
    assert.equal(sg.total.sg, 1.5);
    assert.equal(sg.ott.sg, 0.5);
    assert.equal(sg.putt.sg, -0.8);
    assert.equal(sg.app.sg, null);
  });

  it("trendserien er eldste → nyeste", () => {
    const sg = byggSpillerSgFraRunder([
      rad({ sgTotal: 3 }), // nyest
      rad({ sgTotal: 2 }),
      rad({ sgTotal: 1 }), // eldst
    ]);
    assert.ok(sg);
    assert.deepEqual(sg.total.trend, [1, 2, 3]);
  });

  it("runder helt uten tall telles ikke i grunnlaget", () => {
    const sg = byggSpillerSgFraRunder([rad({ sgTotal: 1 }), rad({})]);
    assert.ok(sg);
    assert.equal(sg.grunnlag, "1 runde");
  });
});

describe("byggSpillerSgFraInput", () => {
  it("null når ingen registreringer har tall", () => {
    assert.equal(byggSpillerSgFraInput([rad({})]), null);
  });

  it("bruker nyeste verdi per felt (ikke snitt) og merker kilden", () => {
    const sg = byggSpillerSgFraInput([
      rad({ sgOtt: 0.9 }), // nyest
      rad({ sgOtt: -0.5, sgApp: -1.2 }),
    ]);
    assert.ok(sg);
    assert.equal(sg.kilde, "SELVRAPPORTERT");
    assert.equal(sg.grunnlag, "2 registreringer");
    assert.equal(sg.ott.sg, 0.9); // nyeste, ikke snittet 0,2
    assert.equal(sg.app.sg, -1.2); // nyeste som HAR feltet
    assert.deepEqual(sg.ott.trend, [-0.5, 0.9]);
  });
});

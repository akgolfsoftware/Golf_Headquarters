import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { datoIkkeFramITid, LoggOktSchema, sgOmradeFor, tilLoggetOkt } from "./logg-okt";

const gyldig = { date: "2026-10-04", pyramid: "SLAG", area: "Innspill", minutes: 45, effort: 7, focus: 8 } as const;

describe("Logg økt (pakke 13)", () => {
  it("SG-område bare for SLAG", () => {
    assert.equal(sgOmradeFor("SLAG", "Innspill"), "APP");
    assert.equal(sgOmradeFor("SLAG", "Bunker"), "ARG");
    assert.equal(sgOmradeFor("TEK", "Sving"), null);
  });
  it("området må høre til pyramiden, og fokus føres ikke for FYS", () => {
    assert.ok(LoggOktSchema.safeParse(gyldig).success);
    assert.ok(!LoggOktSchema.safeParse({ ...gyldig, area: "Styrke" }).success);
    assert.ok(!LoggOktSchema.safeParse({ ...gyldig, focus: undefined }).success);
    assert.ok(LoggOktSchema.safeParse({ ...gyldig, pyramid: "FYS", area: "Styrke", focus: undefined }).success);
    assert.ok(!LoggOktSchema.safeParse({ ...gyldig, pyramid: "FYS", area: "Styrke" }).success);
  });
  it("datoen kan ikke være fram i tid (Oslo)", () => {
    const naa = new Date("2026-10-04T22:30:00Z"); // 00:30 5. okt. i Oslo
    assert.ok(datoIkkeFramITid("2026-10-05", naa));
    assert.ok(!datoIkkeFramITid("2026-10-06", naa));
  });
  it("eldre logger med bare SG-område telles som SLAG", () => {
    const d = new Date("2026-10-01T00:00:00Z");
    assert.deepEqual(tilLoggetOkt({ date: d, minutes: 30, pyramid: null, sgArea: "PUTT", location: null }), { dato: "2026-10-01", min: 30, akse: "SLAG", sted: null });
    assert.deepEqual(tilLoggetOkt({ date: d, minutes: 60, pyramid: "FYS", sgArea: null, location: "Styrkerom" }), { dato: "2026-10-01", min: 60, akse: "FYS", sted: "Styrkerom" });
    assert.equal(tilLoggetOkt({ date: d, minutes: 30, pyramid: null, sgArea: null, location: null }), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aggregerVolumPerUke } from "../../training/volum";

describe("aggregerVolumPerUke", () => {
  it("returnerer tom array hvis ingen logger", () => {
    const result = aggregerVolumPerUke([], 4);
    assert.deepEqual(result, []);
  });

  it("summerer minutter per uke per SgCategory", () => {
    const now = new Date("2026-05-18");
    const logs = [
      { date: new Date("2026-05-12"), sgArea: "OTT" as const, minutes: 30 },
      { date: new Date("2026-05-13"), sgArea: "OTT" as const, minutes: 20 },
      { date: new Date("2026-05-14"), sgArea: "PUTT" as const, minutes: 45 },
    ];
    const result = aggregerVolumPerUke(logs, 4, now);
    const ottUke = result.find((r) => r.sgArea === "OTT" && r.uke === "2026-W20");
    assert.ok(ottUke, "OTT uke 20 skal finnes");
    assert.equal(ottUke?.minutter, 50);
    const puttUke = result.find((r) => r.sgArea === "PUTT" && r.uke === "2026-W20");
    assert.equal(puttUke?.minutter, 45);
  });
});

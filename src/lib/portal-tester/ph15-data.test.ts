import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  beregnPH15Statistikk,
  formaterNorskDesimal,
  justerStepperVerdi,
  utledPH15Oppsett,
} from "./ph15-data";
import type { ScorekortSpec } from "./protocol";

describe("ph15-data", () => {
  describe("formaterNorskDesimal", () => {
    it("formaterer tall til norsk visning", () => {
      assert.equal(formaterNorskDesimal(3.5), "3,5");
      assert.equal(formaterNorskDesimal(4), "4");
      assert.equal(formaterNorskDesimal(null), "—");
      assert.equal(formaterNorskDesimal(undefined), "—");
    });
  });

  describe("justerStepperVerdi", () => {
    it("justerer opp og ned med desimalavrunding", () => {
      assert.equal(justerStepperVerdi(3.5, 0.5), 4);
      assert.equal(justerStepperVerdi(3.5, -0.5), 3);
      assert.equal(justerStepperVerdi(0.2, -0.5), 0); // stopper på min 0
      assert.equal(justerStepperVerdi(99.5, 1), 100); // stopper på maks 100
    });
  });

  describe("utledPH15Oppsett", () => {
    it("gjenkjenner avstandstest i meter", () => {
      const spec: ScorekortSpec = {
        unit: "m",
        forsok: Array.from({ length: 10 }, (_, i) => ({
          nr: i + 1,
          label: `Slag ${i + 1}`,
          felter: [{ key: "avstand", label: "Meter", type: "meter", unit: "m" }],
        })),
      };
      const oppsett = utledPH15Oppsett(spec);
      assert.equal(oppsett.modus, "distance");
      assert.equal(oppsett.antallSlag, 10);
      assert.equal(oppsett.grenseM, 4);
      assert.equal(oppsett.enhet, "m");
    });

    it("gjenkjenner boolean treff/bom", () => {
      const spec: ScorekortSpec = {
        forsok: Array.from({ length: 9 }, (_, i) => ({
          nr: i + 1,
          label: `Slag ${i + 1}`,
          felter: [{ key: "ok", label: "Treff", type: "checkbox" }],
        })),
      };
      const oppsett = utledPH15Oppsett(spec);
      assert.equal(oppsett.modus, "hit_miss");
      assert.equal(oppsett.antallSlag, 9);
      assert.equal(oppsett.enhet, "treff");
    });
  });

  describe("beregnPH15Statistikk", () => {
    it("beregner snitt og antall innenfor grense for avstand", () => {
      const verdier = [3.2, 5.8, 2.1, 4.4, 1.6, 3.9];
      const stats = beregnPH15Statistikk(verdier, 4, "distance");
      assert.equal(stats.antallFort, 6);
      assert.equal(stats.antallInnenforGrense, 4); // 3.2, 2.1, 1.6, 3.9 er <= 4
      assert.ok(stats.snittVerdi !== null && Math.abs(stats.snittVerdi - 3.5) < 0.01);
    });

    it("beregner tomme verdier trygt", () => {
      const stats = beregnPH15Statistikk([], 4, "distance");
      assert.equal(stats.antallFort, 0);
      assert.equal(stats.antallInnenforGrense, 0);
      assert.equal(stats.snittVerdi, null);
    });
  });
});

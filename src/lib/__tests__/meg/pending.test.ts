import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isConfirmation, isCancellation } from "@/lib/meg/pending";

describe("isConfirmation", () => {
  it("gjenkjenner bekreftelsesord (case/tegnsetting-uavhengig)", () => {
    for (const t of ["BEKREFT", "bekreft", "Ja", "ja!", "ok", "Utfør", "send", "gjør det"]) {
      assert.ok(isConfirmation(t), `skulle vært bekreftelse: ${t}`);
    }
  });

  it("avviser vanlig tekst", () => {
    for (const t of ["hva er klokka", "logg søvn 7 timer", "kanskje senere"]) {
      assert.ok(!isConfirmation(t), `skulle ikke vært bekreftelse: ${t}`);
    }
  });
});

describe("isCancellation", () => {
  it("gjenkjenner avbryt-ord", () => {
    for (const t of ["nei", "Nei.", "avbryt", "stopp", "glem det"]) {
      assert.ok(isCancellation(t), `skulle vært avbryt: ${t}`);
    }
  });

  it("avviser bekreftelse og vanlig tekst", () => {
    for (const t of ["ja", "bekreft", "fortsett"]) {
      assert.ok(!isCancellation(t), `skulle ikke vært avbryt: ${t}`);
    }
  });
});

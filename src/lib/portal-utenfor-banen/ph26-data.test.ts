import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  rankChallengeRows,
  beregnBreakCm,
  DEFAULT_FYS_OVELSER,
  PGA_PUTT_BANDS,
} from "./ph26-data";

describe("ph26-data", () => {
  describe("rankChallengeRows", () => {
    it("rangerer med høyeste score som vinner", () => {
      const rows: [string, number | null][] = [
        ["Alice", 8],
        ["Bob", 10],
        ["Charlie", null],
        ["Dave", 6],
      ];
      const ranked = rankChallengeRows(rows, "hi");
      assert.equal(ranked[0].name, "Bob");
      assert.equal(ranked[0].rank, 1);
      assert.equal(ranked[1].name, "Alice");
      assert.equal(ranked[1].rank, 2);
      assert.equal(ranked[2].name, "Dave");
      assert.equal(ranked[2].rank, 3);
      assert.equal(ranked[3].name, "Charlie");
      assert.equal(ranked[3].rank, null);
    });

    it("rangerer med laveste score som vinner", () => {
      const rows: [string, number | null][] = [
        ["Alice", 72],
        ["Bob", 68],
        ["Charlie", 75],
      ];
      const ranked = rankChallengeRows(rows, "lo");
      assert.equal(ranked[0].name, "Bob");
      assert.equal(ranked[0].rank, 1);
      assert.equal(ranked[1].name, "Alice");
      assert.equal(ranked[1].rank, 2);
      assert.equal(ranked[2].name, "Charlie");
      assert.equal(ranked[2].rank, 3);
    });
  });

  describe("beregnBreakCm", () => {
    it("beregner break i cm matematisk korrekt etter stimp og helning", () => {
      // 10 stimp, 10 ft, 2% helning => 0.55 * 10 * 2 * 1.0 = 11 cm
      assert.equal(beregnBreakCm(10, 10, 2), 11);
      // 12 stimp, 10 ft, 2% helning => 0.55 * 10 * 2 * 1.2 = 13.2 => 13 cm
      assert.equal(beregnBreakCm(12, 10, 2), 13);
      // 8 stimp, 20 ft, 1% helning => 0.55 * 20 * 1 * 0.8 = 8.8 => 9 cm
      assert.equal(beregnBreakCm(8, 20, 1), 9);
    });
  });

  describe("konstanter", () => {
    it("har 5 standard FYS-øvelser", () => {
      assert.equal(DEFAULT_FYS_OVELSER.length, 5);
      assert.ok(DEFAULT_FYS_OVELSER[0].navn.includes("Oppvarming"));
    });

    it("har 6 PGA putt-bånd", () => {
      assert.equal(PGA_PUTT_BANDS.length, 6);
      assert.equal(PGA_PUTT_BANDS[0].avstandFt, 3);
      assert.equal(PGA_PUTT_BANDS[5].avstandFt, 25);
    });
  });
});

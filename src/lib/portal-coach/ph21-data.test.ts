import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parsePH21Tab,
  formatVideoVarighet,
  formatPH21Dato,
  computePH21TabCounts,
  type PH21Plan,
  type PH21Video,
} from "./ph21-data";

describe("ph21-data", () => {
  describe("parsePH21Tab", () => {
    it("parserer gyldige tabs", () => {
      assert.equal(parsePH21Tab("msg"), "msg");
      assert.equal(parsePH21Tab("q"), "q");
      assert.equal(parsePH21Tab("fb"), "fb");
      assert.equal(parsePH21Tab("vid"), "vid");
      assert.equal(parsePH21Tab("plan"), "plan");
      assert.equal(parsePH21Tab("ønske"), "ønske");
      assert.equal(parsePH21Tab("onske"), "ønske");
    });

    it("faller tilbake på msg ved ugyldig eller tom input", () => {
      assert.equal(parsePH21Tab(null), "msg");
      assert.equal(parsePH21Tab(undefined), "msg");
      assert.equal(parsePH21Tab("ugyldig"), "msg");
    });
  });

  describe("formatVideoVarighet", () => {
    it("formaterer sekunder til M:SS", () => {
      assert.equal(formatVideoVarighet(65), "1:05");
      assert.equal(formatVideoVarighet(120), "2:00");
      assert.equal(formatVideoVarighet(30), "0:30");
      assert.equal(formatVideoVarighet(0), "0:30");
      assert.equal(formatVideoVarighet(null), "0:30");
    });
  });

  describe("formatPH21Dato", () => {
    it("formaterer ren dato", () => {
      const d = new Date(2026, 8, 26, 14, 30);
      assert.equal(formatPH21Dato(d), "26.09.2026");
    });

    it("formaterer dato med klokkeslett", () => {
      const d = new Date(2026, 8, 26, 8, 14);
      assert.equal(formatPH21Dato(d, true), "26.09 · 08:14");
    });

    it("håndterer ugyldig dato trygt", () => {
      assert.equal(formatPH21Dato("ugyldig-dato"), "—");
    });
  });

  describe("computePH21TabCounts", () => {
    it("beregner antall ventende planer og usette videoer", () => {
      const plans: PH21Plan[] = [
        { id: "1", title: "Plan 1", sessions: 4, hours: "6 t", sent: "I dag", status: "Venter på spiller" },
        { id: "2", title: "Plan 2", sessions: 2, hours: "3 t", sent: "I går", status: "Godtatt" },
      ];
      const videos: PH21Video[] = [
        { id: "v1", title: "Video 1", len: "1:20", img: "/img1", date: "26.09", seen: false },
        { id: "v2", title: "Video 2", len: "2:00", img: "/img2", date: "25.09", seen: true },
        { id: "v3", title: "Video 3", len: "0:45", img: "/img3", date: "24.09", seen: false },
      ];

      const counts = computePH21TabCounts({ plans, videos });
      assert.equal(counts.plan, 1);
      assert.equal(counts.vid, 2);
    });

    it("gir undefined når det ikke er noen ubehandlede elementer", () => {
      const counts = computePH21TabCounts({
        plans: [{ id: "1", title: "Plan", sessions: 1, hours: "1", sent: "I dag", status: "Godtatt" }],
        videos: [{ id: "v1", title: "Video", len: "1", img: "", date: "", seen: true }],
      });
      assert.equal(counts.plan, undefined);
      assert.equal(counts.vid, undefined);
    });
  });
});

import { describe, test, mock } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("server-only", { defaultExport: {} });

for (const css of [
  "precision-a2.css",
  "precision-a4.css",
  "precision-a5.css",
  "precision-a7.css",
  "precision-komponenter.css",
  "precision-athletics.css",
]) {
  mock.module(`@/styles/${css}`, { namedExports: {} });
}

mock.module("next/navigation", {
  namedExports: {
    useRouter: () => ({ push() {}, replace() {} }),
  },
});
mock.module("next/link", { defaultExport: "a" });

describe("PH16Stats (Stats) uten demotall", async () => {
  const { PH16Stats } = await import("@/components/portal/precision/PH16Stats");
  const { PH16bSkillMap } = await import("@/components/portal/precision/PH16bSkillMap");
  const { byggPH16Stats } = await import("@/lib/portal-analyse/ph16-stats-data");

  const tom = byggPH16Stats({ navn: "Ola Nordmann", runder: [], tmSlag: [] });

  test("0 runder: tomtilstand, ingen demospiller og ingen dobbel «Kategori»", () => {
    const html = renderToStaticMarkup(React.createElement(PH16Stats, { data: tom }));
    assert.ok(!html.includes("Tobias Lindvik"));
    assert.ok(!html.includes("Kategori Kategori"));
    assert.ok(html.includes("Registrer 4 runder til før snittet vises"));
    assert.ok(html.includes("Kategori —"));
    assert.ok(html.includes("Ingen runder registrert ennå."));
    assert.ok(!html.includes("75,2"), "demosnittet vises ikke");
  });

  test("alle fire faner rendrer uten data", () => {
    for (const fane of ["snitt", "sg", "tren", "test"] as const) {
      const html = renderToStaticMarkup(React.createElement(PH16Stats, { data: tom, aktivFane: fane }));
      assert.ok(!html.includes("Kategori Kategori"), fane);
      assert.ok(!html.includes("Kategori C"), fane);
    }
  });

  test("med 4 runder: snitt vises uten oppdiktet kategori", () => {
    const runder = Array.from({ length: 4 }, (_, i) => ({
      id: `r${i}`,
      playedAt: new Date(Date.UTC(2026, 8, 20 - i)),
      score: 76,
      roundType: "turnering",
      courseName: "Testbane",
      sgTotal: null,
      sgSource: null,
      benchmarkLevelSnapshot: null,
      holeScores: Array.from({ length: 18 }, () => ({ par: 4 })),
      sgTee: null, sgApp200: null, sgApp150: null, sgApp100: null, sgApp50: null,
      sgChip: null, sgPitch: null, sgLob: null, sgBunker: null,
      sgPutt0_3: null, sgPutt3_5: null, sgPutt5_10: null, sgPutt10_15: null,
      sgPutt15_25: null, sgPutt25_40: null, sgPutt40plus: null,
    }));
    const d = byggPH16Stats({ navn: "Ola", runder, tmSlag: [] });
    const html = renderToStaticMarkup(React.createElement(PH16Stats, { data: d }));
    assert.ok(html.includes("76,0"));
    assert.ok(html.includes("Referanse ikke satt"));
    assert.ok(html.includes("PAR 72"));
    assert.ok(!html.includes("Kategori Kategori"));
  });

  test("Skill map rendrer «—» uten målt SG", () => {
    const html = renderToStaticMarkup(React.createElement(PH16bSkillMap, { data: tom }));
    assert.ok(html.includes("—"));
    assert.ok(!html.includes("Kategori C"));
  });
});

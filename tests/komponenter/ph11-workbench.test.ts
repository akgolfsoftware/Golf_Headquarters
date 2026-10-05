import { describe, test, mock } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { uke, SPILLER, FYS, MAL, KILDER } from "../visual/precision/skjermer/_wb-data";

mock.module("server-only", { defaultExport: {} });

// Mock CSS imports for Node environment
for (const css of ["precision-a4.css", "precision-a9.css", "precision-komponenter.css", "precision-athletics.css", "workbench-selected.css"]) {
  mock.module(`@/styles/${css}`, { namedExports: {} });
}

// Mock minimal dependencies for AG11Workbench in SSR test
mock.module("next/navigation", {
  namedExports: {
    useRouter: () => ({ push() {}, replace() {} }),
  },
});
mock.module("next/link", { defaultExport: "a" });
mock.module("sonner", { namedExports: { toast: { success() {}, error() {} } } });

describe("PH11Workbench (Spiller)", async () => {
  const { PH11Workbench } = await import("@/components/portal/precision/PH11Workbench");

  test("rendrer spiller-workbench med Uke 40 og uten coach-velgere", () => {
    const html = renderToStaticMarkup(
      React.createElement(PH11Workbench, {
        playerId: "p1",
        spillerNavn: SPILLER,
        uke: uke(false),
        kilder: KILDER,
        goals: MAL,
        fys: FYS,
        niva: "uke",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    // Skal inneholde ukenummer
    assert.match(html, /Uke 40/);
    // Spiller ser IKKE velger-dropdown for andre spillere eller grupper
    assert.doesNotMatch(html, /data-velger="spiller"/);
    // Skal inneholde dagnavn
    assert.match(html, /Man/);
    assert.match(html, /Søn/);
  });

  test("rendrer tom uke for spiller", () => {
    const html = renderToStaticMarkup(
      React.createElement(PH11Workbench, {
        playerId: "p1",
        spillerNavn: SPILLER,
        uke: uke(true),
        fys: FYS,
        niva: "uke",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Uke 40/);
  });

  test("rendrer nivåene volum og målsetninger for spiller", () => {
    const htmlVol = renderToStaticMarkup(
      React.createElement(PH11Workbench, {
        playerId: "p1",
        spillerNavn: SPILLER,
        uke: uke(false),
        fys: FYS,
        niva: "vol",
      })
    );
    assert.ok(htmlVol.length > 0);

    const htmlMal = renderToStaticMarkup(
      React.createElement(PH11Workbench, {
        playerId: "p1",
        spillerNavn: SPILLER,
        uke: uke(false),
        goals: MAL,
        fys: FYS,
        niva: "mal",
        side: "mal",
      })
    );
    assert.ok(htmlMal.length > 0);
  });
});

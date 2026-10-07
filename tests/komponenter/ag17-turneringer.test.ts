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
  "precision-a17.css",
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

describe("AG17Turneringer (Turneringer)", async () => {
  const { AG17Turneringer } = await import("@/components/admin/precision/AG17Turneringer");

  const data = {
    tournaments: [
      { id: "t1", name: "Testturnering A", date: "9. jun", course: "Testbane", lat: 59.2, lon: 10.9, paameldte: 2, st: "Påmeldt" as const },
      { id: "t2", name: "Testturnering B", date: "10. jun", course: null, lat: null, lon: null, paameldte: null, st: null },
    ],
    tDups: [
      {
        id: "d1",
        match: "Overlapp: X",
        a: { src: "Manuell", name: "A", date: "1", course: "—" },
        b: { src: "NGF", name: "B", date: "1", course: "—" },
      },
    ],
  };

  const vis = (props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(AG17Turneringer, props as never));

  test("rendrer bare turneringene den får, med — der data mangler", () => {
    const html = vis({ tilstand: "data", startFane: "alle", data });
    assert.match(html, /Testturnering A/);
    assert.match(html, /Testturnering B/);
    assert.match(html, /—/);
    assert.doesNotMatch(html, /Srixon|Borregaard|Feltstyrke|Data Golf/);
  });

  test("kartet viser bare turneringer med ekte koordinater", () => {
    const html = vis({ tilstand: "data", startFane: "kart", data });
    assert.match(html, /Testturnering A på Testbane/);
    assert.doesNotMatch(html, /Testturnering B på/);
  });

  test("uten data vises ingen demoturneringer", () => {
    const html = vis({ tilstand: "tom", startFane: "alle" });
    assert.match(html, /Ingen turneringer/);
    assert.doesNotMatch(html, /Srixon|Simonsen|Thorsen/);
  });

  test("Påmeldt er nøytral, ikke rust", () => {
    const html = vis({ tilstand: "data", startFane: "alle", data });
    assert.doesNotMatch(html, /pa-status--signal/);
  });

  test("dubletter lenker til dublettlista, ny turnering til skjemaet", () => {
    assert.match(vis({ tilstand: "data", startFane: "dup", data }), /\/admin\/tournaments\/dubletter/);
    assert.match(vis({ tilstand: "data", startFane: "ny", data }), /\/admin\/tournaments\/ny/);
  });

  test("laster og feil", () => {
    assert.match(vis({ tilstand: "laster" }), /Henter turneringer/);
    assert.match(vis({ tilstand: "feil" }), /Turneringene kunne ikke hentes/);
  });
});

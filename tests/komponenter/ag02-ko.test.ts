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

describe("AG02Ko (Kø)", async () => {
  const { AG02Ko } = await import("@/components/admin/precision/AG02Ko");

  test("rendrer kø med standard faner og godkjenninger", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "data",
        startFane: "godkjenninger",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Kø/);
    assert.match(html, /Godkjenninger/);
    assert.match(html, /Agentforslag/);
    assert.match(html, /Tester/);
    assert.match(html, /Dubletter/);
    assert.match(html, /Moderering/);
    assert.match(html, /E-postutkast/);
  });

  test("rendrer tom tilstand med lenke til Cockpit", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "tom",
        startFane: "godkjenninger",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen saker venter/);
    assert.match(html, /Til Cockpit/);
  });

  test("rendrer laster-tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "laster",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Henter køen …/);
  });

  test("rendrer feil-tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "feil",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Køen kunne ikke hentes/);
    assert.match(html, /FEIL 502/);
  });
});

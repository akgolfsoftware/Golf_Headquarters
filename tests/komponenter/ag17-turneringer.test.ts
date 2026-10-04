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

  test("rendrer turneringer med standard faner og tabell", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG17Turneringer, {
        tilstand: "data",
        startFane: "alle",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Turneringer/);
    assert.match(html, /Alle/);
    assert.match(html, /Mine spillere/);
    assert.match(html, /Kart/);
    assert.match(html, /Dubletter/);
    assert.match(html, /Ny turnering/);
    assert.match(html, /Srixon Tour 5/);
    assert.match(html, /Borregaard GK/);
  });

  test("rendrer kartvisning over Sør-Norge", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG17Turneringer, {
        tilstand: "data",
        startFane: "kart",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Kart · Sør-Norge/);
    assert.match(html, /SKJEMATISK · IKKE MÅLESTOKK/);
    assert.match(html, /MINE SPILLERE/);
    assert.match(html, /INGEN AV MINE/);
  });

  test("rendrer dubletter fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG17Turneringer, {
        tilstand: "data",
        startFane: "dup",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Mulig dublett/);
    assert.match(html, /Slå sammen/);
    assert.match(html, /Ikke dublett/);
  });

  test("rendrer tom tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG17Turneringer, {
        tilstand: "tom",
        startFane: "alle",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen turneringer/);
    assert.match(html, /Ny turnering/);
  });

  test("rendrer laster- og feil-tilstand", () => {
    const lasterHtml = renderToStaticMarkup(
      React.createElement(AG17Turneringer, {
        tilstand: "laster",
      })
    );
    assert.match(lasterHtml, /Henter turneringer …/);

    const feilHtml = renderToStaticMarkup(
      React.createElement(AG17Turneringer, {
        tilstand: "feil",
      })
    );
    assert.match(feilHtml, /Turneringene kunne ikke hentes/);
    assert.match(feilHtml, /GOLFBOX · 504/);
  });
});

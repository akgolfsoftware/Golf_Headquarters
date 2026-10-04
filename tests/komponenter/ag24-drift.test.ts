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
  "precision-a18.css",
  "precision-a19.css",
  "precision-a21.css",
  "precision-a22.css",
  "precision-a23.css",
  "precision-a24.css",
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

describe("AG24Drift (Drift · kun admin)", async () => {
  const { AG24Drift } = await import(
    "@/components/admin/precision/AG24Drift"
  );

  test("rendrer sletteforespørsler fane (GDPR art. 17)", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG24Drift, {
        tilstand: "data",
        startFane: "gdpr",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Drift · kun admin/);
    assert.match(html, /Sletteforespørsler/);
    assert.match(html, /Mia Fjell/);
    assert.match(html, /Forelder · Siv Fjell/);
    assert.match(html, /30 DAGER · GDPR ART\. 17/);
    assert.match(html, /Lag innsynskopi først/);
    assert.match(html, /Slett data/);
  });

  test("rendrer revisjonslogg fane (AuditLog)", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG24Drift, {
        tilstand: "data",
        startFane: "audit",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Revisjonslogg · siste 7 dager/);
    assert.match(html, /Anders Kristiansen/);
    assert.match(html, /Belastningsagent/);
    assert.match(html, /Tobias Lindvik/);
  });

  test("rendrer feillogg fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG24Drift, {
        tilstand: "data",
        startFane: "feil",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Feillogg · siste 7 dager/);
    assert.match(html, /Rapportagent/);
    assert.match(html, /TrackMan API/);
    assert.match(html, /Tripletex-eksport/);
  });

  test("rendrer hjelp fane med FAQ", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG24Drift, {
        tilstand: "data",
        startFane: "hjelp",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Hvordan godkjenner jeg et utkast fra Jarvis\?/);
    assert.match(html, /Hvordan slettes en spiller\?/);
    assert.match(html, /Hvem ser økonomitallene\?/);
    assert.match(html, /KONTAKT · DRIFT@DEMO\.NO/);
  });

  test("rendrer tom tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG24Drift, {
        tilstand: "tom",
        startFane: "gdpr",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen sletteforespørsler/);
    assert.match(html, /Forespørsler fra spillere og foreldre kommer hit/);
  });

  test("rendrer laster- og feiltilstander", () => {
    const lasterHtml = renderToStaticMarkup(
      React.createElement(AG24Drift, { tilstand: "laster" })
    );
    assert.match(lasterHtml, /Henter driftsdata/);

    const feilHtml = renderToStaticMarkup(
      React.createElement(AG24Drift, { tilstand: "feil" })
    );
    assert.match(feilHtml, /Driftsdata kunne ikke hentes/);
    assert.match(feilHtml, /FEIL 503 · DRIFT/);
  });
});

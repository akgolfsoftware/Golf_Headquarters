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

describe("AG19CaddieHub (Caddie og Jarvis AI-hub)", async () => {
  const { AG19CaddieHub } = await import(
    "@/components/admin/precision/AG19CaddieHub"
  );

  test("rendrer agentkø med kjøringer, steg og godkjenning", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG19CaddieHub, {
        tilstand: "data",
        startFane: "ko",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Caddie · Jarvis/);
    assert.match(html, /Agentkø/);
    assert.match(html, /Prosjekter/);
    assert.match(html, /Skills/);
    assert.match(html, /Samtale/);
    assert.match(html, /Belastningsagent/);
    assert.match(html, /acwr-sjekk/);
    assert.match(html, /Kjøringsdetalj/);
    assert.match(html, /Godkjenn og send/);
    assert.match(html, /JARVIS SENDER OG ENDRER INGENTING SELV/);
  });

  test("rendrer prosjekter-fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG19CaddieHub, {
        tilstand: "data",
        startFane: "prosj",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Sesongslutt 2026/);
    assert.match(html, /Vinterplan WANG/);
    assert.match(html, /Rekruttering Mini/);
    assert.match(html, /Åpne i Oppgaver/);
  });

  test("rendrer skills-fane med brytere", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG19CaddieHub, {
        tilstand: "data",
        startFane: "skills",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /acwr-sjekk/);
    assert.match(html, /inaktiv-spiller/);
    assert.match(html, /skolefravær/);
    assert.match(html, /ukerapport-forelder/);
    assert.match(html, /Aktiv/);
  });

  test("rendrer samtale-fane med Caddie", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG19CaddieHub, {
        tilstand: "data",
        startFane: "chat",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Caddie · samtale/);
    assert.match(html, /Hvem i WANG bør ha lettere uke 40\?/);
    assert.match(html, /Spør Caddie/);
    assert.match(html, /Lagre som utkast/);
  });

  test("rendrer tom tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG19CaddieHub, {
        tilstand: "tom",
        startFane: "ko",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen kjøringer i dag/);
    assert.match(html, /Åpne samtale/);
  });

  test("rendrer laster- og feil-tilstand", () => {
    const lasterHtml = renderToStaticMarkup(
      React.createElement(AG19CaddieHub, {
        tilstand: "laster",
      })
    );
    assert.match(lasterHtml, /Henter agentkøen …/);

    const feilHtml = renderToStaticMarkup(
      React.createElement(AG19CaddieHub, {
        tilstand: "feil",
      })
    );
    assert.match(feilHtml, /Caddie svarer ikke/);
    assert.match(feilHtml, /FEIL 503 · AGENTER/);
  });
});

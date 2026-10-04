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

describe("AG21Oppgaver (Oppgaver og rutiner)", async () => {
  const { AG21Oppgaver } = await import(
    "@/components/admin/precision/AG21Oppgaver"
  );

  test("rendrer mine oppgaver med avkryssing og metadata", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG21Oppgaver, {
        tilstand: "data",
        startFane: "mine",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Oppgaver/);
    assert.match(html, /Mine oppgaver/);
    assert.match(html, /Prosjekter/);
    assert.match(html, /Rutiner/);
    assert.match(html, /Notion/);
    assert.match(html, /Godkjenn ukeplan uke 40 · Tobias Lindvik/);
    assert.match(html, /Oppdater nivåstige Team Norway 2027/);
    assert.match(html, /SESONGSLUTT 2026/);
    assert.match(html, /VINTERPLAN WANG/);
  });

  test("rendrer prosjekter-fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG21Oppgaver, {
        tilstand: "data",
        startFane: "prosj",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Sesongslutt 2026/);
    assert.match(html, /Vinterplan WANG/);
    assert.match(html, /Rekruttering Mini/);
    assert.match(html, /2 AV 6 FERDIG · FRIST 31\.10\.2026/);
  });

  test("rendrer rutiner-fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG21Oppgaver, {
        tilstand: "data",
        startFane: "rutiner",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Publiser ukeplaner/);
    assert.match(html, /Svar i Innboks innen 24 t/);
    assert.match(html, /Sjekk ACWR for WANG/);
    assert.match(html, /Godkjenn ukerapporter/);
    assert.match(html, /Gjort denne uka/);
    assert.match(html, /Marker gjort/);
  });

  test("rendrer notion-fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG21Oppgaver, {
        tilstand: "data",
        startFane: "notion",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Notion-arbeidsflate/);
    assert.match(html, /AK Golf · Coach-arbeidsflate/);
    assert.match(html, /SIST SYNKET 26\.09\.2026 14:00/);
    assert.match(html, /Spillerdata synkes aldri til Notion/);
    assert.match(html, /Åpne i Notion/);
    assert.match(html, /Synk nå/);
  });

  test("rendrer tom tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG21Oppgaver, {
        tilstand: "tom",
        startFane: "mine",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen oppgaver/);
    assert.match(html, /Oppgaver du får tildelt, eller lager selv, samles her/);
  });

  test("rendrer laster- og feiltilstander", () => {
    const lasterHtml = renderToStaticMarkup(
      React.createElement(AG21Oppgaver, { tilstand: "laster" })
    );
    assert.match(lasterHtml, /Henter oppgaver/);

    const feilHtml = renderToStaticMarkup(
      React.createElement(AG21Oppgaver, { tilstand: "feil" })
    );
    assert.match(feilHtml, /Oppgavene kunne ikke hentes/);
    assert.match(feilHtml, /NOTION API · 502/);
  });
});

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

describe("AG22InnsiktTalent (Innsikt og talent)", async () => {
  const { AG22InnsiktTalent } = await import(
    "@/components/admin/precision/AG22InnsiktTalent"
  );

  test("rendrer radar-fane med spillere og peer-snitt", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG22InnsiktTalent, {
        tilstand: "data",
        startFane: "radar",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Innsikt og talent/);
    assert.match(html, /Bare for coach/);
    assert.match(html, /Spillere født 2008 eller senere uten samtykke vises aldri/);
    assert.match(html, /2 spillere er skjult/);
    assert.match(html, /VELG OPPTIL FIRE SPILLERE/);
    assert.match(html, /Tobias Lindvik/);
    assert.match(html, /Magnus Aasheim/);
    assert.match(html, /Ingrid Berg/);
    assert.match(html, /FØDT 2009/);
    assert.match(html, /PEER-SNITT KATEGORI D · 14 SPILLERE/);
    assert.match(html, /TESTER OG RUNDER · 20\.09\.2026 · ESTIMAT/);
  });

  test("skjuler spillere uten samtykke (ak-personvern)", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG22InnsiktTalent, {
        tilstand: "data",
        startFane: "radar",
      })
    );

    // Sara Holm (født 2009, consent: false) skal IKKE finnes
    assert.doesNotMatch(html, /Sara Holm/);
    // Ukjent fødselsår skal IKKE finnes
    assert.doesNotMatch(html, /Ukjent fødselsår/);
  });

  test("rendrer discovery-fane med samtykkestatus", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG22InnsiktTalent, {
        tilstand: "data",
        startFane: "disc",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Discovery · talentdager og søknader/);
    assert.match(html, /Emil Strand/);
    assert.match(html, /Vår 2026 · Talentdag Borregaard/);
  });

  test("rendrer wagr-import fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG22InnsiktTalent, {
        tilstand: "data",
        startFane: "wagr",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /WAGR-import/);
    assert.match(html, /Last opp CSV fra WAGR/);
    assert.match(html, /WAGR-EXPORT-2026-09-21\.CSV · 3 RADER/);
    assert.match(html, /Importer fil/);
  });

  test("rendrer tom tilstand med handling", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG22InnsiktTalent, {
        tilstand: "tom",
        startFane: "radar",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen talentprofiler/);
    assert.match(html, /Talentradaren bygges fra tester og runder/);
    assert.match(html, /Åpne Tester/);
  });

  test("rendrer laster- og feiltilstander", () => {
    const lasterHtml = renderToStaticMarkup(
      React.createElement(AG22InnsiktTalent, { tilstand: "laster" })
    );
    assert.match(lasterHtml, /Henter talentprofiler/);

    const feilHtml = renderToStaticMarkup(
      React.createElement(AG22InnsiktTalent, { tilstand: "feil" })
    );
    assert.match(feilHtml, /Talentdata kunne ikke hentes/);
    assert.match(feilHtml, /FEIL 503 · TALENT/);
  });
});

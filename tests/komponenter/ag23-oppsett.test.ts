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

describe("AG23Oppsett (Innstillinger og oppsett)", async () => {
  const { AG23Oppsett } = await import(
    "@/components/admin/precision/AG23Oppsett"
  );

  test("rendrer team og tilgang fane med tabell", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "data",
        startFane: "team",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Oppsett/);
    assert.match(html, /Team og tilgang/);
    assert.match(html, /Anders Kristiansen/);
    assert.match(html, /Hovedcoach/);
    assert.match(html, /Admin/);
    assert.match(html, /anders@demo\.no/);
    assert.match(html, /Kari Demo/);
    assert.match(html, /Per Demo/);
    assert.match(html, /Line Demo/);
  });

  test("rendrer egen profil fane", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "data",
        startFane: "profil",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Visningsnavn/);
    assert.match(html, /E-post/);
    assert.match(html, /Totrinnsinnlogging \(2FA\)/);
    assert.match(html, /Lagre/);
  });

  test("rendrer inviter coach og ekstern trener faner", () => {
    const invHtml = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "data",
        startFane: "inviter",
      })
    );
    assert.match(invHtml, /Inviter coach/);
    assert.match(invHtml, /Coach får tilgang til stall, plan og kø/);
    assert.match(invHtml, /Lag invitasjon/);

    const ekstHtml = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "data",
        startFane: "ekstern",
      })
    );
    assert.match(ekstHtml, /Ekstern trener/);
    assert.match(ekstHtml, /Ekstern trener får lesetilgang til spillere du velger/);
    assert.match(ekstHtml, /Hele WANG Toppidrett/);
  });

  test("rendrer integrasjoner, markedsføring og virksomhet faner", () => {
    const integrHtml = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "data",
        startFane: "integr",
      })
    );
    assert.match(integrHtml, /TrackMan/);
    assert.match(integrHtml, /GolfBox/);
    assert.match(integrHtml, /Tripletex/);
    assert.match(integrHtml, /Notion/);
    assert.match(integrHtml, /Data Golf/);

    const markHtml = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "data",
        startFane: "mark",
      })
    );
    assert.match(markHtml, /Markedsføring · forside/);
    assert.match(markHtml, /AKGOLF\.NO/);
    assert.match(markHtml, /Ingen sitater, stjerner eller vitnesbyrd/);

    const virksHtml = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "data",
        startFane: "virks",
      })
    );
    assert.match(virksHtml, /Virksomhetsinformasjon/);
    assert.match(virksHtml, /AK Golf Academy/);
    assert.match(virksHtml, /Europe\/Oslo/);
  });

  test("rendrer tom tilstand med infoboks", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG23Oppsett, {
        tilstand: "tom",
        startFane: "team",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Bare deg i teamet/);
    assert.match(html, /Inviter en coach eller ekstern trener/);
  });

  test("rendrer laster- og feiltilstander", () => {
    const lasterHtml = renderToStaticMarkup(
      React.createElement(AG23Oppsett, { tilstand: "laster" })
    );
    assert.match(lasterHtml, /Henter oppsett/);

    const feilHtml = renderToStaticMarkup(
      React.createElement(AG23Oppsett, { tilstand: "feil" })
    );
    assert.match(feilHtml, /Oppsettet kunne ikke hentes/);
    assert.match(feilHtml, /FEIL 502 · ORG/);
  });
});

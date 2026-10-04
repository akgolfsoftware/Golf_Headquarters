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

describe("AG18TrackManVideo (TrackMan og video)", async () => {
  const { AG18TrackManVideo } = await import(
    "@/components/admin/precision/AG18TrackManVideo"
  );

  test("rendrer TrackMan-økter og metrikker", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG18TrackManVideo, {
        tilstand: "data",
        startFane: "okter",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /TrackMan og video/);
    assert.match(html, /Økter/);
    assert.match(html, /Video/);
    assert.match(html, /Opptak/);
    assert.match(html, /Tobias Lindvik/);
    assert.match(html, /Club Speed/);
    assert.match(html, /Ball Speed/);
    assert.match(html, /Smash Factor/);
  });

  test("rendrer video-fane med opptaksgalleri", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG18TrackManVideo, {
        tilstand: "data",
        startFane: "video",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Videoopptak/);
    assert.match(html, /Face-on · full sving/);
    assert.match(html, /Down-the-line · takeaway/);
  });

  test("rendrer opptak-fane med to-kameraoppsett", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG18TrackManVideo, {
        tilstand: "data",
        startFane: "opptak",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Nytt opptak/);
    assert.match(html, /FACE-ON · KAMERA 1/);
    assert.match(html, /DOWN-THE-LINE · KAMERA 2/);
    assert.match(html, /Start opptak/);
    assert.match(html, /SAMTYKKE FRA FORELDER/);
  });

  test("rendrer tom tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG18TrackManVideo, {
        tilstand: "tom",
        startFane: "okter",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen TrackMan-økter denne uka/);
    assert.match(html, /Nytt opptak/);
  });

  test("rendrer laster- og feil-tilstand", () => {
    const lasterHtml = renderToStaticMarkup(
      React.createElement(AG18TrackManVideo, {
        tilstand: "laster",
      })
    );
    assert.match(lasterHtml, /Henter TrackMan-økter …/);

    const feilHtml = renderToStaticMarkup(
      React.createElement(AG18TrackManVideo, {
        tilstand: "feil",
      })
    );
    assert.match(feilHtml, /TrackMan svarer ikke/);
    assert.match(feilHtml, /TRACKMAN API · 504/);
  });
});

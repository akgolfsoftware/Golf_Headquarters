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
  const { AG18TrackManVideo } = await import("@/components/admin/precision/AG18TrackManVideo");

  const data = {
    tmSessions: [
      {
        id: "m1",
        date: "04.10.2026",
        who: "Testspiller A",
        club: "Driver",
        shots: 10,
        video: null,
        bay: null,
        rows: [
          ["Club Speed", "mph", 100.5],
          ["Carry", "m", null],
        ] as [string, string, number | null][],
      },
    ],
    videos: [
      { id: "v1", s: "x", title: "Testvideo", player: "Testspiller A", by: null, at: "04.10.2026", len: null },
    ],
  };
  const vis = (props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(AG18TrackManVideo, props as never));

  test("viser målte verdier og — for manglende, uten hardkodet kølle eller video", () => {
    const html = vis({ tilstand: "data", startFane: "okter", data });
    assert.match(html, /Testspiller A/);
    assert.match(html, /100,5/);
    assert.match(html, /MILJØ IKKE REGISTRERT/);
    assert.doesNotMatch(html, /7-jern|91,4|158,4|hoftevinkel|Studio 1/);
  });

  test("video viser — for ukjent varighet og coach", () => {
    const html = vis({ tilstand: "data", startFane: "video", data });
    assert.match(html, /Testvideo/);
    assert.doesNotMatch(html, /0:04|God rotasjon/);
  });

  test("opptak er ikke koblet og har ingen oppdiktet spiller eller samtykke", () => {
    const html = vis({ tilstand: "data", startFane: "opptak", data });
    assert.match(html, /IKKE KOBLET ENNÅ/);
    assert.doesNotMatch(html, /Tobias|Lindvik|BANKID/);
  });

  test("uten data vises ingen demoøkter", () => {
    const html = vis({ tilstand: "tom", startFane: "okter" });
    assert.match(html, /Ingen TrackMan-økter/);
    assert.doesNotMatch(html, /Tobias|Simonsen|Berntsen/);
  });

  test("laster og feil", () => {
    assert.match(vis({ tilstand: "laster" }), /Henter TrackMan-økter/);
    assert.match(vis({ tilstand: "feil" }), /TrackMan-øktene kunne ikke hentes/);
  });
});

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
  const { AG21Oppgaver } = await import("@/components/admin/precision/AG21Oppgaver");
  const vis = (props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(AG21Oppgaver, props as never));

  const data = {
    mine: [{ id: "o1", t: "Testoppgave", due: "01.10", p: "Testprosjekt", by: "Notion", done: false }],
    projects: [["Testprosjekt", 4, 1, "31.10.2026"]] as [string, number, number, string][],
    routines: [["Mandag", "Testrutine", "—", false]] as [string, string, string, boolean][],
    notion: null,
  };

  test("viser oppgaver den får, og Ny oppgave er deaktivert", () => {
    const html = vis({ tilstand: "data", startFane: "mine", data });
    assert.match(html, /Testoppgave/);
    assert.match(html, /IKKE KOBLET ENNÅ/);
    assert.doesNotMatch(html, /Kari Demo|Tobias|Sesongslutt/);
  });

  test("prosjekter og rutiner", () => {
    assert.match(vis({ tilstand: "data", startFane: "prosj", data }), /Testprosjekt/);
    assert.match(vis({ tilstand: "data", startFane: "rutiner", data }), /Testrutine/);
  });

  test("uten data og uten Notion-kobling vises tom tilstand, ingen demo", () => {
    const html = vis({ tilstand: "tom", startFane: "mine" });
    assert.match(html, /Ingen oppgaver å vise/);
    assert.doesNotMatch(html, /Kari Demo|Sesongslutt|Tobias/);
    const notion = vis({ tilstand: "data", startFane: "notion" });
    assert.match(notion, /IKKE KOBLET/);
    assert.doesNotMatch(notion, /simulert|Coach-arbeidsflate/);
  });

  test("laster og feil", () => {
    assert.match(vis({ tilstand: "laster" }), /Henter oppgaver/);
    assert.match(vis({ tilstand: "feil" }), /Oppgavene kunne ikke hentes/);
  });
});

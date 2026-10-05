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

describe("AG24Drift (Drift)", async () => {
  const { AG24Drift } = await import("@/components/admin/precision/AG24Drift");
  const vis = (props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(AG24Drift, props as never));

  const data = {
    gdpr: [
      { id: "g1", who: "Testbruker A", role: "Spiller", by: "Brukeren selv", at: "01.10.2026", due: "31.10.2026", scope: "Test", st: "Venter" as const },
      { id: "g2", who: "Testbruker B", role: "Spiller", by: "Brukeren selv", at: "01.10.2026", due: "31.10.2026", scope: "Test", st: "Godkjent" as const },
    ],
    audit: [{ id: "a1", t: "05.10 08:00", who: "Testadmin", what: "moderation.approved", obj: "ModerationCase:1" }],
    errors: [{ id: "e1", t: "05.10 06:00", lvl: "Feil" as const, where: "stripe.webhook", msg: "Testfeil", n: 2 }],
  };

  test("viser ekte sletteforespørsler med to steg; sletting krever godkjenning først", () => {
    const html = vis({ tilstand: "data", startFane: "gdpr", data, onGodkjenn: async () => ({ ok: true }), onSlettData: async () => ({ ok: true }) });
    assert.match(html, /Testbruker A/);
    assert.match(html, /Godkjenn forespørselen/);
    assert.match(html, /Slett data/);
    assert.doesNotMatch(html, /Mia Fjell|Siv Fjell|Lag innsynskopi først/);
  });

  test("uten koblede handlinger er knappene deaktivert", () => {
    const html = vis({ tilstand: "data", startFane: "gdpr", data });
    assert.match(html, /Godkjenn forespørselen/);
    assert.match(html, /disabled/);
  });

  test("revisjonslogg og feillogg viser ekte rader", () => {
    assert.match(vis({ tilstand: "data", startFane: "audit", data }), /moderation\.approved/);
    const feil = vis({ tilstand: "data", startFane: "feil", data });
    assert.match(feil, /Testfeil/);
    assert.doesNotMatch(feil, /Rapportagent|Tripletex-eksport/);
  });

  test("hjelp har ingen demokontakt", () => {
    const html = vis({ tilstand: "data", startFane: "hjelp", data });
    assert.match(html, /Hvordan godkjenner jeg/);
    assert.doesNotMatch(html, /DEMO\.NO|demo\.no/);
  });

  test("uten data vises tom tilstand, ikke demo", () => {
    const html = vis({ startFane: "gdpr" });
    assert.match(html, /Ingen sletteforespørsler/);
    assert.doesNotMatch(html, /Mia Fjell/);
  });

  test("laster og feil", () => {
    assert.match(vis({ tilstand: "laster" }), /Henter driftsdata/);
    assert.match(vis({ tilstand: "feil" }), /Driftsdata kunne ikke hentes/);
  });
});

import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { S360Samtaler } from "@/lib/admin-spiller/spiller360-typer";

mock.module("@/styles/precision-a8.css", { namedExports: {} });
mock.module("@/app/portal/analysere/actions", { namedExports: {
  hentTreningsHistorikkFiltrert: async () => { throw Error("no analysis read"); },
} });

test("Samtaler viser eget innhold og forklarer privat AI uten falske nulltall", async () => {
  const { AG08Samtaler } = await import("@/components/admin/precision/AG08Faner");
  const data: S360Samtaler = {
    traader: [{ id: "synthetic-thread", type: "Meldinger", antall: 2, sist: "24.10.2026" }],
    notat: { tekst: "Syntetisk <script>notat</script>", coach: "Syntetisk trener", dato: "24.10.2026" },
    videoer: [{ id: "synthetic-video", tittel: "Syntetisk egen video", dato: "24.10.2026", kilde: "Coach" }],
  };
  const html = renderToStaticMarkup(createElement(AG08Samtaler, { d: data, tom: false }));
  assert.match(html, /DINE DIREKTE SAMTALER/);
  assert.match(html, /Ditt siste notat/); assert.match(html, /Dine videoer/);
  assert.match(html, /Spillerens private AI-samtaler vises ikke her/);
  assert.ok(!html.includes("Siste samtale")); assert.ok(!html.includes("BARE COACH SER DETTE"));
  assert.ok(!html.includes("<script>")); assert.match(html, /&lt;script&gt;/);
  const empty = renderToStaticMarkup(createElement(AG08Samtaler, { d: { traader: [], notat: null, videoer: [] }, tom: false }));
  assert.match(empty, /Ingen direkte samtaler mellom deg og spilleren/);
  assert.match(empty, /Du har ikke skrevet et notat/);
  assert.match(empty, /Ingen ferdige videoer lagt inn av deg/);
  assert.match(empty, /PRIVAT FOR SPILLEREN/);
  assert.ok(!empty.includes("0 meld."));
});

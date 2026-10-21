/**
 * Skrå-toppen i Team Norway (planen team-norway-komplett-redesign-skra-2026-10-21, steg 1):
 * lav topp skal fungere uten bilde, og tom-tilstanden skal si hva som mangler.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", { defaultExport: (p: { src: string }) => createElement("img", { src: p.src }) });

test("lav topp uten bilde: tittel, ingen img", async () => {
  const { TnSkraTopp } = await import("@/components/team-norway/tn-skra-topp");
  const html = renderToStaticMarkup(createElement(TnSkraTopp, { lav: true, overlinje: "Spillere · 14", tittel: "Spillere" }));
  assert.match(html, /Spillere · 14/);
  assert.match(html, /<h1[^>]*>Spillere<\/h1>/);
  assert.doesNotMatch(html, /<img/);
});

test("topp med bilde bruker Team Norway-bildet", async () => {
  const { TnSkraTopp } = await import("@/components/team-norway/tn-skra-topp");
  const html = renderToStaticMarkup(createElement(TnSkraTopp, { bilde: "putting-green", tittel: "Samlinger" }));
  assert.match(html, /\/team-norway\/bilder\/putting-green\.jpg/);
});

test("tom tilstand viser tittel, tekst og handling", async () => {
  const { TnTomtilstand } = await import("@/components/team-norway/tn-tilstand");
  const html = renderToStaticMarkup(createElement(TnTomtilstand, { tittel: "Ingen samlinger", tekst: "Legg inn en samling.", handling: createElement("a", { href: "/x" }, "Ny samling") }));
  assert.match(html, /Ingen samlinger/);
  assert.match(html, /Legg inn en samling\./);
  assert.match(html, /Ny samling/);
});

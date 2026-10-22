/**
 * IUP-toppen (Team Norway Skrå, steg 6): fanenavnet som tittel, faneradens lenker og aktiv fane.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", { defaultExport: (p: { src: string }) => createElement("img", { src: p.src }) });
mock.module("next/link", { defaultExport: ({ children, scroll: _s, ...rest }: Record<string, unknown>) => createElement("a", rest, children as never) });
const LOGO_PNG = new URL("../../designsystem/team-norway/assets/logo/team-norway-golf.png", import.meta.url).pathname;
const LOGO_HVIT = new URL("../../designsystem/team-norway/assets/logo/team-norway-golf-knockout-white.png", import.meta.url).pathname;
mock.module(LOGO_PNG, { defaultExport: { src: "/logo.png", width: 1, height: 1 } });
mock.module(LOGO_HVIT, { defaultExport: { src: "/logo-hvit.png", width: 1, height: 1 } });

test("IUP-toppen har fanenavn som tittel, faner med lenker og innholdet under", async () => {
  const { TnIupTopp } = await import("@/components/team-norway/tn-iup-topp");
  const html = renderToStaticMarkup(
    createElement(TnIupTopp, { spillerId: "s1", spillerNavn: "Spiller A", aktiv: "profil", kanAdministrere: true, overlinje: "IUP · Spiller A", tittel: "Profil", ingress: "Profil." }, createElement("p", null, "Innhold under")),
  );
  assert.match(html, /<h1[^>]*>Profil<\/h1>/);
  assert.match(html, /IUP · Spiller A/);
  assert.match(html, /href="\/team-norway\/spiller\/s1\/profil"/);
  assert.match(html, /href="\/team-norway\/spiller\/s1\/evaluering"/);
  assert.match(html, /aria-current="page"[^>]*>Profil/);
  assert.match(html, /Innhold under/);
});

// Pakke d: faneraden følger IUP-arket, Oversikt er /spiller/[id], og Post er seksjonen «Poster» i Oversikt.
test("faneraden starter med Oversikt og Turneringsplan og har ingen Post-fane", async () => {
  const { TnIupTopp } = await import("@/components/team-norway/tn-iup-topp");
  const html = renderToStaticMarkup(
    createElement(TnIupTopp, { spillerId: "s1", spillerNavn: "Spiller A", aktiv: "tester", kanAdministrere: true, overlinje: "IUP", tittel: "Tester" }),
  );
  const faner = html.slice(html.indexOf('aria-label="IUP-faner"'), html.indexOf("</nav>"));
  const navn = [...faner.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
  assert.deepEqual(navn, ["Oversikt", "Turneringsplan", "Profil", "Plan", "Tester", "Analyse", "Teknisk plan", "Fireukerssjekk"]);
  assert.match(faner, /href="\/team-norway\/spiller\/s1"[^>]*>Oversikt/);
  assert.doesNotMatch(faner, /\/post"/);
});

test("spilleren uten trenertilgang får ikke planfanene", async () => {
  const { TnIupTopp } = await import("@/components/team-norway/tn-iup-topp");
  const html = renderToStaticMarkup(
    createElement(TnIupTopp, { spillerId: "s1", spillerNavn: "Spiller A", aktiv: "profil", kanAdministrere: false, overlinje: "IUP", tittel: "Spillerprofil" }),
  );
  assert.doesNotMatch(html, /evaluering/);
  assert.doesNotMatch(html, /teknisk-plan/);
});
